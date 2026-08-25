import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPreviewData } from "@/lib/site";
import { HomepageView } from "@/components/homepage-view";
import { PreviewBridge } from "@/components/preview-bridge";

// Admin-only draft preview. Lives outside /admin so the sidebar doesn't
// squeeze the full-width homepage render; middleware also guards this path.
export const dynamic = "force-dynamic";

type PreviewPageProps = {
  searchParams: Promise<{ embedded?: string }>;
};

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login?callbackUrl=/preview");

  const params = await searchParams;
  const isEmbedded = params.embedded === "true" || params.embedded === "1";
  const data = await getPreviewData();

  return (
    <div className="preview-page">
      {!isEmbedded && (
        <div className="preview-bar">
          <strong>មើលជាមុនការកែប្រែ</strong>
          <span>នេះជាទំព័រមើលជាមុន — គេហទំព័រសាធារណៈមិនទាន់ផ្លាស់ប្តូរទេ។</span>
          <Link className="button button-outline button-small" href="/admin/content">
            ត្រឡប់ទៅការកែសម្រួល
          </Link>
        </div>
      )}
      <HomepageView {...data} />
      <PreviewBridge />
    </div>
  );
}
