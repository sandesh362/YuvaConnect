# YuvaConnect API

Express + TypeScript API for YuvaConnect Phase 1.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set the values.

3. Create the database tables and Prisma client:

   ```bash
   npm run prisma:migrate -- --name init
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

The health check is available at `http://localhost:4000/health`.

## API

`POST /api/auth/signup`

```json
{
  "email": "student@example.com",
  "password": "password123",
  "name": "Aarav Sharma",
  "role": "STUDENT"
}
```

Returns `201` with a public `user` object and one-hour `accessToken`.

`POST /api/auth/login`

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

`GET /api/auth/me`

Send the access token in the `Authorization` header:

```text
Authorization: Bearer <accessToken>
```

## Create a Neon database

1. Sign in to [Neon](https://neon.tech), create a project, and choose a region near your users.
2. In the Neon dashboard, open **Connect** and copy the PostgreSQL connection string. Use the direct (non-pooled) URL for this Phase 1 setup.
3. Paste it into `DATABASE_URL` in `.env`. Keep `?sslmode=require` if Neon includes it.
4. Set a long random value for `JWT_SECRET`.
5. Run `npm run prisma:migrate -- --name init` from this folder.

## Deploy to Render

Create a new **Web Service** from this repository, then set:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

Add these Render environment variables:

- `DATABASE_URL`: your Neon direct PostgreSQL URL
- `JWT_SECRET`: a long, random secret
- `NODE_ENV`: `production`

Render supplies `PORT` automatically. After deployment, open `https://<your-render-service>.onrender.com/health`; it should return `{ "status": "ok" }`.
