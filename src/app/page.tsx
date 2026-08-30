import type { Metadata } from "next";
import { HomepageView } from "@/components/homepage-view";
import { StructuredData } from "@/components/structured-data";
import { getSiteData } from "@/lib/site";
import { getDriveImage } from "@/lib/drive";

// The public page renders CMS content on every request. It must never be
// statically prerendered or cached, otherwise stale HTML (from build time or a
// previous content state) can be hydrated against a fresh RSC payload and
// throw a hydration mismatch error.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://drmaths.online").replace(/\/$/, "");
  const { content, settings } = await getSiteData();

  const heroImageDrive = getDriveImage(content["hero.imageDriveUrl"] ?? "");
  const heroImageUrl = heroImageDrive?.renderUrl || `${baseUrl}/images/Photo-A.jpg`;

  const title = settings.seoTitleKh || "DR.MATHS Education Center | លោកគ្រូ គរ សម្បត្តិ (Korm Sambath)";
  const description =
    settings.seoDescriptionKh ||
    "មួយជំហានជាមួយ DR.MATHS = មួយជំហានជាមួយ A - ថ្នាក់បង្រៀនគណិតវិទ្យា និងវិទ្យាសាស្ត្រដោយលោកគ្រូ គរ សម្បត្តិ (Korm Sambath)។";

  return {
    title,
    description,
    keywords: [
      "Korm Sambath",
      "Sambath Korm",
      "គរ សម្បត្តិ",
      "លោកគ្រូ គរ សម្បត្តិ",
      "គ្រូ សម្បត្តិ",
      "DR.MATHS",
      "DR.MATHS Education Center",
      "DR MATHS",
      "Doctor Maths",
      "គណិតវិទ្យា",
      "រៀនគណិតវិទ្យា",
      "លំហាត់គណិតវិទ្យា",
      "វិញ្ញាសាត្រៀមប្រឡងបាក់ឌុប",
      "វីដេអូបង្រៀនគណិតវិទ្យា",
      "គណិតវិទ្យាថ្នាក់ទី១២",
      "គណិតវិទ្យាថ្នាក់ទី១១",
      "គណិតវិទ្យាថ្នាក់ទី១០",
      "គណិតវិទ្យាថ្នាក់ទី៩",
      "រូបវិទ្យា",
      "គីមីវិទ្យា",
      "ជីវវិទ្យា",
      "ភាសាខ្មែរ",
    ],
    authors: [{ name: "Korm Sambath (លោកគ្រូ គរ សម្បត្តិ)", url: "https://t.me/sambathkorm" }],
    creator: "Korm Sambath (លោកគ្រូ គរ សម្បត្តិ)",
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: "DR.MATHS Education Center",
      locale: "km_KH",
      type: "website",
      images: [
        {
          url: heroImageUrl,
          width: 1200,
          height: 630,
          alt: "DR.MATHS Education Center - Founder Korm Sambath (លោកគ្រូ គរ សម្បត្តិ)",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [heroImageUrl],
      creator: "@sambathmath9",
    },
  };
}

export default async function Home() {
  const data = await getSiteData();
  return (
    <>
      <StructuredData {...data} />
      <HomepageView {...data} />
    </>
  );
}

