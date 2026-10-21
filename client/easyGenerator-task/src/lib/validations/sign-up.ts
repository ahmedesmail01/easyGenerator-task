import { z } from 'zod'

export const signUpSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters'),
  email: z.string().trim().min(1, 'Email is required').pipe(
    z.email('Enter a valid email address'),
  ),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9\s]/, 'Password must contain at least one special character'),
})

export type SignUpValues = z.infer<typeof signUpSchema>
