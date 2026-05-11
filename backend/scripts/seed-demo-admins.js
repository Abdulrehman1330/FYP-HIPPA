/**
 * Seed local demo ADMIN and SUPER_ADMIN accounts.
 *
 * Idempotent: rerunning this script updates the demo accounts to the expected
 * role, clinic assignment, active status, and password.
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEMO_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || "Password123!";
const DEMO_CLINIC_NAME = process.env.DEMO_CLINIC_NAME || "Demo Home Health Clinic";

const DEMO_ACCOUNTS = [
  {
    email: "superadmin.demo@fyp.local",
    firstName: "Demo",
    lastName: "Superadmin",
    role: "SUPER_ADMIN",
    clinicId: null,
  },
  {
    email: "admin.demo@fyp.local",
    firstName: "Demo",
    lastName: "Admin",
    role: "ADMIN",
  },
];

async function upsertUser(account, passwordHash, clinicId) {
  const targetClinicId = account.role === "SUPER_ADMIN" ? null : clinicId;

  return prisma.user.upsert({
    where: { email: account.email },
    update: {
      password: passwordHash,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
      clinicId: targetClinicId,
      status: "ACTIVE",
      mustChangePassword: false,
    },
    create: {
      email: account.email,
      password: passwordHash,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
      clinicId: targetClinicId,
      status: "ACTIVE",
      mustChangePassword: false,
    },
    select: {
      email: true,
      role: true,
      clinic: { select: { name: true } },
    },
  });
}

async function main() {
  const existingClinic = await prisma.clinic.findFirst({
    where: { name: DEMO_CLINIC_NAME },
    select: { id: true, name: true },
  });
  const clinic = existingClinic
    ? await prisma.clinic.update({
        where: { id: existingClinic.id },
        data: { status: "ACTIVE" },
        select: { id: true, name: true },
      })
    : await prisma.clinic.create({
        data: { name: DEMO_CLINIC_NAME, status: "ACTIVE" },
        select: { id: true, name: true },
      });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = [];

  for (const account of DEMO_ACCOUNTS) {
    users.push(await upsertUser(account, passwordHash, clinic.id));
  }

  console.log("[seed-demo-admins] Seeded accounts:");
  for (const user of users) {
    console.log(`- ${user.role}: ${user.email}${user.clinic ? ` (${user.clinic.name})` : ""}`);
  }
}

main()
  .catch((err) => {
    console.error("[seed-demo-admins] failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
