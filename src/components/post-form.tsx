"use client";

import { useMemo, useState } from "react";
import { getDriveImage } from "@/lib/drive";
import { savePostAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/submit-button";
import { DriveImageUploader } from "@/components/drive-image-uploader";

type PostValues = {
  id?: string;
  titleKh?: string;
  badgeKh?: string | null;
  contentKh?: string;
  driveUrl?: string | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
  order?: number;
  published?: boolean;
  featured?: boolean;
};

export function PostForm({ initial, title = "បន្ថែមដំណឹង / ការផ្សាយថ្មី" }: { initial?: PostValues; title?: string }) {
  const [driveUrl, setDriveUrl] = useState(initial?.driveUrl ?? "");
  const driveImg = useMemo(() => (driveUrl ? getDriveImage(driveUrl) : null), [driveUrl]);

  return (
    <details className="form-card" open={!initial}>
      <summary style={{ cursor: "pointer", fontWeight: 700 }}>{title}</summary>
      <form action={savePostAction} style={{ marginTop: "1rem" }}>
        {initial?.id && <input type="hidden" name="id" value={initial.id} />}
        <div className="field-grid">
          <div className="field field-wide">
            <label htmlFor={`title-${initial?.id ?? "new"}`}>ចំណងជើងដំណឹង / ការផ្សាយ</label>
            <input
              className="input"
              id={`title-${initial?.id ?? "new"}`}
              name="titleKh"
              defaultValue={initial?.titleKh ?? ""}
              placeholder="ឧ. ដំណឹងជ្រើសរើសគ្រូឆ្នើម"
              required
            />
          </div>

          <div className="field">
            <label htmlFor={`badge-${initial?.id ?? "new"}`}>ផ្លាកសម្គាល់ (Badge / Tag)</label>
            <input
              className="input"
              id={`badge-${initial?.id ?? "new"}`}
              name="badgeKh"
              defaultValue={initial?.badgeKh ?? "ដំណឹងជ្រើសរើសគ្រូឆ្នើម"}
              placeholder="ឧ. ដំណឹងជ្រើសរើសគ្រូឆ្នើម, ដំណឹងបន្ទាន់"
            />
          </div>

          <div className="field">
            <label htmlFor={`order-${initial?.id ?? "new"}`}>លំដាប់បង្ហាញ</label>
            <input
              className="input"
              id={`order-${initial?.id ?? "new"}`}
              name="order"
              type="number"
              min="0"
              defaultValue={initial?.order ?? 0}
            />
          </div>

          <div className="field field-wide">
            <label htmlFor={`content-${initial?.id ?? "new"}`}>ខ្លឹមសារដំណឹង / អត្ថបទផ្សាយ</label>
            <textarea
              className="textarea"
              id={`content-${initial?.id ?? "new"}`}
              name="contentKh"
              defaultValue={initial?.contentKh ?? ""}
              rows={8}
              placeholder="សរសេរព័ត៌មានលម្អិតអំពីការជ្រើសរើសគ្រូ ឬដំណឹងផ្សាយនៅទីនេះ..."
              required
            />
          </div>

          <div className="field field-wide">
            <label htmlFor={`drive-${initial?.id ?? "new"}`}>
              រូបភាពផ្ទាំងរូបភាព / Poster ពី Google Drive (មិនដាក់ក៏បាន)
            </label>
            <DriveImageUploader
              id={`drive-${initial?.id ?? "new"}`}
              name="driveUrl"
              defaultValue={initial?.driveUrl ?? ""}
              onChangeUrl={(url) => setDriveUrl(url)}
              required={false}
              helpText="ដាក់រូប Poster ពី Google Drive ដើម្បីបង្ហាញជាមួយដំណឹងផ្សាយ"
            />
            {driveImg && (
              <div style={{ marginTop: ".6rem", display: "flex", alignItems: "center", gap: ".6rem" }}>
                <img
                  src={driveImg.renderUrl}
                  alt="រូបភាពតូច"
                  style={{ width: "52px", height: "52px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--line)" }}
                  referrerPolicy="no-referrer"
                />
                <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>រូបភាព Google Drive ត្រូវបានភ្ជាប់រួចរាល់</span>
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor={`actionUrl-${initial?.id ?? "new"}`}>តំណភ្ជាប់ប៊ូតុងសកម្មភាព (Action Link)</label>
            <input
              className="input"
              id={`actionUrl-${initial?.id ?? "new"}`}
              name="actionUrl"
              defaultValue={initial?.actionUrl ?? "https://t.me/sambathkorm"}
              placeholder="https://t.me/sambathkorm"
            />
          </div>

          <div className="field">
            <label htmlFor={`actionLabel-${initial?.id ?? "new"}`}>អក្សរបង្ហាញលើប៊ូតុង (Button Label)</label>
            <input
              className="input"
              id={`actionLabel-${initial?.id ?? "new"}`}
              name="actionLabel"
              defaultValue={initial?.actionLabel ?? "ទំនាក់ទំនងដាក់ពាក្យតាម Telegram"}
              placeholder="ឧ. ទំនាក់ទំនងដាក់ពាក្យតាម Telegram"
            />
          </div>

          <div className="field field-wide" style={{ display: "flex", gap: "1.5rem", marginTop: ".5rem", flexWrap: "wrap" }}>
            <label className="help" style={{ display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer" }}>
              <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} />
              ផ្សាយលើគេហទំព័រ
            </label>
            <label className="help" style={{ display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer" }}>
              <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? true} />
              📌 កំណត់ជាដំណឹងលេចធ្លោបំផុត (បង្ហាញមុនគេបង្អស់ពេលបើកមើលគេហទំព័រ)
            </label>
          </div>
        </div>

        <div className="form-actions">
          <SubmitButton
            label={initial ? "រក្សាទុកការកែប្រែ" : "ផ្សាយដំណឹងនេះ"}
            loadingLabel="កំពុងរក្សាទុក..."
            variant="primary"
          />
        </div>
      </form>
    </details>
  );
}
