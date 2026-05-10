const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma = require("../config/database");
const { AppError } = require("../middleware/error.middleware");
const { config } = require("../config/env");
const { logAction } = require("./audit.service");
const emailService = require("./email.service");

function genTempPassword() {
  // 12 chars, mixed-case + digit
  const words = ["river", "stone", "cedar", "amber", "frost", "ember", "willow", "haven", "ivory", "maple"];
  const w1 = words[crypto.randomInt(words.length)];
  const w2 = words[crypto.randomInt(words.length)];
  const n = String(crypto.randomInt(1000, 9999));
  return `${w1[0].toUpperCase()}${w1.slice(1)}-${w2}-${n}`;
}

/**
 * List users in caller's clinic. ADMIN-scoped.
 */
async function listUsers(clinicId, { role } = {}) {
  const where = { clinicId };
  if (role) where.role = role;
  return prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      mustChangePassword: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
}

async function getUser(clinicId, userId) {
  const u = await prisma.user.findFirst({
    where: { id: userId, clinicId },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, status: true, mustChangePassword: true, lastLoginAt: true, createdAt: true,
    },
  });
  if (!u) throw new AppError("NOT_FOUND", 404);
  return u;
}

/**
 * Create a CLINICIAN, DOCTOR, or PATIENT user inside the caller's clinic.
 * Generates a temporary password, sets mustChangePassword=true, emails creds (best-effort).
 * For PATIENT, also creates the Patient row (atomic).
 */
async function createUser(clinicId, actingAdmin, { email, firstName, lastName, role, mrn, dateOfBirth, primaryDoctorId, primaryClinicianId }) {
  if (!email || !firstName || !lastName || !role) throw new AppError("VALIDATION_ERROR", 400);
  if (!["CLINICIAN", "DOCTOR", "PATIENT", "ADMIN"].includes(role)) {
    throw new AppError("VALIDATION_ERROR", 400);
  }
  // ADMIN can be created by another ADMIN (per spec) — caller handles policy
  const normalized = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) throw new AppError("Email already registered", 409);

  const tempPassword = genTempPassword();
  const hashed = await bcrypt.hash(tempPassword, config.bcryptCost);

  // For PATIENT, validate MRN, DOB, and primary assignments are in the same clinic
  if (role === "PATIENT") {
    if (!mrn || !dateOfBirth || !primaryDoctorId || !primaryClinicianId) {
      throw new AppError("PATIENT requires mrn, dateOfBirth, primaryDoctorId, primaryClinicianId", 400);
    }
    const [doc, clin] = await Promise.all([
      prisma.user.findFirst({ where: { id: primaryDoctorId, clinicId, role: "DOCTOR" } }),
      prisma.user.findFirst({ where: { id: primaryClinicianId, clinicId, role: "CLINICIAN" } }),
    ]);
    if (!doc) throw new AppError("primaryDoctorId not in clinic or not a DOCTOR", 400);
    if (!clin) throw new AppError("primaryClinicianId not in clinic or not a CLINICIAN", 400);

    const dup = await prisma.patient.findFirst({ where: { clinicId, mrn } });
    if (dup) throw new AppError("MRN already in use in this clinic", 409);
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalized,
        password: hashed,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        clinicId,
        mustChangePassword: true,
        status: "ACTIVE",
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, clinicId: true },
    });

    if (role === "PATIENT") {
      await tx.patient.create({
        data: {
          userId: user.id,
          clinicId,
          mrn,
          dateOfBirth: new Date(dateOfBirth),
          primaryDoctorId,
          primaryClinicianId,
        },
      });
    }
    return user;
  });

  await logAction(`admin.user.create`, actingAdmin.id, null, {
    clinicId, targetUserId: result.id, targetEmail: result.email, role,
  });

  // Email credentials (best-effort)
  let emailDelivered = false, emailReason = null;
  try {
    const r = await emailService.sendPatientCredentials({
      to: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      password: tempPassword,
      clinicianName: `${actingAdmin.firstName || ""} ${actingAdmin.lastName || ""}`.trim() || "Your administrator",
    });
    emailDelivered = r.delivered;
    emailReason = r.reason;
  } catch (err) {
    emailReason = err.message;
  }

  return { user: result, plainPassword: tempPassword, emailDelivered, emailReason };
}

async function updateUser(clinicId, userId, actingAdmin, patch) {
  const target = await prisma.user.findFirst({ where: { id: userId, clinicId } });
  if (!target) throw new AppError("NOT_FOUND", 404);

  const data = {};
  if (patch.firstName) data.firstName = patch.firstName.trim();
  if (patch.lastName) data.lastName = patch.lastName.trim();
  if (patch.role && ["CLINICIAN", "DOCTOR", "PATIENT", "ADMIN"].includes(patch.role)) {
    data.role = patch.role;
  }
  if (patch.status && ["ACTIVE", "DISABLED"].includes(patch.status)) {
    data.status = patch.status;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true },
  });
  await logAction("admin.user.update", actingAdmin.id, null, { clinicId, targetUserId: userId, patch: data });
  return updated;
}

async function disableUser(clinicId, userId, actingAdmin) {
  const target = await prisma.user.findFirst({ where: { id: userId, clinicId } });
  if (!target) throw new AppError("NOT_FOUND", 404);
  await prisma.user.update({ where: { id: userId }, data: { status: "DISABLED" } });
  await logAction("admin.user.disable", actingAdmin.id, null, { clinicId, targetUserId: userId, targetEmail: target.email });
  return { success: true };
}

async function enableUser(clinicId, userId, actingAdmin) {
  const target = await prisma.user.findFirst({ where: { id: userId, clinicId } });
  if (!target) throw new AppError("NOT_FOUND", 404);
  await prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } });
  await logAction("admin.user.enable", actingAdmin.id, null, { clinicId, targetUserId: userId, targetEmail: target.email });
  return { success: true };
}

async function resetPassword(clinicId, userId, actingAdmin) {
  const target = await prisma.user.findFirst({ where: { id: userId, clinicId } });
  if (!target) throw new AppError("NOT_FOUND", 404);

  const tempPassword = genTempPassword();
  const hashed = await bcrypt.hash(tempPassword, config.bcryptCost);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed, mustChangePassword: true },
  });

  await logAction("admin.user.reset-password", actingAdmin.id, null, { clinicId, targetUserId: userId });

  let emailDelivered = false, emailReason = null;
  try {
    const r = await emailService.sendPatientCredentials({
      to: target.email,
      firstName: target.firstName,
      lastName: target.lastName,
      email: target.email,
      password: tempPassword,
      clinicianName: `${actingAdmin.firstName || ""} ${actingAdmin.lastName || ""}`.trim() || "Your administrator",
    });
    emailDelivered = r.delivered;
    emailReason = r.reason;
  } catch (err) {
    emailReason = err.message;
  }

  return { plainPassword: tempPassword, emailDelivered, emailReason };
}

async function listClinicAuditLog(clinicId, { page = 1, limit = 50, action } = {}) {
  const where = { clinicId };
  if (action) where.action = action;
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { items, total, page, limit };
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  disableUser,
  enableUser,
  resetPassword,
  listClinicAuditLog,
};
