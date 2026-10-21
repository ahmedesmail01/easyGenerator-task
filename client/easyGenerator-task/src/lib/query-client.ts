import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        if (axios.isCancel(error)) return false

        // Client errors, including failed authentication, need user action.
        if (axios.isAxiosError(error) && error.response) {
          const status = error.response.status
          if (status >= 400 && status < 500) return false
        }

        return failureCount < 2
      },
    },
    mutations: {
      // Avoid repeating writes such as sign-up or sign-in automatically.
      retry: false,
    },
  },
})
