# Easygenerator full-stack task

One repository containing a React client and NestJS API.

Live application: https://easygenerator.ahmed-esmail.tech/

Repository: https://github.com/ahmedesmail01/easyGenerator-task

See the [submission review and scoring evidence](docs/submission-checklist.md).

- `client/easyGenerator-task`: React, TypeScript, Vite, Tailwind, TanStack Router/Query, React Hook Form, Zod, and Axios.
- `server/easy-generator-task`: NestJS, MongoDB/Mongoose, scrypt password hashing, and revocable cookie sessions.

Use Node.js 24 LTS (`nvm use`) and Bun for dependency management.

```sh
cd server/easy-generator-task
bun install --frozen-lockfile
# Merge .env.example into an existing .env, or copy it if none exists.
cp -n .env.example .env
bun run start:dev
```

In another terminal:

```sh
cd client/easyGenerator-task
bun install --frozen-lockfile
bun run dev
```

Local MongoDB must be running at `mongodb://127.0.0.1:27017`, or set `MONGODB_URI`. Open the client at `http://localhost:5173`. Vite proxies `/api` requests to port 3000.

See [server setup and API documentation](server/easy-generator-task/README.md) for Compass instructions, endpoints, schemas, testing, session security, and production configuration. The authentication forms submit to the API using TanStack Query mutations. Sign-up returns to sign-in, login opens the protected application route, sessions survive reloads via HttpOnly cookies, and logout revokes the session and clears cached user data.

See [AI assistance disclosure](AI.md).

## Production deployment

Docker, HTTPS, MongoDB persistence, backups, and GitHub Actions deployment to Hostinger are documented in [deploy/README.md](deploy/README.md). DNS and VPS/GitHub access must be configured before the workflow can publish a live deployment.
