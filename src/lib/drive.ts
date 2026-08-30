const DRIVE_ID_PATTERN = /^[A-Za-z0-9_-]{15,}$/;

export type DriveImage = {
  originalUrl: string;
  fileId: string;
  renderUrl: string;
};

export function getDriveImage(input: string): DriveImage | null {
  const originalUrl = input.trim();
  if (!originalUrl) return null;

  let url: URL;
  try {
    url = new URL(originalUrl);
  } catch {
    return null;
  }

  const isGoogleDrive =
    url.hostname === "drive.google.com" ||
    url.hostname.endsWith(".drive.google.com") ||
    url.hostname === "docs.google.com";
  if (!isGoogleDrive) return null;

  const pathMatch =
    url.pathname.match(/\/(?:file|drive)(?:\/u\/\d+)?\/d\/([A-Za-z0-9_-]+)/) ||
    url.pathname.match(/\/d\/([A-Za-z0-9_-]+)/);
  const queryId = url.searchParams.get("id");
  const fileId = pathMatch?.[1] ?? queryId ?? "";

  if (!DRIVE_ID_PATTERN.test(fileId)) return null;

  return {
    originalUrl,
    fileId,
    // Direct Google CDN URL — no redirect, no auth cookie needed for public files.
    renderUrl: `https://lh3.googleusercontent.com/d/${fileId}=s1600`,
  };
}

export function isDriveImageUrl(input: string) {
  return getDriveImage(input) !== null;
}
