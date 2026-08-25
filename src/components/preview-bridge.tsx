"use client";

import { useEffect } from "react";
import { getDriveImage } from "@/lib/drive";
import { renderRichText, plain } from "@/lib/text";

type PreviewMessage = {
  type: "cms-preview";
  key: string;
  value?: string;
  visible?: boolean;
};

const RICH_HTML_KEYS = new Set(["hero.title"]);
const RICH_PLAIN_KEYS = new Set(["hero.description", "about.vision", "about.mission", "about.long", "videos.description", "contact.description"]);

// Receives live keystrokes from the admin editor iframe parent and applies
// them to the server-rendered draft snapshot without a reload.
export function PreviewBridge() {
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const message = event.data as PreviewMessage;
      if (message?.type !== "cms-preview" || !message.key) return;

      // 1. Text and Image updates
      const elements = document.querySelectorAll<HTMLElement>(`[data-cms-key="${message.key}"]`);
      elements.forEach((element) => {
        if (typeof message.value === "string") {
          const isImage = "driveOriginal" in element.dataset || element.tagName === "IMG";
          if (isImage) {
            const image = getDriveImage(message.value);
            if (image) {
              element.setAttribute("src", image.renderUrl);
            } else if (!message.value.trim()) {
              const defaultSrc = element.dataset.defaultSrc;
              if (defaultSrc) element.setAttribute("src", defaultSrc);
            }
          } else if (RICH_HTML_KEYS.has(message.key)) {
            element.innerHTML = renderRichText(message.value);
          } else if (RICH_PLAIN_KEYS.has(message.key)) {
            element.textContent = plain(message.value);
          } else {
            element.textContent = message.value;
          }
        }
      });

      // 2. Link href updates (e.g. hero.primaryUrl, hero.secondaryUrl, nav.ctaUrl)
      const linkElements = document.querySelectorAll<HTMLElement>(`[data-cms-href="${message.key}"]`);
      linkElements.forEach((element) => {
        if (typeof message.value === "string") {
          element.setAttribute("href", message.value);
        }
      });

      // 3. Visibility toggles
      if (typeof message.visible === "boolean") {
        // Toggle on targeted elements and items
        const targetElements = document.querySelectorAll<HTMLElement>(
          `[data-cms-key="${message.key}"], [data-cms-item="${message.key}"]`
        );
        targetElements.forEach((element) => {
          if (message.visible) {
            delete element.dataset.cmsHidden;
          } else {
            element.dataset.cmsHidden = "true";
          }
        });

        // Re-evaluate compound cards containing this key
        const cards = document.querySelectorAll<HTMLElement>("[data-cms-card]");
        cards.forEach((card) => {
          const cardKeys = (card.dataset.cmsCard || "").split(/\s+/).filter(Boolean);
          if (!cardKeys.includes(message.key)) return;

          // Check if all keys associated with this card are hidden
          const allHidden = cardKeys.every((k) => {
            const el = card.querySelector(`[data-cms-key="${k}"]`);
            return el?.hasAttribute("data-cms-hidden");
          });

          if (allHidden) {
            card.dataset.cmsHidden = "true";
          } else {
            delete card.dataset.cmsHidden;
          }
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
