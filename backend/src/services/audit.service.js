const prisma = require("../config/database");
const logger = require("../utils/logger");

async function logAction(action, userId, documentId, details, ipAddress) {
  try {
    await prisma.auditLog.create({
      data: { action, userId, documentId, details: details || {}, ipAddress },
    });
  } catch (err) {
    logger.error(`Failed to log audit: ${action}`, { error: err.message });
  }
}

module.exports = { logAction };
