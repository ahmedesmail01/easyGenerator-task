# AI assistance disclosure

AI assistance (OpenAI Codex) was used extensively and iteratively for this submission. This file describes the work recorded in the development conversation; it does not claim that generated code was written unaided or that every proposed approach was retained.

## AI-assisted work

- React/TanStack Router routes, Axios and TanStack Query integration, authentication forms, Zod/React Hook Form validation, password confirmation and visibility controls.
- Easygenerator-inspired theme tokens, authentication image integration and animation, and the protected application's presentation. Image assets came from Easygenerator URLs supplied in the conversation; AI assistance covered their layout, styling and animation code. The homepage's course-building preview is illustrative UI, not a complete LMS editor or an AI content-generation backend.
- NestJS feature modules, MongoDB schemas and indexes, password hashing, cookie sessions, input validation, origin protection, throttling and readiness checks.
- Unit, component, HTTP/MongoDB integration and container smoke tests; structured request logging, consistent API errors, the OpenAPI contract and Swagger UI. Swagger UI reuses the existing contract and serves its assets locally.
- Docker images, Compose services, GitHub Actions, and deployment/operations documentation. VPS routing and certificate setup were checked against existing hosted applications.

## User direction and review boundary

The user supplied the assignment, the User/Session diagram, the branding references and image URLs, and the deployment target. The user requested the authentication interactions, selected an empty production database, and approved server access and routing changes. AI proposed and implemented many of the detailed code, security, testing and deployment decisions described below.

The automated checks and browser checks reported here were executed through the AI-assisted workflow. They are evidence of those checks, not proof of an independent human code review. The submitter should review this disclosure and the implementation, and be able to explain the tradeoffs before sharing the submission.

## Prompts and approaches that worked

The following prompts are edited summaries of iterative requests from the conversation, not verbatim quotations or claims that every implementation detail was specified upfront.

- “Use the attached assessment as the source of requirements. Implement only the client routes with TanStack Router; leave the page UI for a separate step.”
- “Inspect the existing sign-in form and configure React Hook Form with Zod. Apply the assignment's input validation requirements, then use the same form pattern and brand identity for sign-up.”
- “Show each password requirement beneath the field and update its status while the user types. Add a confirm-password field and visibility controls for the password inputs.”
- “Use the supplied User/Session diagram as the MongoDB schema reference. Implement the NestJS authentication module against the assessment requirements, then research the NestJS folder structure and apply it to the existing server.”
- “Connect the existing client authentication forms to the server API. Redirect authenticated users away from authentication routes to the home page, and consolidate the duplicate `/app` route into the index route.”
- “Prepare Docker deployment and GitHub Actions CI/CD for the client, server and database on the specified Hostinger VPS and subdomain. Start with an empty production database.”
- “Provide an interactive UI for the OpenAPI documentation so the endpoints can be explored through Swagger.”

## Corrections and tradeoffs

- The final checked-out implementation uses opaque server-side cookie sessions, not JWTs. Tokens are HttpOnly and only their hashes are stored in MongoDB; logout can revoke them immediately. JWT was discussed during development, but is not claimed as a feature of this submission.
- The server's MongoDB driver required Node rather than Bun at runtime. Bun remains the dependency manager; Node 24 runs the API and tests.
- Client validation initially omitted the API's upper length limits. These were aligned, and form tests now exercise invalid input, password confirmation, API-error recovery and visibility controls.
- Dependency audits found high-severity advisories in unused Nest cloud tooling and the shadcn generator dependency chain. Unused cloud packages were removed. The frontend generator was removed from application dependencies, retaining only the small state variants required by the checked-in components. No patched release was available for the generator’s transitive advisory; removing that tooling removed the affected dependency chain.
- The HTTP integration tests caught Nest reflecting JSON parser error text. Parsing failures are now normalized before the adapter, while unexpected server errors remain masked.
- Unused Vite demo assets and the duplicate template login form were removed after checking imports.
- Deployment was adapted to the VPS's existing Nginx sites rather than replacing the public proxy. Container-only health checks were supplemented with HTTP/cookie/authentication tests and MongoDB restart persistence checks.
- CI exposed MongoDB’s documented incompatibility with newer hosted Linux kernels. The checks job was moved to a hosted runner with a compatible 6.8 kernel; production already uses 6.8. The allocator safety check was preserved. Runner retirement remains an explicit maintenance item.
- Swagger UI was added after the initial JSON documentation. Its live browser check exercised “Try it out” against the health endpoint and checked that local assets loaded under the production Content Security Policy. Protected mutations still require the configured browser Origin and session cookies.
- Generated or proposed work was verified through type checks, linting, tests and browser checks. Failures were treated as evidence to correct the implementation, not as successful validation.

## Scope and limits

This is a focused authentication assignment. Email verification, password reset, distributed rate-limit storage, multiple replicas, offsite backups and a full LMS editor are not implemented. The rate limiter is process-local, and deployment uses a single VPS with brief container replacement downtime. No test score, delivery duration or production traffic result is invented here. AI assistance does not replace the submitter's responsibility to review and understand the code before submission.
