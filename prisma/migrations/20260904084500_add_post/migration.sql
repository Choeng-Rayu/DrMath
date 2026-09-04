-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."Post" (
    "id" TEXT NOT NULL,
    "titleKh" TEXT NOT NULL,
    "badgeKh" TEXT DEFAULT 'ដំណឹងជ្រើសរើស',
    "contentKh" TEXT NOT NULL,
    "driveUrl" TEXT,
    "driveFileId" TEXT,
    "renderUrl" TEXT,
    "actionUrl" TEXT,
    "actionLabel" TEXT DEFAULT 'ទំនាក់ទំនងតាម Telegram',
    "featured" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Post_published_order_idx" ON "public"."Post"("published", "order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Post_featured_idx" ON "public"."Post"("featured");
