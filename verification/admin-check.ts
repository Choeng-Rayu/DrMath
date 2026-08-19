import { chromium } from "playwright";
import { readFileSync } from "node:fs";

async function main() {
  const env = readFileSync(".env", "utf8");
  const PASSWORD = env.match(/^ADMIN_PASSWORD="?(.*?)"?$/m)?.[1] ?? "";
  if (!PASSWORD) throw new Error("ADMIN_PASSWORD not found in .env");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Login
  await page.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });
  await page.fill("#email", "admin@drmaths.com");
  await page.fill("#password", PASSWORD);
  await Promise.all([page.waitForURL("**/admin", { timeout: 15000 }), page.click('button[type="submit"]')]);
  console.log("login: OK");

  // Every admin page + public page
  const paths = ["/admin", "/admin/content", "/admin/videos", "/admin/subjects", "/admin/testimonials", "/admin/settings", "/"];
  let failed = false;
  for (const path of paths) {
    const resp = await page.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
    const status = resp?.status();
    const ok = status === 200;
    if (!ok) failed = true;
    console.log(`${path}: ${status}${ok ? "" : " ❌"}`);
  }

  await browser.close();
  process.exit(failed ? 1 : 0);
}

main();
