import type { ReactNode } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from '@/components/sign-in/login-form'
import { SignUpForm } from '@/components/auth/sign-up-form'

// Routing is outside the forms' responsibility; exercise their actual inputs and submission.
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}))

describe('authentication forms', () => {
  it('blocks invalid login input before making a request', async () => {
    const submit = vi.fn()
    const user = userEvent.setup()
    render(<LoginForm onSubmit={submit} />)
    await user.type(screen.getByLabelText('Email'), 'invalid')
    await user.click(screen.getByRole('button', { name: /^Login$/ }))
    expect(await screen.findByText('Enter a valid email address')).toBeVisible()
    expect(screen.getByText('Password is required')).toBeVisible()
    expect(submit).not.toHaveBeenCalled()
  })

  it('shows API errors and allows login to be retried', async () => {
    const error = { isAxiosError: true, response: { status: 401, data: { message: 'Invalid email or password' } } }
    const submit = vi.fn().mockRejectedValueOnce(error).mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<LoginForm onSubmit={submit} />)
    await user.type(screen.getByLabelText('Email'), 'person@example.com')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'Example123!')
    await user.click(screen.getByRole('button', { name: /^Login$/ }))
    expect(await screen.findByText('Invalid email or password')).toBeVisible()
    await user.click(screen.getByRole('button', { name: /^Login$/ }))
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument())
  })

  it('prevents duplicate submissions while the API request is pending', async () => {
    let finish!: () => void
    const submit = vi.fn(() => new Promise<void>((resolve) => { finish = resolve }))
    const user = userEvent.setup()
    render(<LoginForm onSubmit={submit} />)
    await user.type(screen.getByLabelText('Email'), 'person@example.com')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'Example123!')
    await user.click(screen.getByRole('button', { name: /^Login$/ }))
    const pending = await screen.findByRole('button', { name: 'Logging in…' })
    expect(pending).toBeDisabled()
    await user.click(pending)
    expect(submit).toHaveBeenCalledTimes(1)
    await act(async () => { finish() })
    expect(await screen.findByRole('button', { name: /^Login$/ })).toBeEnabled()
  })

  it('updates password requirements while typing and excludes confirmation from submission', async () => {
    const submit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<SignUpForm onSubmit={submit} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    for (const item of screen.getAllByRole('listitem')) expect(item).toHaveTextContent('Not met:')
    await user.type(screen.getByLabelText('Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'person@example.com')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'Example123!')
    for (const item of screen.getAllByRole('listitem')) expect(item).toHaveTextContent(/^Met:/)
    await user.type(screen.getByLabelText('Confirm password'), 'Different123!')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Passwords do not match')).toBeVisible()
    expect(submit).not.toHaveBeenCalled()
    await user.clear(screen.getByLabelText('Confirm password'))
    await user.type(screen.getByLabelText('Confirm password'), 'Example123!')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    await waitFor(() => expect(submit).toHaveBeenCalledWith({ name: 'Test User', email: 'person@example.com', password: 'Example123!' }))
  })

  it('reveals each password independently without submitting the form', async () => {
    const submit = vi.fn()
    const user = userEvent.setup()
    render(<SignUpForm onSubmit={submit} />)
    await user.click(screen.getAllByRole('button', { name: 'Show password' })[0])
    expect(screen.getByLabelText('Password', { exact: true })).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Confirm password')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(screen.getByLabelText('Password', { exact: true })).toHaveAttribute('type', 'password')
    expect(submit).not.toHaveBeenCalled()
  })
})
