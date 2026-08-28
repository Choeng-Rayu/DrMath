import Link from "next/link";
import { ExerciseForm } from "@/components/exercise-form";
import { DeleteButton } from "@/components/delete-button";
import { AdminAlertBanner } from "@/components/admin-alert-banner";
import { deleteExerciseAction } from "@/app/admin/actions";
import { getAdminData } from "@/lib/site";

type ExercisesPageProps = { searchParams: Promise<{ error?: string; success?: string }> };

export default async function ExercisesPage({ searchParams }: ExercisesPageProps) {
  const { error, success } = await searchParams;
  const { exercises } = await getAdminData();

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="display admin-title">លំហាត់ &amp; វិញ្ញាសា</h1>
          <p className="admin-note">
            បិទភ្ជាប់តំណរូបភាព Google Drive ដើម្បីផ្សាយលំហាត់ និងវិញ្ញាសាសម្រាប់សិស្សទាញយក និងអនុវត្ត។
          </p>
        </div>
        <Link href="/preview" target="_blank" rel="noreferrer" className="button button-secondary button-small">
          មើលទំព័រជាមុន ↗
        </Link>
      </header>
      <AdminAlertBanner error={error} success={success} />
      <ExerciseForm />
      <section className="form-card">
        <h2>លំហាត់ &amp; វិញ្ញាសាដែលមាន</h2>
        {exercises.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "110px" }}>រូបភាព</th>
                  <th>លំហាត់ / វិញ្ញាសា</th>
                  <th>មុខវិជ្ជា &amp; ថ្នាក់</th>
                  <th>ស្ថានភាព</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((exercise) => (
                  <tr key={exercise.id}>
                    <td>
                      <img
                        src={exercise.renderUrl}
                        alt={exercise.titleKh}
                        referrerPolicy="no-referrer"
                        style={{
                          width: 90,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid #ccd5e5",
                          background: "#f0f4f9",
                        }}
                      />
                    </td>
                    <td>
                      <strong>{exercise.titleKh}</strong>
                      {exercise.descriptionKh && (
                        <p style={{ margin: ".2rem 0 0", fontSize: ".82rem", color: "var(--muted)" }}>
                          {exercise.descriptionKh}
                        </p>
                      )}
                      <small className="admin-note" style={{ display: "block", marginTop: ".25rem" }}>
                        លំដាប់៖ {exercise.order}
                        {exercise.featured ? " · ★ លំហាត់សំខាន់" : ""}
                      </small>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: ".3rem", flexWrap: "wrap" }}>
                        {exercise.subjectKh && <span className="badge">{exercise.subjectKh}</span>}
                        {exercise.gradeKh && <span className="badge badge-muted">{exercise.gradeKh}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${exercise.published ? "" : "badge-muted"}`}>
                        {exercise.published ? "បានផ្សាយ" : "ព្រាង"}
                      </span>
                    </td>
                    <td>
                      <ExerciseForm
                        title="កែលំហាត់នេះ"
                        initial={{
                          id: exercise.id,
                          titleKh: exercise.titleKh,
                          descriptionKh: exercise.descriptionKh,
                          subjectKh: exercise.subjectKh,
                          gradeKh: exercise.gradeKh,
                          driveUrl: exercise.driveUrl,
                          solutionUrl: exercise.solutionUrl,
                          order: exercise.order,
                          published: exercise.published,
                          featured: exercise.featured,
                        }}
                      />
                      <DeleteButton action={deleteExerciseAction} id={exercise.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-note">
            មិនទាន់មានលំហាត់ទេ។ ប្រើទម្រង់ខាងលើដើម្បីបន្ថែមលំហាត់ ឬវិញ្ញាសាដំបូងពី Google Drive។
          </p>
        )}
      </section>
    </>
  );
}
