"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ExternalLink, RotateCw, Navigation, MousePointerClick } from "lucide-react";

type Device = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<Device, string> = { desktop: "100%", tablet: "768px", mobile: "390px" };

export function LivePreviewPanel() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendFormState = useCallback(() => {
    const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input[name^="content:"], input[name^="visible:"], textarea[name^="content:"]'
    );
    inputs.forEach((target) => {
      const name = target.getAttribute("name") ?? "";
      const key = name.slice(name.indexOf(":") + 1);
      const section = target.closest<HTMLElement>("[data-cms-section]")?.dataset.cmsSection;
      const message =
        target instanceof HTMLInputElement && target.type === "checkbox"
          ? { type: "cms-preview", key, section, visible: target.checked, scrollTo: false }
          : { type: "cms-preview", key, section, value: target.value, scrollTo: false };
      iframeRef.current?.contentWindow?.postMessage(message, "*");
    });
  }, []);

  const reloadPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = "/preview?embedded=true";
    }
  };

  const sendScrollMessage = useCallback(
    (key?: string, section?: string) => {
      if (!autoScroll) return;
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: "cms-preview-scroll",
          key,
          section,
        },
        "*"
      );
    },
    [autoScroll]
  );

  useEffect(() => {
    // 1. Focus event: when admin clicks into an input/textarea/checkbox, scroll preview to it
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const input = target.closest<HTMLInputElement | HTMLTextAreaElement>(
        'input[name^="content:"], input[name^="visible:"], textarea[name^="content:"]'
      );

      if (input) {
        const name = input.getAttribute("name") || "";
        const key = name.slice(name.indexOf(":") + 1);
        const section = input.closest<HTMLElement>("[data-cms-section]")?.dataset.cmsSection;
        sendScrollMessage(key, section);
      }
    };

    // 2. Click event: if admin clicks a section card or header in editor, scroll preview to that section
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const sectionEl = target.closest<HTMLElement>("[data-cms-section]");
      if (sectionEl) {
        const section = sectionEl.dataset.cmsSection;
        const fieldEl = target.closest<HTMLElement>("[data-cms-key]");
        const key = fieldEl?.dataset.cmsKey;
        sendScrollMessage(key, section);
      }
    };

    // 3. Input & change event: live update content and debounce auto-scroll
    const onFormActivity = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (!target || !(target instanceof HTMLElement)) return;
      const name = target.name || target.getAttribute("name") || "";
      if (!name.startsWith("content:") && !name.startsWith("visible:")) return;

      const key = name.slice(name.indexOf(":") + 1);
      const section = target.closest<HTMLElement>("[data-cms-section]")?.dataset.cmsSection;
      const message =
        target instanceof HTMLInputElement && target.type === "checkbox"
          ? { type: "cms-preview", key, section, visible: target.checked, scrollTo: false }
          : { type: "cms-preview", key, section, value: target.value, scrollTo: false };

      iframeRef.current?.contentWindow?.postMessage(message, "*");

      if (autoScroll) {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          sendScrollMessage(key, section);
        }, 250);
      }
    };

    // 4. Message event: handle preview ready AND click-to-edit from inside preview iframe
    const onWindowMessage = (event: MessageEvent) => {
      if (event.data?.type === "cms-preview-ready") {
        sendFormState();
      }

      // Reverse direction: Preview -> Editor click-to-edit
      if (event.data?.type === "cms-preview-click") {
        const { key, section } = event.data;
        let targetEl: HTMLElement | null = null;

        if (key) {
          targetEl =
            document.querySelector<HTMLElement>(`[data-cms-key="${key}"]`) ||
            document.querySelector<HTMLElement>(`[id="content:${key}"], [name="content:${key}"], [name="visible:${key}"]`);
        }

        if (!targetEl && section) {
          targetEl = document.querySelector<HTMLElement>(`[data-cms-section="${section}"]`);
        }

        if (!targetEl && key && key.includes(".")) {
          const prefix = key.split(".")[0];
          targetEl = document.querySelector<HTMLElement>(`[data-cms-section="${prefix}"]`);
        }

        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

          // Focus the input/textarea field
          const input =
            targetEl instanceof HTMLInputElement || targetEl instanceof HTMLTextAreaElement
              ? targetEl
              : targetEl.querySelector<HTMLInputElement | HTMLTextAreaElement>("input:not([type='checkbox']), textarea, input");

          if (input) {
            input.focus({ preventScroll: true });
            if (input instanceof HTMLInputElement && input.type === "text") {
              input.select();
            }
          }

          // Visual highlight on the editor form field
          document.querySelectorAll(".cms-editor-highlight").forEach((el) => {
            el.classList.remove("cms-editor-highlight");
          });

          const highlightBox = (targetEl.closest(".field") || targetEl.closest(".form-card") || targetEl) as HTMLElement;
          highlightBox.classList.add("cms-editor-highlight");

          if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
          highlightTimeoutRef.current = setTimeout(() => {
            highlightBox.classList.remove("cms-editor-highlight");
          }, 2000);
        }
      }
    };

    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("input", onFormActivity, true);
    document.addEventListener("change", onFormActivity, true);
    window.addEventListener("message", onWindowMessage);

    return () => {
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("input", onFormActivity, true);
      document.removeEventListener("change", onFormActivity, true);
      window.removeEventListener("message", onWindowMessage);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, [autoScroll, sendFormState, sendScrollMessage]);

  return (
    <aside className="preview-panel">
      <div className="preview-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: ".35rem" }}>
          <strong>មើលជាមុនផ្ទាល់</strong>
          <span
            style={{
              fontSize: ".74rem",
              background: "#e0f2fe",
              color: "#0369a1",
              padding: ".12rem .45rem",
              borderRadius: "10px",
              display: "inline-flex",
              alignItems: "center",
              gap: ".25rem",
            }}
            title="ចុចលើអត្ថបទក្នុង Preview ដើម្បីរំកិលទៅកាន់កន្លែងកែប្រែ"
          >
            <MousePointerClick size={11} />
            <span>ចុចលើ Preview ដើម្បីកែ</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: ".35rem", alignItems: "center", marginTop: ".35rem", width: "100%", flexWrap: "wrap" }}>
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
          <div style={{ marginInlineStart: "auto", display: "flex", gap: ".35rem", alignItems: "center" }}>
            <button
              type="button"
              className={`button button-small ${autoScroll ? "button-primary" : "button-secondary"}`}
              onClick={() => setAutoScroll((prev) => !prev)}
              title={autoScroll ? "បិទ Scroll ស្វ័យប្រវត្តិ" : "បើក Scroll ស្វ័យប្រវត្តិ"}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
            >
              <Navigation size={13} style={{ transform: autoScroll ? "rotate(45deg)" : "none" }} />
              <span>{autoScroll ? "Scroll: បើក" : "Scroll: បិទ"}</span>
            </button>
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
