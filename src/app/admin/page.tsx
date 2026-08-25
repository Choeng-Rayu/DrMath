import Link from "next/link";
import { getAdminData } from "@/lib/site";

export default async function AdminDashboard() {
  const { subjects, testimonials, videos } = await getAdminData();
  const metrics = [
    [videos.length, "វីដេអូសរុប", "/admin/videos"],
    [subjects.length, "មុខវិជ្ជា", "/admin/subjects"],
    [testimonials.length, "មតិយោបល់", "/admin/testimonials"],
  ];

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="display admin-title">ផ្ទាំងគ្រប់គ្រង</h1>
          <p className="admin-note">គ្រប់គ្រងមាតិកាគេហទំព័រ DR.MATHS នៅកន្លែងតែមួយ។</p>
        </div>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <Link href="/preview" target="_blank" rel="noreferrer" className="button button-primary button-small">
            មើលទំព័រជាមុន ↗
          </Link>
          <Link href="/" className="button button-secondary button-small">
            មើលគេហទំព័រ
          </Link>
        </div>
      </header>
      <section className="admin-grid">
        {metrics.map(([value, label, href]) => (
          <Link className="metric" href={href as string} key={label as string}>
            <strong>{value as number}</strong>
            <span>{label as string}</span>
          </Link>
        ))}
      </section>
      <section className="form-card">
        <h2>ចាប់ផ្តើមឆាប់រហ័ស</h2>
        <p className="admin-note">
          កែអក្សរ លេខទំនាក់ទំនង និងតំណ Google Drive ក្នុងផ្ទាំងខ្លឹមសារ។ បន្ថែមវីដេអូដោយបិទភ្ជាប់តំណ YouTube ហើយវីដេអូនឹងបង្ហាញក្នុងទំព័រសាធារណៈពេលផ្សាយរួច។
        </p>
        <div className="hero-actions">
          <Link className="button button-primary button-small" href="/admin/content">
            កែខ្លឹមសារ
          </Link>
          <Link className="button button-secondary button-small" href="/admin/videos">
            បន្ថែមវីដេអូ
          </Link>
          <Link href="/preview" target="_blank" rel="noreferrer" className="button button-outline button-small" style={{ color: "var(--ink)", borderColor: "var(--line)" }}>
            មើលទំព័រជាមុន ↗
          </Link>
        </div>
      </section>
    </>
  );
}
