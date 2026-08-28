"use client";

import { useMemo, useState } from "react";
import { getYouTubeEmbed, getYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";
import { saveVideoAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/submit-button";

type VideoValues = {
  id?: string;
  titleKh?: string;
  youtubeUrl?: string;
  seriesKh?: string | null;
  order?: number;
  published?: boolean;
  featured?: boolean;
};

export function VideoForm({ initial, title = "បន្ថែមវីដេអូថ្មី" }: { initial?: VideoValues; title?: string }) {
  const [url, setUrl] = useState(initial?.youtubeUrl ?? "");
  const videoId = useMemo(() => getYouTubeId(url), [url]);

  return (
    <details className="form-card" open={!initial}>
      <summary style={{ cursor: "pointer", fontWeight: 700 }}>{title}</summary>
      <form action={saveVideoAction} style={{ marginTop: "1rem" }}>
        {initial?.id && <input type="hidden" name="id" value={initial.id} />}
        <div className="field-grid">
          <div className="field field-wide">
            <label htmlFor={`youtube-${initial?.id ?? "new"}`}>តំណ YouTube</label>
            <input
              className="input"
              id={`youtube-${initial?.id ?? "new"}`}
              name="youtubeUrl"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://youtu.be/... ឬ https://youtube.com/watch?v=..."
              required
            />
            <p className="help">គាំទ្រ៖ watch?v=, youtu.be, /shorts/ និង /embed/។</p>
          </div>
          {url && !videoId && (
            <p className="error field-wide">
              មិនអាចរកលេខសម្គាល់វីដេអូបានទេ។ សូមពិនិត្យតំណ YouTube ម្តងទៀត។
            </p>
          )}
          {videoId && (
            <div className="field field-wide">
              <label>មើលជាមុន</label>
              <div className="video-layout" style={{ marginTop: 0 }}>
                <img
                  src={getYouTubeThumbnail(videoId)}
                  alt="រូបតូចវីដេអូ YouTube"
                  className="video-thumb"
                  style={{ maxWidth: 320 }}
                />
                <div className="player-frame">
                  <iframe
                    title="មើលវីដេអូមុនផ្សាយ"
                    src={getYouTubeEmbed(videoId)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
          <div className="field field-wide">
            <label htmlFor={`title-${initial?.id ?? "new"}`}>ចំណងជើងវីដេអូ</label>
            <input
              className="input"
              id={`title-${initial?.id ?? "new"}`}
              name="titleKh"
              defaultValue={initial?.titleKh ?? ""}
              placeholder="ឧ. គណិតវិទ្យាថ្នាក់ទី៦ ភាគ៩"
              required
            />
          </div>
          <div className="field">
            <label htmlFor={`series-${initial?.id ?? "new"}`}>ស៊េរី / មុខវិជ្ជា</label>
            <input
              className="input"
              id={`series-${initial?.id ?? "new"}`}
              name="seriesKh"
              defaultValue={initial?.seriesKh ?? ""}
              placeholder="គណិតវិទ្យាថ្នាក់ទី៦"
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
          <label className="help">
            <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} /> ផ្សាយលើទំព័រសាធារណៈ
          </label>
          <label className="help">
            <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} /> កំណត់ជាវីដេអូសំខាន់
          </label>
        </div>
        <div className="form-actions">
          <SubmitButton
            label={initial ? "រក្សាទុកការកែប្រែ" : "រក្សាទុក & ផ្សាយ"}
            loadingLabel="កំពុងរក្សាទុក..."
            disabled={!videoId}
            variant="primary"
          />
        </div>
      </form>
    </details>
  );
}
