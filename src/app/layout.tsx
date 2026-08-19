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

export const metadata: Metadata = {
  title: {
    default: "DR.MATHS Education Center",
    template: "%s | DR.MATHS",
  },
  description: "មួយជំហានជាមួយ DR.MATHS = មួយជំហានជាមួយ A",
  robots: { index: true, follow: true },
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
