const prisma = require("../config/database");
const { verifyAccessToken } = require("../utils/jwt");
const { AppError } = require("./error.middleware");

/**
 * authMiddleware — runs on every protected route.
 * Loads the user, attaches { id, email, role, clinicId, mustChangePassword } to req.user.
 * Enforces:
 *   - Token signature & expiry
 *   - User exists and is ACTIVE
 *   - Clinic (if any) is ACTIVE (suspended → 403)
 *   - mustChangePassword flag — blocks every route except /auth/change-password
 */
const authMiddleware = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("UNAUTHORIZED", 401);
    }

    const payload = verifyAccessToken(header.split(" ")[1]);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        clinicId: true,
        status: true,
        mustChangePassword: true,
        clinic: { select: { id: true, name: true, status: true } },
      },
    });

    if (!user) throw new AppError("UNAUTHORIZED", 401);
    if (user.status === "DISABLED") throw new AppError("UNAUTHORIZED", 401);

    // Suspended/disabled clinic blocks everyone except SUPER_ADMIN
    if (user.role !== "SUPER_ADMIN" && user.clinic && user.clinic.status !== "ACTIVE") {
      throw new AppError("Clinic is currently inactive.", 403);
    }

    // First-login forced password change — block everything except change-password endpoint
    const allowedWhenMustChange = req.path === "/auth/change-password" || req.path === "/auth/me";
    if (user.mustChangePassword && !allowedWhenMustChange) {
      throw new AppError("PASSWORD_CHANGE_REQUIRED", 403);
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      clinicId: user.clinicId,
      mustChangePassword: user.mustChangePassword,
    };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError("UNAUTHORIZED", 401));
  }
};

/**
 * requireRole — gate a route by role.
 * Returns 403 if req.user.role is not in the allow-list.
 */
const requireRole = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("FORBIDDEN", 403));
    }
    next();
  };
};

/**
 * assertCaseload — ensure the requesting user is allowed to act on a given
 * patient (or document, by extension). Returns 404 (not 403) on miss to avoid
 * leaking the existence of resources outside the user's scope.
 *
 * Usage: await assertCaseload(req, { patientId }) or { documentId }
 */
async function assertCaseload(req, { patientId, documentId }) {
  if (!req.user) throw new AppError("UNAUTHORIZED", 401);
  const { role, id: userId, clinicId } = req.user;

  // SUPER_ADMIN — platform-wide, never scoped
  if (role === "SUPER_ADMIN") return true;

  let patient;
  if (documentId) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { clinicId: true, patientId: true, userId: true },
    });
    if (!doc) throw new AppError("NOT_FOUND", 404);
    if (doc.clinicId && doc.clinicId !== clinicId) throw new AppError("NOT_FOUND", 404);

    // Legacy docs without patientId — fall back to checking uploader within same clinic
    if (!doc.patientId) {
      // ADMIN within clinic OK; CLINICIAN must be the uploader
      if (role === "ADMIN") return true;
      if (role === "CLINICIAN" && doc.userId === userId) return true;
      throw new AppError("NOT_FOUND", 404);
    }
    patient = await prisma.patient.findUnique({
      where: { id: doc.patientId },
      select: { id: true, clinicId: true, userId: true, primaryDoctorId: true, primaryClinicianId: true },
    });
  } else if (patientId) {
    patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, clinicId: true, userId: true, primaryDoctorId: true, primaryClinicianId: true },
    });
  } else {
    throw new AppError("VALIDATION_ERROR", 400);
  }

  if (!patient) throw new AppError("NOT_FOUND", 404);
  if (patient.clinicId !== clinicId) throw new AppError("NOT_FOUND", 404);

  switch (role) {
    case "ADMIN":
      return true;
    case "CLINICIAN":
      if (patient.primaryClinicianId === userId) return true;
      throw new AppError("NOT_FOUND", 404);
    case "DOCTOR":
      if (patient.primaryDoctorId === userId) return true;
      throw new AppError("NOT_FOUND", 404);
    case "PATIENT":
      if (patient.userId === userId) return true;
      throw new AppError("NOT_FOUND", 404);
    default:
      throw new AppError("FORBIDDEN", 403);
  }
}

module.exports = { authMiddleware, requireRole, assertCaseload };
