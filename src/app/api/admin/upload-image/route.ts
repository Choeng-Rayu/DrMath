import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isGoogleDriveConfigured, uploadImageToGoogleDrive } from "@/lib/google-drive";
import { prisma } from "@/lib/prisma";

// Maximum upload file size (20 MB)
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "អ្នកត្រូវចូលគណនី Admin ជាមុនសិន។ (Unauthorized)" },
        { status: 401 }
      );
    }

    // 2. Check Google Drive credentials
    const driveStatus = isGoogleDriveConfigured();
    if (!driveStatus.configured) {
      return NextResponse.json(
        {
          error: `Google Drive API មិនទាន់ត្រូវបានកំណត់នៅក្នុង .env ទេ។ (Missing: ${driveStatus.missing.join(", ")})`,
          missingConfig: driveStatus.missing,
        },
        { status: 400 }
      );
    }

    // 3. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "សូមជ្រើសរើសឯកសាររូបភាពដើម្បីផ្ទុកឡើង។ (No file provided)" },
        { status: 400 }
      );
    }

    // 4. Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `ប្រភេទឯកសារមិនត្រឹមត្រូវ (${file.type})។ អនុញ្ញាតតែរូបភាព JPG, PNG, WEBP, GIF, SVG ប៉ុណ្ណោះ។`,
        },
        { status: 400 }
      );
    }

    // 5. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "ទំហំរូបភាពធំពេក (លើសពី 20MB)។ សូមបន្ថយទំហំរូបភាពមុនផ្ទុកឡើង។" },
        { status: 400 }
      );
    }

    // 6. Upload to Google Drive
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Sanitize filename or add timestamp prefix to avoid name collisions
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const uploadResult = await uploadImageToGoogleDrive({
      buffer,
      fileName: safeName,
      mimeType: file.type,
    });

    // 7. Track in MediaAsset table
    try {
      await prisma.mediaAsset.upsert({
        where: { driveUrl: uploadResult.driveUrl },
        update: {
          driveFileId: uploadResult.fileId,
          renderUrl: uploadResult.renderUrl,
          validationState: "valid",
        },
        create: {
          driveUrl: uploadResult.driveUrl,
          driveFileId: uploadResult.fileId,
          renderUrl: uploadResult.renderUrl,
          category: "upload",
        },
      });
    } catch (dbError) {
      console.warn("[upload-image route] Warning: MediaAsset record could not be updated:", dbError);
    }

    return NextResponse.json({
      success: true,
      fileId: uploadResult.fileId,
      driveUrl: uploadResult.driveUrl,
      renderUrl: uploadResult.renderUrl,
      fileName: uploadResult.fileName,
      sizeBytes: uploadResult.sizeBytes,
    });
  } catch (error) {
    console.error("[upload-image route error]", error);
    const message = error instanceof Error ? error.message : "មានបញ្ហាក្នុងការផ្ទុករូបភាពឡើង Google Drive។";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
