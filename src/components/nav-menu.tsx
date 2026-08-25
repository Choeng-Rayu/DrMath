"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

export type NavLink = { href: string; label: string; cmsKey?: string };

function external(url: string) {
  return url.startsWith("http") ? { target: "_blank" as const, rel: "noreferrer" } : {};
}

/**
 * Site navigation: inline links on desktop, hamburger dropdown on mobile.
 * Fully supports live CMS preview updates on desktop and mobile links,
 * CTA button label/href updates, and visibility toggling.
 */
export function NavMenu({
  links,
  ctaLabel,
  ctaHref,
  hiddenKeys = [],
}: {
  links: NavLink[];
  ctaLabel: string;
  ctaHref: string;
  hiddenKeys?: string[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: Event) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("touchstart", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("touchstart", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const isHidden = (key?: string) => (key && hiddenKeys.includes(key) ? { "data-cms-hidden": "true" } : {});

  return (
    <>
      <nav className="nav-links" aria-label="ម៉ឺនុយសំខាន់">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            data-cms-key={link.cmsKey}
            data-cms-item={link.cmsKey}
            {...isHidden(link.cmsKey)}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="nav-toggle" ref={rootRef}>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={open ? "បិទម៉ឺនុយ" : "បើកម៉ឺនុយ"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "✕" : "☰"}
        </button>
        {open && (
          <nav className="mobile-menu" aria-label="ម៉ឺនុយលើទូរស័ព្ទ">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-cms-key={link.cmsKey}
                data-cms-item={link.cmsKey}
                {...isHidden(link.cmsKey)}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
      <a
        className="button button-primary"
        href={ctaHref}
        data-cms-href="nav.ctaUrl"
        data-cms-item="nav.cta"
        {...isHidden("nav.cta")}
        {...external(ctaHref)}
      >
        <span data-cms-key="nav.cta">{ctaLabel}</span>
        <Send size={16} aria-hidden="true" />
      </a>
    </>
  );
}
