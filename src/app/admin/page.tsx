import Link from "next/link";
import { getAdminData } from "@/lib/site";
import { AdminAlertBanner } from "@/components/admin-alert-banner";
import { syncAllToGoogleSheetsAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/submit-button";
import { FileSpreadsheet, ExternalLink, CheckCircle2 } from "lucide-react";

type AdminDashboardProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminDashboard({ searchParams }: AdminDashboardProps) {
  const { error, success } = await searchParams;
  const { subjects, testimonials, videos, exercises, posts } = await getAdminData();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const spreadsheetUrl = spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` : null;

  const metrics = [
    [posts.length, "ដំណឹង & ការផ្សាយ", "/admin/posts"],
    [videos.length, "វីដេអូសរុប", "/admin/videos"],
    [exercises.length, "លំហាត់ & វិញ្ញាសា", "/admin/exercises"],
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

      <AdminAlertBanner error={error} success={success} />

      <section className="admin-grid">
        {metrics.map(([value, label, href]) => (
          <Link className="metric" href={href as string} key={label as string}>
            <strong>{value as number}</strong>
            <span>{label as string}</span>
          </Link>
        ))}
      </section>

      {/* Google Sheets / Drive Live Mirroring Widget */}
      <section className="form-card" style={{ borderLeft: "4px solid #10b981", background: "#fbfcfe" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "#ecfdf5",
                color: "#059669",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#0a1f44" }}>ទិន្នន័យផ្ទុកលើ Google Sheets &amp; Drive</h3>
                <span className="badge" style={{ background: "#ecfdf5", color: "#059669", fontSize: "0.72rem" }}>
                  <CheckCircle2 size={12} style={{ marginRight: "3px" }} /> Auto-Sync Active
                </span>
              </div>
              <p className="admin-note" style={{ margin: "0.25rem 0 0" }}>
                រាល់អត្ថបទ លំហាត់ និងទិន្នន័យដែលអ្នកកែប្រែក្នុង Admin ត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិទៅកាន់ Google Spreadsheet ក្នុង Google Drive។
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="button button-outline button-small"
                style={{ color: "#1240ab", borderColor: "#ccd5e5", background: "#fff" }}
              >
                <ExternalLink size={14} />
                <span>បើកមើល Google Sheet ↗</span>
              </a>
            )}
            <form action={syncAllToGoogleSheetsAction}>
              <SubmitButton
                label="ធ្វើសមកាលកម្មទិន្នន័យ (Sync All to Sheets)"
                loadingLabel="កំពុង Sync ទៅ Google Sheets..."
                variant="primary"
              />
            </form>
          </div>
        </div>
      </section>

      <section className="form-card">
        <h2>ចាប់ផ្តើមឆាប់រហ័ស</h2>
        <p className="admin-note">
          កែអក្សរ លេខទំនាក់ទំនង និងតំណ Google Drive ក្នុងផ្ទាំងខ្លឹមសារ។ បន្ថែមវីដេអូ និងលំហាត់/វិញ្ញាសាពី Google Drive ហើយផ្សាយទៅកាន់គេហទំព័រសាធារណៈ។
        </p>
        <div className="hero-actions">
          <Link className="button button-primary button-small" href="/admin/posts">
            + ផ្សាយដំណឹងថ្មី
          </Link>
          <Link className="button button-secondary button-small" href="/admin/content">
            កែខ្លឹមសារ
          </Link>
          <Link className="button button-secondary button-small" href="/admin/exercises">
            បន្ថែមលំហាត់
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
