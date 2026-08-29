import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { OrderStatus } from '@prisma/client';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || (locals.user.role !== 'TECHNICIAN' && locals.user.role !== 'ADMIN')) {
    throw redirect(303, '/login');
  }

  // Find technician profile
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: locals.user.id }
  });

  const orders = await prisma.order.findMany({
    where: {
      ...(profile ? { technicianId: profile.id } : {}) // If admin, load all or assigned
    },
    include: {
      customer: {
        select: { name: true, phone: true, email: true }
      },
      location: true,
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return {
    orders,
    profile
  };
};

export const actions: Actions = {
  updateStatus: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
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
      console.error('Failed to update job status:', e);
      return fail(500, { error: 'Failed to update job status' });
    }
  }
};
