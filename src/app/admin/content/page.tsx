import Link from "next/link";
import { discardContentAction, publishContentAction, saveContentDraftAction } from "@/app/admin/actions";
import { AdminAlertBanner } from "@/components/admin-alert-banner";
import { DriveLinkInput } from "@/components/drive-link-input";
import { LivePreviewPanel } from "@/components/live-preview-panel";
import { SubmitButton } from "@/components/submit-button";
import { getAdminData } from "@/lib/site";

const sectionNames: Record<string, string> = {
  nav: "របារម៉ឺនុយ និងប៊ូតុង",
  hero: "ផ្នែកដំបូង",
  stats: "ស្ថិតិ",
  about: "អំពីយើង",
  subjects: "មុខវិជ្ជា",
  formats: "ទម្រង់រៀន",
  videos: "វីដេអូ",
  exercises: "លំហាត់ & វិញ្ញាសា",
  highlights: "ចំណុចលេចធ្លោ",
  testimonials: "មតិយោបល់",
  contact: "ទំនាក់ទំនង",
};

const labels: Record<string, string> = {
  "nav.home": "ម៉ឺនុយ៖ ទំព័រដើម",
  "nav.about": "ម៉ឺនុយ៖ អំពីយើង",
  "nav.subjects": "ម៉ឺនុយ៖ មុខវិជ្ជា",
  "nav.videos": "ម៉ឺនុយ៖ វីដេអូ",
  "nav.exercises": "ម៉ឺនុយ៖ លំហាត់",
  "nav.contact": "ម៉ឺនុយ៖ ទំនាក់ទំនង",
  "nav.cta": "ប៊ូតុងចុះឈ្មោះ",
  "nav.ctaUrl": "តំណប៊ូតុងចុះឈ្មោះ",
  "hero.eyebrow": "អក្សរខាងលើ",
  "hero.title": "ចំណងជើងធំ",
  "hero.description": "ពិពណ៌នា",
  "hero.hashtag": "ពាក្យសម្គាល់ (#)",
  "hero.primaryLabel": "ប៊ូតុងទី១",
  "hero.primaryUrl": "តំណប៊ូតុងទី១",
  "hero.secondaryLabel": "ប៊ូតុងទី២",
  "hero.secondaryUrl": "តំណប៊ូតុងទី២",
  "hero.imageDriveUrl": "តំណរូបភាព Google Drive",
  "about.eyebrow": "អក្សរខាងលើ",
  "about.title": "ចំណងជើងផ្នែក",
  "about.visionTitle": "ចំណងជើងទស្សនវិស័យ",
  "about.vision": "ខ្លឹមសារទស្សនវិស័យ",
  "about.missionTitle": "ចំណងជើងបេសកកម្ម",
  "about.mission": "ខ្លឹមសារបេសកកម្ម",
  "about.long": "អត្ថបទពិស្តារ",
  "about.imageDriveUrl": "តំណរូបភាព Google Drive",
  "stats.1.value": "ស្ថិតិទី១៖ តម្លៃ",
  "stats.1.label": "ស្ថិតិទី១៖ ពាក្យពិពណ៌នា",
  "stats.2.value": "ស្ថិតិទី២៖ តម្លៃ",
  "stats.2.label": "ស្ថិតិទី២៖ ពាក្យពិពណ៌នា",
  "stats.3.value": "ស្ថិតិទី៣៖ តម្លៃ",
  "stats.3.label": "ស្ថិតិទី៣៖ ពាក្យពិពណ៌នា",
  "stats.4.value": "ស្ថិតិទី៤៖ តម្លៃ",
  "stats.4.label": "ស្ថិតិទី៤៖ ពាក្យពិពណ៌នា",
  "subjects.eyebrow": "អក្សរខាងលើ",
  "subjects.title": "ចំណងជើងផ្នែក",
  "formats.eyebrow": "អក្សរខាងលើ",
  "formats.title": "ចំណងជើងផ្នែក",
  "formats.1.title": "ទម្រង់ទី១៖ ចំណងជើង",
  "formats.1.text": "ទម្រង់ទី១៖ ពិពណ៌នា",
  "formats.2.title": "ទម្រង់ទី២៖ ចំណងជើង",
  "formats.2.text": "ទម្រង់ទី២៖ ពិពណ៌នា",
  "formats.3.title": "ទម្រង់ទី៣៖ ចំណងជើង",
  "formats.3.text": "ទម្រង់ទី៣៖ ពិពណ៌នា",
  "videos.eyebrow": "អក្សរខាងលើ",
  "videos.title": "ចំណងជើងផ្នែក",
  "videos.description": "ពិពណ៌នាផ្នែក",
  "exercises.eyebrow": "អក្សរខាងលើ",
  "exercises.title": "ចំណងជើងផ្នែក",
  "exercises.description": "ពិពណ៌នាផ្នែក",
  "highlights.eyebrow": "អក្សរខាងលើ",
  "highlights.title": "ចំណងជើងផ្នែក",
  "highlights.1.title": "ចំណុចទី១៖ ចំណងជើង",
  "highlights.1.text": "ចំណុចទី១៖ ពិពណ៌នា",
  "highlights.2.title": "ចំណុចទី២៖ ចំណងជើង",
  "highlights.2.text": "ចំណុចទី២៖ ពិពណ៌នា",
  "highlights.3.title": "ចំណុចទី៣៖ ចំណងជើង",
  "highlights.3.text": "ចំណុចទី៣៖ ពិពណ៌នា",
  "testimonials.eyebrow": "អក្សរខាងលើ",
  "testimonials.title": "ចំណងជើងផ្នែក",
  "contact.eyebrow": "អក្សរខាងលើ",
  "contact.title": "ចំណងជើងផ្នែក",
  "contact.description": "ពិពណ៌នា",
  "contact.cta": "អក្សរប៊ូតុងទំនាក់ទំនង",
};

type ContentPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function ContentPage({ searchParams }: ContentPageProps) {
  const { error, success } = await searchParams;
  const { contents } = await getAdminData();
  const grouped = contents.reduce<Record<string, typeof contents>>((accumulator, item) => {
    accumulator[item.section] ??= [];
    accumulator[item.section].push(item);
    return accumulator;
  }, {});
  const hasDrafts = contents.some((row) => row.draftValue !== null || row.draftVisible !== null);

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="display admin-title">កែខ្លឹមសារគេហទំព័រ</h1>
          <p className="admin-note">អក្សរ តំណ លេខ និងរូបភាពនៅទំព័រសាធារណៈអាចកែបាននៅទីនេះ។</p>
        </div>
        <Link href="/preview" target="_blank" rel="noreferrer" className="button button-secondary button-small">
          មើលទំព័រជាមុន ↗
        </Link>
      </header>

      <AdminAlertBanner error={error} success={success} />

      <div className="editor-layout">
        <div>
          {hasDrafts && (
            <div className="draft-banner">
              <span>មានការកែប្រែដែលមិនទាន់ផ្សាយ — គេហទំព័រសាធារណៈឃើញខ្លឹមសារចាស់។</span>
              <span style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                <form action={publishContentAction}>
                  <SubmitButton
                    label="ផ្សាយឥឡូវនេះ"
                    loadingLabel="កំពុងផ្សាយ..."
                    variant="primary"
                    size="small"
                  />
                </form>
                <form action={discardContentAction}>
                  <SubmitButton
                    label="បោះបង់ការកែប្រែ"
                    loadingLabel="កំពុងបោះបង់..."
                    variant="danger"
                    size="small"
                  />
                </form>
              </span>
            </div>
          )}
          <form action={saveContentDraftAction}>
            {Object.entries(grouped).map(([section, rows]) => (
              <section className="form-card" key={section}>
                <h2>{sectionNames[section] ?? section}</h2>
                <div className="field-grid">
                  {rows.map((row) => {
                    const value = row.draftValue ?? row.value;
                    const visible = row.draftVisible ?? row.visible;
                    const isLarge = row.type === "RICH_TEXT" || value.length > 100;
                    const isImage = row.type === "IMAGE";
                    const isDraft = row.draftValue !== null || row.draftVisible !== null;
                    return (
                      <div className={`field ${isLarge || isImage ? "field-wide" : ""}`} key={row.id}>
                        <label htmlFor={`content:${row.key}`}>
                          {labels[row.key] ?? row.key}
                          {isDraft ? " ✏️" : ""}
                        </label>
                        {isImage ? (
                          <DriveLinkInput id={`content:${row.key}`} name={`content:${row.key}`} defaultValue={value} />
                        ) : isLarge ? (
                          <textarea className="textarea" id={`content:${row.key}`} name={`content:${row.key}`} defaultValue={value} />
                        ) : (
                          <input
                            className="input"
                            id={`content:${row.key}`}
                            name={`content:${row.key}`}
                            defaultValue={value}
                            type={row.type === "LINK" ? "url" : "text"}
                          />
                        )}
                        {isImage && (
                          <p className="help">
                            ដាក់រូបទៅក្នុង Google Drive របស់អ្នក កំណត់ជា <strong>Anyone with the link</strong> រួចបិទភ្ជាប់តំណ <code>/file/d/...</code> នៅទីនេះ។ រូបមិនត្រូវកែពី source code ទេ។
                          </p>
                        )}
                        <label className="help">
                          <input name={`visible:${row.key}`} type="checkbox" defaultChecked={visible} /> បង្ហាញធាតុនេះលើគេហទំព័រ
                        </label>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
            <div className="form-actions">
              <SubmitButton
                label="រក្សាទុកសេចក្តីព្រាង"
                loadingLabel="កំពុងរក្សាទុកសេចក្តីព្រាង..."
                variant="primary"
              />
            </div>
          </form>
        </div>
        <LivePreviewPanel />
      </div>
    </>
  );
}
