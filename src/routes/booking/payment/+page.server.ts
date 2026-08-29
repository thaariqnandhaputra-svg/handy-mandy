import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { calculateOrderPricing } from '$lib/server/pricing';
import { OrderStatus, PaymentProvider, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

const checkoutPayloadSchema = z.object({
  locationId: z.string().min(1, 'Location is required'),
  includeInstallation: z.boolean(),
  includeHub: z.boolean(),
  scheduledDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive()
    })
  ).min(1, 'Cart cannot be empty')
});

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, '/login?redirectTo=/booking/payment');
  }

  const locations = await prisma.location.findMany({
    where: { userId: locals.user.id }
  });

  return {
    locations
  };
};

export const actions: Actions = {
  processMockPayment: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const payloadRaw = formData.get('payload')?.toString();

    if (!payloadRaw) {
      return fail(400, { error: 'Missing booking payload' });
    }

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payloadRaw);
    } catch {
      return fail(400, { error: 'Invalid payload format' });
    }

    const validation = checkoutPayloadSchema.safeParse(parsedPayload);
    if (!validation.success) {
      return fail(400, { error: validation.error.errors[0].message });
    }

    const { locationId, includeInstallation, includeHub, scheduledDate, notes, items } = validation.data;

    // Verify location ownership
    const location = await prisma.location.findFirst({
      where: { id: locationId, userId: locals.user.id }
    });

    if (!location) {
      return fail(400, { error: 'Invalid installation location selected' });
    }

    // Recalculate price server-side strictly from database
    let pricing;
    try {
      pricing = await calculateOrderPricing({
        rawItems: items,
        includeInstallation,
        includeHub
      });
    } catch (err: any) {
      return fail(400, { error: err.message || 'Pricing calculation failed' });
    }

    // Atomic transaction: Create Order + OrderItems + Mock Payment (Confirmed)
    let createdOrderId = '';
    try {
      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            customerId: locals.user!.id,
            locationId: location.id,
            includeInstallation: pricing.includeInstallation,
            includeHub: pricing.includeHub,
            installationFee: pricing.installationFee,
            hubFee: pricing.hubFee,
            additionalFees: pricing.additionalFees,
            subtotal: pricing.subtotal,
            totalAmount: pricing.totalAmount,
            status: OrderStatus.CONFIRMED, // Immediately confirmed via simulated payment
            scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
            notes: notes || null,
            items: {
              create: pricing.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice
              }))
            },
            payment: {
              create: {
                provider: PaymentProvider.MANUAL,
                status: PaymentStatus.PAID,
                amount: pricing.totalAmount,
                paymentType: 'mock_instant_settlement',
                transactionRef: `MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                paidAt: new Date()
              }
            }
          }
        });

        return newOrder;
      });

      createdOrderId = order.id;
    } catch (e) {
      console.error('Order creation error:', e);
      return fail(500, { error: 'Failed to process order. Please try again.' });
    }

    throw redirect(303, `/booking/confirmation/${createdOrderId}`);
  }
};
