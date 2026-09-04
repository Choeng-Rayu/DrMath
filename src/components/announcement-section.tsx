"use client";

import { useState } from "react";
import {
  Briefcase,
  Calendar,
  ExternalLink,
  GraduationCap,
  Maximize2,
  Pin,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { PostItem } from "@/lib/site";
import { getDriveImage } from "@/lib/drive";

interface AnnouncementSectionProps {
  posts?: PostItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  telegramUrl?: string | null;
}

function parseRecruitmentContent(raw: string) {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const subjects: string[] = [];
  const requirements: string[] = [];
  const contacts: string[] = [];
  const hashtags: string[] = [];
  const others: string[] = [];

  for (const line of lines) {
    if (/^[0-9]+[.)\s]/.test(line)) {
      let sub = line.replace(/^[0-9]+[.)\s]*/, "").trim();
      sub = sub.replace(/([^\s0-9០-៩])([0-9០-៩]+នាក់)/g, "$1 $2");
      subjects.push(sub);
    } else if (line.includes("លក្ខខណ្ឌ") || line.includes("🅰️លក្ខខណ្ឌ") || line.includes("🅰️ លក្ខខណ្ឌ")) {
      requirements.push(line.replace(/^🅰️\s*/, "").replace(/^លក្ខខណ្ឌជ្រើសរើស[:\s]*/, "").trim());
    } else if (line.includes("Telegram") || line.includes("ទំនាក់ទំនង") || line.includes("ចាប់អារម្មណ៍")) {
      contacts.push(line.replace(/^🅰️\s*/, "").trim());
    } else if (line.startsWith("#")) {
      const tags = line.split(/\s+/).filter((t) => t.startsWith("#"));
      hashtags.push(...tags);
    } else {
      others.push(line);
    }
  }

  return { lines, subjects, requirements, contacts, hashtags, others };
}

export function AnnouncementSection({
  posts = [],
  eyebrow = "ដំណឹង & ការផ្សាយ",
  title = "ដំណឹងជ្រើសរើសគ្រូឆ្នើម",
  description,
  telegramUrl = "https://t.me/sambathkorm",
}: AnnouncementSectionProps) {
  const [activeModalImg, setActiveModalImg] = useState<string | null>(null);

  if (!posts || posts.length === 0) return null;

  const featuredPost = posts.find((p) => p.featured) ?? posts[0];
  const otherPosts = posts.filter((p) => p.id !== featuredPost.id);

  const featuredParsed = parseRecruitmentContent(featuredPost.contentKh);
  const featuredDriveImg = featuredPost.driveUrl ? getDriveImage(featuredPost.driveUrl) : null;
  const actionHref = featuredPost.actionUrl || telegramUrl || "https://t.me/sambathkorm";

  // Subject icon mapping for visual Khmer education badges
  const getSubjectEmoji = (subject: string) => {
    if (subject.includes("គណិត")) return "📐";
    if (subject.includes("រូប")) return "⚛️";
    if (subject.includes("គីមី")) return "🧪";
    if (subject.includes("ខ្មែរ")) return "🇰🇭";
    if (subject.includes("ជីវ")) return "🌿";
    if (subject.includes("អង់គ្លេស")) return "🌐";
    return "📚";
  };

  return (
    <section id="announcements" data-cms-section="posts" className="section announcement-section">
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".45rem",
              background: "#fef3c7",
              color: "#b45309",
              padding: ".35rem .95rem",
              borderRadius: "20px",
              fontSize: ".82rem",
              fontWeight: 700,
              marginBottom: ".8rem",
            }}
          >
            <Sparkles size={14} aria-hidden="true" />
            <span data-cms-key="posts.eyebrow">{eyebrow}</span>
          </div>

          <h2
            className="display section-title"
            data-cms-key="posts.title"
            style={{ marginTop: 0 }}
          >
            {title}
          </h2>

          {description && (
            <p
              className="section-lead"
              data-cms-key="posts.description"
              style={{ margin: ".75rem auto 0" }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Featured Heroic Recruitment Post Card */}
        <div className="recruitment-card">
          <div className="recruitment-grid">
            {/* Left / Main Content Column */}
            <div className="recruitment-content-col">
              {/* Header Badges */}
              <div style={{ display: "flex", alignItems: "center", gap: ".6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                <span className="recruitment-badge-hot">
                  <span className="pulse-dot" />
                  {featuredPost.badgeKh || "ដំណឹងជ្រើសរើសគ្រូឆ្នើម"}
                </span>

                <span className="recruitment-badge-pin">
                  <Pin size={12} />
                  <span>ការផ្សាយសំខាន់</span>
                </span>

                <span style={{ fontSize: ".82rem", color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: ".35rem", marginLeft: "auto" }}>
                  <Calendar size={13} />
                  <span>{new Date(featuredPost.createdAt).toLocaleDateString("km-KH", { year: "numeric", month: "short", day: "numeric" })}</span>
                </span>
              </div>

              {/* Title */}
              <h3 className="recruitment-title">
                {featuredPost.titleKh}
              </h3>

              {/* Introduction / Other Text */}
              {featuredParsed.others.length > 0 && (
                <p className="recruitment-lead">
                  {featuredParsed.others.join(" ")}
                </p>
              )}

              {/* Target Subjects Needed Grid */}
              {featuredParsed.subjects.length > 0 && (
                <div style={{ marginTop: "1.4rem" }}>
                  <h4 style={{ fontSize: ".92rem", color: "var(--ink)", fontWeight: 700, margin: "0 0 .75rem", display: "flex", alignItems: "center", gap: ".4rem" }}>
                    <Users size={16} color="var(--blue)" />
                    <span>មុខវិជ្ជា និងចំនួនដែលត្រូវការជ្រើសរើស៖</span>
                  </h4>
                  <div className="recruitment-subjects-grid">
                    {featuredParsed.subjects.map((sub, idx) => (
                      <div key={idx} className="recruitment-subject-chip">
                        <span className="subject-chip-icon">{getSubjectEmoji(sub)}</span>
                        <span className="subject-chip-text">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements Callout Box */}
              {featuredParsed.requirements.length > 0 && (
                <div className="recruitment-callout">
                  <div className="callout-icon">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <strong style={{ display: "block", color: "#0c4a6e", fontSize: ".92rem" }}>
                      លក្ខខណ្ឌជ្រើសរើស (Requirements)
                    </strong>
                    <p style={{ margin: ".25rem 0 0", color: "#0369a1", fontSize: ".88rem" }}>
                      {featuredParsed.requirements.join(" ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions & Telegram CTA */}
              <div className="recruitment-actions">
                <a
                  href={actionHref}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-primary"
                  style={{ gap: ".55rem", padding: ".75rem 1.4rem", fontSize: ".95rem" }}
                >
                  <Send size={18} aria-hidden="true" />
                  <span>{featuredPost.actionLabel || "ទំនាក់ទំនងដាក់ពាក្យតាម Telegram (@sambathkorm)"}</span>
                </a>

                {featuredDriveImg && (
                  <button
                    type="button"
                    onClick={() => setActiveModalImg(featuredDriveImg.renderUrl)}
                    className="button button-secondary"
                    style={{ background: "#fff", color: "var(--ink)", border: "1px solid var(--line)" }}
                  >
                    <Maximize2 size={16} />
                    <span>ពង្រីកមើល Poster</span>
                  </button>
                )}
              </div>

              {/* Hashtags */}
              {featuredParsed.hashtags.length > 0 && (
                <div className="recruitment-hashtags">
                  {featuredParsed.hashtags.map((tag, idx) => (
                    <span key={idx} className="recruitment-hash">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Poster Image / Branded Visual Frame */}
            <div className="recruitment-visual-col">
              {featuredDriveImg ? (
                <div
                  className="recruitment-poster-wrap"
                  onClick={() => setActiveModalImg(featuredDriveImg.renderUrl)}
                  title="ចុចដើម្បីពង្រីកមើលរូបភាពពេញ"
                >
                  <img
                    src={featuredDriveImg.renderUrl}
                    alt={featuredPost.titleKh}
                    className="recruitment-poster-img"
                    referrerPolicy="no-referrer"
                  />
                  <div className="poster-zoom-overlay">
                    <span className="poster-zoom-btn">
                      <Maximize2 size={14} /> ចុចពង្រីក Poster
                    </span>
                  </div>
                </div>
              ) : (
                <div className="recruitment-graphic-card">
                  <div className="graphic-badge">
                    <Briefcase size={28} />
                  </div>
                  <h4 style={{ margin: ".8rem 0 .4rem", fontSize: "1.15rem", color: "var(--ink)", fontWeight: 800 }}>
                    DR.MATHS RECRUITMENT
                  </h4>
                  <p style={{ margin: 0, fontSize: ".85rem", color: "var(--muted)", maxWidth: "260px" }}>
                    ចូលរួមជាមួយក្រុមការងារគ្រូបង្រៀនឆ្នើម ដើម្បីអភិវឌ្ឍន៍សមត្ថភាពសិស្សានុសិស្សកម្ពុជា
                  </p>
                  <div className="graphic-pillars">
                    <span>✓ បរិយាកាសការងារវិជ្ជាជីវៈ</span>
                    <span>✓ ផ្តល់តម្លៃលើគរុកោសល្យ</span>
                    <span>✓ ថ្នាក់រៀនបំពាក់ឧបករណ៍ទំនើប</span>
                  </div>
                  <a
                    href={actionHref}
                    target="_blank"
                    rel="noreferrer"
                    className="button button-small button-primary"
                    style={{ marginTop: "1.2rem", width: "100%" }}
                  >
                    <span>ដាក់ពាក្យឥឡូវនេះ</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional announcements if more than 1 exist */}
        {otherPosts.length > 0 && (
          <div style={{ marginTop: "2.5rem" }}>
            <h3 style={{ fontSize: "1.2rem", color: "var(--ink)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
              <span>ដំណឹង និងការផ្សាយផ្សេងទៀត</span>
              <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1", fontSize: ".75rem" }}>
                {otherPosts.length}
              </span>
            </h3>

            <div className="additional-posts-grid">
              {otherPosts.map((p) => {
                const pImg = p.driveUrl ? getDriveImage(p.driveUrl) : null;
                const pHref = p.actionUrl || telegramUrl || "https://t.me/sambathkorm";
                return (
                  <article key={p.id} className="additional-post-card">
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".6rem" }}>
                      {p.badgeKh && (
                        <span className="badge" style={{ background: "#fef3c7", color: "#b45309", fontSize: ".72rem", fontWeight: 700 }}>
                          {p.badgeKh}
                        </span>
                      )}
                      <span style={{ fontSize: ".78rem", color: "var(--muted)", marginLeft: "auto" }}>
                        {new Date(p.createdAt).toLocaleDateString("km-KH")}
                      </span>
                    </div>

                    <h4 style={{ margin: "0 0 .5rem", fontSize: "1.05rem", color: "var(--ink)", lineHeight: 1.45 }}>
                      {p.titleKh}
                    </h4>

                    <p style={{ margin: "0 0 1rem", fontSize: ".85rem", color: "var(--muted)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                      {p.contentKh.length > 180 ? `${p.contentKh.slice(0, 180)}...` : p.contentKh}
                    </p>

                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <a
                        href={pHref}
                        target="_blank"
                        rel="noreferrer"
                        className="button button-small button-primary"
                        style={{ fontSize: ".8rem" }}
                      >
                        <span>{p.actionLabel || "ព័ត៌មានលម្អិត"}</span>
                        <ExternalLink size={13} />
                      </a>

                      {pImg && (
                        <button
                          type="button"
                          onClick={() => setActiveModalImg(pImg.renderUrl)}
                          className="button button-small button-outline"
                          style={{ color: "var(--ink)", borderColor: "var(--line)" }}
                        >
                          <Maximize2 size={13} />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Poster Image */}
      {activeModalImg && (
        <div className="lightbox-backdrop" onClick={() => setActiveModalImg(null)}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", height: "auto", maxHeight: "90vh" }}>
            <div className="lightbox-header">
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <Briefcase size={18} color="var(--blue)" />
                <span style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--ink)" }}>
                  {featuredPost.titleKh}
                </span>
              </div>
              <button
                type="button"
                className="lightbox-tool-btn lightbox-close-btn"
                onClick={() => setActiveModalImg(null)}
                aria-label="បិទ"
              >
                <X size={18} />
              </button>
            </div>
            <div className="lightbox-content" style={{ padding: "1rem", background: "#0f172a" }}>
              <img
                src={activeModalImg}
                alt="Poster"
                style={{ maxWidth: "100%", maxHeight: "72vh", objectFit: "contain", borderRadius: "8px" }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="lightbox-footer">
              <a
                href={actionHref}
                target="_blank"
                rel="noreferrer"
                className="button button-primary button-small"
              >
                <Send size={15} />
                <span>{featuredPost.actionLabel || "ទំនាក់ទំនងតាម Telegram"}</span>
              </a>
              <button
                type="button"
                onClick={() => setActiveModalImg(null)}
                className="button button-secondary button-small"
              >
                បិទផ្ទាំង
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
