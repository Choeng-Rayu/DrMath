import { google } from "googleapis";
import { Readable } from "stream";

/**
 * Normalizes private key strings from environment variables,
 * ensuring escaped newlines (\n) are properly converted to actual line breaks.
 */
function getFormattedPrivateKey(): string | null {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;
  if (!rawKey) return null;
  return rawKey.replace(/\\n/g, "\n");
}

/**
 * Checks if Google Drive API is configured (either via OAuth2 or Service Account).
 */
export function isGoogleDriveConfigured(): { configured: boolean; mode?: "oauth2" | "service_account"; missing: string[] } {
  // Option 1: OAuth2 (Recommended for Personal @gmail.com accounts with 15GB free quota)
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    return { configured: true, mode: "oauth2", missing: [] };
  }

  // Option 2: Service Account (Recommended for Google Workspace / Shared Drives)
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = getFormattedPrivateKey();

  if (email && privateKey) {
    return { configured: true, mode: "service_account", missing: [] };
  }

  const missing: string[] = [];
  if (!clientId || !clientSecret || !refreshToken) {
    if (!email) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_CLIENT_ID");
    if (!privateKey) missing.push("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY or GOOGLE_REFRESH_TOKEN");
  }

  return {
    configured: false,
    missing,
  };
}

/**
 * Initializes authenticated Google Drive v3 client using OAuth2 or Service Account credentials.
 */
function getGoogleDriveClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  // 1. Prefer OAuth 2.0 if available (avoids 0MB service account quota limits on personal accounts)
  if (clientId && clientSecret && refreshToken) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, "https://developers.google.com/oauthplayground");
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return google.drive({ version: "v3", auth: oauth2Client });
  }

  // 2. Service Account fallback
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = getFormattedPrivateKey();

  if (!email || !privateKey) {
    throw new Error(
      "Google Drive API credentials not configured. Please set GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN or GOOGLE_SERVICE_ACCOUNT credentials."
    );
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

export type DriveUploadResult = {
  success: true;
  fileId: string;
  driveUrl: string;
  renderUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

/**
 * Uploads an image Buffer to Google Drive, places it in the target folder if configured,
 * and sets public reader permission ('anyone with the link can view').
 */
export async function uploadImageToGoogleDrive({
  buffer,
  fileName,
  mimeType,
}: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<DriveUploadResult> {
  const drive = getGoogleDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  // 1. Prepare file metadata
  const requestBody: { name: string; parents?: string[] } = {
    name: fileName,
  };

  if (folderId && folderId.trim()) {
    requestBody.parents = [folderId.trim()];
  }

  // 2. Upload file to Google Drive
  const readableStream = new Readable();
  readableStream.push(buffer);
  readableStream.push(null);

  const fileResponse = await drive.files.create({
    requestBody,
    media: {
      mimeType,
      body: readableStream,
    },
    supportsAllDrives: true,
    fields: "id, name, mimeType, size, webViewLink",
  });

  const fileId = fileResponse.data.id;
  if (!fileId) {
    throw new Error("Failed to receive Google Drive file ID after upload.");
  }

  // 3. Set public read permission ("Anyone with the link can view")
  try {
    await drive.permissions.create({
      fileId,
      supportsAllDrives: true,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
  } catch (permError) {
    console.warn("[uploadImageToGoogleDrive] Warning: Could not set public permission on Drive file:", permError);
  }

  const driveUrl = `https://drive.google.com/file/d/${fileId}/view`;
  const renderUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;

  return {
    success: true,
    fileId,
    driveUrl,
    renderUrl,
    fileName: fileResponse.data.name || fileName,
    mimeType: fileResponse.data.mimeType || mimeType,
    sizeBytes: Number(fileResponse.data.size ?? buffer.length),
  };
}
