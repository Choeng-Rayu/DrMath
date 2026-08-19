import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ContentMap = Record<string, string>;

export const fallbackContent: ContentMap = {
  "nav.home": "ទំព័រដើម",
  "nav.about": "អំពីយើង",
  "nav.subjects": "មុខវិជ្ជា",
  "nav.videos": "វីដេអូ",
  "nav.contact": "ទំនាក់ទំនង",
  "nav.cta": "ចុះឈ្មោះរៀន",
  "nav.ctaUrl": "https://t.me/sambathkorm",
  "hero.eyebrow": "DR.MATHS EDUCATION CENTER",
  "hero.title": "មួយជំហានជាមួយ <strong>DR.MATHS</strong> = មួយជំហានជាមួយ ABC",
  "hero.description": "រៀនឱ្យយល់ច្បាស់ ពង្រឹងមូលដ្ឋាន និងឈានទៅរកលទ្ធផលដែលអ្នកស្រមៃ។",
  "hero.hashtag": "#ចង់ចេះគណិតវិទ្យា មក #DRMATHSEDUCATIONCENTER",
  "hero.primaryLabel": "ចាប់ផ្តើមរៀន",
  "hero.primaryUrl": "https://t.me/sambathkorm",
  "hero.secondaryLabel": "មើលវីដេអូមេរៀន",
  "hero.secondaryUrl": "#videos",
  "hero.imageDriveUrl": "",
  "stats.1.value": "ថ្នាក់ទី៣–១២",
  "stats.1.label": "កម្រិតសិក្សា",
  "stats.2.value": "៥ មុខវិជ្ជា",
  "stats.2.label": "ជម្រើសសិក្សា",
  "stats.3.value": "៣ ទម្រង់",
  "stats.3.label": "របៀបរៀន",
  "stats.4.value": "A / សិស្សពូកែ",
  "stats.4.label": "គោលដៅរបស់យើង",
  "about.eyebrow": "ស្គាល់យើងបន្ថែម",
  "about.title": "កន្លែងសិក្សាដែលធ្វើឱ្យគណិតវិទ្យាងាយយល់",
  "about.visionTitle": "ទស្សនវិស័យ",
  "about.vision": "បង្កើតសិស្សដែលមានទំនុកចិត្ត ចេះគិតវិភាគ និងស្រឡាញ់ការរៀនសូត្រ។",
  "about.missionTitle": "បេសកកម្ម",
  "about.mission": "ផ្តល់ការបង្រៀនច្បាស់លាស់ ជិតស្និទ្ធ និងសមស្របតាមកម្រិតរបស់សិស្សម្នាក់ៗ។",
  "about.long": "យើងជឿថា សិស្សគ្រប់រូបអាចពូកែបាន ប្រសិនបើទទួលបានការណែនាំត្រឹមត្រូវ។ DR.MATHS រៀបចំមេរៀនជាជំហានៗ ដើម្បីឱ្យការយល់ដឹងក្លាយជាទំនុកចិត្ត។",
  "subjects.eyebrow": "មុខវិជ្ជាដែលយើងបង្រៀន",
  "subjects.title": "សិក្សាតាមជំនាញដែលអ្នកត្រូវការ",
  "formats.eyebrow": "បត់បែនតាមអ្នក",
  "formats.title": "ជ្រើសរើសទម្រង់រៀនដែលសមរម្យ",
  "formats.1.title": "បង្រៀនផ្ទាល់",
  "formats.1.text": "រៀនជួបគ្រូដោយផ្ទាល់ ក្នុងបរិយាកាសផ្តោតលើការយល់។",
  "formats.2.title": "រៀនអនឡាញ",
  "formats.2.text": "រៀនពីគ្រប់ទីកន្លែង ជាមួយការណែនាំច្បាស់លាស់។",
  "formats.3.title": "បង្រៀនដល់ផ្ទះ",
  "formats.3.text": "ទទួលបានការបង្រៀនផ្ទាល់ខ្លួន នៅទីតាំងដែលអ្នកងាយស្រួល។",
  "videos.eyebrow": "វីដេអូមេរៀនជាស៊េរី",
  "videos.title": "មើលមេរៀនឡើងវិញ តាមល្បឿនរបស់អ្នក",
  "videos.description": "វីដេអូដែលបានផ្សាយដោយគ្រូ បង្ហាញជាជំហានៗ និងងាយតាមដាន។",
  "highlights.eyebrow": "ហេតុអ្វីជ្រើសរើស DR.MATHS",
  "highlights.title": "ការរៀនដែលផ្តល់លទ្ធផលជាក់ស្តែង",
  "highlights.1.title": "គ្រូមានបទពិសោធន៍",
  "highlights.1.text": "ពន្យល់ជាសាមញ្ញ និងជួយដោះស្រាយចំណុចដែលសិស្សមិនទាន់យល់។",
  "highlights.2.title": "ផែនការសិក្សាច្បាស់",
  "highlights.2.text": "រៀនតាមមេរៀន និងតាមគោលដៅប្រឡងរបស់អ្នក។",
  "highlights.3.title": "បរិយាកាសគាំទ្រ",
  "highlights.3.text": "មានសំណួរ មានការឆ្លើយ និងមានការលើកទឹកចិត្តជានិច្ច។",
  "testimonials.eyebrow": "មតិពីអ្នករៀន",
  "testimonials.title": "ទំនុកចិត្តចាប់ផ្តើមពីការយល់ច្បាស់",
  "contact.eyebrow": "ចាប់ផ្តើមថ្ងៃនេះ",
  "contact.title": "ត្រៀមខ្លួនសម្រាប់ជំហានបន្ទាប់របស់អ្នក?",
  "contact.description": "ទាក់ទង DR.MATHS ដើម្បីសួរព័ត៌មាន និងចុះឈ្មោះរៀន។",
  "contact.cta": "សួរព័ត៌មានតាម Telegram",
};

const fallbackSubjects = [
  { id: "math", icon: "∑", nameKh: "គណិតវិទ្យា", descriptionKh: "បង្កើតមូលដ្ឋានរឹងមាំ និងដោះស្រាយលំហាត់ដោយទំនុកចិត្ត។", order: 1, visible: true },
  { id: "physics", icon: "⚛", nameKh: "រូបវិទ្យា", descriptionKh: "យល់ពីគោលការណ៍ និងអនុវត្តតាមលំហាត់ជាក់ស្តែង។", order: 2, visible: true },
  { id: "chemistry", icon: "⌬", nameKh: "គីមីវិទ្យា", descriptionKh: "ស្វែងយល់ពីរូបមន្ត ប្រតិកម្ម និងការគិតវិភាគ។", order: 3, visible: true },
  { id: "biology", icon: "⌘", nameKh: "ជីវវិទ្យា", descriptionKh: "រៀនដោយយល់ពីជីវិត ប្រព័ន្ធ និងទំនាក់ទំនង។", order: 4, visible: true },
  { id: "khmer", icon: "ក", nameKh: "ភាសាខ្មែរ", descriptionKh: "ពង្រឹងការអាន សរសេរ និងការប្រើប្រាស់ភាសាខ្មែរ។", order: 5, visible: true },
];

const fallbackTestimonials = [
  { id: "student", nameKh: "សិស្សថ្នាក់ទី៩", roleKh: "អ្នករៀន DR.MATHS", quoteKh: "គ្រូពន្យល់ច្បាស់ ធ្វើឱ្យខ្ញុំចាប់ផ្តើមចូលចិត្តគណិតវិទ្យា។", rating: 5, order: 1, visible: true },
  { id: "parent", nameKh: "អាណាព្យាបាល", roleKh: "មាតាបិតាសិស្ស", quoteKh: "យើងឃើញការរីកចម្រើនរបស់កូនទាំងការយល់ដឹង និងទំនុកចិត្ត។", rating: 5, order: 2, visible: true },
];

const fallbackSettings = {
  phones: ["077 934 497", "069 688 768", "085 708 045"],
  telegramUrl: "https://t.me/sambathkorm",
  facebookUrl: null,
  tiktokUrl: null,
  instagramUrl: null,
  logoDriveUrl: null,
  logoRenderUrl: null,
  logoAlt: "DR.MATHS",
  addressKh: "សូមទាក់ទងតាម Telegram ដើម្បីទទួលព័ត៌មានទីតាំងសិក្សា។",
  hoursKh: "រៀងរាល់ថ្ងៃ តាមការណាត់ជួប",
  footerTextKh: "© DR.MATHS Education Center។ រក្សាសិទ្ធិគ្រប់យ៉ាង។",
  seoTitleKh: "DR.MATHS Education Center | រៀនឱ្យយល់ច្បាស់",
  seoDescriptionKh: "ថ្នាក់បង្រៀន គណិតវិទ្យា រូបវិទ្យា គីមីវិទ្យា ជីវវិទ្យា និងភាសាខ្មែរ។",
};

// Cached per request so generateMetadata and the page body share one snapshot
// of the database instead of reading it twice (avoiding any head/body
// divergence and halving the query load).
export const getSiteData = cache(async function getSiteData() {
  noStore();
  try {
    const [contentRows, settings, subjects, testimonials, videos] = await Promise.all([
      prisma.siteContent.findMany(),
      prisma.settings.findUnique({ where: { id: "site-settings" } }),
      prisma.subject.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
      prisma.testimonial.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
      prisma.video.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }] }),
    ]);

    const content = { ...fallbackContent, ...Object.fromEntries(contentRows.map((row) => [row.key, row.value])) };
    let phones = fallbackSettings.phones;
    try { phones = settings?.phones ? JSON.parse(settings.phones) : phones; } catch { /* use seed fallback */ }

    return {
      content,
      settings: settings ? { ...settings, phones } : fallbackSettings,
      subjects: subjects.length ? subjects : fallbackSubjects,
      testimonials: testimonials.length ? testimonials : fallbackTestimonials,
      videos,
    };
  } catch {
    return {
      content: fallbackContent,
      settings: fallbackSettings,
      subjects: fallbackSubjects,
      testimonials: fallbackTestimonials,
      videos: [],
    };
  }
});

export async function getAdminData() {
  noStore();
  const [contents, settings, subjects, testimonials, videos] = await Promise.all([
    prisma.siteContent.findMany({ orderBy: [{ section: "asc" }, { key: "asc" }] }),
    prisma.settings.findUnique({ where: { id: "site-settings" } }),
    prisma.subject.findMany({ orderBy: { order: "asc" } }),
    prisma.testimonial.findMany({ orderBy: { order: "asc" } }),
    prisma.video.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
  ]);
  return { contents, settings, subjects, testimonials, videos };
}
