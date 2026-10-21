# Easygenerator full-stack task

One repository containing a React client and NestJS API.

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

See [server setup and API documentation](server/easy-generator-task/README.md) for Compass instructions, endpoints, schemas, testing, session security, and production configuration. The authentication forms currently validate client-side; connecting their submit callbacks to the API and enforcing client route access remain separate frontend work.

See [AI assistance disclosure](AI.md).
