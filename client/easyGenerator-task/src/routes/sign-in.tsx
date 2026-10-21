import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '@/components/auth/auth-layout'
import { LoginForm } from '@/components/sign-in/login-form'

export const Route = createFileRoute('/sign-in')({ component: SignInPage })

function SignInPage() {
  return <AuthLayout><LoginForm /></AuthLayout>
}
