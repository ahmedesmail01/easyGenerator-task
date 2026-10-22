import { useEffect } from 'react'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { LearningHome } from '@/components/home/learning-home'
import { apiErrorMessage, applicationQueryOptions, isUnauthorized, sessionQueryOptions, signOut } from '@/features/auth/api'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.fetchQuery(sessionQueryOptions)
    if (!user) {
      await context.queryClient.cancelQueries()
      context.queryClient.clear()
      throw redirect({ to: '/sign-in', replace: true })
    }
  },
  loader: async ({ context }) => {
    try { await context.queryClient.fetchQuery(applicationQueryOptions) }
    catch (error) {
      if (isUnauthorized(error)) {
        await context.queryClient.cancelQueries()
        context.queryClient.clear()
        throw redirect({ to: '/sign-in', replace: true })
      }
      throw error
    }
  },
  pendingComponent: () => <p role="status" className="p-8">Loading your account…</p>,
  errorComponent: ApplicationError,
  component: HomePage,
})

function ApplicationError({ error }: { error: unknown }) {
  const router = useRouter()
  return <div className="space-y-4 p-8"><p role="alert">{apiErrorMessage(error)}</p><Button onClick={() => { void router.invalidate() }}>Try again</Button></div>
}

function HomePage() {
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const session = useQuery({ ...sessionQueryOptions, refetchInterval: 60_000 })
  const application = useSuspenseQuery(applicationQueryOptions)
  const logout = useMutation({ mutationFn: signOut })

  useEffect(() => {
    if (session.data === null || isUnauthorized(application.error)) {
      void (async () => {
        await queryClient.cancelQueries()
        queryClient.clear()
        await navigate({ to: '/sign-in', replace: true })
      })()
    }
  }, [session.data, application.error, queryClient, navigate])

  if (!session.data || isUnauthorized(application.error)) return null

  return <LearningHome
    user={session.data}
    welcomeMessage={application.data.message}
    error={session.error ? apiErrorMessage(session.error) : logout.error ? apiErrorMessage(logout.error) : undefined}
    loggingOut={logout.isPending}
    onLogout={async () => {
      try {
        await logout.mutateAsync()
        await queryClient.cancelQueries()
        queryClient.clear()
        await navigate({ to: '/sign-in', replace: true })
      } catch { /* Keep the UI available so logout can be retried. */ }
    }}
  />
}
