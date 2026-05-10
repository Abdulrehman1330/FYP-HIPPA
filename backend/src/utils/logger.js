const winston = require("winston");

/**
 * PHI scrubber — strip known sensitive fields before any line is emitted.
 * Operational logs go through this; the audit log goes to the DB unchanged.
 *
 * Heuristic — covers obvious PHI keys. Not a substitute for never logging
 * patient bodies in the first place.
 */
const PHI_KEYS = new Set([
  "password", "ssn", "social_security",
  "patient_name", "patientName", "name",
  "date_of_birth", "dateOfBirth", "dob",
  "mrn", "medical_record_number",
  "address", "phone", "phoneNumber",
  "email", // emails of patients are PHI under HIPAA
]);

function scrubObject(obj, depth = 0) {
  if (depth > 6 || obj == null) return obj;
  if (Array.isArray(obj)) return obj.map((v) => scrubObject(v, depth + 1));
  if (typeof obj !== "object") return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (PHI_KEYS.has(k)) {
      out[k] = "[REDACTED]";
    } else {
      out[k] = scrubObject(v, depth + 1);
    }
  }
  return out;
}

const phiScrubFormat = winston.format((info) => {
  const scrubbed = scrubObject(info);
  return scrubbed;
})();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  format: winston.format.combine(
    phiScrubFormat,
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        phiScrubFormat,
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

module.exports = logger;
