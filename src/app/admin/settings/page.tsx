import Link from "next/link";
import { saveSettingsAction } from "@/app/admin/actions";
import { AdminAlertBanner } from "@/components/admin-alert-banner";
import { DriveLinkInput } from "@/components/drive-link-input";
import { SubmitButton } from "@/components/submit-button";
import { getAdminData } from "@/lib/site";

type SettingsPageProps = {
  searchParams: Promise<{ error?: string; success?: string; saved?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { error, success, saved } = await searchParams;
  const { settings } = await getAdminData();
  let phones: string[] = [];
  try {
    phones = settings?.phones ? JSON.parse(settings.phones) : [];
  } catch {
    phones = [];
  }

  const successParam = success ?? (saved ? "saved" : undefined);

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="display admin-title">ការកំណត់គេហទំព័រ</h1>
          <p className="admin-note">ព័ត៌មានទំនាក់ទំនង បណ្តាញសង្គម រូបសញ្ញា និង SEO។</p>
        </div>
        <Link href="/preview" target="_blank" rel="noreferrer" className="button button-secondary button-small">
          មើលទំព័រជាមុន ↗
        </Link>
      </header>

      <AdminAlertBanner error={error} success={successParam} />

      <form action={saveSettingsAction} className="form-card">
        <div className="field-grid">
          <div className="field field-wide">
            <label>លេខទូរស័ព្ទ</label>
            <textarea
              className="textarea"
              name="phones"
              style={{ minHeight: 86 }}
              defaultValue={phones.join("\n")}
            />
            <p className="help">មួយលេខក្នុងមួយបន្ទាត់។</p>
          </div>
          <div className="field">
            <label>តំណ Telegram</label>
            <input
              className="input"
              name="telegramUrl"
              type="url"
              defaultValue={settings?.telegramUrl ?? ""}
              placeholder="https://t.me/..."
            />
          </div>
          <div className="field">
            <label>តំណ Facebook</label>
            <input
              className="input"
              name="facebookUrl"
              type="url"
              defaultValue={settings?.facebookUrl ?? ""}
            />
          </div>
          <div className="field">
            <label>តំណ TikTok</label>
            <input
              className="input"
              name="tiktokUrl"
              type="url"
              defaultValue={settings?.tiktokUrl ?? ""}
            />
          </div>
          <div className="field">
            <label>តំណ Instagram</label>
            <input
              className="input"
              name="instagramUrl"
              type="url"
              defaultValue={settings?.instagramUrl ?? ""}
            />
          </div>
          <div className="field field-wide">
            <label>តំណរូបសញ្ញា Google Drive</label>
            <DriveLinkInput
              id="logoDriveUrl"
              name="logoDriveUrl"
              defaultValue={settings?.logoDriveUrl ?? ""}
            />
            <p className="help">
              ដាក់រូបសញ្ញានៅ Google Drive ហើយកំណត់ការចែករំលែកជា <strong>Anyone with the link</strong> មុនបិទភ្ជាប់តំណ។
            </p>
          </div>
          <div className="field">
            <label>អត្ថបទជំនួសរូបសញ្ញា</label>
            <input
              className="input"
              name="logoAlt"
              defaultValue={settings?.logoAlt ?? "DR.MATHS"}
            />
          </div>
          <div className="field">
            <label>ម៉ោងបើកបង្រៀន</label>
            <input
              className="input"
              name="hoursKh"
              defaultValue={settings?.hoursKh ?? ""}
            />
          </div>
          <div className="field field-wide">
            <label>អាសយដ្ឋាន / ព័ត៌មានទីតាំង</label>
            <textarea
              className="textarea"
              name="addressKh"
              defaultValue={settings?.addressKh ?? ""}
            />
          </div>
          <div className="field field-wide">
            <label>អត្ថបទ Footer</label>
            <input
              className="input"
              name="footerTextKh"
              defaultValue={settings?.footerTextKh ?? ""}
            />
          </div>
          <div className="field">
            <label>ចំណងជើង SEO</label>
            <input
              className="input"
              name="seoTitleKh"
              defaultValue={settings?.seoTitleKh ?? ""}
            />
          </div>
          <div className="field">
            <label>ការពិពណ៌នា SEO</label>
            <input
              className="input"
              name="seoDescriptionKh"
              defaultValue={settings?.seoDescriptionKh ?? ""}
            />
          </div>
        </div>
        <div className="form-actions">
          <SubmitButton
            label="រក្សាទុកការកំណត់"
            loadingLabel="កំពុងរក្សាទុកការកំណត់..."
            variant="primary"
          />
        </div>
      </form>
    </>
  );
}
