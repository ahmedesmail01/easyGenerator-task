import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { AuthLayout } from '@/components/auth/auth-layout'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { signUp } from '@/features/auth/api'
import { guestOnly } from '@/features/auth/guest-only'

export const Route = createFileRoute('/sign-up')({ beforeLoad: guestOnly, component: SignUpPage })

function SignUpPage() {
  const navigate = Route.useNavigate()
  const mutation = useMutation({ mutationFn: signUp, gcTime: 0 })
  return <AuthLayout><SignUpForm onSubmit={async (values) => {
    try {
      await mutation.mutateAsync(values)
      await navigate({ to: '/sign-in', search: { registered: true }, replace: true })
    } finally { mutation.reset() }
  }} /></AuthLayout>
}
