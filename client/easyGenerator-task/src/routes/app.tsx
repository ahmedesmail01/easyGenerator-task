import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app')({
  component: ApplicationPage,
})

function ApplicationPage() {
  // Build the application UI here. Add a session guard once auth is implemented.
  return null
}
