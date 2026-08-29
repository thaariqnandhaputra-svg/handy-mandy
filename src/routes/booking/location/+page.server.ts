import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { z } from 'zod';

const locationSchema = z.object({
  label: z.string().optional(),
  addressLine: z.string().min(5, 'Address line must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().min(3, 'Postal code is required')
});

export const load: PageServerLoad = async ({ parent }) => {
  const data = await parent();
  return {
    locations: data.locations
  };
};

export const actions: Actions = {
  createLocation: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const label = formData.get('label')?.toString().trim() || null;
    const addressLine = formData.get('addressLine')?.toString().trim() || '';
    const city = formData.get('city')?.toString().trim() || '';
    const province = formData.get('province')?.toString().trim() || '';
    const postalCode = formData.get('postalCode')?.toString().trim() || '';

    const validation = locationSchema.safeParse({ label, addressLine, city, province, postalCode });
    if (!validation.success) {
      return fail(400, {
        error: validation.error.errors[0].message,
        label,
        addressLine,
        city,
        province,
        postalCode
      });
    }

    try {
      const newLoc = await prisma.location.create({
        data: {
          userId: locals.user.id,
          label,
          addressLine,
          city,
          province,
          postalCode
        }
      });

      return {
        success: true,
        createdLocationId: newLoc.id
      };
    } catch (e) {
      console.error('Failed to create location:', e);
      return fail(500, { error: 'Failed to save address' });
    }
  }
};
