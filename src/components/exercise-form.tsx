"use client";

import { useMemo, useState } from "react";
import { getDriveImage } from "@/lib/drive";
import { saveExerciseAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/submit-button";
import { DriveImageUploader } from "@/components/drive-image-uploader";

type ExerciseValues = {
  id?: string;
  titleKh?: string;
  descriptionKh?: string | null;
  subjectKh?: string | null;
  gradeKh?: string | null;
  driveUrl?: string;
  solutionUrl?: string | null;
  order?: number;
  published?: boolean;
  featured?: boolean;
};

export function ExerciseForm({ initial, title = "បន្ថែមលំហាត់ / វិញ្ញាសាថ្មី" }: { initial?: ExerciseValues; title?: string }) {
  const [driveUrl, setDriveUrl] = useState(initial?.driveUrl ?? "");
  const driveImg = useMemo(() => getDriveImage(driveUrl), [driveUrl]);

  return (
    <details className="form-card" open={!initial}>
      <summary style={{ cursor: "pointer", fontWeight: 700 }}>{title}</summary>
      <form action={saveExerciseAction} style={{ marginTop: "1rem" }}>
        {initial?.id && <input type="hidden" name="id" value={initial.id} />}
        <div className="field-grid">
          <div className="field field-wide">
            <label htmlFor={`drive-${initial?.id ?? "new"}`}>រូបភាពលំហាត់ / វិញ្ញាសា</label>
            <DriveImageUploader
              id={`drive-${initial?.id ?? "new"}`}
              name="driveUrl"
              defaultValue={initial?.driveUrl ?? ""}
              onChangeUrl={(url) => setDriveUrl(url)}
              required
            />
          </div>

          <div className="field field-wide">
            <label htmlFor={`title-${initial?.id ?? "new"}`}>ចំណងជើងលំហាត់ / វិញ្ញាសា</label>
            <input
              className="input"
              id={`title-${initial?.id ?? "new"}`}
              name="titleKh"
              defaultValue={initial?.titleKh ?? ""}
              placeholder="ឧ. វិញ្ញាសាគណិតវិទ្យា ថ្នាក់ទី១២ - ត្រៀមប្រឡងបាក់ឌុប"
              required
            />
          </div>

          <div className="field">
            <label htmlFor={`subject-${initial?.id ?? "new"}`}>មុខវិជ្ជា</label>
            <input
              className="input"
              id={`subject-${initial?.id ?? "new"}`}
              name="subjectKh"
              defaultValue={initial?.subjectKh ?? "គណិតវិទ្យា"}
              placeholder="ឧ. គណិតវិទ្យា, រូបវិទ្យា, គីមីវិទ្យា"
            />
          </div>

          <div className="field">
            <label htmlFor={`grade-${initial?.id ?? "new"}`}>កម្រិតថ្នាក់</label>
            <input
              className="input"
              id={`grade-${initial?.id ?? "new"}`}
              name="gradeKh"
              defaultValue={initial?.gradeKh ?? "ថ្នាក់ទី១២"}
              placeholder="ឧ. ថ្នាក់ទី១២, ថ្នាក់ទី៩"
            />
          </div>

          <div className="field field-wide">
            <label htmlFor={`desc-${initial?.id ?? "new"}`}>ការណែនាំ ឬពិពណ៌នាសង្ខេប</label>
            <textarea
              className="input"
              id={`desc-${initial?.id ?? "new"}`}
              name="descriptionKh"
              defaultValue={initial?.descriptionKh ?? ""}
              rows={2}
              placeholder="ឧ. លំហាត់អនុវត្តអនុគមន៍ និងអាំងតេក្រាល រៀបចំដោយ DR.MATHS..."
            />
          </div>

          <div className="field field-wide">
            <label htmlFor={`sol-${initial?.id ?? "new"}`}>តំណចម្លើយ / ឆានែល Telegram (បើមាន)</label>
            <input
              className="input"
              id={`sol-${initial?.id ?? "new"}`}
              name="solutionUrl"
              defaultValue={initial?.solutionUrl ?? ""}
              placeholder="https://t.me/sambathkorm"
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

          <div className="field field-wide" style={{ display: "flex", gap: "1.5rem", marginTop: ".5rem" }}>
            <label className="help" style={{ display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer" }}>
              <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} />
              ផ្សាយលើទំព័រសាធារណៈ
            </label>
            <label className="help" style={{ display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer" }}>
              <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} />
              កំណត់ជាលំហាត់សំខាន់ (Featured)
            </label>
          </div>
        </div>

        <div className="form-actions">
          <SubmitButton
            label={initial ? "រក្សាទុកការកែប្រែ" : "រក្សាទុក & ផ្សាយ"}
            loadingLabel="កំពុងរក្សាទុក..."
            disabled={!driveImg}
            variant="primary"
          />
        </div>
      </form>
    </details>
  );
}
