# Spear Line — site analysis and plan to finish

> **Status, 26 October 2026 (V7).** Done in code: icon, symbol and favicon set (Q2); SEO machinery behind a launch switch (B3, Q1, Q10); CSP cleanup (Q3, Unsplash removed); three new pages and a shared file manifest (Q5); font and motion upgrade; browser-checked on 12 pages × 4 widths (part of Q6). Still needing the owner: business details and enquiry hosting (B1, B2, Q7), real content and photography (B4), Club decision (Q9), legal review (Q8), and a real-device, axe and Lighthouse pass (rest of Q6). See `VALIDATION.md`.

Analysed 26 October 2026 at commit `4c54efb` (V6). `npm run check` and `npm test` pass (16/16).

## 1. What exists

A static, dependency-free, 10-page site (home, vehicles, supplies, logistics, about, club, enquire, privacy, 404, plus the `timber-logistics` alias). Built from `scripts/render-pages.mjs` into `public/`, then mirrored to the repo root for GitHub Pages (`scripts/pages-root.mjs`). It has a polished visual layer (13 generated images, self-hosted fonts, a motion system, mobile nav) and a Node server with a validated, privacy-minded enquiry endpoint that is switched off by default.

Strong points: accessibility groundwork (skip link, focus handling, reduce-motion control, readable no-JS fallbacks), honest copy (no invented claims, imagery disclosed as AI-generated), shared client/server validation, security headers and CSP on the Node server, and a sync check that stops the two output folders drifting.

## 2. Findings: what blocks "finished"

**Blockers (the site cannot do its job yet)**

| # | Finding | Evidence |
|---|---|---|
| B1 | **No working way to contact the business.** Submission is off, and no email, phone, WhatsApp or address is configured. The "enquiry" is a downloadable text file the visitor must send somehow, to someone whose address is not on the site. | `site-config.js` is all empty; the enquire page says "Online submission is not currently open" |
| B2 | **GitHub Pages cannot run the enquiry server.** Even if `.env` is filled in, `server.mjs` is not deployed by the Pages workflow. Production needs a host that runs Node, or a form backend. | Only `.github/workflows/check.yml` exists; no deploy step |
| B3 | **The site is hidden from search and has no real identity.** Every page has `noindex,nofollow` and `robots.txt` says `Disallow: /`. No legal business name, no address, no canonical URL. | `grep noindex` hits all 10 pages |
| B4 | **Placeholder-grade content.** Imagery is entirely AI-generated; there is no real inventory, no real vehicles, no team, no proof (references, years, locations served). About and service pages are copy about "listening" rather than what is actually offered. | `ASSETS.md`, footer disclosure |

**Quality gaps**

| # | Finding |
|---|---|
| Q1 | SEO basics missing: no canonical, no `og:image`/`og:url`/`twitter:card`, no `sitemap.xml`, no JSON-LD (`Organization`, `Service`). Titles are fine; descriptions are generic. |
| Q2 | Favicon is the white transparent logo (`spear-line-logo.png`), which disappears on light browser tabs. No `apple-touch-icon` or web manifest. |
| Q3 | CSP in `server.mjs` still allows `https://images.unsplash.com`; no remote images are used. Static hosting (Pages) cannot send these headers at all, so a `<meta>` CSP or a different host is needed. |
| Q4 | Four render-blocking requests on first paint (three CSS files, `boot.js`) and ~95 KB of CSS/JS in total, plus a `?v=6.3` cache-busting string hand-maintained in the generator. Images are ~3.5 MB for the whole `public/`; individual files are under 280 KB, so this is acceptable, but the hero and mobile hero need a measured LCP. |
| Q5 | Source is hard to maintain: HTML pages, CSS and JS are minified or very long-line, so reviews and diffs are hard. `render-pages.mjs` is a single 74-line file holding all copy. |
| Q6 | Testing is structural only. No browser test covers the form flow, menu, tabs or gallery; no automated accessibility, Lighthouse or visual regression check. The V6 browser review was manual and did not use real iOS/Android devices. |
| Q7 | Operations undocumented as a runbook: the purge job (`scripts/purge-enquiries.mjs`) exists, but nothing schedules it; no backups, monitoring, spam control beyond the rate limiter and honeypot, no notification when an enquiry arrives. |
| Q8 | Legal/compliance: privacy page has no controller name or contact (depends on B1); no cookie/analytics statement is needed today but must be revisited if analytics are added; vehicle and food sales may need regional disclosures (import, licensing, food safety) — to be confirmed by the owner. |
| Q9 | The Club page is "coming soon" with no email capture, so the interest it generates is lost. Either collect interest properly or remove it from primary nav until it launches. |
| Q10 | `timber-logistics.html` is a retained alias; on static hosting it is a full duplicate page, not a redirect, which duplicates content for search engines. |

## 3. Decisions the owner must make first

These change the work; nothing below should be guessed.

1. **Business facts:** legal name, public email, phone/WhatsApp, address or service area, countries served, opening hours.
2. **Enquiry delivery:** (a) Node host with the existing server (needs hosting, `.env`, purge schedule), or (b) a form service/email provider with the static site. Recommendation: (a) on a small managed Node host with a persistent volume, because validation, retention and privacy handling are already built; add an email notification so enquiries are not missed.
3. **Domain:** the production URL and whether Pages stays the host for the public site.
4. **Imagery:** keep illustrative AI images with the disclosure, or replace with real photos (inventory, warehouse, vehicles, team).
5. **Club:** capture interest now, or hide until launch.
6. **Scope claims:** which vehicle makes, supply categories and routes can truthfully be named.

## 4. Plan

Order matters: each phase leaves the site shippable.

### Phase 0 — Inputs (owner)
Answer section 3. Nothing downstream is blocked except content and contact details.

### Phase 1 — Make it able to receive business (B1, B2, Q7)
1. Fill `site-config.js` and `.env` from the real details; set `legalName`, `email`, `phone`, `whatsapp`, `address`.
2. Deploy `server.mjs` (host chosen in decision 2). Set `ENQUIRIES_ENABLED=true`, `PUBLIC_ORIGIN` (HTTPS), `RETENTION_DAYS`, `DATA_DIR` on a persistent private volume outside `public/`.
3. Add an owner notification on each stored enquiry (email or webhook) and a visible success reference.
4. Schedule `scripts/purge-enquiries.mjs` daily; document backups and how the owner reads enquiries.
5. Keep the download-draft fallback and add a visible contact line (email / WhatsApp link) on the enquire page, footer and about page.
6. Tests: server tests for the notification path and the disabled/enabled switch; end-to-end submit against a local server.

### Phase 2 — Content and credibility (B4, Q9)
1. Replace generic copy with specifics: actual vehicle types and sourcing process, supply categories and minimum quantities, routes and cargo types, typical response time.
2. About page: who runs Spear Line, where it operates, why customers can trust it. Only verifiable facts.
3. Swap in real photographs where available; otherwise keep the AI disclosure on every page that uses them.
4. Club: add an interest-capture form that reuses the validated endpoint (new `club` service type, email only, own consent text), or drop it from the main nav.
5. Update `privacy.html` with controller name, contact route, retention period and the processor/host used.

### Phase 3 — Go public and be findable (B3, Q1, Q2, Q3, Q10)
1. Remove `noindex` from the generator and `Disallow: /` from `robots.txt`; add `Sitemap:`.
2. Per page: `<link rel="canonical">`, unique description, `og:image` (a 1200×630 crop of the hero), `og:url`, `twitter:card`.
3. Add `sitemap.xml` and JSON-LD `Organization` plus `Service` entries using the real details.
4. Favicon set: a dark-background or coloured logo mark as `favicon.ico`/SVG, `apple-touch-icon`, `site.webmanifest`.
5. Make `timber-logistics.html` a meta-refresh plus canonical to `logistics.html`, or remove it if no old links exist.
6. Remove unsplash from the CSP; add an equivalent `<meta http-equiv>` CSP only if it does not break the inline boot behaviour, else document that headers come from the Node host.
7. Add a staging check: the build fails if a page ships `noindex` while `PUBLIC_LAUNCH=true`.

### Phase 4 — Quality and performance (Q4, Q5, Q6)
1. Browser tests (Playwright is available) for: menu open/close/Escape, service tabs with arrow keys, gallery, accordion, form validation and submit, draft download, reduce-motion persistence, 320/390/768/1363 px with no horizontal overflow.
2. Add axe-core accessibility checks and a Lighthouse CI budget (LCP, CLS, total JS) to `check.yml`.
3. Measure and then reduce: inline critical CSS or merge the three stylesheets, defer non-essential scripts, confirm `fetchpriority` on the correct hero, hash-based asset names instead of `?v=6.3`.
4. Source hygiene: split `render-pages.mjs` into content data plus templates; keep generated HTML formatted; add a formatter and lint to `npm run check`.
5. Real-device pass on at least one iPhone and one Android phone.

### Phase 5 — Launch and keep running
1. Point the domain, confirm HTTPS, run the full check list below on production.
2. Submit the sitemap to Search Console; verify one real end-to-end enquiry arrives.
3. Add privacy-respecting uptime monitoring; add analytics only if wanted, and update `privacy.html` first.
4. Update README, VALIDATION.md and ASSETS.md for the launched state and write a short owner runbook (read enquiries, rotate secrets, restore, update content).

## 5. Launch checklist (done = all true)

- [ ] A visitor can submit an enquiry and the owner is notified within minutes
- [ ] Real contact details visible on enquire page, footer and privacy page
- [ ] Privacy page names the controller, retention period and host
- [ ] No `noindex`; sitemap, canonicals, OG image, JSON-LD present
- [ ] `npm run check`, `npm test`, browser tests and axe pass in CI
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95
- [ ] Verified on real iOS and Android devices
- [ ] Purge job scheduled; backup and restore tested
- [ ] All copy claims verified by the owner; imagery disclosure accurate

## 6. Prompt to give Claude to execute this

> You are finishing the Spear Line website in `cartelug/spear-line` on branch `claude/admiring-bell-10yfyh`. Read `docs/FINISH-PLAN.md`, `README.md`, `DESIGN.md`, `ASSETS.md` and `VALIDATION.md` first. Edit `scripts/render-pages.mjs` and `public/`, then run `npm run render:pages`; never edit the repo-root mirror by hand. Do not invent business facts, contact details, prices, inventory, testimonials or claims; where the plan needs the owner's input, stop and ask, or leave a clearly marked configuration value. Keep enquiries stored outside `public/`, keep the privacy page accurate to what the code does, and preserve accessibility and reduced-motion behaviour.
>
> Work phase by phase from section 4. After each phase: run `npm run check` and `npm test`, run the new browser tests, update `VALIDATION.md`, commit with a descriptive message, and push to the branch above. Do not open a pull request unless asked. Begin with Phase 1 using the details I supply; if any of section 3 is unanswered, proceed with Phases 3 (the parts that need no business facts), 4 and the structure of Phase 2, and list what is still blocked at the end.
