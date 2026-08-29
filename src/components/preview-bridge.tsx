"use client";

import { useEffect, useRef } from "react";
import { getDriveImage } from "@/lib/drive";
import { renderRichText, plain } from "@/lib/text";

type PreviewMessage = {
  type: "cms-preview" | "cms-preview-scroll";
  key?: string;
  section?: string;
  value?: string;
  visible?: boolean;
  scrollTo?: boolean;
};

const RICH_HTML_KEYS = new Set(["hero.title"]);
const RICH_PLAIN_KEYS = new Set([
  "hero.description",
  "about.vision",
  "about.mission",
  "about.long",
  "videos.description",
  "exercises.description",
  "contact.description",
]);

// Receives live keystrokes and focus events from the admin editor iframe parent,
// applies them to the preview DOM in real-time, and enables click-to-edit to sync back to the editor.
export function PreviewBridge({ embedded = false }: { embedded?: boolean }) {
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scrollToTarget = (key?: string, section?: string) => {
      let target: HTMLElement | null = null;

      // 1. Try finding specific key element
      if (key) {
        target = document.querySelector<HTMLElement>(
          `[data-cms-key="${key}"]:not([data-cms-hidden="true"]), [data-cms-href="${key}"]:not([data-cms-hidden="true"]), [data-cms-item="${key}"]:not([data-cms-hidden="true"])`
        );

        if (!target) {
          // Try finding inside compound cards
          target = document.querySelector<HTMLElement>(
            `[data-cms-card*="${key}"]:not([data-cms-hidden="true"])`
          );
        }
      }

      // 2. If no direct element found, try section
      if (!target && section) {
        target =
          document.querySelector<HTMLElement>(`[data-cms-section="${section}"]`) ||
          document.getElementById(section);
      }

      // 3. Fallback: extract section prefix from key (e.g. 'hero' from 'hero.title')
      if (!target && key && key.includes(".")) {
        const prefix = key.split(".")[0];
        target =
          document.querySelector<HTMLElement>(`[data-cms-section="${prefix}"]`) ||
          document.getElementById(prefix);
      }

      // 4. Perform smooth scroll and visual highlight
      if (target) {
        const isSection = target.tagName === "SECTION" || target.tagName === "HEADER" || target.tagName === "FOOTER";
        target.scrollIntoView({
          behavior: "smooth",
          block: isSection ? "start" : "center",
          inline: "nearest",
        });

        // Clear existing highlights
        document.querySelectorAll(".cms-preview-highlight").forEach((el) => {
          el.classList.remove("cms-preview-highlight");
        });

        // Apply new highlight
        target.classList.add("cms-preview-highlight");

        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }

        highlightTimeoutRef.current = setTimeout(() => {
          target?.classList.remove("cms-preview-highlight");
        }, 1800);
      }
    };

    // Listen for incoming live updates and scroll commands from the parent editor
    const onMessage = (event: MessageEvent) => {
      const message = event.data as PreviewMessage;
      if (!message || (message.type !== "cms-preview" && message.type !== "cms-preview-scroll")) {
        return;
      }

      // Handle direct scroll requests
      if (message.type === "cms-preview-scroll") {
        scrollToTarget(message.key, message.section);
        return;
      }

      const { key, value, visible, scrollTo = true, section } = message;
      if (!key) return;

      // 1. Text and Image live updates
      const elements = document.querySelectorAll<HTMLElement>(`[data-cms-key="${key}"]`);
      elements.forEach((element) => {
        if (typeof value === "string") {
          const isImage = "driveOriginal" in element.dataset || element.tagName === "IMG";
          if (isImage) {
            const image = getDriveImage(value);
            if (image) {
              element.setAttribute("src", image.renderUrl);
            } else if (!value.trim()) {
              const defaultSrc = element.dataset.defaultSrc;
              if (defaultSrc) element.setAttribute("src", defaultSrc);
            }
          } else if (RICH_HTML_KEYS.has(key)) {
            element.innerHTML = renderRichText(value);
          } else if (RICH_PLAIN_KEYS.has(key)) {
            element.textContent = plain(value);
          } else {
            element.textContent = value;
          }
        }
      });

      // 2. Link href updates
      const linkElements = document.querySelectorAll<HTMLElement>(`[data-cms-href="${key}"]`);
      linkElements.forEach((element) => {
        if (typeof value === "string") {
          element.setAttribute("href", value);
        }
      });

      // 3. Visibility toggles
      if (typeof visible === "boolean") {
        const targetElements = document.querySelectorAll<HTMLElement>(
          `[data-cms-key="${key}"], [data-cms-item="${key}"]`
        );
        targetElements.forEach((element) => {
          if (visible) {
            delete element.dataset.cmsHidden;
          } else {
            element.dataset.cmsHidden = "true";
          }
        });

        // Re-evaluate compound cards containing this key
        const cards = document.querySelectorAll<HTMLElement>("[data-cms-card]");
        cards.forEach((card) => {
          const cardKeys = (card.dataset.cmsCard || "").split(/\s+/).filter(Boolean);
          if (!cardKeys.includes(key)) return;

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

      // 4. Auto-scroll if enabled
      if (scrollTo) {
        scrollToTarget(key, section);
      }
    };

    // Click-to-edit: when admin clicks any text, image, or section in preview, notify parent editor to focus it
    const onPreviewClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      // Find closest element with cms metadata
      const keyEl = target.closest<HTMLElement>("[data-cms-key], [data-cms-href], [data-cms-item]");
      const key = keyEl?.dataset.cmsKey || keyEl?.dataset.cmsHref || keyEl?.dataset.cmsItem;

      const sectionEl = target.closest<HTMLElement>("[data-cms-section]");
      const section = sectionEl?.dataset.cmsSection || (key?.includes(".") ? key.split(".")[0] : undefined);

      if (key || section) {
        // Prevent default navigation for internal links in preview when clicking to edit
        if (target.closest("a") || target.closest("button")) {
          // Allow lightbox close/navigation buttons if needed, otherwise prevent default
          const isLightboxControl = target.closest(".lightbox-controls, .lightbox-nav-btns");
          if (!isLightboxControl) {
            event.preventDefault();
            event.stopPropagation();
          }
        }

        // Highlight in preview immediately
        const highlightTarget = keyEl || sectionEl || target;
        document.querySelectorAll(".cms-preview-highlight").forEach((el) => {
          el.classList.remove("cms-preview-highlight");
        });
        highlightTarget.classList.add("cms-preview-highlight");
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = setTimeout(() => {
          highlightTarget.classList.remove("cms-preview-highlight");
        }, 1800);

        // Send message to parent editor
        try {
          window.parent?.postMessage(
            {
              type: "cms-preview-click",
              key,
              section,
            },
            "*"
          );
        } catch {
          /* ignore */
        }
      }
    };

    window.addEventListener("message", onMessage);
    if (embedded || window.parent !== window) {
      document.addEventListener("click", onPreviewClick, true);
    }

    try {
      window.parent?.postMessage({ type: "cms-preview-ready" }, "*");
    } catch {
      /* ignore */
    }

    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onPreviewClick, true);
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, [embedded]);

  return null;
}
