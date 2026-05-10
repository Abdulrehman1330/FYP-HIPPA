const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { errorMiddleware } = require("./middleware/error.middleware");
const { generalLimiter, authLimiter } = require("./middleware/rate-limit.middleware");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/documents.routes");
const extractionRoutes = require("./routes/extraction.routes");
const reviewRoutes = require("./routes/review.routes");
const pocRoutes = require("./routes/poc.routes");
const riskRoutes = require("./routes/risk.routes");
const ragRoutes = require("./routes/rag.routes");
const patientsRoutes = require("./routes/patients.routes"); // legacy — kept for backward compat
const superRoutes = require("./routes/super.routes");
const adminRoutes = require("./routes/admin.routes");
const adminPatientsRoutes = require("./routes/admin-patients.routes");
const caseloadRoutes = require("./routes/caseload.routes");

const app = express();

// === SECURITY HEADERS ===
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
}));

// === CORS — allow-list with credentials (cookies) ===
const corsOrigins = (process.env.CORS_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
const allowedOrigins = corsOrigins.length > 0 ? corsOrigins : [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // same-origin / curl
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

// === RATE LIMITING ===
// Auth endpoints: tighter window (login throttle in spec §6.7)
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/auth/refresh", authLimiter);
// All other authenticated routes — general 100 req / 15 min per IP
app.use("/api/v1", generalLimiter);

// === ROUTES ===
app.use("/api/v1", healthRoutes);
app.use("/api/v1", authRoutes);

// New role-scoped namespaces
app.use("/api/v1", superRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1", adminPatientsRoutes);
app.use("/api/v1", caseloadRoutes);

// Existing namespaces (refactored for tenancy + caseload)
app.use("/api/v1", documentRoutes);
app.use("/api/v1", extractionRoutes);
app.use("/api/v1", reviewRoutes);
app.use("/api/v1", pocRoutes);
app.use("/api/v1", ragRoutes);
app.use("/api/v1", riskRoutes);

// Legacy /patients — kept temporarily for the old "Add patient" flow
app.use("/api/v1", patientsRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Healthcare Document API v1.0", docs: "/api/v1/health" });
});

app.use(errorMiddleware);

module.exports = app;
