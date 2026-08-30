const DRIVE_ID_PATTERN = /^[A-Za-z0-9_-]{15,}$/;

export type DriveImage = {
  originalUrl: string;
  fileId: string;
  renderUrl: string;
  previewUrl: string;
  downloadUrl: string;
};

export type DriveFile = DriveImage;

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
    // Direct Google CDN / Thumbnail URL (generates preview image for both Images and PDFs)
    renderUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`,
    // Interactive Google Drive embedded preview URL
    previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    // Direct download link
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}

export function getDriveFile(input: string): DriveFile | null {
  return getDriveImage(input);
}

export function isDriveImageUrl(input: string) {
  return getDriveImage(input) !== null;
}

export function isDriveFileUrl(input: string) {
  return getDriveImage(input) !== null;
}
