import assert from "node:assert/strict";
import { getDriveImage } from "../src/lib/drive";
import { getYouTubeId, getYouTubeThumbnail } from "../src/lib/youtube";
import { renderRichText, plain } from "../src/lib/text";

const driveId = "1AbCdEfGhIjKlMnOpQrStUvWxYz";
const drive = getDriveImage(`https://drive.google.com/file/d/${driveId}/view?usp=sharing`);
assert.ok(drive, "A valid Google Drive file link should normalize");
assert.equal(drive.fileId, driveId);
assert.equal(drive.renderUrl, `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`);
assert.equal(getDriveImage("https://example.com/image.png"), null, "Non-Drive image links must be rejected");

const expectedVideoId = "dQw4w9WgXcQ";
for (const url of [
  `https://www.youtube.com/watch?v=${expectedVideoId}`,
  `https://youtu.be/${expectedVideoId}`,
  `https://www.youtube.com/shorts/${expectedVideoId}`,
  `https://www.youtube.com/embed/${expectedVideoId}`,
]) {
  assert.equal(getYouTubeId(url), expectedVideoId, `Expected to parse ${url}`);
}
assert.equal(getYouTubeId("https://vimeo.com/1234"), null, "Non-YouTube video links must be rejected");
assert.equal(getYouTubeThumbnail(expectedVideoId), `https://img.youtube.com/vi/${expectedVideoId}/hqdefault.jpg`);

// Rich text & plain text tests
assert.equal(plain("Hello <strong>World</strong>"), "Hello World");
assert.equal(
  renderRichText("មួយជំហានជាមួយ <strong>DR.MATHS</strong> = មួយជំហានជាមួយ ABC"),
  "មួយជំហានជាមួយ <strong>DR.MATHS</strong> = មួយជំហានជាមួយ ABC"
);
assert.equal(
  renderRichText('<script>alert("hack")</script><strong>Clean</strong>'),
  '&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;<strong>Clean</strong>'
);

import { isGoogleDriveConfigured } from "../src/lib/google-drive";

// Check Google Drive configuration status returns expected schema
const driveConfig = isGoogleDriveConfigured();
assert.equal(typeof driveConfig.configured, "boolean");
assert.ok(Array.isArray(driveConfig.missing));

import { fallbackPosts, getSiteData } from "../src/lib/site";
assert.ok(fallbackPosts.length > 0, "Fallback posts must not be empty");
assert.ok(fallbackPosts[0].titleKh.includes("ដំណឹងជ្រើសរើសគ្រូឆ្នើម"), "Fallback post must have recruitment title");
assert.ok(fallbackPosts[0].contentKh.includes("គ្រូគណិតវិទ្យា"), "Fallback post must include math teacher");
assert.equal(fallbackPosts[0].featured, true, "Recruitment post must be featured");

console.log("All CMS, Drive, and Preview smoke tests passed successfully.");

