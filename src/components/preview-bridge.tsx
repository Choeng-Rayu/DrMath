"use client";

import { useEffect } from "react";
import { getDriveImage } from "@/lib/drive";
import { plain } from "@/lib/text";

type PreviewMessage = {
  type: "cms-preview";
  key: string;
  value?: string;
  visible?: boolean;
};

const RICH_TEXT_KEYS = new Set(["hero.title", "hero.description", "about.vision", "about.mission", "about.long", "videos.description", "contact.description"]);

// Receives live keystrokes from the admin editor iframe parent and applies
// them to the server-rendered draft snapshot without a reload.
export function PreviewBridge() {
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const message = event.data as PreviewMessage;
      if (message?.type !== "cms-preview" || !message.key) return;

      const elements = document.querySelectorAll<HTMLElement>(`[data-cms-key="${message.key}"]`);
      elements.forEach((element) => {
        if (typeof message.value === "string") {
          const isImage = "driveOriginal" in element.dataset || element.tagName === "IMG";
          if (isImage) {
            const image = getDriveImage(message.value);
            if (image) element.setAttribute("src", image.renderUrl);
          } else {
            element.textContent = RICH_TEXT_KEYS.has(message.key) ? plain(message.value) : message.value;
          }
        }
        if (message.key.startsWith("nav.")) {
          // nav labels render twice (desktop + mobile menu); textContent above covers both
        }
      });

      // Visibility toggles arrive per-key; hide every element bound to that key.
      if (typeof message.visible === "boolean") {
        elements.forEach((element) => {
          if (message.visible) delete element.dataset.cmsHidden;
          else element.dataset.cmsHidden = "true";
        });
      }
    };

    window.addEventListener("message", onMessage);
    try {
      window.parent?.postMessage({ type: "cms-preview-ready" }, "*");
    } catch {
      /* ignore cross-origin error if any */
    }
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
}
