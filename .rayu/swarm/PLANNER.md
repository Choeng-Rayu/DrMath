Plan validated against the actual code and written. Summary of findings and the few corrections to your design:

**Your design is largely correct.** Validated and refined on these points grounded in the real files:

1. **CSP is a real but manageable risk** (`next.config.ts`): global `frame-ancestors 'self'` + `X-Frame-Options: SAMEORIGIN`. Same-origin self-embed is normally allowed, but must be browser-tested; keep global policy intact and only relax `frame-ancestors` for `/preview` per-route if blocked. `script-src 'unsafe-inline'` + `connect-src 'self'` already permit postMessage — confirmed safe.

2. **Middleware must expand**: current `matcher: ["/admin/:path*"]` leaves `/preview` **unprotected**. Add `/preview` to the matcher and guard it. Edge runtime is fine (NextAuth edge `auth()` already used).

3. **`saveContentAction` has exactly one consumer** (`src/app/admin/content/page.tsx` L1/L39) — safe to split into draft/publish/discard. **Correction:** its `mediaAsset.upsert` IMAGE logic must move into `publishContentAction`, not the draft action.

4. **Confirmed the latent `visible` bug**: `getSiteData` (site.ts L112) builds `[row.key, row.value]` and drops `visible`. Your `data-cms-hidden` approach correctly fixes it — build a `hiddenKeys` set from `visible:false` rows.

5. **No hydration risk** extracting `HomepageView` if kept a **server component** (your plan). Keep `generateMetadata` + `force-dynamic` in `page.tsx`. `data-cms-key` is pure server render.

6. **postMessage confirmed best** — `/preview` is same-origin; your hybrid (server-rendered draft snapshot + client bridge overlaying keystrokes) beats polling/URL-params.

7. **Migration safe** — nullable columns = simple ALTER on Supabase, no rewrite. Prisma returns all columns by default so `getAdminData` automatically includes drafts; the page must read the new fields.

8. **`scripts/smoke-test.ts` is pure `drive.ts`/`youtube.ts` tests** — unaffected.

**Revalidate rules (the critical correctness point):** draft saves → revalidate only `/preview` + `/admin/content` (never `/`); publish → revalidate `/`, `/preview`, `/admin/content`; discard → `/preview` + `/admin/content`. The existing `refreshPublic()` helper revalidates `/` + `/admin`, so it must NOT be called on draft save.

**One addition:** extract the `plain()` tag-strip helper into `src/lib/text.ts` so the client bridge can reuse it for rich-text live edits.

Plan: `/home/rayu/.rayu/plans/tingly-bouncing-dream-agent-ab34070e20cff4fce.md`. Shared brief: `/home/rayu/DR_Math/.rayu/swarm/shared.json` (3 domains: frontend, backend, security).
