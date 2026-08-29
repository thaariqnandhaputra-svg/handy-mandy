import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ params }) => {
  const product = await prisma.product.findUnique({
    where: { id: params.id }
  });

  if (!product || !product.isActive) {
    throw error(404, 'Product not found or inactive');
  }

  // Related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
      isActive: true
    },
    take: 3
  });

  return {
    product,
    relatedProducts
  };
};
