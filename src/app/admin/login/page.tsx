import Link from "next/link";
import { loginAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/submit-button";

type LoginPageProps = { searchParams: Promise<{ error?: string; callbackUrl?: string }> };

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasError = Boolean(params.error);
  const callbackUrl = params.callbackUrl?.startsWith("/") ? params.callbackUrl : "/admin";

  return (
    <main className="login-page">
      <section className="login-card">
        <Link className="brand" href="/"><span className="brand-mark">∑</span><span>DR.MATHS</span></Link>
        <h1 className="display">ចូលផ្ទាំងគ្រប់គ្រង</h1>
        <p className="admin-note">សម្រាប់អ្នកគ្រប់គ្រង DR.MATHS តែប៉ុណ្ណោះ។</p>
        {hasError && <p className="error" role="alert" style={{ background: "#fef2f2", border: "1px solid #fca5a5", padding: ".75rem 1rem", borderRadius: "10px", marginTop: "1rem" }}>អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ។ សូមព្យាយាមម្តងទៀត។</p>}
        <form action={loginAction} className="form-card" style={{ marginTop: "1.25rem", padding: 0, border: 0, background: "transparent" }}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div className="field"><label htmlFor="email">អ៊ីមែល</label><input className="input" id="email" name="email" type="email" autoComplete="email" required /></div>
          <div className="field" style={{ marginTop: "1rem" }}><label htmlFor="password">ពាក្យសម្ងាត់</label><input className="input" id="password" name="password" type="password" autoComplete="current-password" minLength={8} required /></div>
          <div style={{ marginTop: "1.25rem" }}>
            <SubmitButton
              label="ចូលគណនី"
              loadingLabel="កំពុងចូលគណនី..."
              variant="primary"
              style={{ width: "100%" }}
            />
          </div>
        </form>
        <p className="help" style={{ marginTop: "1.25rem" }}>បើអ្នកមិនមានព័ត៌មានចូលគណនី សូមទាក់ទងម្ចាស់គេហទំព័រ។</p>
      </section>
    </main>
  );
}
