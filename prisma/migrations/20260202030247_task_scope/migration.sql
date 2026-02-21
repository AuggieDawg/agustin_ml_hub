-- CreateEnum
CREATE TYPE "TaskScope" AS ENUM ('PORTAL', 'OWNER');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "scope" "TaskScope" NOT NULL DEFAULT 'PORTAL';

-- CreateIndex
CREATE INDEX "Task_userId_scope_idx" ON "Task"("userId", "scope");
