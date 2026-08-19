"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDriveImage } from "@/lib/drive";
import { getYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

const optionalUrl = z.union([z.string().url(), z.literal("")]);

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("អ្នកត្រូវចូលគណនីជាមុនសិន។");
  return session;
}

function refreshPublic() {
  revalidatePath("/");
  revalidatePath("/admin");
}

function isPrismaError(error: unknown, code: string): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/admin");
  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl.startsWith("/") ? callbackUrl : "/admin" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/admin/login?error=${error.type}`);
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

export async function saveContentAction(formData: FormData) {
  await requireAdmin();
  const rows = await prisma.siteContent.findMany();

  await prisma.$transaction(
    rows.map((row) => {
      const value = String(formData.get(`content:${row.key}`) ?? "").trim();
      const visible = formData.get(`visible:${row.key}`) === "on";
      if (row.type === "IMAGE" && value) {
        const image = getDriveImage(value);
        if (!image) throw new Error(`តំណ Google Drive សម្រាប់ ${row.key} មិនត្រឹមត្រូវ។`);
      }
      return prisma.siteContent.update({ where: { id: row.id }, data: { value, visible } });
    }),
  );

  const driveValues = rows
    .filter((row) => row.type === "IMAGE")
    .map((row) => String(formData.get(`content:${row.key}`) ?? "").trim())
    .filter(Boolean);
  for (const driveUrl of driveValues) {
    const image = getDriveImage(driveUrl);
    if (image) {
      await prisma.mediaAsset.upsert({
        where: { driveUrl: image.originalUrl },
        update: { driveFileId: image.fileId, renderUrl: image.renderUrl, validationState: "valid" },
        create: { driveUrl: image.originalUrl, driveFileId: image.fileId, renderUrl: image.renderUrl, category: "content" },
      });
    }
  }

  refreshPublic();
  revalidatePath("/admin/content");
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  const data = {
    phones: String(formData.get("phones") ?? "")
      .split("\n")
      .map((phone) => phone.trim())
      .filter(Boolean),
    telegramUrl: String(formData.get("telegramUrl") ?? "").trim(),
    facebookUrl: String(formData.get("facebookUrl") ?? "").trim(),
    tiktokUrl: String(formData.get("tiktokUrl") ?? "").trim(),
    instagramUrl: String(formData.get("instagramUrl") ?? "").trim(),
    logoDriveUrl: String(formData.get("logoDriveUrl") ?? "").trim(),
    logoAlt: String(formData.get("logoAlt") ?? "DR.MATHS").trim(),
    addressKh: String(formData.get("addressKh") ?? "").trim(),
    hoursKh: String(formData.get("hoursKh") ?? "").trim(),
    footerTextKh: String(formData.get("footerTextKh") ?? "").trim(),
    seoTitleKh: String(formData.get("seoTitleKh") ?? "").trim(),
    seoDescriptionKh: String(formData.get("seoDescriptionKh") ?? "").trim(),
  };

  const parsedUrls = [data.telegramUrl, data.facebookUrl, data.tiktokUrl, data.instagramUrl].map((url) => optionalUrl.parse(url));
  const logo = data.logoDriveUrl ? getDriveImage(data.logoDriveUrl) : null;
  if (data.logoDriveUrl && !logo) throw new Error("តំណរូបសញ្ញា Google Drive មិនត្រឹមត្រូវ។");

  await prisma.settings.upsert({
    where: { id: "site-settings" },
    update: {
      phones: JSON.stringify(data.phones),
      telegramUrl: parsedUrls[0] || null,
      facebookUrl: parsedUrls[1] || null,
      tiktokUrl: parsedUrls[2] || null,
      instagramUrl: parsedUrls[3] || null,
      logoDriveUrl: logo?.originalUrl ?? null,
      logoDriveId: logo?.fileId ?? null,
      logoRenderUrl: logo?.renderUrl ?? null,
      logoAlt: data.logoAlt || "DR.MATHS",
      addressKh: data.addressKh || null,
      hoursKh: data.hoursKh || null,
      footerTextKh: data.footerTextKh || null,
      seoTitleKh: data.seoTitleKh || null,
      seoDescriptionKh: data.seoDescriptionKh || null,
    },
    create: {
      id: "site-settings",
      phones: JSON.stringify(data.phones),
      telegramUrl: parsedUrls[0] || null,
      facebookUrl: parsedUrls[1] || null,
      tiktokUrl: parsedUrls[2] || null,
      instagramUrl: parsedUrls[3] || null,
      logoDriveUrl: logo?.originalUrl ?? null,
      logoDriveId: logo?.fileId ?? null,
      logoRenderUrl: logo?.renderUrl ?? null,
      logoAlt: data.logoAlt || "DR.MATHS",
      addressKh: data.addressKh || null,
      hoursKh: data.hoursKh || null,
      footerTextKh: data.footerTextKh || null,
      seoTitleKh: data.seoTitleKh || null,
      seoDescriptionKh: data.seoDescriptionKh || null,
    },
  });

  if (logo) {
    await prisma.mediaAsset.upsert({
      where: { driveUrl: logo.originalUrl },
      update: { driveFileId: logo.fileId, renderUrl: logo.renderUrl, validationState: "valid" },
      create: { driveUrl: logo.originalUrl, driveFileId: logo.fileId, renderUrl: logo.renderUrl, category: "logo" },
    });
  }

  refreshPublic();
  revalidatePath("/admin/settings");
}

const videoSchema = z.object({
  id: z.string().optional(),
  titleKh: z.string().min(2).max(250),
  youtubeUrl: z.string().url(),
  seriesKh: z.string().max(120).optional(),
  order: z.coerce.number().int().min(0).max(9999),
  published: z.boolean(),
  featured: z.boolean(),
});

export async function saveVideoAction(formData: FormData) {
  await requireAdmin();
  const parsed = videoSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    titleKh: String(formData.get("titleKh") ?? "").trim(),
    youtubeUrl: String(formData.get("youtubeUrl") ?? "").trim(),
    seriesKh: String(formData.get("seriesKh") ?? "").trim() || undefined,
    order: String(formData.get("order") ?? "0"),
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) redirect("/admin/videos?error=invalid");
  const youtubeId = getYouTubeId(parsed.data.youtubeUrl);
  if (!youtubeId) redirect("/admin/videos?error=invalid");

  try {
    await prisma.$transaction(async (tx) => {
      if (parsed.data.featured) await tx.video.updateMany({ where: { featured: true }, data: { featured: false } });
      const data = {
        titleKh: parsed.data.titleKh,
        youtubeUrl: parsed.data.youtubeUrl,
        youtubeId,
        thumbUrl: getYouTubeThumbnail(youtubeId),
        seriesKh: parsed.data.seriesKh ?? null,
        order: parsed.data.order,
        published: parsed.data.published,
        featured: parsed.data.featured,
      };
      if (parsed.data.id) await tx.video.update({ where: { id: parsed.data.id }, data });
      else await tx.video.create({ data });
    });
  } catch (error) {
    console.error("[saveVideoAction]", error);
    if (isPrismaError(error, "P2002")) redirect("/admin/videos?error=duplicate");
    redirect("/admin/videos?error=save");
  }

  refreshPublic();
  revalidatePath("/admin/videos");
  redirect("/admin/videos");
}

export async function deleteVideoAction(formData: FormData) {
  await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  try {
    // deleteMany is a no-op when the record is already gone (delete would throw P2025).
    await prisma.video.deleteMany({ where: { id } });
  } catch (error) {
    console.error("[deleteVideoAction]", error);
    redirect("/admin/videos?error=delete");
  }
  refreshPublic();
  revalidatePath("/admin/videos");
}

const subjectSchema = z.object({
  id: z.string().optional(),
  icon: z.string().min(1).max(12),
  nameKh: z.string().min(2).max(100),
  descriptionKh: z.string().min(4).max(500),
  order: z.coerce.number().int().min(0).max(9999),
  visible: z.boolean(),
});

export async function saveSubjectAction(formData: FormData) {
  await requireAdmin();
  const parsed = subjectSchema.parse({
    id: String(formData.get("id") ?? "") || undefined,
    icon: String(formData.get("icon") ?? "∑").trim(),
    nameKh: String(formData.get("nameKh") ?? "").trim(),
    descriptionKh: String(formData.get("descriptionKh") ?? "").trim(),
    order: String(formData.get("order") ?? "0"),
    visible: formData.get("visible") === "on",
  });
  if (parsed.id) await prisma.subject.update({ where: { id: parsed.id }, data: parsed });
  else await prisma.subject.create({ data: parsed });
  refreshPublic();
  revalidatePath("/admin/subjects");
  redirect("/admin/subjects");
}

export async function deleteSubjectAction(formData: FormData) {
  await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  try {
    await prisma.subject.deleteMany({ where: { id } });
  } catch (error) {
    console.error("[deleteSubjectAction]", error);
    redirect("/admin/subjects?error=delete");
  }
  refreshPublic();
  revalidatePath("/admin/subjects");
}

const testimonialSchema = z.object({
  id: z.string().optional(),
  nameKh: z.string().min(2).max(100),
  roleKh: z.string().max(150).optional(),
  quoteKh: z.string().min(4).max(700),
  rating: z.coerce.number().int().min(1).max(5),
  order: z.coerce.number().int().min(0).max(9999),
  visible: z.boolean(),
});

export async function saveTestimonialAction(formData: FormData) {
  await requireAdmin();
  const parsed = testimonialSchema.parse({
    id: String(formData.get("id") ?? "") || undefined,
    nameKh: String(formData.get("nameKh") ?? "").trim(),
    roleKh: String(formData.get("roleKh") ?? "").trim() || undefined,
    quoteKh: String(formData.get("quoteKh") ?? "").trim(),
    rating: String(formData.get("rating") ?? "5"),
    order: String(formData.get("order") ?? "0"),
    visible: formData.get("visible") === "on",
  });
  const data = { ...parsed, roleKh: parsed.roleKh ?? null };
  if (parsed.id) await prisma.testimonial.update({ where: { id: parsed.id }, data });
  else await prisma.testimonial.create({ data });
  refreshPublic();
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function deleteTestimonialAction(formData: FormData) {
  await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  try {
    await prisma.testimonial.deleteMany({ where: { id } });
  } catch (error) {
    console.error("[deleteTestimonialAction]", error);
    redirect("/admin/testimonials?error=delete");
  }
  refreshPublic();
  revalidatePath("/admin/testimonials");
}
