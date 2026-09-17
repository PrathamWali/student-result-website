# Deployment

This project is split into:
- Frontend: Vite + React (deploy to Vercel)
- Backend: Node + Express (deploy to Render)
- Student data: `backend/db/students.json` (read-only at runtime)

## 1. Backend — Render

Create a **Web Service** from this repository.

Settings:
- Root Directory: `backend`
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`

Environment variables:
- `JWT_SECRET` = a long random secret
- `JWT_EXPIRES_IN` = `8h`
- `FRONTEND_ORIGIN` = your Vercel production URL, e.g. `https://your-site.vercel.app`

After deployment, verify:
`https://YOUR-BACKEND.onrender.com/api/health`

It should return JSON containing `"status":"ok"`.

## 2. Frontend — Vercel

Import the same GitHub repository into Vercel.

Settings:
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable:
- `VITE_API_URL` = `https://YOUR-BACKEND.onrender.com`

Redeploy after adding/changing the variable.

## 3. Important CORS step

After Vercel gives you the production URL, set that exact URL as Render's
`FRONTEND_ORIGIN` environment variable and redeploy/restart the Render service.

For multiple allowed frontend origins, separate them with commas.

## 4. Local development

The frontend still uses Vite's `/api` proxy when `VITE_API_URL` is not set.
The backend remains on port 3001.

Backend:
`cd backend`
`npm install`
`npm start`

Frontend:
`npm install`
`npm run dev`

## Data note

The project intentionally uses JSON instead of SQLite. It is suitable for a
demo/read-only result portal. If you later need administrators to add/edit
students and have those changes persist reliably in production, move the data
to a hosted database.
