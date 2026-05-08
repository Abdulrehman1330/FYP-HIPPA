-- Phase 4: Plan-of-Care versioning
-- Drop the old unique-per-document constraint so we can keep version history.
DROP INDEX IF EXISTS "generated_pocs_documentId_key";

-- AlterTable
ALTER TABLE "generated_pocs"
  ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN     "parentVersionId" TEXT,
  ADD COLUMN     "generatedById" TEXT,
  ADD COLUMN     "approvedById" TEXT;

-- CreateIndex
CREATE INDEX "generated_pocs_documentId_idx" ON "generated_pocs"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "generated_pocs_documentId_version_key" ON "generated_pocs"("documentId", "version");

-- AddForeignKey: self-reference for parent version lineage
ALTER TABLE "generated_pocs"
  ADD CONSTRAINT "generated_pocs_parentVersionId_fkey"
  FOREIGN KEY ("parentVersionId") REFERENCES "generated_pocs"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
