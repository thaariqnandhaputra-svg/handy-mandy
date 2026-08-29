import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, '/login?redirectTo=/orders');
  }

  const orders = await prisma.order.findMany({
    where: { customerId: locals.user.id },
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
    },
    orderBy: { createdAt: 'desc' }
  });

  return {
    orders
  };
};
