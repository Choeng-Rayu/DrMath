import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const report = await page.evaluate(() => {
    const ranges: string[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if (rule instanceof CSSFontFaceRule && rule.style.fontFamily.toLowerCase().includes("freehand")) {
            ranges.push(rule.style.getPropertyValue("unicode-range"));
          }
        }
      } catch {}
    }
    // Find an element containing only Latin/digits to measure its font
    const all = Array.from(document.querySelectorAll("body *"));
    const latinEl = all.find((el) => el.childElementCount === 0 && /^[A-Za-z0-9 .\-#:]+$/.test((el as HTMLElement).innerText.trim()) && (el as HTMLElement).innerText.trim().length > 0);
    return {
      freehandUnicodeRanges: ranges,
      latinSample: latinEl ? { text: (latinEl as HTMLElement).innerText.trim().slice(0, 40), font: getComputedStyle(latinEl as HTMLElement).fontFamily } : null,
    };
  });
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}

main();
