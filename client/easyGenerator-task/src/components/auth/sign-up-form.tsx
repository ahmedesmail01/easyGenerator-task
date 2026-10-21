import { PasswordInput } from '@/components/ui/password-input'
import { useForm, useWatch } from 'react-hook-form'
import { Check, Circle } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { passwordRequirements, signUpSchema, type SignUpValues } from '@/lib/validations/sign-up'

type SignUpFormProps = Omit<React.ComponentProps<'form'>, 'onSubmit'> & {
  onSubmit?: (values: Omit<SignUpValues, 'confirmPassword'>) => void | Promise<void>
}

export function SignUpForm({ className, onSubmit, ...props }: SignUpFormProps) {
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onChange',
  })
  const password = useWatch({ control, name: 'password' })

  return (
    <form {...props} className={cn('flex flex-col gap-6', className)} noValidate
      onSubmit={handleSubmit(async ({ name, email, password }) => {
        await onSubmit?.({ name, email, password })
      })}
      aria-busy={isSubmitting}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">Enter your details to get started</p>
        </div>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="signup-name">Name</FieldLabel>
          <Input {...register('name')} id="signup-name" autoComplete="name" placeholder="Your name" required
            aria-invalid={!!errors.name} aria-describedby={errors.name ? 'signup-name-error' : undefined} />
          <FieldError id="signup-name-error" errors={[errors.name]} />
        </Field>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="signup-email">Email</FieldLabel>
          <Input {...register('email')} id="signup-email" type="email" autoComplete="username"
            autoCapitalize="none" spellCheck={false} placeholder="m@example.com" required
            aria-invalid={!!errors.email} aria-describedby={errors.email ? 'signup-email-error' : undefined} />
          <FieldError id="signup-email-error" errors={[errors.email]} />
        </Field>
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="signup-password">Password</FieldLabel>
          <PasswordInput {...register('password', { deps: ['confirmPassword'] })} id="signup-password" autoComplete="new-password" required
            aria-invalid={!!errors.password}
            aria-describedby={`signup-password-help${errors.password ? ' signup-password-error' : ''}`} />
          <ul id="signup-password-help" className="flex flex-col gap-1 text-sm">
            {passwordRequirements.map((requirement) => {
              const met = requirement.test(password)
              const Icon = met ? Check : Circle
              return (
                <li key={requirement.label} className={cn('flex items-center gap-2', met ? 'text-success-foreground' : 'text-muted-foreground')}>
                  <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="sr-only">{met ? 'Met: ' : 'Not met: '}</span>
                  {requirement.label}
                </li>
              )
            })}
          </ul>
          <FieldError id="signup-password-error" errors={[errors.password]} />
        </Field>
        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="signup-confirm-password">Confirm password</FieldLabel>
          <PasswordInput {...register('confirmPassword')} id="signup-confirm-password"
            autoComplete="new-password" required aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'signup-confirm-password-error' : undefined} />
          <FieldError id="signup-confirm-password-error" errors={[errors.confirmPassword]} />
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : 'Create account'}</Button>
          <FieldDescription className="text-center">
            Already have an account? <Link to="/sign-in">Log in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
