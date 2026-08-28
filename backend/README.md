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
   npx prisma migrate deploy
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

### Profiles and uploads

All of these endpoints require the bearer token above.

- `GET /api/profile` returns `{ role, profile }`; a student profile includes `portfolioItems`.
- `PUT /api/profile` upserts the current user's profile. Student fields: `college`, `skills` (string array), `bio`, `availability`, and `profileImageUrl`. Business fields: `businessName`, `category`, `registrationNumber`, `address`, and `shopImageUrl`.
- `POST /api/profile/portfolio` adds a student portfolio item with `title`, optional `description`, and optional `imageUrl`.
- `DELETE /api/profile/portfolio/:id` removes an item owned by the current student.
- `POST /api/upload` accepts one image as multipart form field `file` and returns `{ "url": "..." }`.
- `PATCH /api/profile/:userId/verify` requires an `ADMIN` user's bearer token and sets the applicable profile's `isVerified` field to true.

Set `CLOUDINARY_URL` before using `/api/upload`. It has the format `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`.

## Create a Neon database

1. Sign in to [Neon](https://neon.tech), create a project, and choose a region near your users.
2. In the Neon dashboard, open **Connect** and copy the PostgreSQL connection string. Use the direct (non-pooled) URL for this Phase 1 setup.
3. Paste it into `DATABASE_URL` in `.env`. Keep `?sslmode=require` if Neon includes it.
4. Set a long random value for `JWT_SECRET`.
5. Run `npx prisma migrate deploy` from this folder to apply the included profile migration.

## Deploy to Render

Create a new **Web Service** from this repository, then set:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm install && npx prisma migrate deploy && npm run build` |
| Start Command | `npm start` |

Add these Render environment variables:

- `DATABASE_URL`: your Neon direct PostgreSQL URL
- `JWT_SECRET`: a long, random secret
- `CLOUDINARY_URL`: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`
- `NODE_ENV`: `production`

Render supplies `PORT` automatically. After deployment, open `https://<your-render-service>.onrender.com/health`; it should return `{ "status": "ok" }`.
