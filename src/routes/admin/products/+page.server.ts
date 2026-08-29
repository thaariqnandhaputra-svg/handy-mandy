import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(5, 'Description is required'),
  category: z.string().min(2, 'Category is required'),
  basePrice: z.number().int().positive('Price must be positive'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  requiresHub: z.boolean(),
  isActive: z.boolean().default(true)
});

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || locals.user.role !== 'ADMIN') {
    throw redirect(303, '/login');
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return {
    products
  };
};

export const actions: Actions = {
  createProduct: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'ADMIN') {
      return fail(403, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const name = formData.get('name')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const category = formData.get('category')?.toString() || '';
    const basePrice = parseInt(formData.get('basePrice')?.toString() || '0', 10);
    const imageUrl = formData.get('imageUrl')?.toString() || '';
    const requiresHub = formData.get('requiresHub') === 'on';

    const validation = productSchema.safeParse({
      name,
      description,
      category,
      basePrice,
      imageUrl,
      requiresHub,
      isActive: true
    });

    if (!validation.success) {
      return fail(400, { error: validation.error.errors[0].message });
    }

    try {
      await prisma.product.create({
        data: {
          name,
          description,
          category,
          basePrice,
          imageUrl: imageUrl || null,
          requiresHub,
          isActive: true
        }
      });
      return { success: true };
    } catch (e) {
      console.error('Failed to create product:', e);
      return fail(500, { error: 'Failed to create product' });
    }
  },

  toggleActive: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'ADMIN') {
      return fail(403, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const productId = formData.get('productId')?.toString();

    if (!productId) return fail(400, { error: 'Product ID required' });

    try {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return fail(404, { error: 'Product not found' });

      await prisma.product.update({
        where: { id: productId },
        data: { isActive: !product.isActive }
      });
      return { success: true };
    } catch (e) {
      console.error('Failed to toggle active:', e);
      return fail(500, { error: 'Toggle active status failed' });
    }
  }
};
