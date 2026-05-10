const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma = require("../config/database");
const { AppError } = require("../middleware/error.middleware");
const emailService = require("./email.service");
const logger = require("../utils/logger");

/**
 * Generate a memorable but secure random password.
 * Format: word-word-#### (~52 bits of entropy)
 */
function generatePassword() {
  const words = [
    "river", "stone", "cedar", "amber", "frost", "ember", "willow", "haven",
    "ivory", "maple", "ocean", "raven", "swift", "quiet", "noble", "silver",
  ];
  const w1 = words[crypto.randomInt(words.length)];
  const w2 = words[crypto.randomInt(words.length)];
  const n = String(crypto.randomInt(1000, 9999));
  return `${w1}-${w2}-${n}`;
}

/**
 * Create a patient login (User with VIEWER role) and email credentials.
 * Called by clinicians/admins.
 *
 * Returns: { patient, plainPassword, emailDelivered, emailReason }
 */
async function createPatient({ email, firstName, lastName, clinician }) {
  if (!email || !firstName || !lastName) {
    throw new AppError("First name, last name, and email are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new AppError("Invalid email address", 400);
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new AppError(`A user with email ${normalizedEmail} already exists`, 409);
  }

  const plainPassword = generatePassword();
  const hashed = await bcrypt.hash(plainPassword, 10);

  const patient = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashed,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: "VIEWER",
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  logger.info(`Patient ${normalizedEmail} created by clinician ${clinician.email}`);

  // Send credentials email (non-blocking failure — return delivery status)
  const clinicianName = `${clinician.firstName || ""} ${clinician.lastName || ""}`.trim() || "Your clinician";
  const result = await emailService.sendPatientCredentials({
    to: normalizedEmail,
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: normalizedEmail,
    password: plainPassword,
    clinicianName,
  });

  return {
    patient,
    plainPassword,
    emailDelivered: result.delivered,
    emailReason: result.reason || null,
  };
}

/**
 * List all patient logins (VIEWER users), optionally filtered by clinician.
 */
async function listPatients() {
  const patients = await prisma.user.findMany({
    where: { role: "VIEWER" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return patients;
}

/**
 * Re-generate password and re-send email to a patient.
 */
async function resendPatientCredentials({ patientId, clinician }) {
  const patient = await prisma.user.findUnique({
    where: { id: patientId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  if (!patient) throw new AppError("Patient not found", 404);
  if (patient.role !== "VIEWER") throw new AppError("Account is not a patient login", 400);

  const plainPassword = generatePassword();
  const hashed = await bcrypt.hash(plainPassword, 10);

  await prisma.user.update({
    where: { id: patientId },
    data: { password: hashed },
  });

  const clinicianName = `${clinician.firstName || ""} ${clinician.lastName || ""}`.trim() || "Your clinician";
  const result = await emailService.sendPatientCredentials({
    to: patient.email,
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    password: plainPassword,
    clinicianName,
  });

  return {
    patient,
    plainPassword,
    emailDelivered: result.delivered,
    emailReason: result.reason || null,
  };
}

module.exports = { createPatient, listPatients, resendPatientCredentials };
