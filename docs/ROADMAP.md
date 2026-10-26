# Spear Line roadmap to launch and beyond

Replaces the early analysis in `FINISH-PLAN.md`. Everything under "Measured" was run on 26 October 2026 against the real pages; everything under "Needs you" cannot be completed by anyone but the owner.

## 1. Where the site stands (measured)

| Area | Result | How |
| --- | --- | --- |
| Accessibility | axe-core: 0 violations on 12 pages × phone and desktop, with and without Reduce motion. Lighthouse accessibility 100 | WCAG 2.0–2.2 A/AA and best-practice rule sets |
| Performance (phone, throttled) | 91–96, CLS 0.001 | Lighthouse against the Node server, after the V9 redesign |
| Performance (desktop) | 99–100 | Lighthouse |
| Best practices | 100 | Lighthouse |
| SEO | 63–66 by default only because pages are deliberately `noindex`; launch mode adds canonical, share tags, structured data and sitemap | Lighthouse |
| Layout | No horizontal overflow 320–1920 px on 12 pages; 200% zoom holds | Playwright sweep |
| Security | Security review of the branch: no high-confidence findings | Static review of build, client scripts and server |
| Tests | 32 unit and server tests plus 7 browser tests pass | `npm test`, `npm run test:e2e` |

V9 (the golden-hour redesign: blended photographic sections, glass cards, Hubot/Mona Sans, logo preloader, single content file) replaced the V8 visual language; see `DESIGN.md` and `CONTENT.md`.

## 2. What only the owner can unblock

| # | Decision or input | Unblocks | Default if you say nothing |
| --- | --- | --- | --- |
| 1 | Legal business name, public email, phone, WhatsApp, address or service area | Contact page, footer, privacy page, structured data | Contact page shows an honest empty state |
| 2 | Production domain | Canonical links, sitemap, share cards | Site stays `noindex` |
| 3 | Enquiry hosting: a small managed Node host with a persistent volume (recommended) or a form service | Real enquiries, owner notification | Form prepares a downloadable draft only |
| 4 | Real photographs of vehicles, stock, team and premises | Replacing illustrative AI imagery | AI imagery stays, disclosed in the footer |
| 5 | What the Bar will be: location, opening details, menu, whether it serves alcohol, local licensing | Replacing the three "To be announced" cards | Page stays a teaser |
| 6 | Which vehicle makes, supply categories and routes can be named truthfully | Specific service copy and richer SEO | Copy stays general |
| 7 | Legal and compliance review: import, food safety, alcohol licensing, privacy by market | Final privacy and FAQ text | Current copy makes no regulated claims |

## 3. Phased plan

Each phase leaves the site shippable. Items marked ✅ are already done.

### Phase A — Foundations ✅
Symbol, icon sprite, favicon and share assets; new type system; V9 redesign with one content file (`content/site.mjs`) and empty slots for inventory, stats, testimonials, partners and team; How it works, FAQ, Contact, Bar pages; motion layer with Reduce motion; launch switch; shared file manifest; CSS bundle; compression; accessibility, performance and security passes; documentation and tests.

### Phase B — Make it receive business (needs #1 and #3)
Built and tested without your details: the owner-notification webhook (`NOTIFY_WEBHOOK_URL`), `/healthz`, the Dockerfile and `docs/DEPLOY.md`. Still needed: your business details, the host, and a real end-to-end enquiry on that host.
1. Deploy `server.mjs` on a Node host; set `ENQUIRIES_ENABLED`, `PUBLIC_ORIGIN` (HTTPS), `BUSINESS_LEGAL_NAME`, `PUBLIC_CONTACT_EMAIL`, `RETENTION_DAYS`, `DATA_DIR` on a private volume.
2. Add an owner notification when an enquiry is stored (email or webhook), and show the reference to the visitor.
3. Schedule `scripts/purge-enquiries.mjs` daily; document backup and restore; test both.
4. Fill `site-config.js`; confirm the Contact page cards, footer and privacy text switch on.
5. Add an end-to-end test: submit against a local server, check the stored file and notification.
Exit test: a real enquiry arrives in the owner's inbox within minutes.

### Phase C — Go public (needs #2)
1. `SITE_ORIGIN=https://… SITE_LAUNCH=1 npm run build`; deploy.
2. Submit `sitemap.xml` in Search Console; verify the property.
3. Re-run Lighthouse and axe on production; keep scores at or above Section 1.
4. Add privacy-respecting uptime monitoring. Add analytics only if wanted, and update the privacy page first.
Exit test: Lighthouse SEO 100 and a canonical, indexable page set on the live domain.

### Phase D — Credibility (needs #4, #6, #7)
1. Replace generic copy with specifics the owner confirms: makes, categories, minimums, routes, typical response time.
2. Real photography with alt text; keep the AI-imagery note on any page that still uses illustrations.
3. About page: who runs Spear Line and where, using verifiable facts only. No invented testimonials, counts or client logos.
4. Local-business structured data once an address exists.

### Phase E — The Bar (needs #5)
1. Replace "To be announced" cards with real details as each is decided.
2. If interest capture is wanted, add a `bar` interest form on the validated endpoint with its own consent text; otherwise leave it as a teaser.
3. Confirm licensing and age-gating wording with a professional before promoting any drinks.

### Phase F — Quality gates in CI
Done: a `browser` CI job runs Playwright tests with axe (12 pages × phone and desktop, with and without Reduce motion), overflow checks at four widths, the hero note, the draft flow, menu, FAQ, timeline and Reduce motion. Still open: a Lighthouse budget job, real devices, Safari and Firefox, and screen-reader passes.
1. Add Playwright browser tests to `check.yml` (menu, tabs, FAQ, form, Reduce motion, no overflow at four widths).
2. Add axe and a Lighthouse budget (performance ≥ 90 on phone, accessibility 100, no regressions) as a CI job.
3. Test on real iPhone and Android devices, Safari and Firefox; fix any divergences.
4. Add a screen-reader pass (VoiceOver and TalkBack) of home, FAQ and the enquiry form.

### Phase G — Growth (after launch)
Targeted landing pages per service and market, backed by real keywords and content; case studies once real; analytics-driven copy changes; email follow-up for enquiries; localisation if serving several languages.

## 4. Skills and tools

Already used here: axe-core, Lighthouse, Playwright, the security-review skill. Offered for install: `frontend-design`, `rampstack-seo` (technical and on-page SEO), `design-skills` (UX writing, critique, journey mapping), Website Copywriting & Positioning, `brand-studio`, and Anthropic's Marketing plugin. Recommended order once installed: copywriting for Phase D, SEO for Phase C, brand-studio before any Bar launch, design-skills for Phase F user testing. Third-party connectors that would send the site or analytics to outside services were deliberately not offered.

## 5. Risks to watch

- **Invented claims.** Every new sentence must restate something the owner has confirmed. Tests already block stock, price, testimonial and opening-hours wording.
- **Illustrative imagery.** AI images must never be presented as real stock, staff or premises.
- **Motion.** Keep continuous effects paused offscreen and every effect behind Reduce motion; keep CLS near zero by animating transform, opacity and reserved-width font-stretch only.
- **Hosting split.** GitHub Pages cannot run the enquiry server; do not enable submission on a static-only deployment.
- **Privacy.** Enquiries must stay outside `public/`; retention must be set before enabling submission.
