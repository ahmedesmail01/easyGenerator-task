import axios from 'axios'
import { queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { SignInValues } from '@/lib/validations/sign-in'
import type { SignUpValues } from '@/lib/validations/sign-up'

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export const sessionKey = ['auth', 'session'] as const
export const isUnauthorized = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 401

export const sessionQueryOptions = queryOptions({
  queryKey: sessionKey,
  queryFn: async ({ signal }): Promise<User | null> => {
    try {
      const { data } = await api.get<{ user: User }>('/auth/me', { signal })
      return data.user
    } catch (error) {
      if (isUnauthorized(error)) return null
      throw error
    }
  },
  staleTime: 0,
  retry: false,
})

export const applicationQueryOptions = queryOptions({
  queryKey: ['application'] as const,
  queryFn: async ({ signal }) => {
    const { data } = await api.get<{ message: string }>('/auth/application', { signal })
    return data
  },
  staleTime: 0,
  retry: false,
})

export async function signIn(values: SignInValues) {
  const { data } = await api.post<{ user: User; expiresAt: string }>('/auth/sign-in', values)
  return data
}

export async function signUp(values: Omit<SignUpValues, 'confirmPassword'>) {
  const { data } = await api.post<{ user: User }>('/auth/sign-up', values)
  return data
}

export async function signOut() {
  try {
    await api.post('/auth/sign-out')
  } catch (error) {
    if (!isUnauthorized(error)) throw error
  }
}

export function apiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Something went wrong. Please try again.'
  if (!error.response) return 'Unable to reach the server. Please try again.'
  if (error.response.status === 429) return 'Too many attempts. Please wait a minute and try again.'
  if (error.response.status >= 500) return 'The server is unavailable. Please try again shortly.'
  const body: unknown = error.response.data
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = body.message
    if (typeof message === 'string') return message
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) return message.join('. ')
  }
  return 'Your request could not be completed. Please try again.'
}
