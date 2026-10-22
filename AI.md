# AI assistance disclosure

AI assistance (OpenAI Codex) was used extensively and iteratively for this submission. This file describes the work recorded in the development conversation; it does not claim that generated code was written unaided or that every proposed approach was retained.

## AI-assisted work

- React/TanStack Router routes, Axios and TanStack Query integration, authentication forms, Zod/React Hook Form validation, password confirmation and visibility controls.
- Easygenerator-inspired theme tokens, authentication artwork/animation, and the protected application's presentation. The homepage's course-building preview is illustrative UI, not a complete LMS editor or an AI content-generation backend.
- NestJS feature modules, MongoDB schemas and indexes, password hashing, cookie sessions, input validation, origin protection, throttling and readiness checks.
- Unit, component, HTTP/MongoDB integration and container smoke tests; structured request logging, consistent API errors and OpenAPI documentation.
- Docker images, Compose services, GitHub Actions, and deployment/operations documentation. VPS routing and certificate setup were checked against existing hosted applications.

## Prompts and approaches that worked

Concrete requests produced useful, reviewable increments: configure the API/query clients, implement the signup requirements from the assignment, show password requirements while typing, add confirmation and visibility controls, and connect authentication with protected routes. Supplying the User/Session diagram clarified the intended storage model.

For the final review, the approach was to compare the original task PDF with actual source and test evidence, then close missing requirements and bonus features. The review caught this previously missing, mandatory disclosure file. Small changes with targeted tests were more useful than asking for an undefined universal “best practice” architecture.

## Corrections and tradeoffs

- The final checked-out implementation uses opaque server-side cookie sessions, not JWTs. Tokens are HttpOnly and only their hashes are stored in MongoDB; logout can revoke them immediately. JWT was discussed during development, but is not claimed as a feature of this submission.
- Repeated application UI was consolidated onto `/`, removing the separate `/app` route. Router checks query the API rather than trusting a browser flag.
- The server's MongoDB driver required Node rather than Bun at runtime. Bun remains the dependency manager; Node 24 runs the API and tests.
- Client validation initially omitted the API's upper length limits. These were aligned, and form tests now exercise invalid input, password confirmation, API-error recovery and visibility controls.
- Dependency audits found high-severity advisories in unused Nest cloud tooling and the shadcn generator dependency chain. Unused cloud packages were removed. The frontend generator was removed from application dependencies, retaining only the small state variants required by the checked-in components. This avoided pretending an unpatched transitive issue was resolved by a version override.
- The HTTP integration tests caught Nest reflecting JSON parser error text. Parsing failures are now normalized before the adapter, while unexpected server errors remain masked.
- Unused Vite demo assets and the duplicate template login form were removed after checking imports.
- The README initially linked to an absent `AI.md`; the scoring review corrected that omission.
- Deployment was adapted to the VPS's existing Nginx sites rather than replacing the public proxy. Container-only health checks were supplemented with HTTP/cookie/authentication tests and MongoDB restart persistence checks.
- CI exposed MongoDB’s documented incompatibility with newer hosted Linux kernels. The checks job was moved to a hosted runner with a compatible 6.8 kernel; production already uses 6.8. The allocator safety check was preserved. Runner retirement remains an explicit maintenance item.
- Generated or proposed work was verified through type checks, linting, tests and browser checks. Failures were treated as evidence to correct the implementation, not as successful validation.

## Scope and limits

This is a focused authentication assignment. Email verification, password reset, distributed rate-limit storage, multiple replicas, offsite backups and a full LMS editor are not implemented. The rate limiter is process-local, and deployment uses a single VPS with brief container replacement downtime. No test score, delivery duration or production traffic result is invented here. AI assistance does not replace the submitter's responsibility to review and understand the code before submission.
