require("dotenv").config();

const nodeEnv = process.env.NODE_ENV || "development";

const config = {
  port: parseInt(process.env.PORT || "3000"),
  nodeEnv,
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
  llmProvider: (process.env.LLM_PROVIDER || "auto").toLowerCase(),
  openaiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  geminiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  anthropicKey: process.env.ANTHROPIC_API_KEY || "",
  anthropicModel: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022",
  anthropicVersion: process.env.ANTHROPIC_VERSION || "2023-06-01",
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:8000",
  ocrServiceUrl: process.env.OCR_SERVICE_URL || "http://localhost:5000",

  // Password policy (relaxed for dev — set via env in prod)
  passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || "8", 10),
  publicRegistrationEnabled: (process.env.PUBLIC_REGISTRATION_ENABLED || (nodeEnv === "production" ? "false" : "true")).toLowerCase() === "true",

  // Bcrypt
  bcryptCost: parseInt(process.env.BCRYPT_COST || "10", 10),
};

module.exports = { config };
