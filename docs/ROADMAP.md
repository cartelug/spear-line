# Spear Line roadmap to launch and beyond

Replaces the early analysis in `FINISH-PLAN.md`. Everything under "Measured" was run on 26 October 2026 against the real pages; everything under "Needs you" cannot be completed by anyone but the owner. On 31 October 2026 a visual review (section 1a), the owner's Drive records (section 1b) and a services expansion were added as Phases H to L: foundations for six divisions, the **Founders page**, **Spear Line Timber**, **digital services** and a **visual upgrade**. The detail is in `SERVICES-PLAN.md`.

## 1. Where the site stands (measured)

| Area | Result | How |
| --- | --- | --- |
| Accessibility | axe-core: 0 violations on 12 pages × phone and desktop, with and without Reduce motion. Lighthouse accessibility 100 | WCAG 2.0–2.2 A/AA and best-practice rule sets |
| Performance (phone, throttled) | 97–100 on all 12 pages, CLS 0 | Lighthouse against the Node server, V11 |
| Performance (desktop) | 99–100 | Lighthouse |
| Best practices | 100 | Lighthouse |
| SEO | 63–66 by default only because pages are deliberately `noindex`; launch mode adds canonical, share tags, structured data and sitemap | Lighthouse |
| Layout | No overflow or clipped text at 23 sizes from 280 to 3440 px, landscape phones and touch tablets included | Playwright sweep |
| Security | Security review of the branch: no high-confidence findings | Static review of build, client scripts and server |
| Tests | 32 unit and server tests plus 7 browser tests pass | `npm test`, `npm run test:e2e` |

V11 added ten new photographs (generated with GPT Image 1.5 through Zapier) and more motion. V9 (the golden-hour redesign) replaced the V8 visual language; V10 made it fast (inlined first-screen styles, AVIF, 40 KB of fonts, prerendered links, offline support) and switched to the owner's fonts. See `DESIGN.md`, `CONTENT.md` and `VALIDATION.md`.

## 1a. Visual review, 31 October 2026

Scope: home, About, Vehicles and Contact at 1440 px, and home and About at 390 px, with Reduce motion on; screenshots only. Lighthouse and axe were not re-run. Not yet reviewed: Supplies, Logistics, How it works, FAQ, Enquire, Bar, Privacy and 404 (done in Phase L).

Keep: the golden-hour palette, the type scale, the hero waybill, blended sections and the speed in section 1.

| # | Finding |
| --- | --- |
| V1 | No real people anywhere. The only team image shows three people from behind |
| V2 | About is thin (hero, one paragraph, one image, three cards) with large empty bands at 1440 px |
| V3 | Contact dead-ends: "Direct contact details will appear here", and the footer "Get in touch" column holds one link |
| V4 | One closing banner (aerial road, "Let's move something forward") repeats on home, About and Contact |
| V5 | At 1440 by 900 the service chips at the foot of the home hero are partly hidden by the marquee tape |
| V6 | Vehicles: three wide alternating rows leave large gaps; titles over photographs on the two cross-sell cards need a legibility check |
| V7 | The footer note calls all imagery AI-generated, which stops being true once real photographs are added |

## 1b. What the owner's Drive records change

The owner's records describe a company wider than the current site, and a core focus the site has drifted from.

- **Core focus is vehicles and timber haulage** (Kampala and the DR Congo). The word "timber" appears nowhere in `content/site.mjs`; the site leads with foodstuffs and beverages, which the records call a developing direction.
- **Six divisions**, not three services: building materials and equipment, motors, food and beverages, fitness and wellness, real estate, and leisure and hospitality. Sourcing, transport, warehousing, imports and agribusiness are shared capabilities, not headline divisions.
- **Digital services** (websites, brand identity, social media growth and advertising management) are proposed but not yet owner-approved.
- **Status vocabulary:** Active only with evidence, Preparing to launch, Planned. The site has no way to show this yet.
- **One named founder**, written "Joh Ayom" on the site because the owner confirmed that spelling on 31 October 2026 (the Drive records and picture file names say "Joe"). A Founder Series of ten scenes plus three other images exists in Drive, and the records describe them as generated storytelling assets, not evidence of operations.
- **Open conflict:** the site uses MTN Brighter Sans Bold and Sky Text (licence unconfirmed, see `ASSETS.md`); the records list Archivo and Lexend as the latest requested pair.

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
| 8 | Status of each division (Active with evidence, Preparing to launch, Planned) | Home grid, division pages, sitemap | Motors and Timber haulage: Preparing to launch; the rest Planned |
| 9 | Founder details: names, role wording, verified bio and message, written approval for the likeness in generated images, ideally one real photograph | Founders page | Page built but hidden |
| 10 | Digital services: seventh division or shared capability, and approval to publish | Digital page and navigation | Shared capability, Planned |
| 11 | Timber boundary: transport only or also sales; routes and carriers | Spear Line Timber section and page | Transport coordination only |
| 12 | Hospitality name (Bar, Club or wider) | Hospitality page | "Leisure and hospitality", with Spear Line Bar first |
| 13 | Typeface: keep MTN Brighter Sans and Sky Text, or move to Archivo and Lexend (recommended, open licence) | Visual upgrade | Keep current |
| 14 | Scope: which pages beyond the owner-approved seven are agreed | Wave 3 pages | Seven first |

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

### Phase H — Foundations for six divisions (needs #8, #14) ✅ built
Built 31 October 2026 with the plan's defaults; see "Build status" in `SERVICES-PLAN.md` for the differences. Still open: redirect aliases for renamed pages (not renamed), the lead register in Phase K. Full detail in `SERVICES-PLAN.md` sections 2 to 5.
1. Add `divisions[]` and `founders[]` to `content/site.mjs`, and one template in `scripts/build.mjs` that generates the division pages, hub cards, home grid, navigation, footer, sitemap and structured data.
2. Status rules in code: every division has a `status`; `active` needs an `evidence` string; Planned pages are `noindex`, offer Register interest and stay out of the sitemap. Tests enforce all three.
3. Navigation: a Businesses panel, and a Services sheet in the phone dock; at most seven top-level items.
4. Enquiry types for construction, property, fitness, hospitality and digital, plus an optional `cargo` on logistics, in `validation.js`, the server and the tests.
5. Redirect aliases for `vehicles.html`, `supplies.html`, `bar.html` and `timber-logistics.html`.
6. Extend the claim tests to block unsupported wording.
Exit test: a dummy division renders end to end and `npm run check`, `npm test` and the browser tests pass.

### Phase I — Founders page (needs #9) built, waiting on the owner
The page, the picture pipeline, the captions and the tests are done. Needs from the owner: the founder pictures copied into `source-images/founders/`, the founder's message and bio, and written approval of the likeness (`approvedOn`).
1. `founders.html` with the cutout hero, founder's message, a captioned storyboard of the Founder Series scenes tied to divisions, principles, businesses grid and a call to action. A founder strip on About links to it.
2. Every generated image of a person carries an "AI-generated illustration" caption; a real portrait replaces the generated one as soon as it exists.
3. Nothing publishes until the founder's bio, message and likeness approval are supplied. No biography is invented.
4. Masters go in `source-images/` (not served); `scripts/images.py` gains portrait and alpha support.
Exit test: axe 0 violations; every founder has a name, role and `approvedOn`; every generated image on the page has its caption.

### Phase J — Spear Line Timber (needs #11) built, without dedicated timber photographs
The section, strip, cargo note, page and tests are done using existing images. The five timber illustrations are queued in `visual-prompts.json` (the connected OpenAI account has no credit); real photographs should replace them.
1. A full-bleed "timber line" section on home, the same module on `timber.html`, and a short version on Logistics: tree-ring contour layer, a four-stop consignment strip (yard check, loading, route, delivery) and a waybill-style cargo note that opens the logistics enquiry pre-filled with `cargo=timber`.
2. Five new illustrations (recorded in `visual-prompts.json`), replaced by real photographs first when available.
3. Copy says timber haulage and transport coordination only: no ownership, stock, fleet, tonnage, transit time, certification or lawful-origin guarantee.
Exit test: CLS 0, phone performance at or above 90, all effects off under Reduce motion.

### Phase K — Digital services and the other new divisions (needs #8, #10, #12) pages built; lead register open
The Digital, Building supplies, Fitness and wellness, Real estate and Hospitality pages exist in their true status. Open: step 4, the private lead register through `NOTIFY_WEBHOOK_URL`, and the matching privacy page update.
1. Digital page: websites and landing pages, brand identity, social media growth and advertising management; Facebook and Instagram only until other platforms are confirmed eligible. "Request a quote", no public prices, no promised followers, reach or sales, no fake engagement. Proof section stays an empty state until real, permitted case studies exist.
2. Building supplies, fitness and wellness (non-clinical), real estate and hospitality pages from the template, each in its true status, with Register interest where Planned and no booking, listing or membership claims.
3. Motors, food and beverages and hospitality pages are the existing Vehicles, Supplies and Bar pages renamed and widened.
4. Lead register: point `NOTIFY_WEBHOOK_URL` at a private sheet or database; update the privacy page for every service in the chain before switching it on.
Exit test: every page passes axe and Lighthouse; Planned pages are `noindex`; a real enquiry reaches the register.

### Phase L — Visual upgrade, V12 (needs #13) partly done
Done: V2 (About founder strip; the page is still thin), V3 (Contact next steps), V4 (closing banners on About and Contact), the status chip and division icons, the home restructure and the services heading layout. Open: V5, V6, V7, the typeface decision, real photography, the pages not yet reviewed, and real devices.
1. Fix V2 to V7 (section 1a): rebuild About, enrich Contact, vary the closing banners, re-seat the marquee tape, tighten Vehicles and check card legibility, make image wording per-image.
2. Division system: six sprite icons, a status chip, one accent per division from existing tokens.
3. Home restructure: waybill offers every live division, then the businesses grid, then the timber line.
4. Decide the typeface (#13) and, optionally, align the gold with the brand guide.
5. Review the pages not yet reviewed (section 1a), then real devices, Safari and Firefox, and screen readers (Phase F).
6. No new continuous effects beyond the tree rings; update `DESIGN.md`, `ASSETS.md` and `VALIDATION.md`.
Exit test: scores in section 1 hold or improve, with no overflow from 280 to 3440 px.

## 4. Skills and tools

Already used here: axe-core, Lighthouse, Playwright, the security-review skill. Offered for install: `frontend-design`, `rampstack-seo` (technical and on-page SEO), `design-skills` (UX writing, critique, journey mapping), Website Copywriting & Positioning, `brand-studio`, and Anthropic's Marketing plugin. Recommended order once installed: copywriting for Phase D, SEO for Phase C, brand-studio before any Bar launch, design-skills for Phase F user testing. Third-party connectors that would send the site or analytics to outside services were deliberately not offered.

## 5. Risks to watch

- **Invented claims.** Every new sentence must restate something the owner has confirmed. Tests already block stock, price, testimonial and opening-hours wording.
- **Illustrative imagery.** AI images must never be presented as real stock, staff or premises. This now includes generated images of the founder: they are captioned as illustrations and never shown as proof of a deal, site or customer.
- **Status inflation.** A division is Active only with recorded evidence. Planned divisions get no booking, listing, membership or stock wording, and stay out of search until they are real.
- **Timber.** Haulage is not ownership of timber. No claim about stock, fleet, tonnage, certification or lawful origin.
- **Digital services.** Never promise followers, reach, sales or a platform that cannot lawfully serve the market. Internal rates and profit arrangements stay out of this public repository.
- **Scope.** The owner-approved plan is seven pages; pages beyond it need a written agreement.
- **Motion.** Keep continuous effects paused offscreen and every effect behind Reduce motion; keep CLS near zero by animating transform, opacity and reserved-width font-stretch only.
- **Hosting split.** GitHub Pages cannot run the enquiry server; do not enable submission on a static-only deployment.
- **Privacy.** Enquiries must stay outside `public/`; retention must be set before enabling submission.
