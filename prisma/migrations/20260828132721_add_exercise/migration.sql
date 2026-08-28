-- CreateTable
CREATE TABLE "public"."Exercise" (
    "id" TEXT NOT NULL,
    "titleKh" TEXT NOT NULL,
    "descriptionKh" TEXT,
    "subjectKh" TEXT,
    "gradeKh" TEXT,
    "driveUrl" TEXT NOT NULL,
    "driveFileId" TEXT NOT NULL,
    "renderUrl" TEXT NOT NULL,
    "solutionUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Exercise_published_order_idx" ON "public"."Exercise"("published", "order");

-- CreateIndex
CREATE INDEX "Exercise_featured_idx" ON "public"."Exercise"("featured");

-- CreateIndex
CREATE INDEX "Exercise_subjectKh_idx" ON "public"."Exercise"("subjectKh");
