import { env } from '$env/dynamic/private';
import crypto from 'crypto';

export interface CreateSnapTransactionParams {
  orderId: string;
  totalAmount: number;
  customer: {
    name: string;
    email: string;
    phone?: string | null;
  };
  items: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export async function createMidtransTransaction(params: CreateSnapTransactionParams): Promise<{
  token: string;
  redirectUrl: string;
}> {
  const isProduction = env.MIDTRANS_IS_PRODUCTION === 'true';
  const serverKey = env.MIDTRANS_SERVER_KEY || '';
  const clientKey = env.MIDTRANS_CLIENT_KEY || '';

  // If Midtrans credentials are placeholders or not configured, return simulated token
  if (!serverKey || serverKey.includes('xxxxxxxx') || serverKey.startsWith('SB-Mid-server-xxx')) {
    const mockToken = `snap-token-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return {
      token: mockToken,
      redirectUrl: `/booking/confirmation/${params.orderId}`
    };
  }

  try {
    const midtransClient = await import('midtrans-client');
    const snap = new midtransClient.default.Snap({
      isProduction,
      serverKey,
      clientKey
    });

    const parameter = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.totalAmount
      },
      customer_details: {
        first_name: params.customer.name,
        email: params.customer.email,
        phone: params.customer.phone ?? undefined
      },
      item_details: params.items.map((item) => ({
        id: item.id.substring(0, 50),
        price: item.price,
        quantity: item.quantity,
        name: item.name.substring(0, 50)
      }))
    };

    const transaction = await snap.createTransaction(parameter);
    return {
      token: transaction.token as string,
      redirectUrl: transaction.redirect_url as string
    };
  } catch (error) {
    console.error('Midtrans API transaction creation error:', error);
    throw error;
  }
}

/**
 * Verify cryptographic signature of incoming Midtrans notification:
 * SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  serverKey: string;
  receivedSignature: string;
}): boolean {
  if (!params.receivedSignature || !params.serverKey) return false;

  const payload = `${params.orderId}${params.statusCode}${params.grossAmount}${params.serverKey}`;
  const computedSignature = crypto.createHash('sha512').update(payload).digest('hex');
  return computedSignature === params.receivedSignature;
}
