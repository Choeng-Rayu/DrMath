import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

async function inspectFolder() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, "https://developers.google.com/oauthplayground");
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const drive = google.drive({ version: "v3", auth: oauth2Client });
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  console.log("=== FILES IN GOOGLE DRIVE FOLDER ===");
  const files = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType, webViewLink, size, modifiedTime)",
  });
  console.log(files.data.files);

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  console.log("\n=== SPREADSHEET TABS & VALUES (ID: " + spreadsheetId + ") ===");
  const ss = await sheets.spreadsheets.get({ spreadsheetId });
  console.log("Spreadsheet Title:", ss.data.properties?.title);
  console.log("Tabs in spreadsheet:", ss.data.sheets?.map((s) => s.properties?.title));

  for (const sheet of ss.data.sheets || []) {
    const title = sheet.properties?.title;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${title}!A1:H10`,
    });
    console.log(`\n--- Tab: [${title}] (Total rows found: ${res.data.values?.length || 0}) ---`);
    if (res.data.values) {
      console.log("Header:", res.data.values[0]);
      if (res.data.values.length > 1) {
        console.log("First data row:", res.data.values[1]);
      }
    }
  }
}

inspectFolder().catch(console.error);
