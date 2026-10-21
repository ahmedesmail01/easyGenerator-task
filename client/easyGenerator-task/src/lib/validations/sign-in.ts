import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').pipe(
    z.email('Enter a valid email address'),
  ),
  // Password complexity belongs to sign-up; sign-in accepts existing credentials.
  password: z.string().min(1, 'Password is required'),
})

export type SignInValues = z.infer<typeof signInSchema>
