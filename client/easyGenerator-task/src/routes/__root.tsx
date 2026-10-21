import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: Outlet,
  notFoundComponent: NotFoundPage,
})

function NotFoundPage() {
  // Build the not-found UI here.
  return null
}
