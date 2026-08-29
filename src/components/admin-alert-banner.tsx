"use client";

import { useEffect, useState } from "react";

const errorMessages: Record<string, string> = {
  invalid: "ទិន្នន័យមិនត្រឹមត្រូវ។ សូមពិនិត្យការបញ្ចូលម្តងទៀត។",
  invalid_drive: "តំណ Google Drive មិនត្រឹមត្រូវ។ សូមប្រាកដថាបានបិទភ្ជាប់តំណចែករំលែកដែលមានលេខសម្គាល់ឯកសារត្រឹមត្រូវ។",
  duplicate: "ទិន្នន័យ ឬតំណនេះមានរួចហើយក្នុងប្រព័ន្ធ។",
  delete: "មានបញ្ហាពេលលុប។ សូមព្យាយាមម្តងទៀត។",
  save: "មានបញ្ហាពេលរក្សាទុក។ សូមព្យាយាមម្តងទៀត។",
  CredentialsSignin: "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ។",
  sheets_sync_failed: "មិនអាចធ្វើសមកាលកម្មទៅ Google Sheet បានទេ។ សូមពិនិត្យមើល Google Sheets API ក្នុង Google Cloud។",
};

const successMessages: Record<string, string> = {
  saved: "បានរក្សាទុកទិន្នន័យដោយជោគជ័យ!",
  created: "បានបន្ថែមទិន្នន័យថ្មីដោយជោគជ័យ!",
  updated: "បានកែប្រែទិន្នន័យដោយជោគជ័យ!",
  deleted: "បានលុបទិន្នន័យចេញដោយជោគជ័យ!",
  published: "បានផ្សាយខ្លឹមសារទៅកាន់គេហទំព័រសាធារណៈដោយជោគជ័យ!",
  draft_saved: "បានរក្សាទុកសេចក្តីព្រាងដោយជោគជ័យ! អ្នកអាចមើលជាមុនបាន។",
  discarded: "បានបោះបង់ការកែប្រែសេចក្តីព្រាងរួចរាល់។",
  sheets_synced: "បានធ្វើសមកាលកម្មទិន្នន័យទាំងអស់ទៅ Google Sheet ក្នុង Google Drive ដោយជោគជ័យ!",
  true: "ប្រតិបត្តិការបានជោគជ័យ!",
};

export function AdminAlertBanner({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  const [visible, setVisible] = useState(Boolean(error || success));

  useEffect(() => {
    setVisible(Boolean(error || success));
  }, [error, success]);

  if (!visible || (!error && !success)) return null;

  const isError = Boolean(error);
  const text = isError
    ? errorMessages[error!] ?? "មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។"
    : successMessages[success!] ?? "ប្រតិបត្តិការបានជោគជ័យ!";

  return (
    <div
      role={isError ? "alert" : "status"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.85rem 1.15rem",
        borderRadius: "12px",
        marginBottom: "1.25rem",
        background: isError ? "#fef2f2" : "#f0fdf4",
        border: `1px solid ${isError ? "#fca5a5" : "#86efac"}`,
        color: isError ? "#991b1b" : "#166534",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        animation: "slideDown 0.2s ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
        {isError ? (
          <svg
            style={{ width: "20px", height: "20px", flexShrink: 0, color: "#dc2626" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ) : (
          <svg
            style={{ width: "20px", height: "20px", flexShrink: 0, color: "#16a34a" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )}
        <span style={{ fontWeight: 600, fontSize: "0.92rem", lineHeight: 1.4 }}>{text}</span>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        style={{
          background: "transparent",
          border: "none",
          color: isError ? "#991b1b" : "#166534",
          cursor: "pointer",
          padding: "0.25rem 0.5rem",
          borderRadius: "6px",
          fontWeight: 700,
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          opacity: 0.8,
        }}
        aria-label="បិទការជូនដំណឹង"
      >
        ✕
      </button>
    </div>
  );
}

// Backward compatibility alias for any existing imports
export function AdminErrorBanner({ code }: { code?: string }) {
  return <AdminAlertBanner error={code} />;
}
