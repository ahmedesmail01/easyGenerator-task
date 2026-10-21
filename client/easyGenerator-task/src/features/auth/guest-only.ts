import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { sessionQueryOptions } from './api'

export async function guestOnly({ context }: { context: { queryClient: QueryClient } }) {
  // Keep public forms reachable during an outage; their submit handlers show API errors.
  const user = await context.queryClient.fetchQuery(sessionQueryOptions).catch(() => null)
  if (user) throw redirect({ to: '/app', replace: true })
}
