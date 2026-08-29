import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.user) {
    throw redirect(303, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }

  const locations = await prisma.location.findMany({
    where: { userId: locals.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return {
    user: locals.user,
    locations
  };
};
