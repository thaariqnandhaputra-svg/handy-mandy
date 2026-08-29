import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { verifyPassword, createSession, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '$lib/server/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    if (locals.user.role === 'ADMIN') throw redirect(303, '/admin/orders');
    if (locals.user.role === 'TECHNICIAN') throw redirect(303, '/technician/orders');
    throw redirect(303, '/');
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const email = formData.get('email')?.toString().trim().toLowerCase() || '';
    const password = formData.get('password')?.toString() || '';

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      return fail(400, {
        error: validation.error.errors[0].message,
        email
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return fail(400, {
        error: 'Invalid email or password',
        email
      });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return fail(400, {
        error: 'Invalid email or password',
        email
      });
    }

    const session = await createSession(user.id);
    cookies.set(SESSION_COOKIE_NAME, session.id, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Math.floor(SESSION_DURATION_MS / 1000)
    });

    const explicitRedirect = url.searchParams.get('redirectTo');
    if (explicitRedirect) {
      throw redirect(303, explicitRedirect);
    }

    if (user.role === 'ADMIN') throw redirect(303, '/admin/orders');
    if (user.role === 'TECHNICIAN') throw redirect(303, '/technician/orders');

    throw redirect(303, '/');
  }
};
