require("dotenv").config();

const config = {
  port: parseInt(process.env.PORT || "3000"),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",

  // JWT — access + refresh
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET || "dev-secret") + "-refresh",
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || "1h",
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL || "7d",
  // Legacy alias
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_ACCESS_TTL || "1h",

  // Storage
  storageDir: process.env.DOCUMENT_STORAGE_DIR || "./storage/documents",

  // External services (optional)
  openaiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:8000",
  ocrServiceUrl: process.env.OCR_SERVICE_URL || "http://localhost:5000",

  // Password policy (relaxed for dev — set via env in prod)
  passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || "8", 10),

  // Bcrypt
  bcryptCost: parseInt(process.env.BCRYPT_COST || "10", 10),
};

module.exports = { config };
