import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/app/admin/actions";

const links = [
  ["/admin", "ផ្ទាំងគ្រប់គ្រង"],
  ["/admin/content", "កែខ្លឹមសារ"],
  ["/admin/videos", "វីដេអូ YouTube"],
  ["/admin/subjects", "មុខវិជ្ជា"],
  ["/admin/testimonials", "មតិយោបល់"],
  ["/admin/settings", "ការកំណត់"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) return children;

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link className="brand" href="/admin"><span className="brand-mark">∑</span><span>DR.MATHS</span></Link>
        <p style={{ color: "rgba(255,255,255,.55)", fontSize: ".78rem", marginTop: ".7rem" }}>ផ្ទាំងគ្រប់គ្រង</p>
        <nav aria-label="ម៉ឺនុយអ្នកគ្រប់គ្រង">
          {links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
        </nav>
        <div style={{ marginTop: "2rem" }}>
          <Link href="/" className="button button-outline button-small" style={{ width: "100%", marginBottom: ".65rem" }}>មើលគេហទំព័រ</Link>
          <form action={logoutAction}><button className="button button-outline button-small" style={{ width: "100%" }}>ចាកចេញ</button></form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
