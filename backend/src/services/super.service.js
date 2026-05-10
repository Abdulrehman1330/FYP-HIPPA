const bcrypt = require("bcrypt");
const prisma = require("../config/database");
const { AppError } = require("../middleware/error.middleware");
const { config } = require("../config/env");
const { logAction } = require("./audit.service");

async function listClinics() {
  const clinics = await prisma.clinic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true, patients: true, documents: true } },
    },
  });
  return clinics;
}

async function getClinic(id) {
  const c = await prisma.clinic.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true, patients: true, documents: true, auditLogs: true } },
    },
  });
  if (!c) throw new AppError("NOT_FOUND", 404);
  return c;
}

async function createClinic({ name }) {
  if (!name || !name.trim()) throw new AppError("VALIDATION_ERROR", 400);
  const existing = await prisma.clinic.findFirst({ where: { name: name.trim() } });
  if (existing) throw new AppError("A clinic with that name already exists", 409);
  return prisma.clinic.create({ data: { name: name.trim(), status: "ACTIVE" } });
}

async function updateClinic(id, { name, status }) {
  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (status !== undefined) {
    if (!["ACTIVE", "SUSPENDED", "DISABLED"].includes(status)) throw new AppError("VALIDATION_ERROR", 400);
    data.status = status;
  }
  return prisma.clinic.update({ where: { id }, data });
}

async function suspendClinic(id) {
  return prisma.clinic.update({ where: { id }, data: { status: "SUSPENDED" } });
}

async function createInitialAdmin(clinicId, { email, password, firstName, lastName }) {
  if (!email || !password || !firstName || !lastName) throw new AppError("VALIDATION_ERROR", 400);
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new AppError("Email already registered", 409);

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) throw new AppError("NOT_FOUND", 404);

  const hashed = await bcrypt.hash(password, config.bcryptCost);
  return prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashed,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: "ADMIN",
      clinicId,
      mustChangePassword: true,
    },
    select: {
      id: true, email: true, firstName: true, lastName: true, role: true, clinicId: true, mustChangePassword: true,
    },
  });
}

async function listPlatformAuditLog({ page = 1, limit = 50, action, clinicId } = {}) {
  const where = {};
  if (action) where.action = action;
  if (clinicId) where.clinicId = clinicId;
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        clinic: { select: { name: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { items, total, page, limit };
}

async function platformMetrics() {
  const [clinics, users, patients, documents, audit] = await Promise.all([
    prisma.clinic.count(),
    prisma.user.count(),
    prisma.patient.count(),
    prisma.document.count(),
    prisma.auditLog.count(),
  ]);
  return { clinics, users, patients, documents, auditLogEntries: audit };
}

async function disableUser(userId, actingSuperAdminId) {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) throw new AppError("NOT_FOUND", 404);
  await prisma.user.update({ where: { id: userId }, data: { status: "DISABLED" } });
  await logAction("super.user.disable", actingSuperAdminId, null, { targetUserId: userId, targetEmail: u.email });
  return { success: true };
}

module.exports = {
  listClinics,
  getClinic,
  createClinic,
  updateClinic,
  suspendClinic,
  createInitialAdmin,
  listPlatformAuditLog,
  platformMetrics,
  disableUser,
};
