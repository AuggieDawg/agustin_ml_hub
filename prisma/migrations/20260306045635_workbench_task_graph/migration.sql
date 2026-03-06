-- AlterTable
ALTER TABLE "WorkbenchTask" ADD COLUMN     "mapX" DOUBLE PRECISION NOT NULL DEFAULT 40,
ADD COLUMN     "mapY" DOUBLE PRECISION NOT NULL DEFAULT 40;

-- CreateTable
CREATE TABLE "WorkbenchTaskLink" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sourceTaskId" TEXT NOT NULL,
    "targetTaskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkbenchTaskLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkbenchTaskLink_ownerId_idx" ON "WorkbenchTaskLink"("ownerId");

-- CreateIndex
CREATE INDEX "WorkbenchTaskLink_sourceTaskId_idx" ON "WorkbenchTaskLink"("sourceTaskId");

-- CreateIndex
CREATE INDEX "WorkbenchTaskLink_targetTaskId_idx" ON "WorkbenchTaskLink"("targetTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkbenchTaskLink_ownerId_sourceTaskId_targetTaskId_key" ON "WorkbenchTaskLink"("ownerId", "sourceTaskId", "targetTaskId");

-- CreateIndex
CREATE INDEX "WorkbenchTask_ownerId_idx" ON "WorkbenchTask"("ownerId");

-- CreateIndex
CREATE INDEX "WorkbenchTask_ownerId_status_idx" ON "WorkbenchTask"("ownerId", "status");

-- CreateIndex
CREATE INDEX "WorkbenchTask_ownerId_updatedAt_idx" ON "WorkbenchTask"("ownerId", "updatedAt");

-- AddForeignKey
ALTER TABLE "WorkbenchTaskLink" ADD CONSTRAINT "WorkbenchTaskLink_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbenchTaskLink" ADD CONSTRAINT "WorkbenchTaskLink_sourceTaskId_fkey" FOREIGN KEY ("sourceTaskId") REFERENCES "WorkbenchTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbenchTaskLink" ADD CONSTRAINT "WorkbenchTaskLink_targetTaskId_fkey" FOREIGN KEY ("targetTaskId") REFERENCES "WorkbenchTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
