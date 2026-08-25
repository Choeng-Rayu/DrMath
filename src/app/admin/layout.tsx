import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) return children;

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link className="brand" href="/admin">
          <span className="brand-mark">∑</span>
          <span>DR.MATHS</span>
        </Link>
        <p style={{ color: "rgba(255,255,255,.55)", fontSize: ".78rem", marginTop: ".7rem" }}>
          ផ្ទាំងគ្រប់គ្រង
        </p>
        <AdminNav />
        <div style={{ marginTop: "2rem" }}>
          <Link
            href="/"
            className="button button-outline button-small"
            style={{ width: "100%", marginBottom: ".65rem" }}
          >
            មើលគេហទំព័រ
          </Link>
          <form action={logoutAction}>
            <button className="button button-outline button-small" style={{ width: "100%" }}>
              ចាកចេញ
            </button>
          </form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
