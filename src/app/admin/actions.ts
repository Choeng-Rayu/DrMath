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
  revalidatePath("/preview");
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

// Saves edits as DRAFTS: the public site keeps showing published values until
// publishContentAction runs. Only /preview and the editor revalidate here.
export async function saveContentDraftAction(formData: FormData) {
  await requireAdmin();
  try {
    const rows = await prisma.siteContent.findMany();

    await prisma.$transaction(
      rows.map((row) => {
        const value = String(formData.get(`content:${row.key}`) ?? "").trim();
        const visible = formData.get(`visible:${row.key}`) === "on";
        if (row.type === "IMAGE" && value) {
          const image = getDriveImage(value);
          if (!image) throw new Error(`INVALID_DRIVE`);
        }
        const changed = value !== row.value || visible !== row.visible;
        return prisma.siteContent.update({
          where: { id: row.id },
          data: changed ? { draftValue: value, draftVisible: visible } : { draftValue: null, draftVisible: null },
        });
      }),
    );
  } catch (error) {
    console.error("[saveContentDraftAction]", error);
    if (error instanceof Error && error.message === "INVALID_DRIVE") {
      redirect("/admin/content?error=invalid_drive");
    }
    redirect("/admin/content?error=save");
  }

  revalidatePath("/preview");
  revalidatePath("/admin/content");
  redirect("/admin/content?success=draft_saved");
}

// Publishes all drafts (copy draft → published, clear drafts) and registers
// any Drive images with the mediaAsset table.
export async function publishContentAction() {
  await requireAdmin();
  try {
    const rows = await prisma.siteContent.findMany({
      where: {
        OR: [{ draftValue: { not: null } }, { draftVisible: { not: null } }],
      },
    });

    if (rows.length) {
      await prisma.$transaction(
        rows.map((row) =>
          prisma.siteContent.update({
            where: { id: row.id },
            data: {
              value: row.draftValue ?? row.value,
              visible: row.draftVisible ?? row.visible,
              draftValue: null,
              draftVisible: null,
            },
          }),
        ),
      );
      for (const row of rows) {
        const publishedValue = row.draftValue ?? row.value;
        if (row.type !== "IMAGE" || !publishedValue) continue;
        const image = getDriveImage(publishedValue);
        if (image) {
          await prisma.mediaAsset.upsert({
            where: { driveUrl: image.originalUrl },
            update: { driveFileId: image.fileId, renderUrl: image.renderUrl, validationState: "valid" },
            create: { driveUrl: image.originalUrl, driveFileId: image.fileId, renderUrl: image.renderUrl, category: "content" },
          });
        }
      }
    }
  } catch (error) {
    console.error("[publishContentAction]", error);
    redirect("/admin/content?error=save");
  }

  refreshPublic();
  revalidatePath("/preview");
  revalidatePath("/admin/content");
  redirect("/admin/content?success=published");
}

export async function discardContentAction() {
  await requireAdmin();
  try {
    await prisma.siteContent.updateMany({ data: { draftValue: null, draftVisible: null } });
  } catch (error) {
    console.error("[discardContentAction]", error);
    redirect("/admin/content?error=save");
  }
  revalidatePath("/preview");
  revalidatePath("/admin/content");
  redirect("/admin/content?success=discarded");
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  const rawData = {
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

  const parsedTelegram = optionalUrl.safeParse(rawData.telegramUrl);
  const parsedFacebook = optionalUrl.safeParse(rawData.facebookUrl);
  const parsedTiktok = optionalUrl.safeParse(rawData.tiktokUrl);
  const parsedInstagram = optionalUrl.safeParse(rawData.instagramUrl);

  if (!parsedTelegram.success || !parsedFacebook.success || !parsedTiktok.success || !parsedInstagram.success) {
    redirect("/admin/settings?error=invalid");
  }

  const logo = rawData.logoDriveUrl ? getDriveImage(rawData.logoDriveUrl) : null;
  if (rawData.logoDriveUrl && !logo) {
    redirect("/admin/settings?error=invalid_drive");
  }

  try {
    await prisma.settings.upsert({
      where: { id: "site-settings" },
      update: {
        phones: JSON.stringify(rawData.phones),
        telegramUrl: parsedTelegram.data || null,
        facebookUrl: parsedFacebook.data || null,
        tiktokUrl: parsedTiktok.data || null,
        instagramUrl: parsedInstagram.data || null,
        logoDriveUrl: logo?.originalUrl ?? null,
        logoDriveId: logo?.fileId ?? null,
        logoRenderUrl: logo?.renderUrl ?? null,
        logoAlt: rawData.logoAlt || "DR.MATHS",
        addressKh: rawData.addressKh || null,
        hoursKh: rawData.hoursKh || null,
        footerTextKh: rawData.footerTextKh || null,
        seoTitleKh: rawData.seoTitleKh || null,
        seoDescriptionKh: rawData.seoDescriptionKh || null,
      },
      create: {
        id: "site-settings",
        phones: JSON.stringify(rawData.phones),
        telegramUrl: parsedTelegram.data || null,
        facebookUrl: parsedFacebook.data || null,
        tiktokUrl: parsedTiktok.data || null,
        instagramUrl: parsedInstagram.data || null,
        logoDriveUrl: logo?.originalUrl ?? null,
        logoDriveId: logo?.fileId ?? null,
        logoRenderUrl: logo?.renderUrl ?? null,
        logoAlt: rawData.logoAlt || "DR.MATHS",
        addressKh: rawData.addressKh || null,
        hoursKh: rawData.hoursKh || null,
        footerTextKh: rawData.footerTextKh || null,
        seoTitleKh: rawData.seoTitleKh || null,
        seoDescriptionKh: rawData.seoDescriptionKh || null,
      },
    });

    if (logo) {
      await prisma.mediaAsset.upsert({
        where: { driveUrl: logo.originalUrl },
        update: { driveFileId: logo.fileId, renderUrl: logo.renderUrl, validationState: "valid" },
        create: { driveUrl: logo.originalUrl, driveFileId: logo.fileId, renderUrl: logo.renderUrl, category: "logo" },
      });
    }
  } catch (error) {
    console.error("[saveSettingsAction]", error);
    redirect("/admin/settings?error=save");
  }

  refreshPublic();
  revalidatePath("/admin/settings");
  redirect("/admin/settings?success=saved");
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
  redirect("/admin/videos?success=saved");
}

export async function deleteVideoAction(formData: FormData) {
  await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  try {
    await prisma.video.deleteMany({ where: { id } });
  } catch (error) {
    console.error("[deleteVideoAction]", error);
    redirect("/admin/videos?error=delete");
  }
  refreshPublic();
  revalidatePath("/admin/videos");
  redirect("/admin/videos?success=deleted");
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
  const parsed = subjectSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    icon: String(formData.get("icon") ?? "∑").trim(),
    nameKh: String(formData.get("nameKh") ?? "").trim(),
    descriptionKh: String(formData.get("descriptionKh") ?? "").trim(),
    order: String(formData.get("order") ?? "0"),
    visible: formData.get("visible") === "on",
  });
  if (!parsed.success) redirect("/admin/subjects?error=invalid");

  try {
    if (parsed.data.id) await prisma.subject.update({ where: { id: parsed.data.id }, data: parsed.data });
    else await prisma.subject.create({ data: parsed.data });
  } catch (error) {
    console.error("[saveSubjectAction]", error);
    redirect("/admin/subjects?error=save");
  }

  refreshPublic();
  revalidatePath("/admin/subjects");
  redirect("/admin/subjects?success=saved");
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
  redirect("/admin/subjects?success=deleted");
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
  const parsed = testimonialSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    nameKh: String(formData.get("nameKh") ?? "").trim(),
    roleKh: String(formData.get("roleKh") ?? "").trim() || undefined,
    quoteKh: String(formData.get("quoteKh") ?? "").trim(),
    rating: String(formData.get("rating") ?? "5"),
    order: String(formData.get("order") ?? "0"),
    visible: formData.get("visible") === "on",
  });
  if (!parsed.success) redirect("/admin/testimonials?error=invalid");

  const data = { ...parsed.data, roleKh: parsed.data.roleKh ?? null };
  try {
    if (data.id) await prisma.testimonial.update({ where: { id: data.id }, data });
    else await prisma.testimonial.create({ data });
  } catch (error) {
    console.error("[saveTestimonialAction]", error);
    redirect("/admin/testimonials?error=save");
  }

  refreshPublic();
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials?success=saved");
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
  redirect("/admin/testimonials?success=deleted");
}

const exerciseSchema = z.object({
  id: z.string().optional(),
  titleKh: z.string().min(2).max(250),
  descriptionKh: z.string().max(1000).optional(),
  subjectKh: z.string().max(100).optional(),
  gradeKh: z.string().max(100).optional(),
  driveUrl: z.string().url(),
  solutionUrl: z.string().optional(),
  order: z.coerce.number().int().min(0).max(9999),
  published: z.boolean(),
  featured: z.boolean(),
});

export async function saveExerciseAction(formData: FormData) {
  await requireAdmin();
  const parsed = exerciseSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    titleKh: String(formData.get("titleKh") ?? "").trim(),
    descriptionKh: String(formData.get("descriptionKh") ?? "").trim() || undefined,
    subjectKh: String(formData.get("subjectKh") ?? "").trim() || undefined,
    gradeKh: String(formData.get("gradeKh") ?? "").trim() || undefined,
    driveUrl: String(formData.get("driveUrl") ?? "").trim(),
    solutionUrl: String(formData.get("solutionUrl") ?? "").trim() || undefined,
    order: String(formData.get("order") ?? "0"),
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) redirect("/admin/exercises?error=invalid");
  const driveImg = getDriveImage(parsed.data.driveUrl);
  if (!driveImg) redirect("/admin/exercises?error=invalid_drive");

  try {
    await prisma.$transaction(async (tx) => {
      const data = {
        titleKh: parsed.data.titleKh,
        descriptionKh: parsed.data.descriptionKh ?? null,
        subjectKh: parsed.data.subjectKh ?? null,
        gradeKh: parsed.data.gradeKh ?? null,
        driveUrl: driveImg.originalUrl,
        driveFileId: driveImg.fileId,
        renderUrl: driveImg.renderUrl,
        solutionUrl: parsed.data.solutionUrl ?? null,
        order: parsed.data.order,
        published: parsed.data.published,
        featured: parsed.data.featured,
      };

      if (parsed.data.id) {
        await tx.exercise.update({ where: { id: parsed.data.id }, data });
      } else {
        await tx.exercise.create({ data });
      }

      await tx.mediaAsset.upsert({
        where: { driveUrl: driveImg.originalUrl },
        update: { driveFileId: driveImg.fileId, renderUrl: driveImg.renderUrl, validationState: "valid" },
        create: { driveUrl: driveImg.originalUrl, driveFileId: driveImg.fileId, renderUrl: driveImg.renderUrl, category: "exercise" },
      });
    });
  } catch (error) {
    console.error("[saveExerciseAction]", error);
    redirect("/admin/exercises?error=save");
  }

  refreshPublic();
  revalidatePath("/admin/exercises");
  redirect("/admin/exercises?success=saved");
}

export async function deleteExerciseAction(formData: FormData) {
  await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  try {
    await prisma.exercise.deleteMany({ where: { id } });
  } catch (error) {
    console.error("[deleteExerciseAction]", error);
    redirect("/admin/exercises?error=delete");
  }
  refreshPublic();
  revalidatePath("/admin/exercises");
  redirect("/admin/exercises?success=deleted");
}
