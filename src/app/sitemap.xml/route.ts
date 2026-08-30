import { getSiteData } from "@/lib/site";
import { getDriveImage } from "@/lib/drive";
import { getYouTubeEmbed, getYouTubeThumbnail } from "@/lib/youtube";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1 hour ISR cache

function escapeXml(str: string): string {
  if (!str) return "";
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

function ensureAbsoluteUrl(url: string, baseUrl: string): string {
  if (!url) return baseUrl;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
}

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://drmaths.online").replace(/\/$/, "");
  const currentDate = new Date().toISOString();

  // Fetch live published data (PostgreSQL DB with Google Sheets failover)
  const { content, settings, exercises = [], videos = [] } = await getSiteData();

  // Resolve main images
  const heroImageDrive = getDriveImage(content["hero.imageDriveUrl"] ?? "");
  const heroImageUrl = heroImageDrive?.renderUrl || ensureAbsoluteUrl("/images/Photo-A.jpg", baseUrl);

  const aboutImageDrive = getDriveImage(content["about.imageDriveUrl"] ?? "");
  const aboutImageUrl = aboutImageDrive?.renderUrl || ensureAbsoluteUrl("/images/A-2025_only.jpg", baseUrl);

  const logoUrl = settings.logoRenderUrl || ensureAbsoluteUrl("/logo.jpg", baseUrl);

  type ImageEntry = { loc: string; title?: string; caption?: string };
  const imageEntries: ImageEntry[] = [];

  if (logoUrl) {
    imageEntries.push({
      loc: logoUrl,
      title: "DR.MATHS Education Center Logo",
      caption: "DR.MATHS Education Center - Founder Korm Sambath (លោកគ្រូ គរ សម្បត្តិ)",
    });
  }

  if (heroImageUrl) {
    imageEntries.push({
      loc: heroImageUrl,
      title: "DR.MATHS Education Center | លោកគ្រូ គរ សម្បត្តិ (Korm Sambath)",
      caption: "ថ្នាក់បង្រៀនគណិតវិទ្យា និងវិទ្យាសាស្ត្រ DR.MATHS",
    });
  }

  if (aboutImageUrl) {
    imageEntries.push({
      loc: aboutImageUrl,
      title: "អំពី DR.MATHS Education Center",
      caption: "ស្គាល់ពីទស្សនវិស័យ និងបេសកកម្មរបស់ DR.MATHS",
    });
  }

  exercises.forEach((ex) => {
    const exUrl = ex.renderUrl.startsWith("http") ? ex.renderUrl : ensureAbsoluteUrl(ex.renderUrl, baseUrl);
    if (exUrl) {
      imageEntries.push({
        loc: exUrl,
        title: `${ex.titleKh} | លោកគ្រូ គរ សម្បត្តិ (Korm Sambath)`,
        caption: ex.descriptionKh || `${ex.subjectKh ?? "គណិតវិទ្យា"} ${ex.gradeKh ?? ""}`,
      });
    }
  });

  videos.forEach((v) => {
    const thumb = v.thumbUrl || getYouTubeThumbnail(v.youtubeId);
    if (thumb) {
      imageEntries.push({
        loc: thumb,
        title: `${v.titleKh} (Thumbnail)`,
        caption: `វីដេអូមេរៀន ${v.seriesKh ?? "DR.MATHS"}`,
      });
    }
  });

  // Deduplicate by loc
  const seenLocs = new Set<string>();
  const uniqueImages = imageEntries.filter((img) => {
    if (seenLocs.has(img.loc)) return false;
    seenLocs.add(img.loc);
    return true;
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${escapeXml(baseUrl)}</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;

  // Render all Google image sitemap entries with rich titles
  for (const img of uniqueImages) {
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${escapeXml(img.loc)}</image:loc>\n`;
    if (img.title) xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
    if (img.caption) xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`;
    xml += `    </image:image>\n`;
  }

  // Render all Google video sitemap entries
  for (const v of videos) {
    const thumb = v.thumbUrl || getYouTubeThumbnail(v.youtubeId);
    const title = `${v.titleKh} | លោកគ្រូ គរ សម្បត្តិ (Korm Sambath)`;
    const desc =
      v.seriesKh ||
      content["videos.description"] ||
      "មេរៀនគណិតវិទ្យា និងវិទ្យាសាស្ត្របង្រៀនដោយលោកគ្រូ គរ សម្បត្តិ (Korm Sambath) នៅ DR.MATHS Education Center";
    const playerLoc = getYouTubeEmbed(v.youtubeId);
    const pubDate = (v as { createdAt?: Date }).createdAt?.toISOString() || currentDate;

    xml += `    <video:video>\n`;
    xml += `      <video:title>${escapeXml(title)}</video:title>\n`;
    xml += `      <video:thumbnail_loc>${escapeXml(thumb)}</video:thumbnail_loc>\n`;
    xml += `      <video:description>${escapeXml(desc)}</video:description>\n`;
    xml += `      <video:player_loc>${escapeXml(playerLoc)}</video:player_loc>\n`;
    xml += `      <video:publication_date>${escapeXml(pubDate)}</video:publication_date>\n`;
    xml += `      <video:family_friendly>yes</video:family_friendly>\n`;
    xml += `      <video:uploader info="${escapeXml(`${baseUrl}/#about`)}">${escapeXml("Korm Sambath (លោកគ្រូ គរ សម្បត្តិ)")}</video:uploader>\n`;
    xml += `      <video:tag>${escapeXml("Korm Sambath, គរ សម្បត្តិ, DR.MATHS, គណិតវិទ្យា, វិទ្យាសាស្ត្រ")}</video:tag>\n`;
    xml += `    </video:video>\n`;
  }

  xml += `  </url>\n`;
  xml += `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
