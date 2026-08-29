import { json, type RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { env } from '$env/dynamic/private';
import { verifyMidtransSignature } from '$lib/server/payment/midtrans';
import { OrderStatus, PaymentStatus } from '../../../../generated/prisma/client';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const notification = await request.json();

    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const signatureKey = notification.signature_key;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const paymentType = notification.payment_type;

    if (!orderId || !statusCode || !grossAmount || !signatureKey) {
      return json({ message: 'Missing required webhook payload fields' }, { status: 400 });
    }

    const serverKey = env.MIDTRANS_SERVER_KEY || '';

    // Verify cryptographic signature (bypass if testing in placeholder mode with special header or key)
    const isMock = serverKey.includes('xxxxxxxx') || serverKey.startsWith('SB-Mid-server-xxx');
    if (!isMock) {
      const isValid = verifyMidtransSignature({
        orderId,
        statusCode,
        grossAmount,
        serverKey,
        receivedSignature: signatureKey
      });

      if (!isValid) {
        console.error(`[Webhook] Invalid signature for order: ${orderId}`);
        return json({ message: 'Invalid signature' }, { status: 400 });
      }
    }

    // Lookup order and payment in DB
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true }
    });

    if (!existingOrder || !existingOrder.payment) {
      console.error(`[Webhook] Order or Payment record not found for ID: ${orderId}`);
      return json({ message: 'Order not found' }, { status: 404 });
    }

    // Determine target payment and order statuses
    let targetPaymentStatus: PaymentStatus = existingOrder.payment.status;
    let targetOrderStatus: OrderStatus = existingOrder.status;

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        targetPaymentStatus = PaymentStatus.PAID;
        if (existingOrder.status === OrderStatus.PENDING_PAYMENT) {
          targetOrderStatus = OrderStatus.CONFIRMED;
        }
      }
    } else if (transactionStatus === 'settlement') {
      targetPaymentStatus = PaymentStatus.PAID;
      if (existingOrder.status === OrderStatus.PENDING_PAYMENT) {
        targetOrderStatus = OrderStatus.CONFIRMED;
      }
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      targetPaymentStatus = PaymentStatus.FAILED;
      if (existingOrder.status === OrderStatus.PENDING_PAYMENT) {
        targetOrderStatus = OrderStatus.CANCELLED;
      }
    } else if (transactionStatus === 'pending') {
      targetPaymentStatus = PaymentStatus.PENDING;
    }

    // Idempotent atomic update
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId },
        data: {
          status: targetPaymentStatus,
          paymentType: paymentType ?? existingOrder.payment.paymentType,
          transactionRef: notification.transaction_id ?? existingOrder.payment.transactionRef,
          paidAt: targetPaymentStatus === PaymentStatus.PAID ? new Date() : existingOrder.payment.paidAt
        }
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: targetOrderStatus
        }
      })
    ]);

    return json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('[Webhook] Error processing payment notification:', error);
    return json({ message: 'Internal server error' }, { status: 500 });
  }
};
