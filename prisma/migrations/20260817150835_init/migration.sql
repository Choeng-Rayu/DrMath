-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('TEXT', 'RICH_TEXT', 'LINK', 'IMAGE', 'BOOLEAN', 'JSON');

-- CreateTable
CREATE TABLE "public"."AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SiteContent" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "public"."ContentType" NOT NULL DEFAULT 'TEXT',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Settings" (
    "id" TEXT NOT NULL DEFAULT 'site-settings',
    "phones" TEXT NOT NULL DEFAULT '[]',
    "telegramUrl" TEXT,
    "facebookUrl" TEXT,
    "tiktokUrl" TEXT,
    "instagramUrl" TEXT,
    "logoDriveUrl" TEXT,
    "logoDriveId" TEXT,
    "logoRenderUrl" TEXT,
    "logoAlt" TEXT DEFAULT 'DR.MATHS',
    "addressKh" TEXT,
    "hoursKh" TEXT,
    "footerTextKh" TEXT,
    "seoTitleKh" TEXT,
    "seoDescriptionKh" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaAsset" (
    "id" TEXT NOT NULL,
    "driveUrl" TEXT NOT NULL,
    "driveFileId" TEXT NOT NULL,
    "renderUrl" TEXT NOT NULL,
    "altKh" TEXT,
    "category" TEXT,
    "validationState" TEXT NOT NULL DEFAULT 'valid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Video" (
    "id" TEXT NOT NULL,
    "titleKh" TEXT NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "thumbUrl" TEXT NOT NULL,
    "seriesKh" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subject" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '∑',
    "nameKh" TEXT NOT NULL,
    "descriptionKh" TEXT NOT NULL,
    "mediaId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Testimonial" (
    "id" TEXT NOT NULL,
    "nameKh" TEXT NOT NULL,
    "roleKh" TEXT,
    "quoteKh" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "public"."AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SiteContent_key_key" ON "public"."SiteContent"("key");

-- CreateIndex
CREATE INDEX "SiteContent_section_idx" ON "public"."SiteContent"("section");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_driveUrl_key" ON "public"."MediaAsset"("driveUrl");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_driveFileId_key" ON "public"."MediaAsset"("driveFileId");

-- CreateIndex
CREATE UNIQUE INDEX "Video_youtubeId_key" ON "public"."Video"("youtubeId");

-- CreateIndex
CREATE INDEX "Video_published_order_idx" ON "public"."Video"("published", "order");

-- CreateIndex
CREATE INDEX "Video_featured_idx" ON "public"."Video"("featured");

-- CreateIndex
CREATE INDEX "Subject_visible_order_idx" ON "public"."Subject"("visible", "order");

-- CreateIndex
CREATE INDEX "Testimonial_visible_order_idx" ON "public"."Testimonial"("visible", "order");
