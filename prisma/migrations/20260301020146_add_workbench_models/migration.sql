-- CreateEnum
CREATE TYPE "WorkbenchTaskStatus" AS ENUM ('Open', 'InProgress', 'Review', 'Completed', 'Overdue');

-- CreateEnum
CREATE TYPE "WorkbenchTaskPriority" AS ENUM ('Low', 'Medium', 'High');

-- CreateTable
CREATE TABLE "WorkbenchTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "assignee" TEXT NOT NULL,
    "status" "WorkbenchTaskStatus" NOT NULL DEFAULT 'Open',
    "priority" "WorkbenchTaskPriority" NOT NULL DEFAULT 'Medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT,

    CONSTRAINT "WorkbenchTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkbenchTaskComment" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" TEXT NOT NULL,
    "authorId" TEXT,

    CONSTRAINT "WorkbenchTaskComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkbenchTask" ADD CONSTRAINT "WorkbenchTask_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbenchTaskComment" ADD CONSTRAINT "WorkbenchTaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "WorkbenchTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbenchTaskComment" ADD CONSTRAINT "WorkbenchTaskComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
