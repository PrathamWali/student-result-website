# Karnatak University Student Result Portal — Backend

## Requirements
- Node.js 18+ (Node.js 20 or 24 both work)
- npm

This version intentionally does **not** use SQLite or native `node-gyp` packages. Student data is stored in `db/students.json`, so no Visual Studio build tools are required.

## Run

From this `backend` folder:

```powershell
npm install
npm run seed
npm start
```

The API starts at `http://localhost:3001`.

Health check:
`http://localhost:3001/api/health`

## Demo accounts

- `U02BF25S0274` / `Sujanpujar@123`
- `4KV21CS001` / `student123`

Passwords are stored as salted scrypt hashes in `db/students.json`.

## API

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/results/:usn` with `Authorization: Bearer <token>`
- `GET /api/health`
