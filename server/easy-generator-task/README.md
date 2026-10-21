# Easygenerator authentication API

NestJS + MongoDB authentication using revocable, server-side sessions. Requires **Node.js 24 LTS**, Bun for package management, and MongoDB. Use Node to run the server and tests: the current MongoDB driver uses a Node API that Bun does not yet implement.

## Project structure

The server uses feature modules, following [Nest's module guidance](https://docs.nestjs.com/modules), with [Mongoose schemas near their owning features](https://docs.nestjs.com/techniques/mongodb). Nest does not prescribe one universal directory tree; this structure is sized for this application's domains.

```text
src/
  main.ts                         # Bootstrap
  setup-app.ts                    # HTTP middleware, CORS, validation
  app.module.ts                   # Root composition and global guards
  app.controller.ts               # Public root endpoint
  app.service.ts
  common/
    guards/origin.guard.ts        # Application-wide origin protection
  config/
    environment.ts                # Validated environment configuration
    environment.spec.ts
  database/
    database.module.ts            # One MongoDB connection
  modules/
    auth/
      auth.module.ts
      auth.controller.ts          # Auth HTTP endpoints and cookies
      auth.service.ts             # Authentication/session orchestration
      constants/                  # Session cookie name
      dto/                        # Separate sign-in/sign-up DTOs and tests
      guards/                     # Session authentication guard
      schemas/                    # Session model and indexes
      services/                   # Password hashing service and tests
      types/                      # Authenticated request type
      utils/                      # Session-token hashing
    users/
      users.module.ts
      users.service.ts            # User persistence and unique index setup
      schemas/                    # User model
      mappers/                    # Explicit public user projection
  # Unit tests live beside the source they verify.
test/
  app.e2e-spec.ts                  # Cross-module HTTP + MongoDB integration
```

`AppModule` composes infrastructure and features. `AuthModule` imports `UsersModule` and consumes its exported `UsersService`; it does not inject the user Mongoose model directly. `UsersModule` owns the user model and exposes only the service. Sessions remain internal to authentication. Application-wide guards belong in `common`, while feature-specific guards remain inside their feature. Direct imports make dependencies explicit; there are no barrel files or circular module references. Existing collection names, indexes, routes, and response contracts are preserved, so this reorganization requires no database migration.

## Local setup and Compass

From the repository root:

```sh
cd server/easy-generator-task
nvm use 24
bun install --frozen-lockfile
# If you already have .env, merge the example settings instead of overwriting it.
cp -n .env.example .env
bun run start:dev
```

Defaults: API `http://localhost:3000`, frontend origin `http://localhost:5173`, database `mongodb://127.0.0.1:27017/easygenerator`. Environment variables are validated at startup. `.env` is ignored; `.env.example` is safe to commit. Never put a MongoDB URI containing credentials in a `VITE_*` variable.

Compass is a GUI, not the MongoDB server. Keep your existing local MongoDB service running and connect Compass to `mongodb://127.0.0.1:27017`. If your Compass connection uses a different URI, use that URI in the server's `MONGODB_URI`. The application database is `easygenerator`; `users` and `sessions` appear during initialization. The API creates required indexes before accepting requests. In Compass, check each collection's **Indexes** tab.

## Data model

`users`:

| Field | Storage / constraints |
| --- | --- |
| `_id` | MongoDB ObjectId |
| `email` | Required, trimmed, lowercase, valid email, maximum 254 characters, unique index |
| `name` | Required, trimmed, 3–100 characters |
| `passwordHash` | Required salted scrypt hash; excluded from default selections and all responses |
| `createdAt`, `updatedAt` | Mongoose-managed Date timestamps |

`sessions`:

| Field | Storage / constraints |
| --- | --- |
| `_id` | MongoDB ObjectId |
| `userId` | Required ObjectId reference to User; indexed |
| `tokenHash` | Required unique SHA-256 hash of a random 256-bit token; excluded from default selections |
| `createdAt` | Date, defaults to now |
| `expiresAt` | Required Date; TTL index with `expireAfterSeconds: 0` |
| `revokedAt` | Date or null |

MongoDB references are not foreign-key constraints. Authentication also verifies that the referenced user still exists. TTL cleanup is asynchronous: authorization explicitly checks `expiresAt > now` and `revokedAt: null` on every protected request, independently of physical deletion.

## HTTP API

All authentication responses use `Cache-Control: no-store`. User responses contain only `id`, `email`, `name`, `createdAt`, and `updatedAt`. Tokens and password hashes are never returned in JSON.

| Method | Endpoint | Request / response |
| --- | --- | --- |
| POST | `/auth/sign-up` | `{ "name", "email", "password" }` → **201** `{ "user": { ... } }` |
| POST | `/auth/sign-in` | `{ "email", "password" }` → **200** `{ "user": { ... }, "expiresAt": "..." }` and session cookie |
| GET | `/auth/me` | Requires session → **200** `{ "user": { ... } }` |
| GET | `/auth/application` | Requires session → **200** `{ "message": "Welcome to the application." }` |
| POST | `/auth/sign-out` | Revokes current session and clears cookie → **204**; safe to repeat |

Sign-up requires at least 8 password characters, a letter, a number, and a non-whitespace special character. Passwords are limited to 128 characters and are never trimmed or lowercased. Sign-in requires a nonempty password, without imposing new password-complexity rules on existing credentials. Confirm password is a frontend-only check; do not send it to this API. Unknown properties are rejected.

Sign-up creates an account but does not automatically sign in. After successful registration, the client should navigate to sign-in. Both unknown emails and incorrect passwords produce the same **401** message. Duplicate normalized emails return **409**. Invalid payloads return **400**, disallowed/missing origins **403**, absent/expired/revoked sessions **401**, and rate limits **429**. Nest's error shape is `{ "statusCode", "message", "error" }`; validation `message` can be an array.

### Try it locally

```sh
curl -i http://localhost:3000/auth/sign-up \
  -H 'Origin: http://localhost:5173' -H 'Content-Type: application/json' \
  --data '{"name":"Demo User","email":"demo@example.com","password":"Example123!"}'

curl -i -c /tmp/easygenerator-cookies.txt http://localhost:3000/auth/sign-in \
  -H 'Origin: http://localhost:5173' -H 'Content-Type: application/json' \
  --data '{"email":"demo@example.com","password":"Example123!"}'

curl -b /tmp/easygenerator-cookies.txt http://localhost:3000/auth/me
curl -b /tmp/easygenerator-cookies.txt http://localhost:3000/auth/application
curl -i -b /tmp/easygenerator-cookies.txt -X POST http://localhost:3000/auth/sign-out \
  -H 'Origin: http://localhost:5173'
rm /tmp/easygenerator-cookies.txt
```

## Frontend integration

The existing Vite `/api` proxy maps `/api/auth/...` to these endpoints. Browser same-origin requests send cookies automatically. For direct requests from the frontend to a different API origin, use Axios `withCredentials: true` and set `CLIENT_ORIGIN` to the exact frontend origin (no trailing slash). The cookie is HttpOnly: do not read it from JavaScript or copy it into localStorage. Get session state from `/auth/me`. Clear user-specific TanStack Query caches on logout and when switching accounts.

The client forms are connected through `src/features/auth/api.ts` using Axios and TanStack Query. Successful registration returns to sign-in with a confirmation message; login loads `/app`. The protected route checks `/auth/me` before entry and loads its welcome message from `/auth/application`. Active sessions are rechecked on focus and every minute. Logout revokes the session and clears cached data. Server/API errors are displayed inline. No session token is stored in localStorage.

## Security and production settings

- Password hashing uses asynchronous Node scrypt with a fresh 16-byte salt and fixed versioned parameters (`N=131072, r=8, p=1`, 64-byte key). Verification uses constant-time comparison; missing users still perform a dummy hash comparison.
- Each sign-in issues a new random token; MongoDB stores only its SHA-256 hash. Default lifetime is 7 days, configurable with `SESSION_TTL_SECONDS` (60 seconds to 30 days). Sessions have fixed expiry, not sliding expiry. Logout revokes the current session only.
- `eg_session` is host-only, HttpOnly, SameSite=Lax, Path=/, and **Secure in production**. Use HTTPS for production and deploy frontend/API on the same site. Arbitrary cross-site cookie deployments are intentionally unsupported by this configuration.
- Origin checks reject all unsafe requests unless `Origin` exactly equals `CLIENT_ORIGIN`, including missing origins. This protects login, logout, and other mutations against CSRF. Command-line clients must supply that header. CORS alone is not treated as CSRF protection.
- Helmet security headers, a 16 KiB JSON body limit, whitelist validation, and no-store responses are enabled. Do not log request bodies, cookies, passwords, or database credentials.
- Rate limits per client IP: 5 sign-ups/minute, 10 sign-ins/minute, and 100 requests/minute by default. The current rate-limit store is in-process. **Before deploying multiple replicas**, use shared throttling storage. Configure Express trust-proxy only for your actual trusted proxy hops, and apply edge limits to protect expensive password hashing. No blanket `trust proxy: true` is enabled.
- Use a dedicated MongoDB user with least-privilege permissions, network restrictions, TLS, and backups in production. Required indexes are created at startup, so the application identity currently needs index-creation privileges. For larger deployments, move index provisioning to a controlled deployment step before removing those privileges. Index changes are not destructively synchronized.
- Set `NODE_ENV=production`, an explicit `MONGODB_URI`, and an HTTPS `CLIENT_ORIGIN`. Missing or invalid settings stop startup. Configure your reverse proxy to route `/api` to the backend and strip that prefix, as Vite does locally.
- The generated Observe setup with placeholder credentials was removed from bootstrap; no external telemetry is configured by default. If adding monitoring, configure real credentials and redact sensitive data.

```sh
bun run build
bun run start:prod
```

## Verification

```sh
bun run build
bun run lint
bun run test
bun run test:e2e
```

Use Node 24 on your PATH. Integration tests start a temporary real MongoDB process through `mongodb-memory-server`, run against an isolated database, and shut it down afterward. The first installation/run may download a MongoDB binary; CI must allow that download or provide a cached binary. Tests never use your Compass database. They cover input validation, password policy, duplicate email constraints, session hashing, protected endpoints, expiry before TTL cleanup, logout/revocation, production cookie flags, origin checks, and rate limiting.

This implements the task's backend authentication scope. Email verification, password reset, and distributed throttling are future extensions, not implemented features.
