/*
  Warnings:

  - You are about to drop the `SEOData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SEOData";

-- CreateTable
CREATE TABLE "SeoData" (
    "id" TEXT NOT NULL,
    "entityType" "SeoEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "canonical" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "robots" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SeoData_entityType_idx" ON "SeoData"("entityType");

-- CreateIndex
CREATE UNIQUE INDEX "SeoData_entityType_entityId_key" ON "SeoData"("entityType", "entityId");
