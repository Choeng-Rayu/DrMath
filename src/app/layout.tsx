import type { Metadata } from "next";
import { Freehand, Moul } from "next/font/google";
import "./globals.css";

const khmerBody = Freehand({
  variable: "--font-khmer-body",
  weight: "400",
  subsets: ["khmer"],
  display: "swap",
});

const khmerDisplay = Moul({
  variable: "--font-khmer-display",
  weight: "400",
  subsets: ["khmer"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://drmaths.online";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "DR.MATHS Education Center | លោកគ្រូ គរ សម្បត្តិ (Korm Sambath)",
    template: "%s | DR.MATHS",
  },
  description:
    "មួយជំហានជាមួយ DR.MATHS = មួយជំហានជាមួយ A - ថ្នាក់បង្រៀនគណិតវិទ្យា និងវិទ្យាសាស្ត្រដោយលោកគ្រូ គរ សម្បត្តិ (Korm Sambath) សម្រាប់សិស្សថ្នាក់ទី៣ ដល់ទី១២។",
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
    "Cambodia Math Teacher",
    "Khmer Math Exercises",
  ],
  authors: [{ name: "Korm Sambath (លោកគ្រូ គរ សម្បត្តិ)", url: "https://t.me/sambathkorm" }],
  creator: "Korm Sambath (លោកគ្រូ គរ សម្បត្តិ)",
  publisher: "DR.MATHS Education Center",
  category: "Education",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "DR.MATHS Education Center | លោកគ្រូ គរ សម្បត្តិ (Korm Sambath)",
    description:
      "មួយជំហានជាមួយ DR.MATHS = មួយជំហានជាមួយ A - ថ្នាក់បង្រៀនគណិតវិទ្យា និងវិទ្យាសាស្ត្រដោយលោកគ្រូ គរ សម្បត្តិ (Korm Sambath)។",
    url: baseUrl,
    siteName: "DR.MATHS Education Center",
    locale: "km_KH",
    type: "website",
    images: [
      {
        url: "/images/Photo-A.jpg",
        width: 1200,
        height: 630,
        alt: "DR.MATHS Education Center - Founder Korm Sambath (លោកគ្រូ គរ សម្បត្តិ)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DR.MATHS Education Center | លោកគ្រូ គរ សម្បត្តិ (Korm Sambath)",
    description: "មួយជំហានជាមួយ DR.MATHS = មួយជំហានជាមួយ A - បង្រៀនដោយលោកគ្រូ គរ សម្បត្តិ",
    images: ["/images/Photo-A.jpg"],
    creator: "@sambathmath9",
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km" suppressHydrationWarning>
      <body className={`${khmerBody.variable} ${khmerDisplay.variable}`}>{children}</body>
    </html>
  );
}
