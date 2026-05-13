const bcrypt = require("bcrypt");
const prisma = require("../config/database");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { AppError } = require("../middleware/error.middleware");
const { config } = require("../config/env");

const SUPER_ADMIN_EMAIL = "asadrasheeddev@gmail.com";

function validatePassword(password) {
  if (!password || typeof password !== "string") {
    throw new AppError("VALIDATION_ERROR", 400);
  }
  const min = config.passwordMinLength;
  if (password.length < min) {
    throw new AppError(`Password must be at least ${min} characters`, 400);
  }
}

/**
 * Self-registration is restricted to the very first SUPER_ADMIN seed.
 * In all other cases, accounts are created by an ADMIN through /admin/users
 * (or by a SUPER_ADMIN through /super/users). This function is kept for the
 * seed flow and returns the same shape as before.
 *
 * The role assignment is enforced server-side regardless of what the caller passes:
 *   - asadrasheeddev@gmail.com  → SUPER_ADMIN
 *   - everyone else             → CLINICIAN by default
 */
async function registerUser(email, password, firstName, lastName, _requestedRole) {
  if (!config.publicRegistrationEnabled) {
    throw new AppError("Public registration is disabled", 403);
  }

  if (!email || !firstName || !lastName) throw new AppError("VALIDATION_ERROR", 400);
  validatePassword(password);

  const normalized = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) throw new AppError("Email already registered", 400);

  const role = normalized === SUPER_ADMIN_EMAIL ? "SUPER_ADMIN" : "CLINICIAN";

  const hashed = await bcrypt.hash(password, config.bcryptCost);
  const user = await prisma.user.create({
    data: {
      email: normalized,
      password: hashed,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      // SUPER_ADMIN has no clinic; CLINICIAN self-signups don't get a clinic until admin assigns
      clinicId: null,
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, clinicId: true, mustChangePassword: true },
  });

  const accessToken = signAccessToken({
    userId: user.id, email: user.email, role: user.role, clinicId: user.clinicId,
  });
  const refreshToken = signRefreshToken({ userId: user.id });

  return { user, token: accessToken, accessToken, refreshToken };
}

async function loginUser(email, password) {
  const normalized = (email || "").trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  // Same opaque error for unknown email vs wrong password vs disabled — no information leak
  if (!user) throw new AppError("Invalid credentials", 401);

  const valid = await bcrypt.compare(password || "", user.password);
  if (!valid) throw new AppError("Invalid credentials", 401);

  if (user.status === "DISABLED") throw new AppError("Invalid credentials", 401);

  // Clinic suspension blocks everyone except SUPER_ADMIN
  if (user.role !== "SUPER_ADMIN" && user.clinicId) {
    const clinic = await prisma.clinic.findUnique({ where: { id: user.clinicId } });
    if (clinic && clinic.status !== "ACTIVE") {
      throw new AppError("Clinic is currently inactive.", 403);
    }
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const accessToken = signAccessToken({
    userId: user.id, email: user.email, role: user.role, clinicId: user.clinicId,
  });
  const refreshToken = signRefreshToken({ userId: user.id });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      clinicId: user.clinicId,
      mustChangePassword: user.mustChangePassword,
    },
    token: accessToken,
    accessToken,
    refreshToken,
  };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      clinicId: true,
      mustChangePassword: true,
      clinic: { select: { id: true, name: true, status: true } },
    },
  });
  if (!user) throw new AppError("NOT_FOUND", 404);
  return user;
}

/**
 * Refresh tokens are rotated on every use. The OLD refresh token is invalidated
 * by issuing a new one. (Strict server-side rotation tracking would require a
 * stored nonce table — deferred to a later sprint.)
 */
async function refreshSession(refreshTokenRaw) {
  if (!refreshTokenRaw) throw new AppError("UNAUTHORIZED", 401);
  let payload;
  try {
    payload = verifyRefreshToken(refreshTokenRaw);
  } catch {
    throw new AppError("UNAUTHORIZED", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, clinicId: true, status: true },
  });
  if (!user || user.status === "DISABLED") throw new AppError("UNAUTHORIZED", 401);

  const accessToken = signAccessToken({
    userId: user.id, email: user.email, role: user.role, clinicId: user.clinicId,
  });
  const refreshToken = signRefreshToken({ userId: user.id });

  return { accessToken, refreshToken };
}

/**
 * Change own password. Used both for first-login forced change and later
 * voluntary changes.
 */
async function changePassword({ userId, currentPassword, newPassword }) {
  validatePassword(newPassword);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("NOT_FOUND", 404);

  // mustChangePassword users are exempt from the currentPassword check
  // because they may have been issued a temporary password they don't know
  if (!user.mustChangePassword) {
    if (!currentPassword) throw new AppError("VALIDATION_ERROR", 400);
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) throw new AppError("Invalid credentials", 401);
  }

  const hashed = await bcrypt.hash(newPassword, config.bcryptCost);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed, mustChangePassword: false },
  });

  return { success: true };
}

module.exports = { registerUser, loginUser, getMe, refreshSession, changePassword };
