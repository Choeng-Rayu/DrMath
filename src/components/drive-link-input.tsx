"use client";

import { useMemo, useState } from "react";
import { getDriveImage } from "@/lib/drive";

export function DriveLinkInput({ id, name, defaultValue }: { id: string; name: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const image = useMemo(() => getDriveImage(value), [value]);

  return <>
    <input className="input" id={id} name={name} value={value} onChange={(event) => setValue(event.target.value)} type="url" placeholder="https://drive.google.com/file/d/.../view" />
    {value && !image && <p className="error">តំណនេះមិនមែនជាតំណ Google Drive ដែលមានលេខសម្គាល់ឯកសារត្រឹមត្រូវទេ។</p>}
    {image && <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: ".8rem", alignItems: "center" }}><img src={image.renderUrl} alt="មើលរូបភាព Google Drive ជាមុន" style={{ width: 150, height: 95, objectFit: "cover", borderRadius: 8, border: "1px solid #ccd5e5" }} /><p className="success">តំណរូបភាពត្រឹមត្រូវ។ សូមប្រាកដថា Drive កំណត់ជា <strong>Anyone with the link</strong> មុនរក្សាទុក។</p></div>}
  </>;
}
