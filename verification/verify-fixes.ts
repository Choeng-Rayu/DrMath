import { chromium } from "playwright";
import { readFileSync } from "node:fs";

async function main() {
  const BASE = "http://localhost:3000";
  const env = readFileSync(".env", "utf8");
  const EMAIL = "admin@drmaths.com";
  const PASSWORD = env.match(/^ADMIN_PASSWORD="?(.*?)"?$/m)?.[1] ?? "";
  if (!PASSWORD) throw new Error("ADMIN_PASSWORD not found in .env");

  // Unique 11-char YouTube ID so a fresh run never collides with stale data.
  const ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
  const VIDEO_ID = Array.from({ length: 11 }, () => ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]).join("");
  const VIDEO_URL = `https://youtu.be/${VIDEO_ID}`;
  const TITLE = `Test Video ${VIDEO_ID}`;

  let passed = 0;
  let failed = 0;
  function check(name: string, ok: boolean, extra = "") {
    if (ok) { passed++; console.log(`  ✅ ${name}`); }
    else { failed++; console.log(`  ❌ ${name} ${extra}`); }
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  let confirmShown = false;
  page.on("dialog", async (dialog) => {
    if (dialog.type() === "confirm") confirmShown = true;
    await dialog.accept();
  });

  try {
    // 1. Login
    await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
    await page.fill("#email", EMAIL);
    await page.fill("#password", PASSWORD);
    await Promise.all([page.waitForURL("**/admin", { timeout: 15000 }), page.click('button[type="submit"]')]);
    check("login redirects to /admin", page.url().endsWith("/admin"));

    // 2. Add a video — wait for the row to actually render, not the URL.
    await page.goto(`${BASE}/admin/videos`, { waitUntil: "networkidle" });
    await page.fill("#youtube-new", VIDEO_URL);
    await page.fill("#title-new", TITLE);
    await page.click('button:has-text("រក្សាទុក")');
    await page.locator("text=" + TITLE).first().waitFor({ timeout: 15000 });
    check("video saved successfully", true);

    // 3. Add the SAME YouTube URL again → friendly error banner, no crash, no dup row.
    await page.fill("#youtube-new", VIDEO_URL);
    await page.fill("#title-new", "Duplicate Attempt");
    await page.click('button:has-text("រក្សាទុក")');
    const banner = page.locator('[role="alert"]', { hasText: "វីដេអូនេះ" });
    await banner.waitFor({ timeout: 15000 });
    const bannerText = await banner.innerText();
    const noDuplicateRow = (await page.locator("text=Duplicate Attempt").count()) === 0;
    check("duplicate URL shows friendly error", bannerText.includes("វីដេអូនេះមានរួចហើយ") && noDuplicateRow, `| banner: ${bannerText}`);

    // 4. Delete → confirm() must fire, then the row disappears.
    const row = page.locator("tr", { hasText: TITLE });
    await row.locator('button:has-text("លុប")').click();
    await page.locator("text=" + TITLE).first().waitFor({ state: "detached", timeout: 15000 });
    check("delete shows confirm() and removes the row", confirmShown);

    // 5. Wrong-password login attempts don't crash the app (rate limiter in place).
    await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
    for (let i = 0; i < 6; i++) {
      await page.fill("#email", EMAIL);
      await page.fill("#password", "wrong-password-123");
      await page.click('button[type="submit"]');
      await page.waitForTimeout(600);
    }
    const pageAlive = await page.locator(".login-card").count();
    check("login page survives repeated failed attempts", pageAlive > 0);
  } catch (error) {
    failed++;
    console.log("  ❌ exception:", (error as Error).message);
  } finally {
    await browser.close();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main();
