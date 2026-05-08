-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "reviewClaimedAt" TIMESTAMP(3),
ADD COLUMN     "reviewClaimedById" TEXT,
ADD COLUMN     "reviewCompletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "documents_reviewClaimedById_idx" ON "documents"("reviewClaimedById");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_reviewClaimedById_fkey" FOREIGN KEY ("reviewClaimedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
