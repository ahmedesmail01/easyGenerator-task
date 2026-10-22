import { z } from 'zod'

export const passwordRequirements = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'At least one letter', test: (value: string) => /[a-zA-Z]/.test(value) },
  { label: 'At least one number', test: (value: string) => /[0-9]/.test(value) },
  { label: 'At least one special character', test: (value: string) => /[^a-zA-Z0-9\s]/.test(value) },
]

export const signUpSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(100, 'Name must be at most 100 characters'),
  email: z.string().trim().min(1, 'Email is required').max(254, 'Email must be at most 254 characters').pipe(
    z.email('Enter a valid email address'),
  ),
  password: passwordRequirements.reduce(
    (schema, requirement) => schema.refine(requirement.test, requirement.label),
    z.string().max(128, 'Password must be at most 128 characters'),
  ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((values) => values.password === values.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type SignUpValues = z.infer<typeof signUpSchema>
