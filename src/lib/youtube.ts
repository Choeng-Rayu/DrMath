const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  let candidate: string | null = null;

  if (host === "youtu.be") {
    candidate = url.pathname.split("/").filter(Boolean)[0] ?? null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (url.pathname === "/watch") candidate = url.searchParams.get("v");
    if (url.pathname.startsWith("/shorts/")) candidate = url.pathname.split("/")[2] ?? null;
    if (url.pathname.startsWith("/embed/")) candidate = url.pathname.split("/")[2] ?? null;
  }

  return candidate && YOUTUBE_ID_PATTERN.test(candidate) ? candidate : null;
}

export function getYouTubeThumbnail(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeEmbed(videoId: string) {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
