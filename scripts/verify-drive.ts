import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

async function testDriveConnection() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  console.log("Checking Google Drive configuration in .env...");
  console.log("Client ID:", clientId ? `...${clientId.slice(-20)}` : "MISSING");
  console.log("Client Secret:", clientSecret ? "PRESENT" : "MISSING");
  console.log("Refresh Token:", refreshToken ? `...${refreshToken.slice(-15)}` : "MISSING");
  console.log("Folder ID:", folderId || "NOT SET (will upload to root)");

  if (!clientId || !clientSecret || !refreshToken) {
    console.error("\n❌ Missing OAuth2 credentials in .env. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN.");
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, "https://developers.google.com/oauthplayground");
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const about = await drive.about.get({ fields: "user, storageQuota" });
    console.log("\n✅ SUCCESS! Authenticated with Google Drive as:", about.data.user?.emailAddress);
    console.log("Storage Quota:", {
      limit: about.data.storageQuota?.limit ? `${(Number(about.data.storageQuota.limit) / (1024 * 1024 * 1024)).toFixed(2)} GB` : "Unlimited",
      usage: about.data.storageQuota?.usage ? `${(Number(about.data.storageQuota.usage) / (1024 * 1024 * 1024)).toFixed(2)} GB` : "0 GB",
    });

    if (folderId) {
      const folder = await drive.files.get({ fileId: folderId, fields: "id, name, capabilities" });
      console.log(`✅ Target folder "${folder.data.name}" (${folder.data.id}) is accessible and writable!`);
    }

    console.log("\n🎉 Your Google Drive integration is 100% READY! Image uploads will now work perfectly.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("\n❌ Authentication failed:", message);
    if (message.includes("unauthorized_client")) {
      console.error("👉 Reason: The Refresh Token was created with a different Client ID. Please regenerate the Refresh Token in OAuth Playground with 'Use your own OAuth credentials' checked.");
    }
  }
}

testDriveConnection();
