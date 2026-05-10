/**
 * Phase 2 — Multi-tenant data backfill.
 *
 * Idempotent: re-running it after success should be a no-op (or close to it).
 * Strategy:
 *   1. Create "Alpha Labs and Care" clinic if missing.
 *   2. Create placeholder CLINICIAN + DOCTOR users in Alpha Labs (so we have
 *      someone to set as primaryClinicianId / primaryDoctorId on Patient rows).
 *   3. Promote asadrasheeddev@gmail.com to SUPER_ADMIN, clinicId=NULL.
 *   4. Promote admin@gumnammomina.pk to ADMIN of Alpha Labs.
 *   5. Convert existing VIEWER users to PATIENT, attach to Alpha Labs, create
 *      a Patient row (synthetic MRN, placeholder DOB).
 *   6. Backfill clinicId on every existing Document and AuditLog row.
 *   7. Write generated credentials to backend/migration-credentials.txt.
 *
 * Usage:
 *   node scripts/backfill-multitenant.js
 */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const SUPER_ADMIN_EMAIL = "asadrasheeddev@gmail.com";
const ALPHA_CLINIC_NAME = "Alpha Labs and Care";
const PLACEHOLDER_DOMAIN = "alpha-labs.local";

function genPassword() {
  // 14-char URL-safe random — meets future 12-char rule
  return crypto.randomBytes(10).toString("base64").replace(/[+/=]/g, "").slice(0, 14) + "Aa1";
}

async function ensureClinic() {
  let clinic = await prisma.clinic.findFirst({ where: { name: ALPHA_CLINIC_NAME } });
  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: { name: ALPHA_CLINIC_NAME, status: "ACTIVE" },
    });
    console.log(`[clinic] created "${ALPHA_CLINIC_NAME}" id=${clinic.id}`);
  } else {
    console.log(`[clinic] exists "${ALPHA_CLINIC_NAME}" id=${clinic.id}`);
  }
  return clinic;
}

async function ensurePlaceholderUser({ email, role, firstName, lastName, clinicId, generatedCreds }) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    // If exists, just ensure role/clinic are correct
    if (user.role !== role || user.clinicId !== clinicId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role, clinicId },
      });
      console.log(`[user] updated ${email} → role=${role} clinic=${clinicId}`);
    } else {
      console.log(`[user] exists ${email} role=${role}`);
    }
    return user;
  }
  const plainPassword = genPassword();
  const hashed = await bcrypt.hash(plainPassword, 10);
  user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
      role,
      clinicId,
      mustChangePassword: true,
      status: "ACTIVE",
    },
  });
  generatedCreds.push({ role, email, password: plainPassword });
  console.log(`[user] created placeholder ${role} ${email}`);
  return user;
}

async function promoteSuperAdmin() {
  const u = await prisma.user.findUnique({ where: { email: SUPER_ADMIN_EMAIL } });
  if (!u) {
    console.log(`[super_admin] WARNING — ${SUPER_ADMIN_EMAIL} not found, skipping promotion`);
    return null;
  }
  if (u.role === "SUPER_ADMIN" && u.clinicId === null) {
    console.log(`[super_admin] already correct`);
    return u;
  }
  const updated = await prisma.user.update({
    where: { id: u.id },
    data: { role: "SUPER_ADMIN", clinicId: null },
  });
  console.log(`[super_admin] promoted ${SUPER_ADMIN_EMAIL}`);
  return updated;
}

async function promoteClinicAdmin(email, clinicId) {
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u) {
    console.log(`[admin] ${email} not found — skipping`);
    return null;
  }
  if (u.role === "ADMIN" && u.clinicId === clinicId) {
    console.log(`[admin] ${email} already ADMIN of ${clinicId}`);
    return u;
  }
  const updated = await prisma.user.update({
    where: { id: u.id },
    data: { role: "ADMIN", clinicId, mustChangePassword: true },
  });
  console.log(`[admin] promoted ${email} → ADMIN of clinic ${clinicId} (mustChangePassword=true)`);
  return updated;
}

async function convertViewersToPatients(clinic, primaryDoctor, primaryClinician) {
  const viewers = await prisma.user.findMany({
    where: { OR: [{ role: "VIEWER" }, { role: "PATIENT", clinicId: null }] },
  });

  let mrnCounter = 1;
  const existingPatients = await prisma.patient.findMany({ where: { clinicId: clinic.id } });
  const existingMrns = new Set(existingPatients.map(p => p.mrn));

  for (const viewer of viewers) {
    // Skip if already has a Patient row
    const existingPatient = await prisma.patient.findUnique({ where: { userId: viewer.id } });
    if (existingPatient) {
      console.log(`[patient] ${viewer.email} already has Patient row — skipping`);
      continue;
    }

    // Pick a free MRN
    let mrn;
    while (true) {
      mrn = `ALC-${String(mrnCounter).padStart(4, "0")}`;
      mrnCounter += 1;
      if (!existingMrns.has(mrn)) {
        existingMrns.add(mrn);
        break;
      }
    }

    // Update User: set role=PATIENT, attach to clinic, set mustChangePassword
    await prisma.user.update({
      where: { id: viewer.id },
      data: {
        role: "PATIENT",
        clinicId: clinic.id,
        mustChangePassword: true,
      },
    });

    // Create Patient row with placeholder DOB (1970-01-01) — clinician edits later
    await prisma.patient.create({
      data: {
        userId: viewer.id,
        clinicId: clinic.id,
        mrn,
        dateOfBirth: new Date("1970-01-01"),
        primaryDoctorId: primaryDoctor.id,
        primaryClinicianId: primaryClinician.id,
      },
    });

    console.log(`[patient] ${viewer.email} → PATIENT, MRN=${mrn}, mustChangePassword=true`);
  }
}

async function backfillDocuments(clinic) {
  // Set clinicId on every doc that doesn't have one
  const result = await prisma.document.updateMany({
    where: { clinicId: null },
    data: { clinicId: clinic.id },
  });
  console.log(`[documents] set clinicId on ${result.count} rows`);

  // For docs without a patientId, try to link by extracted patient_name field
  const orphanDocs = await prisma.document.findMany({
    where: { patientId: null },
    include: { extractedFields: true },
  });

  let linked = 0;
  let unlinked = 0;
  for (const doc of orphanDocs) {
    const nameField = doc.extractedFields.find(f => f.fieldName === "patient_name");
    if (!nameField || !nameField.fieldValue) {
      unlinked += 1;
      continue;
    }
    // Find a patient in this clinic whose user firstName+lastName matches
    const patients = await prisma.patient.findMany({
      where: { clinicId: clinic.id },
      include: { user: true },
    });
    const fullNameLower = nameField.fieldValue.toLowerCase().trim();
    const match = patients.find(p =>
      `${p.user.firstName} ${p.user.lastName}`.toLowerCase().trim() === fullNameLower
    );
    if (match) {
      await prisma.document.update({ where: { id: doc.id }, data: { patientId: match.id } });
      linked += 1;
    } else {
      unlinked += 1;
    }
  }
  console.log(`[documents] linked ${linked} to patients by extracted name; ${unlinked} unlinked (still nullable in Phase 1)`);
}

async function backfillAuditLogs(clinic) {
  // Audit logs whose userId is the SUPER_ADMIN stay clinicId=null
  // Everything else → clinic.id
  const sa = await prisma.user.findUnique({ where: { email: SUPER_ADMIN_EMAIL } });
  const where = { clinicId: null };
  if (sa) where.NOT = { userId: sa.id };
  const result = await prisma.auditLog.updateMany({
    where,
    data: { clinicId: clinic.id },
  });
  console.log(`[audit_logs] backfilled clinicId on ${result.count} rows`);
}

async function writeCredentialsFile(generatedCreds, clinicName) {
  if (generatedCreds.length === 0) {
    console.log("[credentials] no new credentials generated this run");
    return;
  }

  const file = path.join(__dirname, "..", "migration-credentials.txt");
  const lines = [
    "================================================================",
    "  Migration credentials — generated by backfill-multitenant.js",
    "  Generated at: " + new Date().toISOString(),
    "  Clinic: " + clinicName,
    "================================================================",
    "",
    "These accounts were auto-created during the multi-tenant migration.",
    "Each one has mustChangePassword=true and will be forced to change",
    "their password on first login.",
    "",
  ];
  for (const c of generatedCreds) {
    lines.push(`Role:     ${c.role}`);
    lines.push(`Email:    ${c.email}`);
    lines.push(`Password: ${c.password}`);
    lines.push(``);
  }
  lines.push("================================================================");
  lines.push("Keep this file safe and DO NOT commit it (it's in .gitignore).");
  lines.push("================================================================");

  fs.writeFileSync(file, lines.join("\n"), { mode: 0o600 });
  console.log(`[credentials] wrote ${generatedCreds.length} entries to ${file}`);
}

async function main() {
  console.log("=== Phase 2 backfill starting ===\n");

  const generatedCreds = [];

  // 1. Clinic
  const alpha = await ensureClinic();

  // 2. Placeholder CLINICIAN + DOCTOR for Alpha Labs (needed for Patient FKs)
  const placeholderClinician = await ensurePlaceholderUser({
    email: `clinician@${PLACEHOLDER_DOMAIN}`,
    role: "CLINICIAN",
    firstName: "Alpha",
    lastName: "Clinician",
    clinicId: alpha.id,
    generatedCreds,
  });

  const placeholderDoctor = await ensurePlaceholderUser({
    email: `doctor@${PLACEHOLDER_DOMAIN}`,
    role: "DOCTOR",
    firstName: "Alpha",
    lastName: "Doctor",
    clinicId: alpha.id,
    generatedCreds,
  });

  // 3. Promote SUPER_ADMIN
  await promoteSuperAdmin();

  // 4. Promote admin@gumnammomina.pk to ADMIN of Alpha Labs
  await promoteClinicAdmin("admin@gumnammomina.pk", alpha.id);

  // 5. Convert any VIEWER (or PATIENT-without-clinic) users → PATIENT + Patient row
  await convertViewersToPatients(alpha, placeholderDoctor, placeholderClinician);

  // 6. Backfill documents and audit logs
  await backfillDocuments(alpha);
  await backfillAuditLogs(alpha);

  // 7. Write credentials file
  await writeCredentialsFile(generatedCreds, ALPHA_CLINIC_NAME);

  console.log("\n=== Phase 2 backfill complete ===");
}

main()
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
