import { saveContentAction } from "@/app/admin/actions";
import { DriveLinkInput } from "@/components/drive-link-input";
import { getAdminData } from "@/lib/site";

const sectionNames: Record<string, string> = {
  nav: "របារម៉ឺនុយ និងប៊ូតុង",
  hero: "ផ្នែកដំបូង",
  stats: "ស្ថិតិ",
  about: "អំពីយើង",
  subjects: "មុខវិជ្ជា",
  formats: "ទម្រង់រៀន",
  videos: "វីដេអូ",
  highlights: "ចំណុចលេចធ្លោ",
  testimonials: "មតិយោបល់",
  contact: "ទំនាក់ទំនង",
};

const labels: Record<string, string> = {
  "nav.home": "ម៉ឺនុយ៖ ទំព័រដើម", "nav.about": "ម៉ឺនុយ៖ អំពីយើង", "nav.subjects": "ម៉ឺនុយ៖ មុខវិជ្ជា", "nav.videos": "ម៉ឺនុយ៖ វីដេអូ", "nav.contact": "ម៉ឺនុយ៖ ទំនាក់ទំនង", "nav.cta": "ប៊ូតុងចុះឈ្មោះ", "nav.ctaUrl": "តំណប៊ូតុងចុះឈ្មោះ",
  "hero.eyebrow": "អក្សរខាងលើ", "hero.title": "ចំណងជើងធំ", "hero.description": "ពិពណ៌នា", "hero.hashtag": "ពាក្យសម្គាល់ (#)", "hero.primaryLabel": "ប៊ូតុងទី១", "hero.primaryUrl": "តំណប៊ូតុងទី១", "hero.secondaryLabel": "ប៊ូតុងទី២", "hero.secondaryUrl": "តំណប៊ូតុងទី២", "hero.imageDriveUrl": "តំណរូបភាព Google Drive",
  "about.eyebrow": "អក្សរខាងលើ", "about.title": "ចំណងជើងផ្នែក", "about.visionTitle": "ចំណងជើងទស្សនវិស័យ", "about.vision": "ខ្លឹមសារទស្សនវិស័យ", "about.missionTitle": "ចំណងជើងបេសកកម្ម", "about.mission": "ខ្លឹមសារបេសកកម្ម", "about.long": "អត្ថបទពិស្តារ",
  "stats.1.value": "ស្ថិតិទី១៖ តម្លៃ", "stats.1.label": "ស្ថិតិទី១៖ ពាក្យពិពណ៌នា", "stats.2.value": "ស្ថិតិទី២៖ តម្លៃ", "stats.2.label": "ស្ថិតិទី២៖ ពាក្យពិពណ៌នា", "stats.3.value": "ស្ថិតិទី៣៖ តម្លៃ", "stats.3.label": "ស្ថិតិទី៣៖ ពាក្យពិពណ៌នា", "stats.4.value": "ស្ថិតិទី៤៖ តម្លៃ", "stats.4.label": "ស្ថិតិទី៤៖ ពាក្យពិពណ៌នា",
  "subjects.eyebrow": "អក្សរខាងលើ", "subjects.title": "ចំណងជើងផ្នែក", "formats.eyebrow": "អក្សរខាងលើ", "formats.title": "ចំណងជើងផ្នែក", "formats.1.title": "ទម្រង់ទី១៖ ចំណងជើង", "formats.1.text": "ទម្រង់ទី១៖ ពិពណ៌នា", "formats.2.title": "ទម្រង់ទី២៖ ចំណងជើង", "formats.2.text": "ទម្រង់ទី២៖ ពិពណ៌នា", "formats.3.title": "ទម្រង់ទី៣៖ ចំណងជើង", "formats.3.text": "ទម្រង់ទី៣៖ ពិពណ៌នា",
  "videos.eyebrow": "អក្សរខាងលើ", "videos.title": "ចំណងជើងផ្នែក", "videos.description": "ពិពណ៌នាផ្នែក", "highlights.eyebrow": "អក្សរខាងលើ", "highlights.title": "ចំណងជើងផ្នែក", "highlights.1.title": "ចំណុចទី១៖ ចំណងជើង", "highlights.1.text": "ចំណុចទី១៖ ពិពណ៌នា", "highlights.2.title": "ចំណុចទី២៖ ចំណងជើង", "highlights.2.text": "ចំណុចទី២៖ ពិពណ៌នា", "highlights.3.title": "ចំណុចទី៣៖ ចំណងជើង", "highlights.3.text": "ចំណុចទី៣៖ ពិពណ៌នា",
  "testimonials.eyebrow": "អក្សរខាងលើ", "testimonials.title": "ចំណងជើងផ្នែក", "contact.eyebrow": "អក្សរខាងលើ", "contact.title": "ចំណងជើងផ្នែក", "contact.description": "ពិពណ៌នា", "contact.cta": "អក្សរប៊ូតុងទំនាក់ទំនង",
};

export default async function ContentPage() {
  const { contents } = await getAdminData();
  const grouped = contents.reduce<Record<string, typeof contents>>((accumulator, item) => {
    accumulator[item.section] ??= [];
    accumulator[item.section].push(item);
    return accumulator;
  }, {});

  return (
    <>
      <header className="admin-header"><div><h1 className="display admin-title">កែខ្លឹមសារគេហទំព័រ</h1><p className="admin-note">អក្សរ តំណ លេខ និងរូបភាពនៅទំព័រសាធារណៈអាចកែបាននៅទីនេះ។</p></div></header>
      <form action={saveContentAction}>
        {Object.entries(grouped).map(([section, rows]) => <section className="form-card" key={section}><h2>{sectionNames[section] ?? section}</h2><div className="field-grid">{rows.map((row) => {
          const isLarge = row.type === "RICH_TEXT" || row.value.length > 100;
          const isImage = row.type === "IMAGE";
          return <div className={`field ${isLarge || isImage ? "field-wide" : ""}`} key={row.id}>
            <label htmlFor={`content:${row.key}`}>{labels[row.key] ?? row.key}</label>
            {isImage ? <DriveLinkInput id={`content:${row.key}`} name={`content:${row.key}`} defaultValue={row.value} /> : isLarge ? <textarea className="textarea" id={`content:${row.key}`} name={`content:${row.key}`} defaultValue={row.value} /> : <input className="input" id={`content:${row.key}`} name={`content:${row.key}`} defaultValue={row.value} type={row.type === "LINK" ? "url" : "text"} />}
            {isImage && <p className="help">ដាក់រូបទៅក្នុង Google Drive របស់អ្នក កំណត់ជា <strong>Anyone with the link</strong> រួចបិទភ្ជាប់តំណ <code>/file/d/...</code> នៅទីនេះ។ រូបមិនត្រូវកែពី source code ទេ។</p>}
            <label className="help"><input name={`visible:${row.key}`} type="checkbox" defaultChecked={row.visible} /> បង្ហាញធាតុនេះលើគេហទំព័រ</label>
          </div>;
        })}</div></section>)}
        <div className="form-actions"><button className="button button-primary" type="submit">រក្សាទុកការកែប្រែ</button></div>
      </form>
    </>
  );
}
