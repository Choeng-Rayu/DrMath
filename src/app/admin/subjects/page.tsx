import { deleteSubjectAction, saveSubjectAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/delete-button";
import { AdminErrorBanner } from "@/components/admin-error-banner";
import { getAdminData } from "@/lib/site";

function SubjectForm({ subject }: { subject?: { id: string; icon: string; nameKh: string; descriptionKh: string; order: number; visible: boolean } }) {
  return <details className="form-card" open={!subject}><summary style={{ cursor: "pointer", fontWeight: 700 }}>{subject ? `កែ៖ ${subject.nameKh}` : "បន្ថែមមុខវិជ្ជាថ្មី"}</summary><form action={saveSubjectAction} style={{ marginTop: "1rem" }}>{subject && <input type="hidden" name="id" value={subject.id} />}<div className="field-grid"><div className="field"><label>សញ្ញា / Icon</label><input className="input" name="icon" defaultValue={subject?.icon ?? "∑"} maxLength={12} required /></div><div className="field"><label>លំដាប់</label><input className="input" name="order" type="number" min="0" defaultValue={subject?.order ?? 0} /></div><div className="field field-wide"><label>ឈ្មោះមុខវិជ្ជា</label><input className="input" name="nameKh" defaultValue={subject?.nameKh ?? ""} required /></div><div className="field field-wide"><label>ការពិពណ៌នា</label><textarea className="textarea" name="descriptionKh" defaultValue={subject?.descriptionKh ?? ""} required /></div><label className="help"><input name="visible" type="checkbox" defaultChecked={subject?.visible ?? true} /> បង្ហាញលើទំព័រសាធារណៈ</label></div><div className="form-actions"><button className="button button-primary" type="submit">រក្សាទុក</button></div></form></details>;
}

type SubjectsPageProps = { searchParams: Promise<{ error?: string }> };

export default async function SubjectsPage({ searchParams }: SubjectsPageProps) {
  const { error } = await searchParams;
  const { subjects } = await getAdminData();
  return <><header className="admin-header"><div><h1 className="display admin-title">មុខវិជ្ជា</h1><p className="admin-note">បន្ថែម កែ លាក់ ឬរៀបលំដាប់កាតមុខវិជ្ជា។</p></div></header><AdminErrorBanner code={error} /><SubjectForm />{subjects.map((subject) => <section key={subject.id}><SubjectForm subject={subject} /><DeleteButton action={deleteSubjectAction} id={subject.id} label="លុបមុខវិជ្ជានេះ" /></section>)}</>;
}
