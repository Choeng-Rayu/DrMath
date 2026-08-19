import type { Metadata } from "next";
import { BookOpen, ExternalLink, MapPin, Phone, Send, Sparkles } from "lucide-react";
import { NavMenu } from "@/components/nav-menu";
import { getDriveImage } from "@/lib/drive";
import { getSiteData } from "@/lib/site";
import { getYouTubeEmbed } from "@/lib/youtube";

// The public page renders CMS content on every request. It must never be
// statically prerendered or cached, otherwise stale HTML (from build time or a
// previous content state) can be hydrated against a fresh RSC payload and
// throw a hydration mismatch error.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteData();
  return {
    title: settings.seoTitleKh || "DR.MATHS Education Center",
    description: settings.seoDescriptionKh || "មួយជំហានជាមួយ DR.MATHS = មួយជំហានជាមួយ A",
  };
}

function plain(value: string) {
  return value.replace(/<[^>]*>/g, "");
}

function external(url: string | null | undefined) {
  return url?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {};
}

export default async function Home() {
  const { content, settings, subjects, testimonials, videos } = await getSiteData();
  const heroImage = getDriveImage(content["hero.imageDriveUrl"] ?? "");
  const aboutImage = getDriveImage(content["about.imageDriveUrl"] ?? "");
  const featured = videos.find((video) => video.featured) ?? videos[0];
  const formats = [1, 2, 3].map((number) => ({
    number: `0${number}`,
    title: content[`formats.${number}.title`],
    text: content[`formats.${number}.text`],
  }));
  const highlights = [1, 2, 3].map((number) => ({
    title: content[`highlights.${number}.title`],
    text: content[`highlights.${number}.text`],
  }));

  return (
    <main className="site-shell">
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-links">
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
              { href: "#home", label: content["nav.home"] },
              { href: "#about", label: content["nav.about"] },
              { href: "#subjects", label: content["nav.subjects"] },
              { href: "#videos", label: content["nav.videos"] },
              { href: "#contact", label: content["nav.contact"] },
            ]}
            ctaLabel={content["nav.cta"]}
            ctaHref={content["nav.ctaUrl"]}
          />
        </div>
      </header>

      <section id="home" className="hero paper-grid">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">{content["hero.eyebrow"]}</p>
            <h1 className="display">{plain(content["hero.title"])}</h1>
            <p className="hero-copy">{content["hero.description"]}</p>
            <div className="hero-actions">
              <a className="button button-primary" href={content["hero.primaryUrl"]} {...external(content["hero.primaryUrl"])}>{content["hero.primaryLabel"]}<Send size={17} aria-hidden="true" /></a>
              <a className="button button-secondary" href={content["hero.secondaryUrl"]}><BookOpen size={17} aria-hidden="true" />{content["hero.secondaryLabel"]}</a>
            </div>
            <p className="hero-hash">{content["hero.hashtag"]}</p>
          </div>
          <div className="hero-art" aria-label="ផ្ទាំងរូបភាព DR.MATHS">
            <div className="hero-poster">
              <img src={heroImage?.renderUrl ?? "/images/Photo-A.jpg"} alt={heroImage ? "រូបភាពសកម្មភាពសិក្សា DR.MATHS" : "ផ្ទាំងរូបភាព DR.MATHS"} referrerPolicy="no-referrer" />
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
          {[1, 2, 3, 4].map((number) => <div className="stat" key={number}><div className="stat-value">{content[`stats.${number}.value`]}</div><div className="stat-label">{content[`stats.${number}.label`]}</div></div>)}
        </div>
      </section>

      <section id="about" className="section">
        <div className="container">
          <p className="eyebrow">{content["about.eyebrow"]}</p>
          <h2 className="display section-title">{content["about.title"]}</h2>
          <div className="about-grid" style={{ marginTop: "2rem" }}>
            <div style={{ display: "grid", gap: "1rem" }}>
              <article className="info-card"><h3>{content["about.visionTitle"]}</h3><p>{content["about.vision"]}</p></article>
              <article className="info-card"><h3>{content["about.missionTitle"]}</h3><p>{content["about.mission"]}</p></article>
            </div>
            <article className="about-long">
              <Sparkles color="#FFB703" size={25} aria-hidden="true" />
              <img className="about-photo" src={aboutImage?.renderUrl ?? "/images/A-2025_only.jpg"} alt={aboutImage ? "រូបភាពសកម្មភាពសិក្សា DR.MATHS" : "រូបភាព DR.MATHS"} loading="lazy" referrerPolicy="no-referrer" />
              <p>{plain(content["about.long"])}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="subjects" className="section paper-grid" style={{ backgroundColor: "#f7f9ff" }}>
        <div className="container">
          <p className="eyebrow">{content["subjects.eyebrow"]}</p>
          <h2 className="display section-title">{content["subjects.title"]}</h2>
          <div className="subject-grid">
            {subjects.map((subject) => <article className="subject-card" key={subject.id}><div className="subject-icon">{subject.icon}</div><h3>{subject.nameKh}</h3><p>{subject.descriptionKh}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">{content["formats.eyebrow"]}</p>
          <h2 className="display section-title">{content["formats.title"]}</h2>
          <div className="format-grid">
            {formats.map((format) => <article className="format-card" key={format.number}><div className="format-number">{format.number}</div><h3>{format.title}</h3><p>{format.text}</p></article>)}
          </div>
        </div>
      </section>

      <section id="videos" className="section video-section">
        <div className="container">
          <p className="eyebrow">{content["videos.eyebrow"]}</p>
          <h2 className="display section-title">{content["videos.title"]}</h2>
          <p className="section-lead">{content["videos.description"]}</p>
          <div className="video-layout">
            <div id="featured-video" className="player-frame">
              {featured ? <iframe title={featured.titleKh} src={getYouTubeEmbed(featured.youtubeId)} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <div className="player-empty"><span><BookOpen size={36} aria-hidden="true" /><br />វីដេអូមេរៀននឹងបង្ហាញនៅទីនេះ បន្ទាប់ពីអ្នកគ្រប់គ្រងផ្សាយវីដេអូដំបូង។</span></div>}
            </div>
            <div className="video-list">
              {videos.length ? videos.map((video) => <a className="video-card" key={video.id} href={video.youtubeUrl} {...external(video.youtubeUrl)}><img className="video-thumb" src={video.thumbUrl} alt={`រូបតូច ${video.titleKh}`} loading="lazy" /><div><h3>{video.titleKh}</h3><p>{video.seriesKh ?? "វីដេអូមេរៀន"} <ExternalLink size={12} aria-hidden="true" /></p></div></a>) : <p style={{ color: "rgba(255,255,255,.68)" }}>មិនទាន់មានវីដេអូដែលបានផ្សាយទេ។</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">{content["highlights.eyebrow"]}</p>
          <h2 className="display section-title">{content["highlights.title"]}</h2>
          <div className="highlight-grid">{highlights.map((highlight, index) => <article className="highlight-card" key={highlight.title}><span className="format-number">{`0${index + 1}`}</span><h3>{highlight.title}</h3><p>{highlight.text}</p></article>)}</div>
        </div>
      </section>

      <section className="section paper-grid" style={{ backgroundColor: "#f7f9ff" }}>
        <div className="container">
          <p className="eyebrow">{content["testimonials.eyebrow"]}</p>
          <h2 className="display section-title">{content["testimonials.title"]}</h2>
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => <article className="testimonial" key={testimonial.id}><div className="stars" aria-label={`${testimonial.rating} ផ្កាយ`}>{"★".repeat(testimonial.rating)}</div><blockquote>“{testimonial.quoteKh}”</blockquote><strong>{testimonial.nameKh}</strong><br /><small>{testimonial.roleKh}</small></article>)}
          </div>
        </div>
      </section>

      <section id="contact" className="section contact">
        <div className="container contact-grid">
          <div><p className="eyebrow">{content["contact.eyebrow"]}</p><h2 className="display">{content["contact.title"]}</h2><p>{content["contact.description"]}</p><a className="button button-primary" href={settings.telegramUrl ?? content["hero.primaryUrl"]} {...external(settings.telegramUrl ?? content["hero.primaryUrl"])}>{content["contact.cta"]}<Send size={17} aria-hidden="true" /></a></div>
          <aside className="contact-card"><h3 style={{ marginTop: 0 }}>ព័ត៌មានទំនាក់ទំនង</h3><p><Phone size={16} aria-hidden="true" style={{ verticalAlign: "middle" }} /> {settings.phones.join(" / ")}</p><p><MapPin size={16} aria-hidden="true" style={{ verticalAlign: "middle" }} /> {settings.addressKh}</p><p>⏰ {settings.hoursKh}</p></aside>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid"><div><a className="brand" href="#home"><img src="/logo.jpg" alt="DR.MATHS" width="32" height="32" style={{ objectFit: "contain", borderRadius: 6 }} /><span>DR.MATHS</span></a><p>{settings.footerTextKh}</p></div><div className="social-links">{settings.telegramUrl && <a href={settings.telegramUrl} {...external(settings.telegramUrl)}>Telegram</a>}{settings.facebookUrl && <a href={settings.facebookUrl} {...external(settings.facebookUrl)}>Facebook</a>}{settings.tiktokUrl && <a href={settings.tiktokUrl} {...external(settings.tiktokUrl)}>TikTok</a>}</div></div>
      </footer>
    </main>
  );
}
