import Link from "next/link";
import { deletePostAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/delete-button";
import { AdminAlertBanner } from "@/components/admin-alert-banner";
import { PostForm } from "@/components/post-form";
import { getAdminData, type PostItem } from "@/lib/site";
import { BellRing, Pin, Calendar } from "lucide-react";

type PostsPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminPostsPage({ searchParams }: PostsPageProps) {
  const { error, success } = await searchParams;
  const { posts } = await getAdminData();

  return (
    <>
      <header className="admin-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <h1 className="display admin-title">ដំណឹង &amp; ការផ្សាយ</h1>
            <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1", fontSize: ".8rem" }}>
              {posts.length} ដំណឹង
            </span>
          </div>
          <p className="admin-note">
            គ្រប់គ្រងការផ្សាយដំណឹង ដូចជាដំណឹងជ្រើសរើសគ្រូឆ្នើម ការប្រឡង ឬសេចក្តីជូនដំណឹងផ្សេងៗ។
            ដំណឹងដែលកំណត់ជា <strong>Featured</strong> នឹងបង្ហាញមុនគេបង្អស់នៅលើគេហទំព័រ។
          </p>
        </div>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          <Link href="/preview" target="_blank" rel="noreferrer" className="button button-secondary button-small">
            មើលទំព័រជាមុន ↗
          </Link>
          <Link href="/" target="_blank" className="button button-outline button-small" style={{ color: "var(--ink)", borderColor: "var(--line)" }}>
            ទំព័រដើម
          </Link>
        </div>
      </header>

      <AdminAlertBanner error={error} success={success} />

      {/* Form to add a new announcement/post */}
      <section>
        <PostForm title="+ បន្ថែមដំណឹង ឬការផ្សាយថ្មី" />
      </section>

      {/* List of existing posts */}
      <div style={{ marginTop: "2rem", display: "grid", gap: "1.25rem" }}>
        <h2 style={{ fontSize: "1.15rem", margin: 0, display: "flex", alignItems: "center", gap: ".5rem" }}>
          <BellRing size={18} color="var(--blue)" />
          <span>បញ្ជីដំណឹងដែលបានបញ្ចូល ({posts.length})</span>
        </h2>

        {posts.length === 0 ? (
          <div className="form-card" style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--muted)" }}>
            មិនទាន់មានដំណឹងផ្សាយណាមួយនៅឡើយទេ។ សូមចុច &ldquo;+ បន្ថែមដំណឹង ឬការផ្សាយថ្មី&rdquo; ខាងលើដើម្បីចាប់ផ្តើម។
          </div>
        ) : (
          posts.map((post: PostItem) => (
            <article key={post.id} className="form-card" style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".6rem", borderBottom: "1px solid var(--line)", paddingBottom: ".85rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".6rem", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: "1.08rem", color: "var(--ink)" }}>
                    {post.titleKh}
                  </span>
                  {post.badgeKh && (
                    <span className="badge" style={{ background: "#fef3c7", color: "#b45309", fontSize: ".75rem", fontWeight: 700 }}>
                      {post.badgeKh}
                    </span>
                  )}
                  {post.featured && (
                    <span className="badge" style={{ background: "#ecfdf5", color: "#047857", fontSize: ".75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <Pin size={12} /> បង្ហាញមុនគេ (Featured)
                    </span>
                  )}
                  {!post.published && (
                    <span className="badge" style={{ background: "#f1f5f9", color: "#64748b", fontSize: ".75rem" }}>
                      មិនទាន់ផ្សាយ (Draft)
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".82rem", color: "var(--muted)" }}>
                  <Calendar size={13} />
                  <span>{new Date(post.createdAt).toLocaleDateString("km-KH")}</span>
                </div>
              </div>

              {/* Edit form */}
              <PostForm initial={post} title={`កែសម្រួល៖ ${post.titleKh}`} />

              <div style={{ marginTop: ".75rem", display: "flex", justifyContent: "flex-end" }}>
                <DeleteButton action={deletePostAction} id={post.id} label="លុបដំណឹងនេះ" />
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
