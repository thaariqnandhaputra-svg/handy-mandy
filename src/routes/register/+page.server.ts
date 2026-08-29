import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { hashPassword, createSession, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '$lib/server/auth';
import { Role } from '@prisma/client';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    throw redirect(303, '/');
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const name = formData.get('name')?.toString() || '';
    const email = formData.get('email')?.toString().trim().toLowerCase() || '';
    const phone = formData.get('phone')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';

    const validation = registerSchema.safeParse({ name, email, phone, password });
    if (!validation.success) {
      return fail(400, {
        error: validation.error.errors[0].message,
        name,
        email,
        phone
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return fail(400, {
        error: 'An account with this email already exists',
        name,
        email,
        phone
      });
    }

    try {
      const passwordHash = await hashPassword(password);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          passwordHash,
          role: Role.CUSTOMER
        }
      });

      const session = await createSession(newUser.id);
      cookies.set(SESSION_COOKIE_NAME, session.id, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: Math.floor(SESSION_DURATION_MS / 1000)
      });
    } catch (e) {
      console.error('Registration failed:', e);
      return fail(500, {
        error: 'Failed to create account. Please try again.',
        name,
        email,
        phone
      });
    }

    const redirectTo = url.searchParams.get('redirectTo') || '/';
    throw redirect(303, redirectTo);
  }
};
