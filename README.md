# DR.MATHS Education Center

A **Khmer-first, mobile-first education website** with a private CMS. The public landing page is driven by editable database content, while the `/admin` workspace allows a trusted administrator to update site copy, contacts, Google Drive image links, subjects, testimonials, and YouTube series videos without changing source code.

## Architecture

| Concern | Implementation |
|---|---|
| Public site | Next.js 15 App Router, TypeScript, Tailwind CSS, Khmer fonts, responsive CSS |
| CMS login | Auth.js Credentials provider with one bcrypt-hashed administrator account |
| Data | Prisma ORM with Supabase PostgreSQL |
| Images | A dedicated owner-managed Google Drive folder; admins paste a public Drive sharing link into the CMS |
| Video lessons | A YouTube URL parser, thumbnail preview, `youtube-nocookie.com` player, published/featured/order controls |
| Hosting | Vercel for the Next.js application, with Supabase holding persistent data |

> **Mobile-first behavior:** The public page is designed first for phone users. At smaller widths, the desktop menu becomes a touch-friendly disclosure menu, the header remains single-line, the hero becomes one column, and content grids collapse to two or one columns. A tested 390 × 844 phone rendering is saved in `verification/mobile-home-refined.png`.

## Local setup

Install dependencies and copy the environment template. `DATABASE_URL`, `AUTH_SECRET`, and the first administrator credentials must be set before using the protected CMS.

```bash
npm install
cp .env.example .env
npm run db:generate
npm run dev
```

Open `http://localhost:3000` to view the public site. When the Supabase database values are in `.env`, create the database tables and initial editable data with the following commands.

```bash
npm run db:migrate -- --name init_drmaths
npm run db:seed
```

The public page has a presentation-only fallback for initial local development. The administrator login and CMS write operations require a working PostgreSQL connection and a seeded admin account.

## Environment variables

| Variable | Use | Where it belongs |
|---|---|---|
| `DATABASE_URL` | Supabase pooled PostgreSQL connection string used at runtime | `.env` and Vercel environment variables |
| `DIRECT_URL` | Direct PostgreSQL connection used for migrations if needed | Local migration environment only |
| `AUTH_SECRET` | Long random secret for signed Auth.js sessions | `.env` and Vercel environment variables |
| `AUTH_URL` | The local or deployed application URL | `.env` and Vercel environment variables |
| `ADMIN_EMAIL` | Seed email for the first CMS administrator | Local seed environment only |
| `ADMIN_PASSWORD` | Strong temporary seed password; change it after the first login | Local seed environment only |
| `ADMIN_NAME` | Display name of the first administrator | Local seed environment only |
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL after deployment | Vercel environment variables |

Never commit `.env`, passwords, database URLs, or the authentication secret. The repository’s `.env.example` contains safe placeholder values only.

## Google Drive image workflow

The initial website does **not** upload image bytes to Vercel or require source-code changes. To publish a logo, hero photo, or other site image, the administrator follows this process.

1. Upload the image to the dedicated DR.MATHS Google Drive folder.
2. In Drive, set the individual file’s access to **Anyone with the link**.
3. Copy its Drive sharing URL, for example `https://drive.google.com/file/d/FILE_ID/view`.
4. Paste the URL into the relevant CMS image field. The CMS extracts the file ID and renders a preview before the form is saved.

The public website loads the Drive image directly rather than proxying it through Vercel, which keeps the initial deployment lightweight. Google Drive is suitable for the requested free initial workflow, but it is not a content-delivery network; if the site becomes heavily used or an image stops serving, migrate the affected images to a storage/CDN service such as Supabase Storage without changing the page architecture.

## YouTube series workflow

In `/admin/videos`, paste a public YouTube URL in any of these forms: `watch?v=`, `youtu.be`, `/shorts/`, or `/embed/`. The form immediately extracts the video ID, displays a thumbnail and privacy-enhanced embed preview, and accepts a Khmer title, series label, display order, publication state, and featured state. Saving a published video updates the public landing page on the next request.

## Deploying with Supabase Free and Vercel Hobby

Create a Supabase project, retrieve its PostgreSQL connection values, and run the migration and seed commands from a controlled local environment before the first deployment. The deployed Vercel application needs the runtime `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, and `NEXT_PUBLIC_SITE_URL`; do not run migrations automatically from every production build.

Create a Vercel project from this repository and set the same runtime variables in the **Production** environment. Use `npm run db:generate && npm run build` as the build command if Vercel does not detect the Prisma client generation automatically. After Vercel provides the production URL, update `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to that URL, redeploy, then sign in to `/admin` and change the bootstrap password.

Vercel’s current Hobby plan is intended for personal, non-commercial use, so it is appropriate for an eligible preview or personal test deployment but should not be assumed to cover public commercial operation of an education business. Review the current plan and fair-use terms before launch. [1] [2]

| Pre-launch check | Expected result |
|---|---|
| Public page at phone width | Navigation, CTAs, Khmer copy, cards, and video section fit without horizontal scrolling |
| `/admin` while signed out | Redirects to `/admin/login` |
| Sign-in | Uses the seeded administrator credentials and reaches the dashboard |
| Google Drive image | Preview works and the published image is accessible without a Google login |
| YouTube video | Supported URL previews correctly; published video appears publicly; unpublished video does not |
| Content save | Updated text, settings, subject, testimonial, or video appears publicly after save |
| Deployment | Production URL loads with the configured `AUTH_URL` and Supabase runtime database URL |

## References

[1] [Vercel Hobby Plan](https://vercel.com/docs/plans/hobby)

[2] [Vercel Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
