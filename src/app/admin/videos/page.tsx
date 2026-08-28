import Link from "next/link";
import { VideoForm } from "@/components/video-form";
import { DeleteButton } from "@/components/delete-button";
import { AdminAlertBanner } from "@/components/admin-alert-banner";
import { deleteVideoAction } from "@/app/admin/actions";
import { getAdminData } from "@/lib/site";

type VideosPageProps = { searchParams: Promise<{ error?: string; success?: string }> };

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const { error, success } = await searchParams;
  const { videos } = await getAdminData();

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="display admin-title">វីដេអូ YouTube</h1>
          <p className="admin-note">បិទភ្ជាប់តំណ YouTube មើលជាមុន ហើយផ្សាយជាស៊េរីវីដេអូ។</p>
        </div>
        <Link href="/preview" target="_blank" rel="noreferrer" className="button button-secondary button-small">
          មើលទំព័រជាមុន ↗
        </Link>
      </header>
      <AdminAlertBanner error={error} success={success} />
      <VideoForm />
      <section className="form-card">
        <h2>វីដេអូដែលមាន</h2>
        {videos.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>វីដេអូ</th>
                  <th>ស៊េរី</th>
                  <th>ស្ថានភាព</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id}>
                    <td>
                      <strong>{video.titleKh}</strong>
                      <br />
                      <small className="admin-note">
                        លំដាប់៖ {video.order}
                        {video.featured ? " · វីដេអូសំខាន់" : ""}
                      </small>
                    </td>
                    <td>{video.seriesKh ?? "—"}</td>
                    <td>
                      <span className={`badge ${video.published ? "" : "badge-muted"}`}>
                        {video.published ? "បានផ្សាយ" : "ព្រាង"}
                      </span>
                    </td>
                    <td>
                      <VideoForm
                        title="កែវីដេអូនេះ"
                        initial={{
                          id: video.id,
                          titleKh: video.titleKh,
                          youtubeUrl: video.youtubeUrl,
                          seriesKh: video.seriesKh,
                          order: video.order,
                          published: video.published,
                          featured: video.featured,
                        }}
                      />
                      <DeleteButton action={deleteVideoAction} id={video.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-note">មិនទាន់មានវីដេអូទេ។ ប្រើទម្រង់ខាងលើដើម្បីបន្ថែមវីដេអូដំបូង។</p>
        )}
      </section>
    </>
  );
}
