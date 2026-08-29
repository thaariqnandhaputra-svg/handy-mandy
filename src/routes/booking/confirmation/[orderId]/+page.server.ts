import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    throw redirect(303, '/login');
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      items: {
        include: { product: true }
      },
      location: true,
      payment: true,
      technician: {
        include: {
          user: {
            select: { name: true, phone: true }
          }
        }
      }
    }
  });

  if (!order) {
    throw error(404, 'Booking order not found');
  }

  // Access control
  if (order.customerId !== locals.user.id && locals.user.role !== 'ADMIN') {
    throw error(403, 'Unauthorized to view this order');
  }

  return {
    order
  };
};
