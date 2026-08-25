import { BookOpen, ExternalLink, MapPin, Phone, Send, Sparkles } from "lucide-react";
import { NavMenu } from "@/components/nav-menu";
import type { ContentMap } from "@/lib/site";
import { getDriveImage } from "@/lib/drive";
import { renderRichText, plain } from "@/lib/text";
import { getYouTubeEmbed } from "@/lib/youtube";

export type HomepageViewProps = {
  content: ContentMap;
  hiddenKeys: string[];
  settings: {
    phones: string[];
    telegramUrl: string | null;
    facebookUrl: string | null;
    tiktokUrl: string | null;
    instagramUrl: string | null;
    logoRenderUrl: string | null;
    logoAlt: string | null;
    addressKh: string | null;
    hoursKh: string | null;
    footerTextKh: string | null;
  };
  subjects: { id: string; icon: string; nameKh: string; descriptionKh: string }[];
  testimonials: { id: string; nameKh: string; roleKh: string | null; quoteKh: string; rating: number }[];
  videos: { id: string; titleKh: string; youtubeId: string; youtubeUrl: string; thumbUrl: string; seriesKh: string | null; featured: boolean }[];
};

function external(url: string | null | undefined) {
  return url?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {};
}

// Renders the public homepage from a data snapshot. Every CMS-managed element
// carries data-cms-key so /preview's client bridge can live-edit it, and
// data-cms-hidden hides rows the admin turned off.
export function HomepageView({ content, hiddenKeys = [], settings, subjects, testimonials, videos }: HomepageViewProps) {
  const isHidden = (key: string) => hiddenKeys.includes(key);
  const hidden = (key: string) => (isHidden(key) ? { "data-cms-hidden": "true" } : {});

  const heroImage = getDriveImage(content["hero.imageDriveUrl"] ?? "");
  const aboutImage = getDriveImage(content["about.imageDriveUrl"] ?? "");
  const featured = videos.find((video) => video.featured) ?? videos[0];
  const formats = [1, 2, 3].map((number) => ({
    num: number,
    number: `0${number}`,
    title: content[`formats.${number}.title`],
    text: content[`formats.${number}.text`],
  }));
  const highlights = [1, 2, 3].map((number) => ({
    num: number,
    title: content[`highlights.${number}.title`],
    text: content[`highlights.${number}.text`],
  }));

  return (
    <main className="site-shell">
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-links" data-cms-key="settings.phones">
            <span>☎ {settings.phones.join(" / ")}</span>
            {settings.telegramUrl && <a href={settings.telegramUrl} {...external(settings.telegramUrl)}>Telegram</a>}
          </div>
          <div className="social-links" aria-label="បណ្តាញសង្គម">
            {settings.facebookUrl && <a href={settings.facebookUrl} {...external(settings.facebookUrl)}>Facebook</a>}
            {settings.tiktokUrl && <a href={settings.tiktokUrl} {...external(settings.tiktokUrl)}>TikTok</a>}
            {settings.instagramUrl && <a href={settings.instagramUrl} {...external(settings.instagramUrl)}>Instagram</a>}
          </div>
        </div>
      </div>

      <header className="nav">
        <div className="container nav-inner">
          <a className="brand" href="#home" aria-label="DR.MATHS ទំព័រដើម">
            <img src={settings.logoRenderUrl ?? "/logo.jpg"} alt={settings.logoAlt ?? "DR.MATHS"} width="38" height="38" style={{ objectFit: "contain", borderRadius: 8 }} referrerPolicy="no-referrer" />
            <span>DR.MATHS</span>
          </a>
          <NavMenu
            links={[
              { href: "#home", label: content["nav.home"], cmsKey: "nav.home" },
              { href: "#about", label: content["nav.about"], cmsKey: "nav.about" },
              { href: "#subjects", label: content["nav.subjects"], cmsKey: "nav.subjects" },
              { href: "#videos", label: content["nav.videos"], cmsKey: "nav.videos" },
              { href: "#contact", label: content["nav.contact"], cmsKey: "nav.contact" },
            ]}
            ctaLabel={content["nav.cta"]}
            ctaHref={content["nav.ctaUrl"]}
            hiddenKeys={hiddenKeys}
          />
        </div>
      </header>

      <section id="home" className="hero paper-grid">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow" data-cms-key="hero.eyebrow">{content["hero.eyebrow"]}</p>
            <h1
              className="display"
              data-cms-key="hero.title"
              data-cms-rich="true"
              dangerouslySetInnerHTML={{ __html: renderRichText(content["hero.title"]) }}
            />
            <p className="hero-copy" data-cms-key="hero.description" data-cms-rich="true">{content["hero.description"]}</p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href={content["hero.primaryUrl"]}
                data-cms-href="hero.primaryUrl"
                data-cms-item="hero.primaryLabel"
                {...hidden("hero.primaryLabel")}
                {...external(content["hero.primaryUrl"])}
              >
                <span data-cms-key="hero.primaryLabel">{content["hero.primaryLabel"]}</span>
                <Send size={17} aria-hidden="true" />
              </a>
              <a
                className="button button-secondary"
                href={content["hero.secondaryUrl"]}
                data-cms-href="hero.secondaryUrl"
                data-cms-item="hero.secondaryLabel"
                {...hidden("hero.secondaryLabel")}
              >
                <BookOpen size={17} aria-hidden="true" />
                <span data-cms-key="hero.secondaryLabel">{content["hero.secondaryLabel"]}</span>
              </a>
            </div>
            <p className="hero-hash" data-cms-key="hero.hashtag">{content["hero.hashtag"]}</p>
          </div>
          <div className="hero-art" aria-label="ផ្ទាំងរូបភាព DR.MATHS">
            <div className="hero-poster" data-cms-item="hero.imageDriveUrl" {...hidden("hero.imageDriveUrl")}>
              <img
                src={heroImage?.renderUrl ?? "/images/Photo-A.jpg"}
                data-default-src="/images/Photo-A.jpg"
                alt={heroImage ? "រូបភាពសកម្មភាពសិក្សា DR.MATHS" : "ផ្ទាំងរូបភាព DR.MATHS"}
                data-cms-key="hero.imageDriveUrl"
                data-drive-original={content["hero.imageDriveUrl"] || ""}
                referrerPolicy="no-referrer"
              />
              <div className="hero-poster-chip" aria-hidden="true">
                <span className="chalk-equation">x² + y² = ?</span>
                <span className="chalk-note">គិត • យល់ • ជឿជាក់</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats" aria-label="ស្ថិតិ DR.MATHS">
        <div className="container stats-grid">
          {[1, 2, 3, 4].map((number) => {
            const valKey = `stats.${number}.value`;
            const lblKey = `stats.${number}.label`;
            const hideCard = isHidden(valKey) && isHidden(lblKey);
            return (
              <div
                className="stat"
                key={number}
                data-cms-card={`${valKey} ${lblKey}`}
                {...(hideCard ? { "data-cms-hidden": "true" } : {})}
              >
                <div className="stat-value" data-cms-key={valKey} {...hidden(valKey)}>{content[valKey]}</div>
                <div className="stat-label" data-cms-key={lblKey} {...hidden(lblKey)}>{content[lblKey]}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="about" className="section">
        <div className="container">
          <p className="eyebrow" data-cms-key="about.eyebrow">{content["about.eyebrow"]}</p>
          <h2 className="display section-title" data-cms-key="about.title">{content["about.title"]}</h2>
          <div className="about-grid" style={{ marginTop: "2rem" }}>
            <div style={{ display: "grid", gap: "1rem" }}>
              <article className="info-card" data-cms-item="about.vision" data-cms-card="about.vision about.visionTitle" {...hidden("about.vision")}>
                <h3 data-cms-key="about.visionTitle">{content["about.visionTitle"]}</h3>
                <p data-cms-key="about.vision" data-cms-rich="true">{content["about.vision"]}</p>
              </article>
              <article className="info-card" data-cms-item="about.mission" data-cms-card="about.mission about.missionTitle" {...hidden("about.mission")}>
                <h3 data-cms-key="about.missionTitle">{content["about.missionTitle"]}</h3>
                <p data-cms-key="about.mission" data-cms-rich="true">{content["about.mission"]}</p>
              </article>
            </div>
            <article className="about-long" data-cms-item="about.long" {...hidden("about.long")}>
              <Sparkles color="#FFB703" size={25} aria-hidden="true" />
              <img
                className="about-photo"
                src={aboutImage?.renderUrl ?? "/images/A-2025_only.jpg"}
                data-default-src="/images/A-2025_only.jpg"
                alt={aboutImage ? "រូបភាពសកម្មភាពសិក្សា DR.MATHS" : "រូបភាព DR.MATHS"}
                loading="lazy"
                referrerPolicy="no-referrer"
                data-cms-key="about.imageDriveUrl"
                data-drive-original={content["about.imageDriveUrl"] || ""}
              />
              <p data-cms-key="about.long" data-cms-rich="true">{plain(content["about.long"])}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="subjects" className="section paper-grid" style={{ backgroundColor: "#f7f9ff" }}>
        <div className="container">
          <p className="eyebrow" data-cms-key="subjects.eyebrow">{content["subjects.eyebrow"]}</p>
          <h2 className="display section-title" data-cms-key="subjects.title">{content["subjects.title"]}</h2>
          <div className="subject-grid">
            {subjects.map((subject) => (
              <article className="subject-card" key={subject.id}>
                <div className="subject-icon">{subject.icon}</div>
                <h3>{subject.nameKh}</h3>
                <p>{subject.descriptionKh}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow" data-cms-key="formats.eyebrow">{content["formats.eyebrow"]}</p>
          <h2 className="display section-title" data-cms-key="formats.title">{content["formats.title"]}</h2>
          <div className="format-grid">
            {formats.map((format) => {
              const titleKey = `formats.${format.num}.title`;
              const textKey = `formats.${format.num}.text`;
              const hideCard = isHidden(titleKey) && isHidden(textKey);
              return (
                <article
                  className="format-card"
                  key={format.number}
                  data-cms-card={`${titleKey} ${textKey}`}
                  {...(hideCard ? { "data-cms-hidden": "true" } : {})}
                >
                  <div className="format-number">{format.number}</div>
                  <h3 data-cms-key={titleKey} {...hidden(titleKey)}>{format.title}</h3>
                  <p data-cms-key={textKey} data-cms-rich="true" {...hidden(textKey)}>{format.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="videos" className="section video-section">
        <div className="container">
          <p className="eyebrow" data-cms-key="videos.eyebrow">{content["videos.eyebrow"]}</p>
          <h2 className="display section-title" data-cms-key="videos.title">{content["videos.title"]}</h2>
          <p className="section-lead" data-cms-key="videos.description" data-cms-rich="true">{content["videos.description"]}</p>
          <div className="video-layout">
            <div id="featured-video" className="player-frame">
              {featured ? (
                <iframe
                  title={featured.titleKh}
                  src={getYouTubeEmbed(featured.youtubeId)}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="player-empty">
                  <span>
                    <BookOpen size={36} aria-hidden="true" />
                    <br />
                    វីដេអូមេរៀននឹងបង្ហាញនៅទីនេះ បន្ទាប់ពីអ្នកគ្រប់គ្រងផ្សាយវីដេអូដំបូង។
                  </span>
                </div>
              )}
            </div>
            <div className="video-list">
              {videos.length ? (
                videos.map((video) => (
                  <a className="video-card" key={video.id} href={video.youtubeUrl} {...external(video.youtubeUrl)}>
                    <img className="video-thumb" src={video.thumbUrl} alt={`រូបតូច ${video.titleKh}`} loading="lazy" />
                    <div>
                      <h3>{video.titleKh}</h3>
                      <p>{video.seriesKh ?? "វីដេអូមេរៀន"} <ExternalLink size={12} aria-hidden="true" /></p>
                    </div>
                  </a>
                ))
              ) : (
                <p style={{ color: "rgba(255,255,255,.68)" }}>មិនទាន់មានវីដេអូដែលបានផ្សាយទេ។</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow" data-cms-key="highlights.eyebrow">{content["highlights.eyebrow"]}</p>
          <h2 className="display section-title" data-cms-key="highlights.title">{content["highlights.title"]}</h2>
          <div className="highlight-grid">
            {highlights.map((highlight) => {
              const titleKey = `highlights.${highlight.num}.title`;
              const textKey = `highlights.${highlight.num}.text`;
              const hideCard = isHidden(titleKey) && isHidden(textKey);
              return (
                <article
                  className="highlight-card"
                  key={highlight.num}
                  data-cms-card={`${titleKey} ${textKey}`}
                  {...(hideCard ? { "data-cms-hidden": "true" } : {})}
                >
                  <span className="format-number">{`0${highlight.num}`}</span>
                  <h3 data-cms-key={titleKey} {...hidden(titleKey)}>{highlight.title}</h3>
                  <p data-cms-key={textKey} data-cms-rich="true" {...hidden(textKey)}>{highlight.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section paper-grid" style={{ backgroundColor: "#f7f9ff" }}>
        <div className="container">
          <p className="eyebrow" data-cms-key="testimonials.eyebrow">{content["testimonials.eyebrow"]}</p>
          <h2 className="display section-title" data-cms-key="testimonials.title">{content["testimonials.title"]}</h2>
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <article className="testimonial" key={testimonial.id}>
                <div className="stars" aria-label={`${testimonial.rating} ផ្កាយ`}>{"★".repeat(testimonial.rating)}</div>
                <blockquote>“{testimonial.quoteKh}”</blockquote>
                <strong>{testimonial.nameKh}</strong>
                <br />
                <small>{testimonial.roleKh}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section contact">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow" data-cms-key="contact.eyebrow">{content["contact.eyebrow"]}</p>
            <h2 className="display" data-cms-key="contact.title">{content["contact.title"]}</h2>
            <p data-cms-key="contact.description" data-cms-rich="true">{content["contact.description"]}</p>
            <a
              className="button button-primary"
              href={settings.telegramUrl ?? content["hero.primaryUrl"]}
              data-cms-href="hero.primaryUrl"
              {...external(settings.telegramUrl ?? content["hero.primaryUrl"])}
            >
              <span data-cms-key="contact.cta">{content["contact.cta"]}</span>
              <Send size={17} aria-hidden="true" />
            </a>
          </div>
          <aside className="contact-card">
            <h3 style={{ marginTop: 0 }}>ព័ត៌មានទំនាក់ទំនង</h3>
            <p><Phone size={16} aria-hidden="true" style={{ verticalAlign: "middle" }} /> {settings.phones.join(" / ")}</p>
            <p><MapPin size={16} aria-hidden="true" style={{ verticalAlign: "middle" }} /> {settings.addressKh}</p>
            <p>⏰ {settings.hoursKh}</p>
          </aside>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <a className="brand" href="#home">
              <img src={settings.logoRenderUrl ?? "/logo.jpg"} alt="DR.MATHS" width="32" height="32" style={{ objectFit: "contain", borderRadius: 6 }} />
              <span>DR.MATHS</span>
            </a>
            <p data-cms-key="settings.footerTextKh">{settings.footerTextKh}</p>
          </div>
          <div className="social-links">
            {settings.telegramUrl && <a href={settings.telegramUrl} {...external(settings.telegramUrl)}>Telegram</a>}
            {settings.facebookUrl && <a href={settings.facebookUrl} {...external(settings.facebookUrl)}>Facebook</a>}
            {settings.tiktokUrl && <a href={settings.tiktokUrl} {...external(settings.tiktokUrl)}>TikTok</a>}
          </div>
        </div>
      </footer>
    </main>
  );
}
