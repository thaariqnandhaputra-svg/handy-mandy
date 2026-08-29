import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { OrderStatus } from '@prisma/client';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || locals.user.role !== 'ADMIN') {
    throw redirect(303, '/login');
  }

  const [orders, technicians] = await Promise.all([
    prisma.order.findMany({
      include: {
        customer: {
          select: { name: true, email: true, phone: true }
        },
        location: true,
        items: {
          include: { product: true }
        },
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
    }),
    prisma.technicianProfile.findMany({
      include: {
        user: {
          select: { name: true, phone: true, email: true }
        }
      },
      orderBy: { isAvailable: 'desc' }
    })
  ]);

  return {
    orders,
    technicians
  };
};

export const actions: Actions = {
  assignTechnician: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'ADMIN') {
      return fail(403, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const orderId = formData.get('orderId')?.toString();
    const technicianId = formData.get('technicianId')?.toString() || null;

    if (!orderId) {
      return fail(400, { error: 'Order ID is required' });
    }

    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          technicianId,
          status: technicianId ? OrderStatus.TECHNICIAN_ASSIGNED : OrderStatus.CONFIRMED
        }
      });

      return { success: true };
    } catch (e) {
      console.error('Failed to assign technician:', e);
      return fail(500, { error: 'Database update failed' });
    }
  },

  updateOrderStatus: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'ADMIN') {
      return fail(403, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const orderId = formData.get('orderId')?.toString();
    const status = formData.get('status')?.toString() as OrderStatus;

    if (!orderId || !status) {
      return fail(400, { error: 'Missing parameters' });
    }

    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status }
      });
      return { success: true };
    } catch (e) {
      console.error('Failed to update status:', e);
      return fail(500, { error: 'Status update failed' });
    }
  }
};
