import { chromium } from "playwright";
import { readFileSync } from "node:fs";

async function main() {
  const env = readFileSync(".env", "utf8");
  const PASSWORD = env.match(/^ADMIN_PASSWORD="?(.*?)"?$/m)?.[1] ?? "";
  const browser = await chromium.launch();

  // Public page: About section shows the draft image
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const about = await page.evaluate(() => {
    const img = document.querySelector(".about-photo") as HTMLImageElement | null;
    return {
      src: img?.src,
      loaded: img ? img.complete && img.naturalWidth > 0 : false,
      naturalSize: img ? `${img.naturalWidth}x${img.naturalHeight}` : null,
    };
  });
  console.log("public about photo:", JSON.stringify(about));
  await page.close();

  // Admin: Content page shows the new Drive link field
  const admin = await browser.newPage();
  await admin.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });
  await admin.fill("#email", "admin@drmaths.com");
  await admin.fill("#password", PASSWORD);
  await Promise.all([admin.waitForURL("**/admin", { timeout: 15000 }), admin.click('button[type="submit"]')]);
  await admin.goto("http://localhost:3000/admin/content", { waitUntil: "networkidle" });
  const field = admin.locator('label', { hasText: "តំណរូបភាព Google Drive" });
  const count = await field.count();
  const placeholder = await field.locator("xpath=following-sibling::*").first().getAttribute("placeholder").catch(() => null);
  console.log(`admin about Drive field present: ${count > 0}${placeholder ? ` | placeholder: ${placeholder}` : ""}`);
  await admin.close();

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
