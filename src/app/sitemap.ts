import type { MetadataRoute } from "next";
import { getSiteData } from "@/lib/site";
import { getDriveImage } from "@/lib/drive";
import { getYouTubeEmbed, getYouTubeThumbnail } from "@/lib/youtube";

// Ensure sitemap is revalidated periodically or generated dynamically
export const revalidate = 3600; // 1 hour revalidation cache

function ensureAbsoluteUrl(url: string, baseUrl: string): string {
  if (!url) return baseUrl;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://drmaths.online").replace(/\/$/, "");
  const currentDate = new Date();

  // Fetch all live data (PostgreSQL DB with Google Sheets failover)
  const { content, settings, exercises = [], videos = [] } = await getSiteData();

  // Resolve main images
  const heroImageDrive = getDriveImage(content["hero.imageDriveUrl"] ?? "");
  const heroImageUrl = heroImageDrive?.renderUrl || ensureAbsoluteUrl("/images/Photo-A.jpg", baseUrl);

  const aboutImageDrive = getDriveImage(content["about.imageDriveUrl"] ?? "");
  const aboutImageUrl = aboutImageDrive?.renderUrl || ensureAbsoluteUrl("/images/A-2025_only.jpg", baseUrl);

  const logoUrl = settings.logoRenderUrl || ensureAbsoluteUrl("/logo.jpg", baseUrl);

  // Collect all unique exercise image URLs
  const exerciseImages = exercises
    .map((ex) => (ex.renderUrl.startsWith("http") ? ex.renderUrl : ensureAbsoluteUrl(ex.renderUrl, baseUrl)))
    .filter(Boolean);

  // Collect all video thumbnail URLs and video metadata
  const videoThumbnails = videos
    .map((v) => v.thumbUrl || getYouTubeThumbnail(v.youtubeId))
    .filter(Boolean);

  const videoMetadataList = videos.map((v) => ({
    title: `${v.titleKh} | លោកគ្រូ គរ សម្បត្តិ (Korm Sambath)`,
    thumbnail_loc: v.thumbUrl || getYouTubeThumbnail(v.youtubeId),
    description:
      v.seriesKh ||
      content["videos.description"] ||
      "មេរៀនគណិតវិទ្យា និងវិទ្យាសាស្ត្របង្រៀនដោយលោកគ្រូ គរ សម្បត្តិ (Korm Sambath) នៅ DR.MATHS Education Center",
    player_loc: getYouTubeEmbed(v.youtubeId),
    publication_date: (v as { createdAt?: Date }).createdAt?.toISOString() || currentDate.toISOString(),
    family_friendly: "yes" as const,
    uploader: {
      info: `${baseUrl}/#about`,
      content: "Korm Sambath (លោកគ្រូ គរ សម្បត្តិ)",
    },
    tag: "Korm Sambath, គរ សម្បត្តិ, DR.MATHS, គណិតវិទ្យា, វិទ្យាសាស្ត្រ",
  }));

  // Aggregated site images
  const allCoreImages = Array.from(
    new Set([logoUrl, heroImageUrl, aboutImageUrl, ...exerciseImages, ...videoThumbnails])
  );

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Primary Canonical Landing Page — contains all page images and all video metadata
  sitemapEntries.push({
    url: `${baseUrl}`,
    lastModified: currentDate,
    changeFrequency: "daily",
    priority: 1.0,
    images: allCoreImages,
    videos: videoMetadataList.length > 0 ? videoMetadataList : undefined,
  });

  return sitemapEntries;
}


