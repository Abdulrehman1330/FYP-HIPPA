const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma = require("../config/database");
const { AppError } = require("../middleware/error.middleware");
const { config } = require("../config/env");
const { logAction } = require("./audit.service");
const emailService = require("./email.service");

function genTempPassword() {
  const words = ["river", "stone", "cedar", "amber", "frost", "ember", "willow", "haven"];
  const w1 = words[crypto.randomInt(words.length)];
  const w2 = words[crypto.randomInt(words.length)];
  const n = String(crypto.randomInt(1000, 9999));
  return `${w1[0].toUpperCase()}${w1.slice(1)}-${w2}-${n}`;
}

async function nextMrn(clinicId) {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  const prefix = clinic ? clinic.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "") : "PAT";
  const count = await prisma.patient.count({ where: { clinicId } });
  return `${prefix || "PAT"}-${String(count + 1).padStart(4, "0")}`;
}

/**
 * Create a Patient atomically: User (role=PATIENT) + Patient row.
 * primaryDoctor and primaryClinician must already exist in the same clinic.
 * If MRN is omitted, one is auto-generated.
 */
async function createPatient(clinicId, actingAdmin, payload) {
  const { email, firstName, lastName, dateOfBirth, mrn, primaryDoctorId, primaryClinicianId } = payload;
  if (!email || !firstName || !lastName || !dateOfBirth || !primaryDoctorId || !primaryClinicianId) {
    throw new AppError("VALIDATION_ERROR — missing required fields", 400);
  }

  const normalized = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalized } });
  if (existingUser) throw new AppError("Email already registered", 409);

  const [doc, clin] = await Promise.all([
    prisma.user.findFirst({ where: { id: primaryDoctorId, clinicId, role: "DOCTOR" } }),
    prisma.user.findFirst({ where: { id: primaryClinicianId, clinicId, role: "CLINICIAN" } }),
  ]);
  if (!doc) throw new AppError("primaryDoctorId must reference a DOCTOR in this clinic", 400);
  if (!clin) throw new AppError("primaryClinicianId must reference a CLINICIAN in this clinic", 400);

  const mrnFinal = mrn || (await nextMrn(clinicId));
  const dup = await prisma.patient.findFirst({ where: { clinicId, mrn: mrnFinal } });
  if (dup) throw new AppError("MRN already in use in this clinic", 409);

  const tempPassword = genTempPassword();
  const hashed = await bcrypt.hash(tempPassword, config.bcryptCost);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalized, password: hashed,
        firstName: firstName.trim(), lastName: lastName.trim(),
        role: "PATIENT", clinicId, mustChangePassword: true, status: "ACTIVE",
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, clinicId: true },
    });
    const patient = await tx.patient.create({
      data: {
        userId: user.id, clinicId, mrn: mrnFinal,
        dateOfBirth: new Date(dateOfBirth),
        primaryDoctorId, primaryClinicianId,
      },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        primaryDoctor: { select: { id: true, firstName: true, lastName: true } },
        primaryClinician: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return { user, patient };
  });

  await logAction("admin.patient.create", actingAdmin.id, null, {
    clinicId, patientId: result.patient.id, mrn: mrnFinal, userId: result.user.id,
  });

  // Email credentials (best-effort)
  let emailDelivered = false, emailReason = null;
  try {
    const r = await emailService.sendPatientCredentials({
      to: normalized,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: normalized,
      password: tempPassword,
      clinicianName: `${actingAdmin.firstName || ""} ${actingAdmin.lastName || ""}`.trim() || "Your administrator",
    });
    emailDelivered = r.delivered;
    emailReason = r.reason;
  } catch (err) {
    emailReason = err.message;
  }

  return {
    patient: result.patient,
    plainPassword: tempPassword,
    emailDelivered, emailReason,
  };
}

async function listPatients(clinicId, { search } = {}) {
  const where = { clinicId };
  if (search) {
    where.OR = [
      { mrn: { contains: search, mode: "insensitive" } },
      { user: { firstName: { contains: search, mode: "insensitive" } } },
      { user: { lastName: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }
  return prisma.patient.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, status: true } },
      primaryDoctor: { select: { id: true, firstName: true, lastName: true } },
      primaryClinician: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { documents: true } },
    },
  });
}

async function getPatient(clinicId, patientId) {
  const p = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, status: true } },
      primaryDoctor: { select: { id: true, firstName: true, lastName: true, email: true } },
      primaryClinician: { select: { id: true, firstName: true, lastName: true, email: true } },
      documents: {
        orderBy: { uploadedAt: "desc" },
        select: { id: true, filename: true, status: true, uploadedAt: true },
      },
    },
  });
  if (!p) throw new AppError("NOT_FOUND", 404);
  return p;
}

async function reassignPatient(clinicId, patientId, actingAdmin, { primaryDoctorId, primaryClinicianId }) {
  const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId } });
  if (!patient) throw new AppError("NOT_FOUND", 404);

  const data = {};
  if (primaryDoctorId) {
    const d = await prisma.user.findFirst({ where: { id: primaryDoctorId, clinicId, role: "DOCTOR" } });
    if (!d) throw new AppError("primaryDoctorId not in clinic or not DOCTOR", 400);
    data.primaryDoctorId = primaryDoctorId;
  }
  if (primaryClinicianId) {
    const c = await prisma.user.findFirst({ where: { id: primaryClinicianId, clinicId, role: "CLINICIAN" } });
    if (!c) throw new AppError("primaryClinicianId not in clinic or not CLINICIAN", 400);
    data.primaryClinicianId = primaryClinicianId;
  }
  const updated = await prisma.patient.update({ where: { id: patientId }, data });
  await logAction("admin.patient.reassign", actingAdmin.id, null, { clinicId, patientId, ...data });
  return updated;
}

module.exports = { createPatient, listPatients, getPatient, reassignPatient };
