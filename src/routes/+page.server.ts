import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ url }) => {
  const categoryFilter = url.searchParams.get('category');

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryFilter ? { category: categoryFilter } : {})
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category']
    })
  ]);

  return {
    products,
    categories: categories.map((c) => c.category),
    activeCategory: categoryFilter
  };
};
