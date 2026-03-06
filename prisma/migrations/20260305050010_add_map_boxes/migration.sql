-- CreateTable
CREATE TABLE "MapBox" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapBox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MapBox_userId_idx" ON "MapBox"("userId");

-- CreateIndex
CREATE INDEX "MapBox_userId_order_idx" ON "MapBox"("userId", "order");

-- AddForeignKey
ALTER TABLE "MapBox" ADD CONSTRAINT "MapBox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
