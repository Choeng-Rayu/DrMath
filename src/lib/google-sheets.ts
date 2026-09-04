import { google, sheets_v4 } from "googleapis";
import { ContentType } from "@prisma/client";
import { prisma, withDbRetry } from "@/lib/prisma";

const SPREADSHEET_TITLE = "DR_MATHS_Database";

const SHEET_NAMES = [
  "SiteContent",
  "Exercises",
  "Videos",
  "Subjects",
  "Testimonials",
  "Settings",
  "MediaAssets",
  "AdminUsers",
  "Posts",
] as const;

type SheetName = (typeof SHEET_NAMES)[number];

let cachedSpreadsheetId: string | null = null;

function getFormattedPrivateKey(): string | null {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;
  if (!rawKey) return null;
  return rawKey.replace(/\\n/g, "\n");
}

function getGoogleAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, "https://developers.google.com/oauthplayground");
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return oauth2Client;
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = getFormattedPrivateKey();

  if (email && privateKey) {
    return new google.auth.JWT({
      email,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });
  }

  return null;
}

export function getGoogleSheetsClient(): sheets_v4.Sheets | null {
  const auth = getGoogleAuthClient();
  if (!auth) return null;
  return google.sheets({ version: "v4", auth });
}

/**
 * Finds or creates the DR_MATHS_Database spreadsheet inside the designated Google Drive folder.
 */
export async function getOrCreateDatabaseSpreadsheet(): Promise<string | null> {
  if (process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
    return process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  }
  if (cachedSpreadsheetId) {
    return cachedSpreadsheetId;
  }

  const auth = getGoogleAuthClient();
  if (!auth) return null;

  const drive = google.drive({ version: "v3", auth });
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  try {
    // 1. Search for existing spreadsheet in folder
    let query = `name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`;
    if (folderId && folderId.trim()) {
      query += ` and '${folderId.trim()}' in parents`;
    }

    const searchRes = await drive.files.list({
      q: query,
      fields: "files(id, name, webViewLink)",
      spaces: "drive",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      cachedSpreadsheetId = searchRes.data.files[0].id!;
      return cachedSpreadsheetId;
    }

    // 2. Create new spreadsheet if not found
    const sheets = google.sheets({ version: "v4", auth });
    const createRes = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: SPREADSHEET_TITLE,
        },
        sheets: SHEET_NAMES.map((title) => ({
          properties: {
            title,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        })),
      },
    });

    const newSpreadsheetId = createRes.data.spreadsheetId;
    if (!newSpreadsheetId) return null;

    // Move to the designated folder if configured
    if (folderId && folderId.trim()) {
      try {
        await drive.files.update({
          fileId: newSpreadsheetId,
          addParents: folderId.trim(),
          supportsAllDrives: true,
          fields: "id, parents",
        });
      } catch (moveErr) {
        console.warn("[getOrCreateDatabaseSpreadsheet] Could not move spreadsheet to folder:", moveErr);
      }
    }

    // Make spreadsheet shareable (reader)
    try {
      await drive.permissions.create({
        fileId: newSpreadsheetId,
        supportsAllDrives: true,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
    } catch (permErr) {
      console.warn("[getOrCreateDatabaseSpreadsheet] Could not set reader permission:", permErr);
    }

    cachedSpreadsheetId = newSpreadsheetId;
    return cachedSpreadsheetId;
  } catch (err) {
    console.error("[getOrCreateDatabaseSpreadsheet error]", err);
    return null;
  }
}

/**
 * Writes data rows to a specific tab in the Google Spreadsheet.
 */
async function overwriteSheetTab(sheetName: SheetName, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const spreadsheetId = await getOrCreateDatabaseSpreadsheet();
  if (!spreadsheetId) return;

  const sheets = getGoogleSheetsClient();
  if (!sheets) return;

  try {
    // 1. Ensure tab exists
    const ssInfo = await sheets.spreadsheets.get({ spreadsheetId });
    const exists = ssInfo.data.sheets?.some((s) => s.properties?.title === sheetName);
    if (!exists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                  gridProperties: { frozenRowCount: 1 },
                },
              },
            },
          ],
        },
      });
    }

    // 2. Clear old data
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    // 3. Write headers and rows
    const formattedRows = [
      headers,
      ...rows.map((row) =>
        row.map((cell) => {
          if (cell === null || cell === undefined) return "";
          if (typeof cell === "boolean") return cell ? "TRUE" : "FALSE";
          return String(cell);
        })
      ),
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: formattedRows,
      },
    });
  } catch (error) {
    console.error(`[overwriteSheetTab error for ${sheetName}]`, error);
  }
}

// ==========================================
// EXPORT / SYNC FUNCTIONS (DB -> Google Sheets)
// ==========================================

export async function syncExercisesToSheet() {
  try {
    const exercises = await withDbRetry(() => prisma.exercise.findMany({ orderBy: { order: "asc" } }));
    const headers = [
      "id",
      "titleKh",
      "subjectKh",
      "gradeKh",
      "descriptionKh",
      "driveUrl",
      "driveFileId",
      "renderUrl",
      "solutionUrl",
      "order",
      "published",
      "featured",
      "updatedAt",
    ];
    const rows = exercises.map((ex) => [
      ex.id,
      ex.titleKh,
      ex.subjectKh,
      ex.gradeKh,
      ex.descriptionKh,
      ex.driveUrl,
      ex.driveFileId,
      ex.renderUrl,
      ex.solutionUrl,
      ex.order,
      ex.published,
      ex.featured,
      ex.updatedAt.toISOString(),
    ]);
    await overwriteSheetTab("Exercises", headers, rows);
  } catch (err) {
    console.warn("[syncExercisesToSheet] skipped due to error:", err);
  }
}

export async function syncContentToSheet() {
  try {
    const contents = await withDbRetry(() => prisma.siteContent.findMany({ orderBy: [{ section: "asc" }, { key: "asc" }] }));
    const headers = ["id", "key", "section", "value", "draftValue", "type", "visible", "updatedAt"];
    const rows = contents.map((c) => [
      c.id,
      c.key,
      c.section,
      c.value,
      c.draftValue,
      c.type,
      c.visible,
      c.updatedAt.toISOString(),
    ]);
    await overwriteSheetTab("SiteContent", headers, rows);
  } catch (err) {
    console.warn("[syncContentToSheet] skipped due to error:", err);
  }
}

export async function syncVideosToSheet() {
  try {
    const videos = await withDbRetry(() => prisma.video.findMany({ orderBy: { order: "asc" } }));
    const headers = ["id", "titleKh", "youtubeUrl", "youtubeId", "thumbUrl", "seriesKh", "order", "published", "featured", "updatedAt"];
    const rows = videos.map((v) => [
      v.id,
      v.titleKh,
      v.youtubeUrl,
      v.youtubeId,
      v.thumbUrl,
      v.seriesKh,
      v.order,
      v.published,
      v.featured,
      v.updatedAt.toISOString(),
    ]);
    await overwriteSheetTab("Videos", headers, rows);
  } catch (err) {
    console.warn("[syncVideosToSheet] skipped due to error:", err);
  }
}

export async function syncSubjectsToSheet() {
  try {
    const subjects = await withDbRetry(() => prisma.subject.findMany({ orderBy: { order: "asc" } }));
    const headers = ["id", "icon", "nameKh", "descriptionKh", "order", "visible", "updatedAt"];
    const rows = subjects.map((s) => [
      s.id,
      s.icon,
      s.nameKh,
      s.descriptionKh,
      s.order,
      s.visible,
      s.updatedAt.toISOString(),
    ]);
    await overwriteSheetTab("Subjects", headers, rows);
  } catch (err) {
    console.warn("[syncSubjectsToSheet] skipped due to error:", err);
  }
}

export async function syncTestimonialsToSheet() {
  try {
    const testimonials = await withDbRetry(() => prisma.testimonial.findMany({ orderBy: { order: "asc" } }));
    const headers = ["id", "nameKh", "roleKh", "quoteKh", "rating", "order", "visible", "updatedAt"];
    const rows = testimonials.map((t) => [
      t.id,
      t.nameKh,
      t.roleKh,
      t.quoteKh,
      t.rating,
      t.order,
      t.visible,
      t.updatedAt.toISOString(),
    ]);
    await overwriteSheetTab("Testimonials", headers, rows);
  } catch (err) {
    console.warn("[syncTestimonialsToSheet] skipped due to error:", err);
  }
}

export async function syncSettingsToSheet() {
  try {
    const settings = await withDbRetry(() => prisma.settings.findUnique({ where: { id: "site-settings" } }));
    if (!settings) return;

    const headers = ["key", "value", "updatedAt"];
    const entries: [string, string][] = [
      ["phones", settings.phones],
      ["telegramUrl", settings.telegramUrl || ""],
      ["facebookUrl", settings.facebookUrl || ""],
      ["tiktokUrl", settings.tiktokUrl || ""],
      ["instagramUrl", settings.instagramUrl || ""],
      ["logoDriveUrl", settings.logoDriveUrl || ""],
      ["logoDriveId", settings.logoDriveId || ""],
      ["logoRenderUrl", settings.logoRenderUrl || ""],
      ["logoAlt", settings.logoAlt || ""],
      ["addressKh", settings.addressKh || ""],
      ["hoursKh", settings.hoursKh || ""],
      ["footerTextKh", settings.footerTextKh || ""],
      ["seoTitleKh", settings.seoTitleKh || ""],
      ["seoDescriptionKh", settings.seoDescriptionKh || ""],
    ];

    const rows = entries.map(([key, value]) => [key, value, settings.updatedAt.toISOString()]);
    await overwriteSheetTab("Settings", headers, rows);
  } catch (err) {
    console.warn("[syncSettingsToSheet] skipped due to error:", err);
  }
}

export async function syncMediaAssetsToSheet() {
  try {
    const assets = await withDbRetry(() => prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }));
    const headers = [
      "id",
      "driveUrl",
      "driveFileId",
      "renderUrl",
      "altKh",
      "category",
      "validationState",
      "createdAt",
      "updatedAt",
    ];
    const rows = assets.map((a) => [
      a.id,
      a.driveUrl,
      a.driveFileId,
      a.renderUrl,
      a.altKh || "",
      a.category || "",
      a.validationState || "valid",
      a.createdAt.toISOString(),
      a.updatedAt.toISOString(),
    ]);
    await overwriteSheetTab("MediaAssets", headers, rows);
  } catch (err) {
    console.warn("[syncMediaAssetsToSheet] skipped due to error:", err);
  }
}

export async function syncAdminUsersToSheet() {
  try {
    const users = await withDbRetry(() => prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } }));
    const headers = ["id", "email", "name", "createdAt", "updatedAt"];
    const rows = users.map((u) => [
      u.id,
      u.email,
      u.name || "",
      u.createdAt.toISOString(),
      u.updatedAt.toISOString(),
    ]);
    await overwriteSheetTab("AdminUsers", headers, rows);
  } catch (err) {
    console.warn("[syncAdminUsersToSheet] skipped due to error:", err);
  }
}

export async function syncPostsToSheet() {
  try {
    const posts = await withDbRetry(() => prisma.post.findMany({ orderBy: { order: "asc" } }));
    const headers = [
      "id",
      "titleKh",
      "badgeKh",
      "contentKh",
      "driveUrl",
      "driveFileId",
      "renderUrl",
      "actionUrl",
      "actionLabel",
      "order",
      "published",
      "featured",
      "updatedAt",
    ];
    const rows = posts.map((p) => [
      p.id,
      p.titleKh,
      p.badgeKh || "",
      p.contentKh,
      p.driveUrl || "",
      p.driveFileId || "",
      p.renderUrl || "",
      p.actionUrl || "",
      p.actionLabel || "",
      p.order,
      p.published,
      p.featured,
      p.updatedAt.toISOString(),
    ]);
    await overwriteSheetTab("Posts", headers, rows);
  } catch (err) {
    console.warn("[syncPostsToSheet] skipped due to error:", err);
  }
}

/**
 * Triggers a full synchronization of all 9 data tables from PostgreSQL to Google Sheets.
 */
export async function syncAllToGoogleSheets(): Promise<{ success: boolean; spreadsheetId?: string; error?: string }> {
  try {
    const spreadsheetId = await getOrCreateDatabaseSpreadsheet();
    if (!spreadsheetId) {
      return { success: false, error: "Could not create or find Google Spreadsheet in Drive." };
    }

    await syncContentToSheet();
    await syncExercisesToSheet();
    await syncVideosToSheet();
    await syncSubjectsToSheet();
    await syncTestimonialsToSheet();
    await syncSettingsToSheet();
    await syncMediaAssetsToSheet();
    await syncAdminUsersToSheet();
    await syncPostsToSheet();

    return { success: true, spreadsheetId };
  } catch (error: unknown) {
    console.error("[syncAllToGoogleSheets error]", error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

// ====================================================
// FAILOVER IMPORT FUNCTIONS (Google Sheets -> Memory)
// ====================================================

async function readSheetTab(sheetName: SheetName): Promise<Record<string, string>[]> {
  const spreadsheetId = await getOrCreateDatabaseSpreadsheet();
  if (!spreadsheetId) return [];

  const sheets = getGoogleSheetsClient();
  if (!sheets) return [];

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const values = res.data.values;
    if (!values || values.length < 2) return [];

    const headers = values[0].map((h: unknown) => String(h).trim());
    const rows = values.slice(1);

    return rows.map((row: unknown[]) => {
      const obj: Record<string, string> = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] !== undefined ? String(row[index]).trim() : "";
      });
      return obj;
    });
  } catch (err) {
    console.warn(`[readSheetTab error for ${sheetName}]`, err);
    return [];
  }
}

export async function fetchAllFromGoogleSheets() {
  try {
    const [exercisesRaw, contentsRaw, videosRaw, subjectsRaw, testimonialsRaw, settingsRaw, postsRaw] = await Promise.all([
      readSheetTab("Exercises"),
      readSheetTab("SiteContent"),
      readSheetTab("Videos"),
      readSheetTab("Subjects"),
      readSheetTab("Testimonials"),
      readSheetTab("Settings"),
      readSheetTab("Posts"),
    ]);

    const posts = (postsRaw || [])
      .filter((r) => r.id && r.titleKh)
      .map((r) => ({
        id: r.id,
        titleKh: r.titleKh,
        badgeKh: r.badgeKh || "ដំណឹងជ្រើសរើសគ្រូឆ្នើម",
        contentKh: r.contentKh || "",
        driveUrl: r.driveUrl || null,
        driveFileId: r.driveFileId || null,
        renderUrl: r.renderUrl || null,
        actionUrl: r.actionUrl || null,
        actionLabel: r.actionLabel || "ទំនាក់ទំនងតាម Telegram",
        order: Number(r.order) || 0,
        published: r.published === "TRUE" || r.published === "true" || r.published === "1",
        featured: r.featured === "TRUE" || r.featured === "true",
        createdAt: new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      }));

    const exercises = exercisesRaw
      .filter((r) => r.id && r.titleKh)
      .map((r) => ({
        id: r.id,
        titleKh: r.titleKh,
        descriptionKh: r.descriptionKh || null,
        subjectKh: r.subjectKh || null,
        gradeKh: r.gradeKh || null,
        driveUrl: r.driveUrl || "",
        driveFileId: r.driveFileId || "",
        renderUrl: r.renderUrl || (r.driveFileId ? `https://lh3.googleusercontent.com/d/${r.driveFileId}=s1600` : ""),
        solutionUrl: r.solutionUrl || null,
        order: Number(r.order) || 0,
        published: r.published === "TRUE" || r.published === "true" || r.published === "1",
        featured: r.featured === "TRUE" || r.featured === "true",
        createdAt: new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      }));

    const contents = contentsRaw
      .filter((r) => r.key)
      .map((r) => ({
        id: r.id || r.key,
        key: r.key,
        section: r.section || r.key.split(".")[0] || "general",
        value: r.value || "",
        draftValue: (r.draftValue || null) as string | null,
        type: (r.type as ContentType) || ContentType.TEXT,
        visible: r.visible === "TRUE" || r.visible === "true" || r.visible === "1",
        draftVisible: null as boolean | null,
        createdAt: new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      }));

    const videos = videosRaw
      .filter((r) => r.id && r.titleKh)
      .map((r) => ({
        id: r.id,
        titleKh: r.titleKh,
        youtubeUrl: r.youtubeUrl || "",
        youtubeId: r.youtubeId || "",
        thumbUrl: r.thumbUrl || (r.youtubeId ? `https://i.ytimg.com/vi/${r.youtubeId}/hqdefault.jpg` : ""),
        seriesKh: r.seriesKh || null,
        order: Number(r.order) || 0,
        published: r.published === "TRUE" || r.published === "true",
        featured: r.featured === "TRUE" || r.featured === "true",
        createdAt: new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      }));

    const subjects = subjectsRaw
      .filter((r) => r.id && r.nameKh)
      .map((r) => ({
        id: r.id,
        icon: r.icon || "∑",
        nameKh: r.nameKh,
        descriptionKh: r.descriptionKh || "",
        mediaId: null,
        order: Number(r.order) || 0,
        visible: r.visible === "TRUE" || r.visible === "true",
        createdAt: new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      }));

    const testimonials = testimonialsRaw
      .filter((r) => r.id && r.nameKh)
      .map((r) => ({
        id: r.id,
        nameKh: r.nameKh,
        roleKh: r.roleKh || null,
        quoteKh: r.quoteKh || "",
        rating: Number(r.rating) || 5,
        order: Number(r.order) || 0,
        visible: r.visible === "TRUE" || r.visible === "true",
        createdAt: new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      }));

    const settingsMap = settingsRaw.reduce<Record<string, string>>((acc, row) => {
      if (row.key) acc[row.key] = row.value || "";
      return acc;
    }, {});

    const settings = {
      id: "site-settings",
      phones: settingsMap.phones || "[]",
      telegramUrl: settingsMap.telegramUrl || null,
      facebookUrl: settingsMap.facebookUrl || null,
      tiktokUrl: settingsMap.tiktokUrl || null,
      instagramUrl: settingsMap.instagramUrl || null,
      logoDriveUrl: settingsMap.logoDriveUrl || null,
      logoDriveId: settingsMap.logoDriveId || null,
      logoRenderUrl: settingsMap.logoRenderUrl || null,
      logoAlt: settingsMap.logoAlt || "DR.MATHS",
      addressKh: settingsMap.addressKh || null,
      hoursKh: settingsMap.hoursKh || null,
      footerTextKh: settingsMap.footerTextKh || null,
      seoTitleKh: settingsMap.seoTitleKh || null,
      seoDescriptionKh: settingsMap.seoDescriptionKh || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      exercises,
      contents,
      videos,
      subjects,
      testimonials,
      settings,
      posts,
    };
  } catch (err) {
    console.error("[fetchAllFromGoogleSheets error]", err);
    return null;
  }
}
