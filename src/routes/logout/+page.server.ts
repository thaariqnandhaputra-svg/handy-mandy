import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { invalidateSession, SESSION_COOKIE_NAME } from '$lib/server/auth';

export const load: PageServerLoad = async () => {
  throw redirect(303, '/');
};

export const actions: Actions = {
  default: async ({ cookies, locals }) => {
    if (locals.sessionId) {
      await invalidateSession(locals.sessionId);
    }
    cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    throw redirect(303, '/login');
  }
};
