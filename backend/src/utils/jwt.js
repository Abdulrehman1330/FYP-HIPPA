const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { config } = require("../config/env");

/**
 * Sign an access token (short-lived, sent in Authorization header).
 * Payload contains userId, email, role, clinicId (or null for SUPER_ADMIN).
 */
function signAccessToken({ userId, email, role, clinicId = null }) {
  return jwt.sign(
    { userId, email, role, clinicId, type: "access" },
    config.jwtSecret,
    { expiresIn: config.jwtAccessTtl },
  );
}

/**
 * Sign a refresh token (long-lived, stored as HttpOnly cookie).
 * Includes a random nonce so each issued token is unique (rotation tracking).
 */
function signRefreshToken({ userId }) {
  const nonce = crypto.randomBytes(8).toString("hex");
  return jwt.sign(
    { userId, nonce, type: "refresh" },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshTtl },
  );
}

function verifyAccessToken(token) {
  const payload = jwt.verify(token, config.jwtSecret);
  if (payload.type && payload.type !== "access") {
    throw new Error("Wrong token type");
  }
  return payload;
}

function verifyRefreshToken(token) {
  const payload = jwt.verify(token, config.jwtRefreshSecret);
  if (payload.type !== "refresh") throw new Error("Wrong token type");
  return payload;
}

// Legacy aliases — kept until all callers migrate
function signToken(userId, email) {
  return signAccessToken({ userId, email, role: null, clinicId: null });
}
function verifyToken(token) {
  return verifyAccessToken(token);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  signToken,
  verifyToken,
};
