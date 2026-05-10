/**
 * Seed the platform's single SUPER_ADMIN account.
 *
 * Idempotent: refuses to create a second SUPER_ADMIN. If one already exists
 * with the configured email, this script verifies the role and exits.
 *
 * Configuration via env vars:
 *   SUPER_ADMIN_EMAIL    (default: asadrasheeddev@gmail.com)
 *   SUPER_ADMIN_PASSWORD (default: asad123456)
 *   SUPER_ADMIN_FIRST    (default: Asad)
 *   SUPER_ADMIN_LAST     (default: Rasheed)
 *
 * Usage:
 *   node scripts/seed-super-admin.js
 */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const EMAIL = (process.env.SUPER_ADMIN_EMAIL || "asadrasheeddev@gmail.com").toLowerCase();
const PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "asad123456";
const FIRST = process.env.SUPER_ADMIN_FIRST || "Asad";
const LAST = process.env.SUPER_ADMIN_LAST || "Rasheed";

async function main() {
  // Guard: refuse if there's already a different SUPER_ADMIN
  const existingSuperAdmins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
  });

  if (existingSuperAdmins.length > 1) {
    console.error(
      `[seed-super-admin] FATAL: ${existingSuperAdmins.length} SUPER_ADMIN accounts already exist. ` +
        "There must be exactly one. Investigate and remove duplicates before proceeding.",
    );
    process.exit(2);
  }

  if (existingSuperAdmins.length === 1) {
    const sa = existingSuperAdmins[0];
    if (sa.email.toLowerCase() !== EMAIL) {
      console.error(
        `[seed-super-admin] FATAL: SUPER_ADMIN already exists with a different email (${sa.email}). ` +
          "Refusing to create a second one. Update SUPER_ADMIN_EMAIL or remove the existing account.",
      );
      process.exit(2);
    }
    console.log(`[seed-super-admin] OK — SUPER_ADMIN ${EMAIL} already provisioned.`);
    return;
  }

  // No SUPER_ADMIN exists — create or promote
  const existingUser = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existingUser) {
    if (existingUser.role !== "SUPER_ADMIN") {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: "SUPER_ADMIN", clinicId: null },
      });
      console.log(`[seed-super-admin] promoted existing user ${EMAIL} → SUPER_ADMIN`);
    }
    return;
  }

  const hashed = await bcrypt.hash(PASSWORD, 10);
  await prisma.user.create({
    data: {
      email: EMAIL,
      password: hashed,
      firstName: FIRST,
      lastName: LAST,
      role: "SUPER_ADMIN",
      clinicId: null,
      mustChangePassword: false,
      status: "ACTIVE",
    },
  });
  console.log(`[seed-super-admin] created SUPER_ADMIN ${EMAIL}`);
}

main()
  .catch((err) => {
    console.error("[seed-super-admin] failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
