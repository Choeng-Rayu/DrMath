"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

export type NavLink = { href: string; label: string };

function external(url: string) {
  return url.startsWith("http") ? { target: "_blank" as const, rel: "noreferrer" } : {};
}

/**
 * Site navigation: inline links on desktop, hamburger dropdown on mobile.
 * The dropdown closes on link tap, outside tap, or Escape — the old
 * <details>-based menu stayed open after navigation.
 */
export function NavMenu({ links, ctaLabel, ctaHref }: { links: NavLink[]; ctaLabel: string; ctaHref: string }) {
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

  return (
    <>
      <nav className="nav-links" aria-label="ម៉ឺនុយសំខាន់">
        {links.map((link) => (
          <a key={link.href} href={link.href}>{link.label}</a>
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
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
      <a className="button button-primary" href={ctaHref} {...external(ctaHref)}>
        {ctaLabel}<Send size={16} aria-hidden="true" />
      </a>
    </>
  );
}
