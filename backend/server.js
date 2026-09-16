const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/auth");
const resultsRoutes = require("./routes/results");

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const hasConfiguredSecret = Boolean(process.env.JWT_SECRET);
const JWT_SECRET = process.env.JWT_SECRET || "local-development-secret-change-me";
process.env.JWT_SECRET = JWT_SECRET;

// Middleware
const allowedOrigins = [
  "http://localhost:8443",
  "http://localhost:5173",
  ...(process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser requests (curl, health checks, server-to-server).
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "100kb" }));

// Request logger
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/results", resultsRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Karnatak University Result API listening on port ${PORT}`);
  if (!hasConfiguredSecret) {
    console.warn("WARNING: JWT_SECRET is not set. Using the local development secret.");
  }
  console.log(`  POST /api/auth/login`);
  console.log(`  GET  /api/results/:usn   (requires Bearer token)`);
  console.log(`  GET  /api/health`);
});
