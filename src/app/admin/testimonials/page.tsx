import Link from "next/link";
import { deleteTestimonialAction, saveTestimonialAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/delete-button";
import { AdminAlertBanner } from "@/components/admin-alert-banner";
import { SubmitButton } from "@/components/submit-button";
import { getAdminData } from "@/lib/site";

function TestimonialForm({
  testimonial,
}: {
  testimonial?: { id: string; nameKh: string; roleKh: string | null; quoteKh: string; rating: number; order: number; visible: boolean };
}) {
  return (
    <details className="form-card" open={!testimonial}>
      <summary style={{ cursor: "pointer", fontWeight: 700 }}>
        {testimonial ? `កែ៖ ${testimonial.nameKh}` : "បន្ថែមមតិយោបល់ថ្មី"}
      </summary>
      <form action={saveTestimonialAction} style={{ marginTop: "1rem" }}>
        {testimonial && <input type="hidden" name="id" value={testimonial.id} />}
        <div className="field-grid">
          <div className="field">
            <label>ឈ្មោះ</label>
            <input className="input" name="nameKh" defaultValue={testimonial?.nameKh ?? ""} required />
          </div>
          <div className="field">
            <label>តួនាទី / ប្រភេទ</label>
            <input className="input" name="roleKh" defaultValue={testimonial?.roleKh ?? ""} placeholder="ឧ. សិស្សថ្នាក់ទី៩" />
          </div>
          <div className="field">
            <label>ផ្កាយ</label>
            <select className="select" name="rating" defaultValue={testimonial?.rating ?? 5}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} ផ្កាយ
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>លំដាប់</label>
            <input className="input" name="order" type="number" min="0" defaultValue={testimonial?.order ?? 0} />
          </div>
          <div className="field field-wide">
            <label>មតិយោបល់</label>
            <textarea className="textarea" name="quoteKh" defaultValue={testimonial?.quoteKh ?? ""} required />
          </div>
          <label className="help">
            <input name="visible" type="checkbox" defaultChecked={testimonial?.visible ?? true} /> បង្ហាញលើទំព័រសាធារណៈ
          </label>
        </div>
        <div className="form-actions">
          <SubmitButton
            label={testimonial ? "រក្សាទុកការកែប្រែ" : "រក្សាទុក"}
            loadingLabel="កំពុងរក្សាទុក..."
            variant="primary"
          />
        </div>
      </form>
    </details>
  );
}

type TestimonialsPageProps = { searchParams: Promise<{ error?: string; success?: string }> };

export default async function TestimonialsPage({ searchParams }: TestimonialsPageProps) {
  const { error, success } = await searchParams;
  const { testimonials } = await getAdminData();

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="display admin-title">មតិយោបល់</h1>
          <p className="admin-note">គ្រប់គ្រងមតិពីសិស្ស និងអាណាព្យាបាល។</p>
        </div>
        <Link href="/preview" target="_blank" rel="noreferrer" className="button button-secondary button-small">
          មើលទំព័រជាមុន ↗
        </Link>
      </header>
      <AdminAlertBanner error={error} success={success} />
      <TestimonialForm />
      {testimonials.map((testimonial) => (
        <section key={testimonial.id}>
          <TestimonialForm testimonial={testimonial} />
          <DeleteButton action={deleteTestimonialAction} id={testimonial.id} label="លុបមតិនេះ" />
        </section>
      ))}
    </>
  );
}
