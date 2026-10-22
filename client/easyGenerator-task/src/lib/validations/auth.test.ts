import { describe, expect, it } from 'vitest'
import { signUpSchema } from './sign-up'
import { signInSchema } from './sign-in'

const valid = { name: 'Test User', email: 'person@example.com', password: 'Example123!', confirmPassword: 'Example123!' }

describe('authentication validation boundaries', () => {
  it.each(['short1!', 'password!', '12345678!', 'Password123', 'Password123 '])('rejects a password missing a required condition: %s', (password) => {
    expect(signUpSchema.safeParse({ ...valid, password, confirmPassword: password }).success).toBe(false)
  })
  it('enforces the API length limits and confirmation', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true)
    expect(signUpSchema.safeParse({ ...valid, name: 'x'.repeat(101) }).success).toBe(false)
    expect(signUpSchema.safeParse({ ...valid, password: 'A1!' + 'a'.repeat(126) }).success).toBe(false)
    expect(signUpSchema.safeParse({ ...valid, confirmPassword: 'Different123!' }).success).toBe(false)
    expect(signInSchema.safeParse({ ...valid, password: 'a'.repeat(129) }).success).toBe(false)
  })
  it('preserves passwords verbatim and accepts existing passwords on login', () => {
    expect(signInSchema.parse({ email: ' person@example.com ', password: ' legacy ' })).toEqual({ email: 'person@example.com', password: ' legacy ' })
  })
})
