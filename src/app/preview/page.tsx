import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPreviewData } from "@/lib/site";
import { HomepageView } from "@/components/homepage-view";
import { PreviewBridge } from "@/components/preview-bridge";

// Admin-only draft preview. Lives outside /admin so the sidebar doesn't
// squeeze the full-width homepage render; middleware also guards this path.
export const dynamic = "force-dynamic";

export default async function PreviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login?callbackUrl=/preview");
  const data = await getPreviewData();

  return (
    <div className="preview-page">
      <div className="preview-bar">
        <strong>មើលជាមុនការកែប្រែ</strong>
        <span>នេះជាទំព័រមើលជាមុន — គេហទំព័រសាធារណៈមិនទាន់ផ្លាស់ប្តូរទេ។</span>
        <Link className="button button-outline button-small" href="/admin/content">ត្រឡប់ទៅការកែសម្រួល</Link>
      </div>
      <HomepageView {...data} />
      <PreviewBridge />
    </div>
  );
}
