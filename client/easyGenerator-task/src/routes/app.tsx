import { useEffect } from 'react'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { apiErrorMessage, applicationQueryOptions, isUnauthorized, sessionQueryOptions, signOut } from '@/features/auth/api'

export const Route = createFileRoute('/app')({
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
  component: ApplicationPage,
})

function ApplicationError({ error }: { error: unknown }) {
  const router = useRouter()
  return <div className="space-y-4 p-8"><p role="alert">{apiErrorMessage(error)}</p><Button onClick={() => { void router.invalidate() }}>Try again</Button></div>
}

function ApplicationPage() {
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

  return <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-6 p-6 md:p-10">
    <p className="font-semibold text-brand">Easygenerator</p>
    <h1 className="font-heading text-heading">{application.data.message}</h1>
    <p className="text-muted-foreground">You’re signed in as {session.data.name} ({session.data.email}).</p>
    {session.error && <p role="alert">{apiErrorMessage(session.error)}</p>}
    {logout.error && <p role="alert" className="text-destructive">{apiErrorMessage(logout.error)}</p>}
    <Button className="w-fit" disabled={logout.isPending} onClick={async () => {
      try {
        await logout.mutateAsync()
        await queryClient.cancelQueries()
        queryClient.clear()
        await navigate({ to: '/sign-in', replace: true })
      } catch { /* Keep the session UI and expose the mutation error for retry. */ }
    }}>{logout.isPending ? 'Logging out…' : 'Log out'}</Button>
  </main>
}
