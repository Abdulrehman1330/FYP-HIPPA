/**
 * Seed the platform's single SUPER_ADMIN account.
 *
 * Idempotent: refuses to create a second SUPER_ADMIN. If one already exists
 * with the configured email, this script verifies the role and exits.
 *
 * Configuration via env vars:
 *   OWNER_EMAIL          (production preferred)
 *   OWNER_TEMP_PASSWORD  (production preferred)
 *   OWNER_FIRST_NAME     (production preferred)
 *   OWNER_LAST_NAME      (production preferred)
 *
 * Legacy local aliases are still accepted:
 *   SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_FIRST, SUPER_ADMIN_LAST
 *
 * Usage:
 *   node scripts/seed-super-admin.js
 */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const EMAIL = (process.env.OWNER_EMAIL || process.env.SUPER_ADMIN_EMAIL || (IS_PRODUCTION ? "" : "asadrasheeddev@gmail.com")).toLowerCase();
const PASSWORD = process.env.OWNER_TEMP_PASSWORD || process.env.SUPER_ADMIN_PASSWORD || (IS_PRODUCTION ? "" : "asad123456");
const FIRST = process.env.OWNER_FIRST_NAME || process.env.SUPER_ADMIN_FIRST || (IS_PRODUCTION ? "" : "Asad");
const LAST = process.env.OWNER_LAST_NAME || process.env.SUPER_ADMIN_LAST || (IS_PRODUCTION ? "" : "Rasheed");
const BCRYPT_COST = parseInt(process.env.BCRYPT_COST || "10", 10);

function requireProductionSecrets() {
  if (!IS_PRODUCTION) return;

  const missing = [];
  if (!EMAIL) missing.push("OWNER_EMAIL");
  if (!PASSWORD) missing.push("OWNER_TEMP_PASSWORD");
  if (!FIRST) missing.push("OWNER_FIRST_NAME");
  if (!LAST) missing.push("OWNER_LAST_NAME");

  if (missing.length > 0) {
    console.error(`[seed-super-admin] FATAL: missing production owner secret(s): ${missing.join(", ")}`);
    process.exit(2);
  }
}

async function main() {
  requireProductionSecrets();

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
          "Refusing to create a second one. Update OWNER_EMAIL or remove the existing account.",
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
      const hashed = await bcrypt.hash(PASSWORD, BCRYPT_COST);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashed,
          role: "SUPER_ADMIN",
          clinicId: null,
          status: "ACTIVE",
          mustChangePassword: true,
        },
      });
      console.log(`[seed-super-admin] promoted existing user ${EMAIL} → SUPER_ADMIN`);
    }
    return;
  }

  const hashed = await bcrypt.hash(PASSWORD, BCRYPT_COST);
  await prisma.user.create({
    data: {
      email: EMAIL,
      password: hashed,
      firstName: FIRST,
      lastName: LAST,
      role: "SUPER_ADMIN",
      clinicId: null,
      mustChangePassword: true,
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
