"use client";

import { useId, useMemo, useRef, useState, DragEvent, ChangeEvent } from "react";
import { Upload, Link2, CheckCircle2, AlertCircle, Loader2, X, RefreshCw, ExternalLink } from "lucide-react";
import { getDriveImage } from "@/lib/drive";

interface DriveImageUploaderProps {
  id?: string;
  name?: string;
  defaultValue?: string;
  required?: boolean;
  helpText?: string;
  onChangeUrl?: (url: string) => void;
}

export function DriveImageUploader({
  id: customId,
  name = "driveUrl",
  defaultValue = "",
  required = false,
  helpText,
  onChangeUrl,
}: DriveImageUploaderProps) {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [driveUrl, setDriveUrl] = useState<string>(defaultValue);
  const [activeTab, setActiveTab] = useState<"upload" | "link">("upload");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Parse Drive image info if a valid Drive URL exists
  const driveImg = useMemo(() => getDriveImage(driveUrl), [driveUrl]);

  const handleUrlChange = (newUrl: string) => {
    setDriveUrl(newUrl);
    setErrorMessage(null);
    setSuccessMessage(null);
    onChangeUrl?.(newUrl);
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("សូមជ្រើសរើសឯកសារដែលជារូបភាព (JPG, PNG, WEBP, GIF, SVG)។");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage("ទំហំរូបភាពធំពេក (លើសពី 20MB)។ សូមបន្ថយទំហំរូបភាពមុនផ្ទុកឡើង។");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "ការផ្ទុករូបភាពឡើង Google Drive បានបរាជ័យ។");
      }

      handleUrlChange(data.driveUrl);
      setSuccessMessage("✓ ផ្ទុករូបភាពឡើង Google Drive និងកំណត់សិទ្ធិមើលជាសាធារណៈជោគជ័យ!");
    } catch (err) {
      console.error("[DriveImageUploader] Upload failed:", err);
      const msg = err instanceof Error ? err.message : "មានបញ្ហាក្នុងការផ្ទុករូបភាព។";
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    handleUrlChange("");
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div className="drive-uploader-container" style={{ display: "grid", gap: "0.75rem" }}>
      {/* Hidden input to pass value to standard Server Action / form submissions */}
      <input
        type="hidden"
        id={inputId}
        name={name}
        value={driveUrl}
        required={required}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />

      {/* Tab Switcher: Direct Upload vs Paste Link */}
      <div
        style={{
          display: "inline-flex",
          background: "#edf0f5",
          padding: "3px",
          borderRadius: "8px",
          width: "fit-content",
          gap: "4px",
          fontSize: "0.82rem",
          fontWeight: 600,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          style={{
            padding: "4px 12px",
            borderRadius: "6px",
            border: 0,
            cursor: "pointer",
            background: activeTab === "upload" ? "#fff" : "transparent",
            color: activeTab === "upload" ? "#1240ab" : "#5b667a",
            boxShadow: activeTab === "upload" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Upload size={14} />
          <span>ផ្ទុករូបភាពឡើង (Auto Upload)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("link")}
          style={{
            padding: "4px 12px",
            borderRadius: "6px",
            border: 0,
            cursor: "pointer",
            background: activeTab === "link" ? "#fff" : "transparent",
            color: activeTab === "link" ? "#1240ab" : "#5b667a",
            boxShadow: activeTab === "link" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Link2 size={14} />
          <span>បិទភ្ជាប់តំណ Drive (Paste Link)</span>
        </button>
      </div>

      {/* Mode 1: Drag-and-Drop / Upload Area */}
      {activeTab === "upload" && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? "#1240ab" : "#ccd5e5"}`,
            background: dragActive ? "#f0f4ff" : "#fbfcfe",
            borderRadius: "12px",
            padding: "1.5rem 1rem",
            textAlign: "center",
            cursor: isUploading ? "wait" : "pointer",
            transition: "all 0.15s ease",
            display: "grid",
            placeItems: "center",
            gap: "0.5rem",
          }}
        >
          {isUploading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "#1240ab" }} />
              <strong style={{ color: "#1240ab", fontSize: "0.95rem" }}>
                កំពុងផ្ទុករូបភាពឡើង Google Drive...
              </strong>
              <small style={{ color: "#5b667a" }}>
                ប្រព័ន្ធកំពុងកំណត់សិទ្ធិមើលជាសាធារណៈ (Anyone with the link) ដោយស្វ័យប្រវត្តិ
              </small>
            </div>
          ) : (
            <>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#edf2ff",
                  display: "grid",
                  placeItems: "center",
                  color: "#1240ab",
                }}
              >
                <Upload size={22} />
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "0.95rem", color: "#0a1f44" }}>
                  ចុចទីនេះដើម្បីជ្រើសរើសរូបភាព ឬ អូសទម្លាក់រូបភាពមកទីនេះ
                </strong>
                <span style={{ fontSize: "0.82rem", color: "#5b667a" }}>
                  ទ្រទ្រង់ប្រភេទ PNG, JPG, WEBP, GIF (ទំហំអតិបរមា 20MB)
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mode 2: Manual URL input */}
      {activeTab === "link" && (
        <div>
          <input
            type="url"
            className="input"
            value={driveUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://drive.google.com/file/d/.../view"
          />
          <p className="help" style={{ marginTop: "0.3rem" }}>
            {helpText || "សូមប្រាកដថាកំណត់សិទ្ធិក្នុង Google Drive ជា Anyone with the link (អ្នកមានតំណអាចមើលបាន)។"}
          </p>
        </div>
      )}

      {/* Error & Warning Display */}
      {errorMessage && (
        <div
          className="error"
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            padding: "0.6rem 0.8rem",
            borderRadius: "8px",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div
          className="success"
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            padding: "0.6rem 0.8rem",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Preview Card if a valid Drive URL exists */}
      {driveImg && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "140px 1fr",
            gap: "1rem",
            alignItems: "center",
            padding: "0.85rem",
            background: "#ffffff",
            border: "1px solid #ccd5e5",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(10,31,68,0.04)",
          }}
        >
          <div style={{ position: "relative", width: "140px", height: "95px" }}>
            <img
              src={driveImg.renderUrl}
              alt="រូបភាពមើលជាមុន Google Drive"
              referrerPolicy="no-referrer"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "block",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: "0.35rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#17733b", fontSize: "0.85rem", fontWeight: 700 }}>
              <CheckCircle2 size={16} />
              <span>រូបភាពត្រៀមរួចរាល់សម្រាប់បង្ហាញលើគេហទំព័រ</span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "#5b667a", wordBreak: "break-all" }}>
              <strong>Google Drive ID:</strong> {driveImg.fileId}
            </div>
            <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.2rem", flexWrap: "wrap" }}>
              <a
                href={driveImg.originalUrl}
                target="_blank"
                rel="noreferrer"
                className="button button-outline button-small"
                style={{
                  color: "#1240ab",
                  borderColor: "#ccd5e5",
                  padding: "0.2rem 0.5rem",
                  fontSize: "0.78rem",
                  minHeight: "28px",
                }}
              >
                <ExternalLink size={12} />
                <span>បើកមើលលើ Drive ↗</span>
              </a>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="button button-outline button-small"
                style={{
                  color: "#0a1f44",
                  borderColor: "#ccd5e5",
                  padding: "0.2rem 0.5rem",
                  fontSize: "0.78rem",
                  minHeight: "28px",
                }}
              >
                <RefreshCw size={12} />
                <span>ប្តូររូបភាពថ្មី</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="button button-outline button-small"
                style={{
                  color: "#b42222",
                  borderColor: "#fecaca",
                  padding: "0.2rem 0.5rem",
                  fontSize: "0.78rem",
                  minHeight: "28px",
                }}
              >
                <X size={12} />
                <span>លុប</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
