# Easygenerator authentication client

React + TypeScript + Vite, with TanStack Router/Query, Axios, React Hook Form, Zod and Tailwind.

Use Node 24 and Bun. From this directory:

```sh
bun install --frozen-lockfile
bun run dev
```

Start the NestJS API and MongoDB using the [root setup instructions](../../README.md). Vite serves `http://localhost:5173` and proxies `/api` to the local API. Production builds use the same-origin `/api` prefix. Environment settings are documented in `.env.example`; never expose secrets through a `VITE_*` variable.

## Structure

- `routes/`: guarded application root, guest-only signup/signin, and a visible not-found page.
- `features/auth/`: API functions, query options, guest guard, and form interaction tests.
- `components/auth/` and `components/sign-in/`: authentication forms; shared inputs live in `components/ui/`.
- `lib/validations/`: signup/signin schemas and password requirements.
- `lib/api.ts` and `lib/query-client.ts`: HTTP and query configuration.
- `components/home/`: protected application's presentation. The course preview is illustrative, not a complete LMS editor.

Signup validates name, email, password complexity, and confirmation. Password rules update while typing. Confirmation is never sent to the server. Signin accepts existing passwords without reapplying signup complexity. Both forms show API failures and prevent duplicate submission while waiting. Sessions use HttpOnly cookies, with no token in localStorage; the protected route checks the API and logout clears query data. The server remains the authorization boundary.

## Checks

```sh
bun run lint
bun run test
bun run build
```

`bun run test` runs Vitest, jsdom and Testing Library against actual form interactions and schema boundary cases. `bun run test:watch` is available during development. The deployment workflow also builds Vite once before the full build to regenerate the file-based route tree in clean checkouts. See [scoring evidence](../../docs/submission-checklist.md) and [deployment guide](../../deploy/README.md).

The shadcn generator is not an application dependency. The checked-in components use the small local `styles/component-variants.css` file for their state selectors. If generating more components, run the CLI separately and review any newly required styles and dependencies. CI runs `bun audit --audit-level high` in both projects.
