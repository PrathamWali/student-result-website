# Karnatak University Student Result Portal

## Run locally on Windows

This project has a Vite frontend and a Node/Express backend.

### 1. Backend

Open a terminal in the `backend` folder:

```powershell
npm install
npm run seed
npm start
```

Keep this terminal running. The backend should report:

`Karnatak University Result API running on http://localhost:3001`

### 2. Frontend

Open a **second** terminal in the project root:

```powershell
npm install
npm run dev
```

Open the `Local:` URL shown by Vite.

### Demo login

```text
USN: U02BF25S0274
Password: Sujanpujar@123
```

Alternative:

```text
USN: 4KV21CS001
Password: student123
```

### Important

The backend in this version uses a JSON data file instead of `better-sqlite3`. Therefore it works with Node.js 24 without Visual Studio or node-gyp.

If login says that the result server cannot be reached, make sure the backend terminal is still running on port 3001.
