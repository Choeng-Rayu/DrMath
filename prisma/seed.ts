import { ContentType, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const contents = [
  ["nav.home", "nav", "ទំព័រដើម", ContentType.TEXT],
  ["nav.about", "nav", "អំពីយើង", ContentType.TEXT],
  ["nav.subjects", "nav", "មុខវិជ្ជា", ContentType.TEXT],
  ["nav.videos", "nav", "វីដេអូ", ContentType.TEXT],
  ["nav.contact", "nav", "ទំនាក់ទំនង", ContentType.TEXT],
  ["nav.cta", "nav", "ចុះឈ្មោះរៀន", ContentType.TEXT],
  ["nav.ctaUrl", "nav", "https://t.me/sambathkorm", ContentType.LINK],
  ["hero.eyebrow", "hero", "DR.MATHS EDUCATION CENTER", ContentType.TEXT],
  ["hero.title", "hero", "មួយជំហានជាមួយ <strong>DR.MATHS</strong> = មួយជំហានជាមួយ ABC", ContentType.RICH_TEXT],
  ["hero.description", "hero", "រៀនឱ្យយល់ច្បាស់ ពង្រឹងមូលដ្ឋាន និងឈានទៅរកលទ្ធផលដែលអ្នកស្រមៃ។", ContentType.TEXT],
  ["hero.hashtag", "hero", "#ចង់ចេះគណិតវិទ្យា មក #DRMATHSEDUCATIONCENTER", ContentType.TEXT],
  ["hero.primaryLabel", "hero", "ចាប់ផ្តើមរៀន", ContentType.TEXT],
  ["hero.primaryUrl", "hero", "https://t.me/sambathkorm", ContentType.LINK],
  ["hero.secondaryLabel", "hero", "មើលវីដេអូមេរៀន", ContentType.TEXT],
  ["hero.secondaryUrl", "hero", "#videos", ContentType.LINK],
  ["hero.imageDriveUrl", "hero", "", ContentType.IMAGE],
  ["stats.1.value", "stats", "ថ្នាក់ទី៣–១២", ContentType.TEXT],
  ["stats.1.label", "stats", "កម្រិតសិក្សា", ContentType.TEXT],
  ["stats.2.value", "stats", "៥ មុខវិជ្ជា", ContentType.TEXT],
  ["stats.2.label", "stats", "ជម្រើសសិក្សា", ContentType.TEXT],
  ["stats.3.value", "stats", "៣ ទម្រង់", ContentType.TEXT],
  ["stats.3.label", "stats", "របៀបរៀន", ContentType.TEXT],
  ["stats.4.value", "stats", "A / សិស្សពូកែ", ContentType.TEXT],
  ["stats.4.label", "stats", "គោលដៅរបស់យើង", ContentType.TEXT],
  ["about.eyebrow", "about", "ស្គាល់យើងបន្ថែម", ContentType.TEXT],
  ["about.title", "about", "កន្លែងសិក្សាដែលធ្វើឱ្យគណិតវិទ្យាងាយយល់", ContentType.TEXT],
  ["about.visionTitle", "about", "ទស្សនវិស័យ", ContentType.TEXT],
  ["about.vision", "about", "បង្កើតសិស្សដែលមានទំនុកចិត្ត ចេះគិតវិភាគ និងស្រឡាញ់ការរៀនសូត្រ។", ContentType.TEXT],
  ["about.missionTitle", "about", "បេសកកម្ម", ContentType.TEXT],
  ["about.mission", "about", "ផ្តល់ការបង្រៀនច្បាស់លាស់ ជិតស្និទ្ធ និងសមស្របតាមកម្រិតរបស់សិស្សម្នាក់ៗ។", ContentType.TEXT],
  ["about.long", "about", "យើងជឿថា សិស្សគ្រប់រូបអាចពូកែបាន ប្រសិនបើទទួលបានការណែនាំត្រឹមត្រូវ។ DR.MATHS រៀបចំមេរៀនជាជំហានៗ ដើម្បីឱ្យការយល់ដឹងក្លាយជាទំនុកចិត្ត។", ContentType.RICH_TEXT],
  ["about.imageDriveUrl", "about", "", ContentType.IMAGE],
  ["subjects.eyebrow", "subjects", "មុខវិជ្ជាដែលយើងបង្រៀន", ContentType.TEXT],
  ["subjects.title", "subjects", "សិក្សាតាមជំនាញដែលអ្នកត្រូវការ", ContentType.TEXT],
  ["formats.eyebrow", "formats", "បត់បែនតាមអ្នក", ContentType.TEXT],
  ["formats.title", "formats", "ជ្រើសរើសទម្រង់រៀនដែលសមរម្យ", ContentType.TEXT],
  ["formats.1.title", "formats", "បង្រៀនផ្ទាល់", ContentType.TEXT],
  ["formats.1.text", "formats", "រៀនជួបគ្រូដោយផ្ទាល់ ក្នុងបរិយាកាសផ្តោតលើការយល់។", ContentType.TEXT],
  ["formats.2.title", "formats", "រៀនអនឡាញ", ContentType.TEXT],
  ["formats.2.text", "formats", "រៀនពីគ្រប់ទីកន្លែង ជាមួយការណែនាំច្បាស់លាស់។", ContentType.TEXT],
  ["formats.3.title", "formats", "បង្រៀនដល់ផ្ទះ", ContentType.TEXT],
  ["formats.3.text", "formats", "ទទួលបានការបង្រៀនផ្ទាល់ខ្លួន នៅទីតាំងដែលអ្នកងាយស្រួល។", ContentType.TEXT],
  ["videos.eyebrow", "videos", "វីដេអូមេរៀនជាស៊េរី", ContentType.TEXT],
  ["videos.title", "videos", "មើលមេរៀនឡើងវិញ តាមល្បឿនរបស់អ្នក", ContentType.TEXT],
  ["videos.description", "videos", "វីដេអូដែលបានផ្សាយដោយគ្រូ បង្ហាញជាជំហានៗ និងងាយតាមដាន។", ContentType.TEXT],
  ["highlights.eyebrow", "highlights", "ហេតុអ្វីជ្រើសរើស DR.MATHS", ContentType.TEXT],
  ["highlights.title", "highlights", "ការរៀនដែលផ្តល់លទ្ធផលជាក់ស្តែង", ContentType.TEXT],
  ["highlights.1.title", "highlights", "គ្រូមានបទពិសោធន៍", ContentType.TEXT],
  ["highlights.1.text", "highlights", "ពន្យល់ជាសាមញ្ញ និងជួយដោះស្រាយចំណុចដែលសិស្សមិនទាន់យល់។", ContentType.TEXT],
  ["highlights.2.title", "highlights", "ផែនការសិក្សាច្បាស់", ContentType.TEXT],
  ["highlights.2.text", "highlights", "រៀនតាមមេរៀន និងតាមគោលដៅប្រឡងរបស់អ្នក។", ContentType.TEXT],
  ["highlights.3.title", "highlights", "បរិយាកាសគាំទ្រ", ContentType.TEXT],
  ["highlights.3.text", "highlights", "មានសំណួរ មានការឆ្លើយ និងមានការលើកទឹកចិត្តជានិច្ច។", ContentType.TEXT],
  ["testimonials.eyebrow", "testimonials", "មតិពីអ្នករៀន", ContentType.TEXT],
  ["testimonials.title", "testimonials", "ទំនុកចិត្តចាប់ផ្តើមពីការយល់ច្បាស់", ContentType.TEXT],
  ["contact.eyebrow", "contact", "ចាប់ផ្តើមថ្ងៃនេះ", ContentType.TEXT],
  ["contact.title", "contact", "ត្រៀមខ្លួនសម្រាប់ជំហានបន្ទាប់របស់អ្នក?", ContentType.TEXT],
  ["contact.description", "contact", "ទាក់ទង DR.MATHS ដើម្បីសួរព័ត៌មាន និងចុះឈ្មោះរៀន។", ContentType.TEXT],
  ["contact.cta", "contact", "សួរព័ត៌មានតាម Telegram", ContentType.TEXT],
] as const;

async function main() {
  for (const [key, section, value, type] of contents) {
    await prisma.siteContent.upsert({
      where: { key },
      update: { section, value, type },
      create: { key, section, value, type },
    });
  }

  await prisma.settings.upsert({
    where: { id: "site-settings" },
    update: {},
    create: {
      id: "site-settings",
      phones: JSON.stringify(["077 934 497", "069 688 768", "085 708 045"]),
      telegramUrl: "https://t.me/sambathkorm",
      addressKh: "សូមទាក់ទងតាម Telegram ដើម្បីទទួលព័ត៌មានទីតាំងសិក្សា។",
      hoursKh: "រៀងរាល់ថ្ងៃ តាមការណាត់ជួប",
      footerTextKh: "© DR.MATHS Education Center។ រក្សាសិទ្ធិគ្រប់យ៉ាង។",
      seoTitleKh: "DR.MATHS Education Center | រៀនឱ្យយល់ច្បាស់",
      seoDescriptionKh: "ថ្នាក់បង្រៀន គណិតវិទ្យា រូបវិទ្យា គីមីវិទ្យា ជីវវិទ្យា និងភាសាខ្មែរ។",
    },
  });

  const subjects = [
    ["∑", "គណិតវិទ្យា", "បង្កើតមូលដ្ឋានរឹងមាំ និងដោះស្រាយលំហាត់ដោយទំនុកចិត្ត។"],
    ["⚛", "រូបវិទ្យា", "យល់ពីគោលការណ៍ និងអនុវត្តតាមលំហាត់ជាក់ស្តែង។"],
    ["⌬", "គីមីវិទ្យា", "ស្វែងយល់ពីរូបមន្ត ប្រតិកម្ម និងការគិតវិភាគ។"],
    ["⌘", "ជីវវិទ្យា", "រៀនដោយយល់ពីជីវិត ប្រព័ន្ធ និងទំនាក់ទំនង។"],
    ["ក", "ភាសាខ្មែរ", "ពង្រឹងការអាន សរសេរ និងការប្រើប្រាស់ភាសាខ្មែរ។"],
  ] as const;

  for (const [index, [icon, nameKh, descriptionKh]] of subjects.entries()) {
    const existing = await prisma.subject.findFirst({ where: { nameKh } });
    if (!existing) {
      await prisma.subject.create({ data: { icon, nameKh, descriptionKh, order: index + 1 } });
    }
  }

  const testimonialCount = await prisma.testimonial.count();
  if (!testimonialCount) {
    await prisma.testimonial.createMany({
      data: [
        { nameKh: "សិស្សថ្នាក់ទី៩", roleKh: "អ្នករៀន DR.MATHS", quoteKh: "គ្រូពន្យល់ច្បាស់ ធ្វើឱ្យខ្ញុំចាប់ផ្តើមចូលចិត្តគណិតវិទ្យា។", rating: 5, order: 1 },
        { nameKh: "អាណាព្យាបាល", roleKh: "មាតាបិតាសិស្ស", quoteKh: "យើងឃើញការរីកចម្រើនរបស់កូនទាំងការយល់ដឹង និងទំនុកចិត្ត។", rating: 5, order: 2 },
      ],
    });
  }

  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.upsert({
      where: { email },
      update: { passwordHash, name: process.env.ADMIN_NAME ?? "DR.MATHS Administrator" },
      create: { email, passwordHash, name: process.env.ADMIN_NAME ?? "DR.MATHS Administrator" },
    });
  } else {
    console.warn("Skipped admin user seed: set ADMIN_EMAIL and ADMIN_PASSWORD first.");
  }
}

main()
  .then(() => console.log("DR.MATHS seed completed."))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
