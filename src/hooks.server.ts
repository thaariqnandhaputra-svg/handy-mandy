import type { Handle } from '@sveltejs/kit';
import { validateSession, SESSION_COOKIE_NAME } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionId) {
    event.locals.user = null;
    event.locals.sessionId = null;
  } else {
    const session = await validateSession(sessionId);
    if (session) {
      event.locals.user = session.user;
      event.locals.sessionId = session.id;
    } else {
      event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
      event.locals.user = null;
      event.locals.sessionId = null;
    }
  }

  const { pathname } = event.url;

  // 1. Admin Route Guard
  if (pathname.startsWith('/admin')) {
    if (!event.locals.user) {
      return new Response(null, {
        status: 303,
        headers: { location: `/login?redirectTo=${encodeURIComponent(pathname)}` }
      });
    }
    if (event.locals.user.role !== 'ADMIN') {
      return new Response('Forbidden: Admin access required', { status: 403 });
    }
  }

  // 2. Technician Route Guard
  if (pathname.startsWith('/technician')) {
    if (!event.locals.user) {
      return new Response(null, {
        status: 303,
        headers: { location: `/login?redirectTo=${encodeURIComponent(pathname)}` }
      });
    }
    if (event.locals.user.role !== 'TECHNICIAN' && event.locals.user.role !== 'ADMIN') {
      return new Response('Forbidden: Technician access required', { status: 403 });
    }
  }

  // 3. Customer Protected Routes Guard
  if (pathname.startsWith('/orders') || pathname.startsWith('/booking')) {
    if (!event.locals.user) {
      return new Response(null, {
        status: 303,
        headers: { location: `/login?redirectTo=${encodeURIComponent(pathname)}` }
      });
    }
  }

  return resolve(event);
};
