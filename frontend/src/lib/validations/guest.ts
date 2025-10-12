/**
 * Guest form validation schemas using Zod
 */

import { z } from 'zod'

// Email validation regex (RFC-compliant)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Phone validation regex (international formats)
const phoneRegex = /^\+?[\d\s\-\(\)]+$/

/**
 * Base guest validation schema with all fields
 */
export const guestBaseSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be 100 characters or less')
    .trim(),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be 100 characters or less')
    .trim(),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .regex(emailRegex, 'Invalid email format')
    .toLowerCase()
    .trim(),

  phone: z
    .string()
    .regex(phoneRegex, 'Invalid phone number format')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  plus_one_allowed: z.boolean().default(false),

  plus_one_name: z
    .string()
    .max(200, 'Plus-one name must be 200 characters or less')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  dietary_restrictions: z
    .string()
    .max(500, 'Dietary restrictions must be 500 characters or less')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val))
})

/**
 * Guest creation schema
 * Used for adding new guests
 */
export const guestCreateSchema = guestBaseSchema.refine(
  (data) => {
    // If plus_one_allowed is true and plus_one_name is provided, validate it
    if (data.plus_one_allowed && data.plus_one_name) {
      return data.plus_one_name.length > 0
    }
    return true
  },
  {
    message: 'Plus-one name cannot be empty when plus-one is allowed',
    path: ['plus_one_name']
  }
)

/**
 * Guest update schema
 * All fields optional for partial updates
 */
export const guestUpdateSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be 100 characters or less')
    .trim()
    .optional(),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be 100 characters or less')
    .trim()
    .optional(),

  email: z
    .string()
    .email('Invalid email format')
    .regex(emailRegex, 'Invalid email format')
    .toLowerCase()
    .trim()
    .optional(),

  phone: z
    .string()
    .regex(phoneRegex, 'Invalid phone number format')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  plus_one_allowed: z.boolean().optional(),

  plus_one_name: z
    .string()
    .max(200, 'Plus-one name must be 200 characters or less')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  dietary_restrictions: z
    .string()
    .max(500, 'Dietary restrictions must be 500 characters or less')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val))
})

/**
 * Quick add schema
 * Minimal fields for fast guest creation
 */
export const quickAddSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be 100 characters or less')
    .trim(),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be 100 characters or less')
    .trim(),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .regex(emailRegex, 'Invalid email format')
    .toLowerCase()
    .trim()
})

// Export types derived from schemas
export type GuestCreateInput = z.infer<typeof guestCreateSchema>
export type GuestUpdateInput = z.infer<typeof guestUpdateSchema>
export type QuickAddInput = z.infer<typeof quickAddSchema>
