"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, RotateCw } from "lucide-react";

type Device = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<Device, string> = { desktop: "100%", tablet: "768px", mobile: "390px" };

// Sticky iframe of /preview shown next to the admin content form. Forwards
// every keystroke from `content:*` / `visible:*` fields into the iframe via
// postMessage so the admin sees the real homepage update while typing.
export function LivePreviewPanel() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<Device>("desktop");

  const sendFormState = () => {
    const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input[name^="content:"], input[name^="visible:"], textarea[name^="content:"]'
    );
    inputs.forEach((target) => {
      const name = target.getAttribute("name") ?? "";
      const key = name.slice(name.indexOf(":") + 1);
      const message =
        target instanceof HTMLInputElement && target.type === "checkbox"
          ? { type: "cms-preview", key, visible: target.checked }
          : { type: "cms-preview", key, value: target.value };
      iframeRef.current?.contentWindow?.postMessage(message, "*");
    });
  };

  const reloadPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = "/preview?embedded=true";
    }
  };

  useEffect(() => {
    const onFormActivity = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (!target || !(target instanceof HTMLElement)) return;
      const name = target.name || target.getAttribute("name") || "";
      if (!name.startsWith("content:") && !name.startsWith("visible:")) return;

      const key = name.slice(name.indexOf(":") + 1);
      const message =
        target instanceof HTMLInputElement && target.type === "checkbox"
          ? { type: "cms-preview", key, visible: target.checked }
          : { type: "cms-preview", key, value: target.value };
      iframeRef.current?.contentWindow?.postMessage(message, "*");
    };

    const onWindowMessage = (event: MessageEvent) => {
      if (event.data?.type === "cms-preview-ready") {
        sendFormState();
      }
    };

    document.addEventListener("input", onFormActivity, true);
    document.addEventListener("change", onFormActivity, true);
    window.addEventListener("message", onWindowMessage);
    return () => {
      document.removeEventListener("input", onFormActivity, true);
      document.removeEventListener("change", onFormActivity, true);
      window.removeEventListener("message", onWindowMessage);
    };
  }, []);

  return (
    <aside className="preview-panel">
      <div className="preview-toolbar">
        <strong>មើលជាមុនផ្ទាល់</strong>
        <div style={{ display: "flex", gap: ".35rem", alignItems: "center" }}>
          {(["desktop", "tablet", "mobile"] as Device[]).map((option) => (
            <button
              key={option}
              type="button"
              className={`button button-small ${device === option ? "button-primary" : "button-secondary"}`}
              onClick={() => setDevice(option)}
            >
              {option === "desktop" ? "កុំព្យូទ័រ" : option === "tablet" ? "ថេប្លេត" : "ទូរស័ព្ទ"}
            </button>
          ))}
        </div>
        <div style={{ marginInlineStart: "auto", display: "flex", gap: ".35rem", alignItems: "center" }}>
          <button
            type="button"
            className="button button-small button-secondary"
            onClick={reloadPreview}
            title="ផ្ទុកទំព័រមើលជាមុនឡើងវិញ"
          >
            <RotateCw size={14} aria-hidden="true" />
          </button>
          <a
            href="/preview"
            target="_blank"
            rel="noreferrer"
            className="button button-small button-secondary"
            title="បើកទំព័រមើលជាមុនក្នុងផ្ទាំងថ្មី"
          >
            <span>ពេញអេក្រង់</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="preview-frame-wrap">
        <iframe
          ref={iframeRef}
          className="preview-frame"
          src="/preview?embedded=true"
          title="មើលគេហទំព័រជាមុន"
          onLoad={sendFormState}
          style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%" }}
        />
      </div>
    </aside>
  );
}
