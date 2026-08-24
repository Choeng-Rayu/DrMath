import type { Metadata } from "next";
import { HomepageView } from "@/components/homepage-view";
import { getSiteData } from "@/lib/site";

// The public page renders CMS content on every request. It must never be
// statically prerendered or cached, otherwise stale HTML (from build time or a
// previous content state) can be hydrated against a fresh RSC payload and
// throw a hydration mismatch error.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteData();
  return {
    title: settings.seoTitleKh || "DR.MATHS Education Center",
    description: settings.seoDescriptionKh || "មួយជំហានជាមួយ DR.MATHS = មួយជំហានជាមួយ A",
  };
}

export default async function Home() {
  const data = await getSiteData();
  return <HomepageView {...data} />;
}
