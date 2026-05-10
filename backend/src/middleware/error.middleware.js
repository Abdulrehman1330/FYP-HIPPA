const logger = require("../utils/logger");

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorMiddleware = (err, req, res, _next) => {
  logger.error(err.message, { path: req.path, method: req.method });

  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json({ success: false, error: err.message });
  }

  res.status(500).json({ success: false, error: "Internal server error" });
};

module.exports = { AppError, errorMiddleware };
