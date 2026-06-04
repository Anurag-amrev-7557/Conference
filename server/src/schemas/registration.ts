import { z } from 'zod';
import { REGISTRATION_DESIGNATION_VALUES } from '../lib/registrationDesignations';

export const registrationDesignationSchema = z.enum(REGISTRATION_DESIGNATION_VALUES);

const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Enter a valid phone number.')
  .max(30, 'Phone number is too long.');

const linkedInSchema = z
  .string()
  .trim()
  .min(1, 'LinkedIn profile is required.')
  .max(200, 'LinkedIn profile is too long.');

export const registrationCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  email: z.string().trim().email('Enter a valid email.').max(200),
  phone: phoneSchema,
  linkedIn: linkedInSchema,
  designation: registrationDesignationSchema,
});

export const registrationAdminCreateSchema = registrationCreateSchema.extend({
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  ticketPriceCents: z.number().int().min(0).max(1_000_000).optional(),
});

export const registrationUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().max(200).optional(),
  phone: phoneSchema.optional(),
  linkedIn: linkedInSchema.optional(),
  designation: registrationDesignationSchema.optional(),
  ticketPriceCents: z.number().int().min(0).max(1_000_000).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
});
