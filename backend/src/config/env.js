require("dotenv").config();

const config = {
  port: parseInt(process.env.PORT || "3000"),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  storageDir: process.env.DOCUMENT_STORAGE_DIR || "./storage/documents",
  openaiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:8000",
};

module.exports = { config };
