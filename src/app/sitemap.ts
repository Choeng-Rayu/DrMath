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

  // 1. Primary Root Domain (Landing Page) - Highest Priority
  sitemapEntries.push({
    url: `${baseUrl}`,
    lastModified: currentDate,
    changeFrequency: "daily",
    priority: 1.0,
    images: allCoreImages,
    videos: videoMetadataList.length > 0 ? videoMetadataList : undefined,
  });

  // 2. Navigation Bar: Video Search & Lessons Section
  sitemapEntries.push({
    url: `${baseUrl}/#videos`,
    lastModified: currentDate,
    changeFrequency: "daily",
    priority: 0.9,
    images: videoThumbnails.length > 0 ? videoThumbnails : [heroImageUrl],
    videos: videoMetadataList.length > 0 ? videoMetadataList : undefined,
  });

  // 3. Navigation Bar: Exercises & Worksheets Section
  sitemapEntries.push({
    url: `${baseUrl}/#exercises`,
    lastModified: currentDate,
    changeFrequency: "daily",
    priority: 0.9,
    images: exerciseImages.length > 0 ? exerciseImages : [heroImageUrl],
  });

  // 4. Navigation Bar: Subjects & Curriculum Section
  sitemapEntries.push({
    url: `${baseUrl}/#subjects`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.8,
    images: [heroImageUrl, logoUrl],
  });

  // 5. Navigation Bar: About Us Section
  sitemapEntries.push({
    url: `${baseUrl}/#about`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.8,
    images: [aboutImageUrl, heroImageUrl],
  });

  // 6. Navigation Bar: Learning Formats Section
  sitemapEntries.push({
    url: `${baseUrl}/#formats`,
    lastModified: currentDate,
    changeFrequency: "monthly",
    priority: 0.7,
    images: [heroImageUrl],
  });

  // 7. Navigation Bar: Contact & Registration Section
  sitemapEntries.push({
    url: `${baseUrl}/#contact`,
    lastModified: currentDate,
    changeFrequency: "monthly",
    priority: 0.8,
    images: [logoUrl],
  });

  // 8. Individual Exercises (Searchable Worksheet Entries with Deep Links)
  exercises.forEach((exercise) => {
    const exImageUrl = exercise.renderUrl.startsWith("http")
      ? exercise.renderUrl
      : ensureAbsoluteUrl(exercise.renderUrl, baseUrl);

    sitemapEntries.push({
      url: `${baseUrl}/#exercise-${exercise.id}`,
      lastModified: (exercise as { updatedAt?: Date }).updatedAt || currentDate,
      changeFrequency: "weekly",
      priority: exercise.featured ? 0.85 : 0.75,
      images: [exImageUrl],
    });
  });

  // 9. Individual Video Lessons (Searchable Video Entries with Deep Links)
  videos.forEach((video) => {
    const thumb = video.thumbUrl || getYouTubeThumbnail(video.youtubeId);
    sitemapEntries.push({
      url: `${baseUrl}/#video-${video.youtubeId}`,
      lastModified: (video as { updatedAt?: Date }).updatedAt || currentDate,
      changeFrequency: "weekly",
      priority: video.featured ? 0.85 : 0.75,
      images: [thumb],
      videos: [
        {
          title: `${video.titleKh} | លោកគ្រូ គរ សម្បត្តិ (Korm Sambath)`,
          thumbnail_loc: thumb,
          description:
            video.seriesKh ||
            content["videos.description"] ||
            "មេរៀនគណិតវិទ្យា និងវិទ្យាសាស្ត្របង្រៀនដោយលោកគ្រូ គរ សម្បត្តិ (Korm Sambath) នៅ DR.MATHS",
          player_loc: getYouTubeEmbed(video.youtubeId),
          publication_date: (video as { createdAt?: Date }).createdAt?.toISOString() || currentDate.toISOString(),
          family_friendly: "yes" as const,
          uploader: {
            info: `${baseUrl}/#about`,
            content: "Korm Sambath (លោកគ្រូ គរ សម្បត្តិ)",
          },
          tag: "Korm Sambath, គរ សម្បត្តិ, DR.MATHS, គណិតវិទ្យា",
        },
      ],
    });
  });

  return sitemapEntries;
}


