"use client";

import { useState } from "react";

const messages: Record<string, string> = {
  invalid: "ទិន្នន័យមិនត្រឹមត្រូវ។ សូមពិនិត្យការបញ្ចូលម្តងទៀត។",
  duplicate: "វីដេអូនេះមានរួចហើយក្នុងបញ្ជី។ សូមសាកល្បងតំណផ្សេងទៀត។",
  delete: "មានបញ្ហាពេលលុប។ សូមព្យាយាមម្តងទៀត។",
  save: "មានបញ្ហាពេលរក្សាទុក។ សូមព្យាយាមម្តងទៀត។",
};

export function AdminErrorBanner({ code }: { code?: string }) {
  const [visible, setVisible] = useState(Boolean(code && messages[code]));
  if (!code || !visible) return null;

  return (
    <div className="error" role="alert" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
      <span>{messages[code] ?? "មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។"}</span>
      <button type="button" className="button button-small" onClick={() => setVisible(false)}>
        បិទ
      </button>
    </div>
  );
}
