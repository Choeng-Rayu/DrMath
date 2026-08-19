import assert from "node:assert/strict";
import { getDriveImage } from "../src/lib/drive";
import { getYouTubeId, getYouTubeThumbnail } from "../src/lib/youtube";

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
assert.equal(getYouTubeThumbnail(expectedVideoId), `https://i.ytimg.com/vi/${expectedVideoId}/hqdefault.jpg`);

console.log("CMS link-parsing smoke tests passed.");
