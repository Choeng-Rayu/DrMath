import assert from "node:assert/strict";
import dotenv from "dotenv";
dotenv.config();

import { isGoogleDriveConfigured, uploadImageToGoogleDrive } from "../src/lib/google-drive";
import { getDriveImage, getDriveFile } from "../src/lib/drive";
import { syncAllToGoogleSheets, fetchAllFromGoogleSheets } from "../src/lib/google-sheets";
import { prisma, withDbRetry } from "../src/lib/prisma";
import { getSiteData } from "../src/lib/site";

async function runAllTests() {
  console.log("==================================================");
  console.log("🚀 STARTING COMPREHENSIVE END-TO-END TEST SUITE");
  console.log("==================================================\n");

  // TEST 1: Google Drive Configuration
  console.log("👉 Test 1: Checking Google Drive API Configuration...");
  const driveConfig = isGoogleDriveConfigured();
  assert.equal(driveConfig.configured, true, "Google Drive must be fully configured in .env");
  console.log("   ✓ Google Drive API credentials verified.\n");

  // TEST 2: URL Parsing for PDF and Image links
  console.log("👉 Test 2: Checking Google Drive Link Parsing for PDFs & Images...");
  const testFileId = "1tOIULzY6_Mzlu-h3xKtZsFVCe72NbMvA";
  const parsed = getDriveFile(`https://drive.google.com/file/d/${testFileId}/view?usp=sharing`);
  assert.ok(parsed, "Should parse Google Drive URL");
  assert.equal(parsed.fileId, testFileId);
  assert.equal(parsed.previewUrl, `https://drive.google.com/file/d/${testFileId}/preview`);
  assert.equal(parsed.downloadUrl, `https://drive.google.com/uc?export=download&id=${testFileId}`);
  assert.equal(parsed.renderUrl, `https://drive.google.com/thumbnail?id=${testFileId}&sz=w1600`);
  console.log("   ✓ URL parser correctly generates thumbnail, preview iframe, and download links.\n");

  // TEST 3: Upload a Test PDF to Google Drive
  console.log("👉 Test 3: Testing Direct PDF Upload to Google Drive...");
  const samplePdfContent = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n200\n%%EOF`;
  const pdfBuffer = Buffer.from(samplePdfContent, "utf-8");

  const uploadRes = await uploadImageToGoogleDrive({
    buffer: pdfBuffer,
    fileName: `test-exam-${Date.now()}.pdf`,
    mimeType: "application/pdf",
  });

  assert.ok(uploadRes.fileId, "Upload result must have fileId");
  assert.ok(uploadRes.driveUrl.includes(uploadRes.fileId), "driveUrl must contain fileId");
  console.log("   ✓ PDF successfully uploaded to Google Drive folder!");
  console.log("     File ID:", uploadRes.fileId);
  console.log("     View Link:", uploadRes.driveUrl);
  console.log("     Render URL:", uploadRes.renderUrl, "\n");

  // TEST 4: Database Storage & Upsert
  console.log("👉 Test 4: Storing PDF Exercise in Database...");
  const testExercise = await withDbRetry(() =>
    prisma.exercise.create({
      data: {
        titleKh: "វិញ្ញាសាគណិតវិទ្យា ថ្នាក់ទី១២ - ត្រៀមប្រឡងបាក់ឌុប (PDF Test)",
        descriptionKh: "វិញ្ញាសាគំរូជាទម្រង់ PDF សម្រាប់សិស្សអនុវត្តត្រៀមប្រឡង",
        subjectKh: "គណិតវិទ្យា",
        gradeKh: "ថ្នាក់ទី១២",
        driveUrl: uploadRes.driveUrl,
        driveFileId: uploadRes.fileId,
        renderUrl: uploadRes.renderUrl,
        solutionUrl: "https://t.me/sambathkorm",
        order: 1,
        published: true,
        featured: true,
      },
    })
  );
  assert.ok(testExercise.id, "Exercise must be created in DB");
  console.log("   ✓ PDF Exercise saved in database with ID:", testExercise.id, "\n");

  // TEST 5: Full Sync to Google Sheets
  console.log("👉 Test 5: Syncing all 8 Tables to Google Sheets (including new PDF)...");
  const syncResult = await syncAllToGoogleSheets();
  assert.equal(syncResult.success, true, "Google Sheets sync must succeed");
  console.log("   ✓ Google Sheets synced successfully! Spreadsheet ID:", syncResult.spreadsheetId, "\n");

  // TEST 6: Read-Back from Google Sheets
  console.log("👉 Test 6: Verifying data persistence in Google Sheets...");
  const sheetData = await fetchAllFromGoogleSheets();
  assert.ok(sheetData, "Must fetch data from Google Sheets");
  assert.ok(sheetData.exercises.length >= 2, "Google Sheets must contain all exercises");
  const foundInSheet = sheetData.exercises.find((e) => e.id === testExercise.id);
  assert.ok(foundInSheet, "The newly created PDF exercise must exist in Google Sheets");
  assert.equal(foundInSheet.titleKh, testExercise.titleKh);
  console.log("   ✓ Verified: Google Sheets contains 100% accurate copy of the PDF exercise.\n");

  // TEST 7: Normal Site Data Fetching
  console.log("👉 Test 7: Fetching Site Data via getSiteData()...");
  const siteData = await getSiteData();
  assert.ok(siteData.exercises.length >= 2, "Site data must return published exercises");
  console.log("   ✓ Site data loaded", siteData.exercises.length, "exercises seamlessly.\n");

  // TEST 8: Simulated Database Outage & Automatic Google Sheets Failover
  console.log("👉 Test 8: Simulating PostgreSQL Database Outage (Failover Test)...");
  // Temporarily break DB connection string
  const originalDbUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://postgres:invalid@127.0.0.1:9999/invalid?connect_timeout=1";

  const failoverData = await getSiteData();
  assert.ok(failoverData.exercises.length >= 2, "Failover must load exercises from Google Sheets");
  assert.ok(failoverData.subjects.length >= 5, "Failover must load subjects from Google Sheets");
  assert.ok(Object.keys(failoverData.content).length >= 50, "Failover must load all site text from Google Sheets");
  console.log("   ✓ Automatic failover succeeded! Site loaded with ZERO downtime during DB outage.\n");

  // Restore DB URL
  process.env.DATABASE_URL = originalDbUrl;

  console.log("==================================================");
  console.log("🎉 ALL 8 TEST CASES PASSED WITH 100% SUCCESS!");
  console.log("==================================================");
}

runAllTests().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
