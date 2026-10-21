import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthLayout } from '@/components/auth/auth-layout'
import { LoginForm } from '@/components/sign-in/login-form'
import { sessionKey, signIn } from '@/features/auth/api'
import { guestOnly } from '@/features/auth/guest-only'

export const Route = createFileRoute('/sign-in')({
  beforeLoad: guestOnly,
  validateSearch: (search: Record<string, unknown>): { registered?: boolean } => ({ registered: search.registered === true || search.registered === 'true' ? true : undefined }),
  component: SignInPage,
})

function SignInPage() {
  const queryClient = useQueryClient()
  const navigate = Route.useNavigate()
  const { registered } = Route.useSearch()
  const mutation = useMutation({ mutationFn: signIn, gcTime: 0 })

  return <AuthLayout>
    {registered && <p role="status" className="mb-4 text-sm text-success-foreground">Account created. Please log in.</p>}
    <LoginForm onSubmit={async (values) => {
      try {
        const { user } = await mutation.mutateAsync(values)
        await queryClient.cancelQueries()
        queryClient.clear()
        queryClient.setQueryData(sessionKey, user)
        await navigate({ to: '/app', replace: true })
      } finally { mutation.reset() }
    }} />
  </AuthLayout>
}
