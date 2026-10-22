import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: Outlet,
  notFoundComponent: NotFoundPage,
})

function NotFoundPage() {
  return <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-6 text-center"><p className="font-semibold text-brand">404</p><h1 className="text-3xl font-bold">Page not found</h1><p className="text-muted-foreground">The page you requested does not exist.</p><Link to="/" className="rounded-full bg-brand px-6 py-3 font-medium text-foreground">Go to home</Link></main>
}
