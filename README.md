# YuvaConnect mobile app

Expo Router mobile client for the YuvaConnect API. Routes live in `src/app`.

## Run locally

Install dependencies once, then provide the backend URL when starting Expo:

```powershell
npm install
$env:EXPO_PUBLIC_API_URL="https://your-render-service.onrender.com"
npm start
```

Scan the QR code in Expo Go. For an Android emulator using a local API, use `http://10.0.2.2:4000`; for a physical phone using a local API, use your computer's LAN IP, for example `http://192.168.1.10:4000`.

`app.config.js` puts `EXPO_PUBLIC_API_URL` into Expo's `extra.apiBaseUrl` configuration. Restart Expo after changing it.

## Included flows

- Signup as a Student or Business, then sign in; the JWT is kept in Expo Secure Store.
- Home fetches the current user from `GET /api/auth/me` and routes to the appropriate profile screen.
- Student profiles support photo upload, skills, availability, and a removable image portfolio.
- Business profiles support shop photos and business verification fields.
- Both profile screens display verification status and invalidate TanStack Query profile data after mutations.

The backend setup, migration, Cloudinary configuration, Render deployment settings, and API reference are in [backend/README.md](backend/README.md).
