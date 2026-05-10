-- Phase 3: Drop VIEWER from the UserRole enum.
-- Safe to run only after all VIEWER users have been converted (Phase 2).
-- Postgres requires creating a new enum, swapping it in, then dropping the old.

BEGIN;

-- Sanity check: refuse to proceed if any user still has VIEWER role
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE role::text = 'VIEWER') THEN
    RAISE EXCEPTION 'Cannot drop VIEWER — one or more users still have role=VIEWER. Run scripts/backfill-multitenant.js first.';
  END IF;
END $$;

-- 1. Create the new enum without VIEWER
CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CLINICIAN', 'DOCTOR', 'PATIENT');

-- 2. Switch the column to use the new enum
ALTER TABLE users
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE "UserRole_new" USING role::text::"UserRole_new",
  ALTER COLUMN role SET DEFAULT 'CLINICIAN'::"UserRole_new";

-- 3. Drop the old enum and rename the new one
DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

COMMIT;
