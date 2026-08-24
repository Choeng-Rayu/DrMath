// E2E verification for the admin live-preview + draft/publish feature.
// Run: npx tsx verification/preview-check.ts  (dev server on :3000 required)
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const BASE = "http://localhost:3000";

async function main() {
  const env = readFileSync(".env", "utf8");
  const PASSWORD = env.match(/^ADMIN_PASSWORD="?(.*?)"?$/m)?.[1] ?? "";
  if (!PASSWORD) throw new Error("ADMIN_PASSWORD not found in .env");

  let failed = false;
  const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${name}: ${ok ? "OK" : "FAIL"} ${detail}`);
    if (!ok) failed = true;
  };

  // Click a server-action button and wait for its POST response to complete.
  async function clickAction(page: import("playwright").Page, selector: string) {
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().startsWith(BASE) && r.request().method() === "POST", { timeout: 20000 }),
      page.locator(selector).click({ noWaitAfter: true }),
    ]);
    return response?.status();
  }

  const browser = await chromium.launch();

  // --- Logged-out /preview must redirect to login ---
  const anon = await browser.newPage();
  await anon.goto(BASE + "/preview", { waitUntil: "domcontentloaded" });
  check("anon /preview redirects to login", anon.url().includes("/admin/login"));
  await anon.close();

  // --- Admin flow ---
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await page.goto(BASE + "/admin/login", { waitUntil: "domcontentloaded" });
  await page.fill("#email", "admin@drmaths.com");
  await page.fill("#password", PASSWORD);
  await Promise.all([page.waitForURL("**/admin", { timeout: 15000 }), page.click('button[type="submit"]')]);
  await page.waitForLoadState("domcontentloaded");
  check("login", true);

  // Discard any leftover drafts so we start clean
  await page.goto(BASE + "/admin/content", { waitUntil: "domcontentloaded" });
  if (await page.locator(".draft-banner").count()) {
    await clickAction(page, '.draft-banner form:has(button:text("បោះបង់")) button');
    await page.locator(".draft-banner").waitFor({ state: "detached", timeout: 10000 }).catch(() => null);
  }
  check("no draft banner after clean-up", (await page.locator(".draft-banner").count()) === 0);

  // Live preview iframe present
  const frameCount = await page.locator(".preview-frame").count();
  check("live preview iframe rendered", frameCount === 1);

  // Wait for iframe and PreviewBridge client hydration
  const frame = page.frameLocator(".preview-frame");
  await frame.locator('[data-cms-key="hero.title"]').waitFor({ state: "visible" });
  await page.waitForTimeout(1000);

  // Type into hero title field and check the iframe updates live
  const heroInput = page.locator("#content\\:hero\\.title");
  const originalTitle = await heroInput.inputValue();
  await heroInput.focus();
  await heroInput.pressSequentially(" PREVIEWTEST", { delay: 20 });
  await page.waitForTimeout(600);
  const previewH1 = await frame.locator('[data-cms-key="hero.title"]').textContent();
  check("iframe live-updates while typing", (previewH1 ?? "").includes("PREVIEWTEST"), `got "${previewH1?.slice(-30)}"`);

  // Save as draft
  await clickAction(page, '.form-actions button[type="submit"]');

  // Draft banner appears seamlessly via RSC update
  await page.locator(".draft-banner").waitFor({ state: "visible", timeout: 10000 });
  check("draft banner after save", (await page.locator(".draft-banner").count()) === 1);

  // Public homepage unchanged
  const publicPage = await browser.newPage();
  await publicPage.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const publicH1 = await publicPage.locator('[data-cms-key="hero.title"]').textContent();
  check("public site NOT changed by draft", !(publicH1 ?? "").includes("PREVIEWTEST"));

  // /preview shows the draft
  await page.goto(BASE + "/preview", { waitUntil: "domcontentloaded" });
  const previewServerH1 = await page.locator('[data-cms-key="hero.title"]').textContent();
  check("/preview shows draft", (previewServerH1 ?? "").includes("PREVIEWTEST"));

  // Publish
  await page.goto(BASE + "/admin/content", { waitUntil: "domcontentloaded" });
  await clickAction(page, '.draft-banner form:has(button:text("ផ្សាយ")) button');
  await page.locator(".draft-banner").waitFor({ state: "detached", timeout: 10000 });
  check("banner cleared after publish", (await page.locator(".draft-banner").count()) === 0);

  await publicPage.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const publishedH1 = await publicPage.locator('[data-cms-key="hero.title"]').textContent();
  check("public site updated after publish", (publishedH1 ?? "").includes("PREVIEWTEST"));

  // Restore: remove suffix, save draft, publish
  await page.goto(BASE + "/admin/content", { waitUntil: "domcontentloaded" });
  await heroInput.fill(originalTitle);
  await clickAction(page, '.form-actions button[type="submit"]');
  await page.locator(".draft-banner").waitFor({ state: "visible", timeout: 10000 });
  await clickAction(page, '.draft-banner form:has(button:text("ផ្សាយ")) button');
  await page.locator(".draft-banner").waitFor({ state: "detached", timeout: 10000 });

  await publicPage.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const restoredH1 = await publicPage.locator('[data-cms-key="hero.title"]').textContent();
  // public page renders plain() (tags stripped); originalTitle is the raw input value
  check("title restored", (restoredH1 ?? "") === originalTitle.replace(/<[^>]*>/g, ""), `got "${restoredH1?.slice(-30)}"`);

  // Discard flow: type, save draft, then discard
  await page.goto(BASE + "/admin/content", { waitUntil: "domcontentloaded" });
  await heroInput.fill(originalTitle + " DISCARDTEST");
  await clickAction(page, '.form-actions button[type="submit"]');
  await page.locator(".draft-banner").waitFor({ state: "visible", timeout: 10000 });
  await clickAction(page, '.draft-banner form:has(button:text("បោះបង់")) button');
  await page.locator(".draft-banner").waitFor({ state: "detached", timeout: 10000 });

  check("banner cleared after discard", (await page.locator(".draft-banner").count()) === 0);
  const discardedValue = await heroInput.inputValue();
  check("discard reverted value", discardedValue === originalTitle);

  // Screenshot of editor with live preview
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto(BASE + "/admin/content", { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: "verification/preview-editor.png" });

  await browser.close();
  console.log(failed ? "\nRESULT: FAILURES FOUND" : "\nRESULT: ALL CHECKS PASSED");
  process.exit(failed ? 1 : 0);
}

main().catch((error) => { console.error(error); process.exit(1); });
