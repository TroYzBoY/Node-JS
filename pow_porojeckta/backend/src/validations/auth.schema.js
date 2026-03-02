// src/validations/auth.schema.js
// ============================================================
// TASK 6 — Full Validation System
//
// register: email required + format, password min 6, username min 3
// login:    email + password
// updateUser: all fields optional with conditional rules
// ============================================================

const { z } = require('zod');

// ── Auth schemas ───────────────────────────────────────────
const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Invalid email format.'),

  username: z
    .string({ required_error: 'Username is required.' })
    .min(3, 'Username must be at least 3 characters.')
    .max(32, 'Username must be at most 32 characters.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'),

  password: z
    .string({ required_error: 'Password is required.' })
    .min(6, 'Password must be at least 6 characters.')
    .max(100, 'Password is too long.'),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Invalid email format.'),

  password: z
    .string({ required_error: 'Password is required.' }),
});

// ── User update schema (all fields optional) ──────────────
// TASK 6: conditional validation — if password present, must meet min length
const updateUserSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters.')
      .max(32, 'Username must be at most 32 characters.')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.')
      .optional(),

    email: z
      .string()
      .email('Invalid email format.')
      .optional(),

    password: z
      .string()
      .min(6, 'Password must be at least 6 characters.')
      .max(100, 'Password is too long.')
      .optional(),

    // Profile fields (nested update)
    bio: z.string().max(500, 'Bio too long.').optional(),
    avatar: z.string().url('Avatar must be a valid URL.').optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided to update.' }
  );

module.exports = { registerSchema, loginSchema, updateUserSchema };
