import { chromium } from "playwright";
import { readFileSync } from "node:fs";

async function main() {
  const BASE = "http://localhost:3000";
  const env = readFileSync(".env", "utf8");
  const PASSWORD = env.match(/^ADMIN_PASSWORD="?(.*?)"?$/m)?.[1] ?? "";
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const violations: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && msg.text().includes("Content Security Policy")) violations.push(msg.text());
  });

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  console.log("home (with video thumbnails) CSP violations:", violations.length ? violations : "none");

  violations.length = 0;
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.fill("#email", "admin@drmaths.com");
  await page.fill("#password", PASSWORD);
  await Promise.all([page.waitForURL("**/admin", { timeout: 15000 }), page.click('button[type="submit"]')]);
  await page.goto(`${BASE}/admin/videos`, { waitUntil: "networkidle" });
  // open the edit form to render the YouTube embed + thumbnail preview
  await page.locator("tr", { hasText: "CSP Check Video" }).locator("details").click();
  await page.waitForTimeout(2500);
  console.log("admin videos (with youtube iframe preview) CSP violations:", violations.length ? violations : "none");

  await browser.close();
  process.exit(violations.length ? 1 : 0);
}

main();
