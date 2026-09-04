"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

const links: NavItem[] = [
  { href: "/admin", label: "ផ្ទាំងគ្រប់គ្រង", exact: true },
  { href: "/admin/posts", label: "ដំណឹង & ការផ្សាយ" },
  { href: "/admin/content", label: "កែខ្លឹមសារ" },
  { href: "/admin/videos", label: "វីដេអូ YouTube" },
  { href: "/admin/exercises", label: "លំហាត់ & វិញ្ញាសា" },
  { href: "/admin/subjects", label: "មុខវិជ្ជា" },
  { href: "/admin/testimonials", label: "មតិយោបល់" },
  { href: "/admin/settings", label: "ការកំណត់" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="ម៉ឺនុយអ្នកគ្រប់គ្រង">
      {links.map(({ href, label, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            href={href}
            key={href}
            className={isActive ? "active" : ""}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
      <a
        href="/preview"
        target="_blank"
        rel="noreferrer"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".4rem" }}
      >
        <span>មើលទំព័រជាមុន</span>
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </nav>
  );
}
