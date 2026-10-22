# Submission review

The assignment is an authentication module, not a full LMS implementation. Delivery speed is assessed by the reviewer; this repository does not claim an invented completion time or guarantee a score.

| Criterion | Implementation and evidence |
| --- | --- |
| Functionality | React + TypeScript signup/signin; email/name/password validation on client and API; protected `/` and `/auth/application`; exact welcome message; logout and persistent sessions. See client form tests and server HTTP integration tests. |
| Production readiness | Salted scrypt, hashed revocable sessions, HttpOnly/Secure cookies, origin checks, rate limits, strict DTO validation, unique/TTL indexes, bounded JSON payloads, readiness checks, safe error responses, private MongoDB/API containers, HTTPS and database backups. High-severity dependency audits run in CI; unused generator/cloud tool chains were removed. |
| Code quality | Feature-based Nest modules, explicit public-user projection, shared client auth/query functions, reusable password input, central validation, logging/error boundary and API contract. Unused demo code and duplicate form templates were removed. |
| Efficient scope | Existing Nest primitives and libraries; no additional auth protocol, LMS backend or unnecessary service architecture. |
| Logging bonus | JSON stdout logs with generated request IDs, route, status and duration. Bodies, query strings, cookies and tokens are omitted. |
| Error handling bonus | Consistent `statusCode`, `message`, `error`, `requestId`, `timestamp`; generic internal errors; malformed/oversized JSON handling; form error recovery and visible 404. |
| Testing bonus | Password/DTO/config/error/logging unit tests; user-facing client form tests; isolated real MongoDB HTTP tests; Docker smoke tests with persistence and cookie/CSRF checks. |
| CI/CD bonus | `.github/workflows/deploy.yml`: client/server checks, tested images, disposable full-stack smoke test, SSH deployment, health verification and rollback attempt. |
| API documentation bonus | Server README with examples and `/openapi.json` (`/api/openapi.json` through the production proxy), including schemas, statuses, cookie authentication and Origin requirements. |
| Mandatory disclosure | Root `AI.md` describes assistance, effective approaches, corrections and limitations. |

## Run the checks

Use Node 24 on PATH and install frozen lockfiles with Bun in both projects.

```sh
cd client/easyGenerator-task
bun run lint
bun run test
bun x vite build
bun run build

cd ../../server/easy-generator-task
bun run lint
bun run build
bun run test
bun run test:e2e
```

Integration tests use a disposable MongoDB process, never the developer's Compass database. The Docker smoke test uses separate temporary volumes, not production data.

## Before sharing

Use the public repository and deployed application links from the root README. Check the latest CI run, review `AI.md` for accuracy, and be ready to explain the session model and security tradeoffs. Do not include `.env`, SSH keys, credentials or private test data. Keep offsite backups, email verification/password reset and distributed throttling listed as limitations rather than implemented capabilities.
