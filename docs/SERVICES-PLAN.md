# Spear Line services expansion plan

Six divisions, Spear Line Timber, digital services and the Founders page. Companion to `ROADMAP.md` (phases H to L). Written 31 October 2026 at commit `b44fe98` (V11).

**Sources.** The owner's Google Drive workspace ("SPEAR LINE | Company Workspace" and the "Joe Ayom - Founder Series" folder), read on 31 October 2026: the Final Business Scope and Six-Division Operating Framework, the Complete Master Information Register, the Company Overview, the launch marketing plan, the legal and compliance checklist, and the Social Media Boosting and Advertising proposal. Internal pricing, payment records, profit arrangements and registration details stay in Drive; this repository is public and none of that is copied here.

**What this plan does not do.** It adds no public claim. Every new page, section and image is gated by the status rules in section 2 and by the owner decisions in section 3.

## Build status, 31 October 2026

Waves 1 to 3 are built and the status rules are enforced by the build and by tests; Wave 4 is partly done. Where the build differs from the plan below:

| Plan | What was built | Why |
| --- | --- | --- |
| Rename `vehicles.html`, `supplies.html` and `bar.html` to `motors.html`, `food-beverages.html` and `hospitality.html` with aliases | The three keep their addresses and are shown as Motors, Food and beverages and the Bar. `hospitality.html` is a new page for the wider division, and the Bar is its first card | Avoids redirects on a static host and keeps existing links working |
| `timber-logistics.html` redirects to `timber.html` | It mirrors `timber.html` (canonical points at `timber.html` in launch mode) | The static host cannot redirect; the duplicate is excluded from the sitemap |
| Five new timber photographs, about twenty new generated images in all | None generated. The OpenAI account connected through Zapier returned "no credits remaining". Thirteen prompts are queued in `visual-prompts.json`; new pages use existing photographs or the contour illustration | Out of credit |
| Founders page hidden until the founder's details are supplied | Built, in the navigation and footer, showing an honest empty state; kept out of the sitemap and `noindex` in launch mode until `approvedOn` is set | The page needs the owner's pictures and words; hiding it from search achieves the same safety |
| Founder pictures wired in | Wired through `source-images/founders/` and `scripts/images.py --founders-only`; tested end to end with temporary images, then removed | The PNG masters could not be retrieved from Drive with the available tools (the connector returns no pixels and the files are about 2 MB each) |
| Seven top-level navigation items | Six: Businesses, Logistics, Timber, How it works, Founders, About, plus the Start an enquiry button | Fits the header at 1100 px; Digital stays off the header as the plan's default for decision D2 |
| Hospitality, fitness and digital hero pictures | Existing pictures (bar interior, contour illustration, desk) | No honest picture of a real operation exists |

Done: `divisions[]`, `statuses`, `timber`, `hubs`, `digitalOffers`, `founders` data; one template for ten new pages; status chips; Spear Line Timber on home, Logistics and its own page; interest enquiry types with validation, server and tests; the Contact "what happens next" section; the About founder strip; per-page closing banners on About and Contact (V4); the services heading fix on the home page; axe with 0 violations and no overflow on all 22 pages at 1363 and 390 px.

Not done: V5 (hero chips behind the marquee tape) and V6 (Vehicles layout density and cross-card legibility) from the visual review; a typeface decision (D6); real photography; the lead register through the webhook; privacy page updates for any new processor; real-device, Safari and Firefox passes.

## 1. What the owner's records say, against what the site says

| Area | Owner's records | Proposed public status | Website today | Gap |
| --- | --- | --- | --- | --- |
| Vehicle sales and trading (Motors) | Documented core focus. Stock and ownership not verified. Hire, rental and ride-hailing are intended extensions | Preparing to launch (Active once evidence is recorded) | Vehicles page | Rename to Motors, add hire as Planned, keep the no-stock-claims rule |
| Timber haulage and transport coordination | Documented core focus, with Kampala and the DR Congo as the founding destinations. Carriers and routes still to confirm. Haulage does not mean Spear Line owns or sells timber | Preparing to launch | The word "timber" appears nowhere in `content/site.mjs`; the old `timber-logistics.html` is a duplicate of Logistics | Largest gap. Needs its own visual section and page |
| Building materials and equipment | Owner-stated: timber products, iron sheets, steel, cement, hardware, tools, machinery | Planned | None | New division |
| Food and beverages | Developing supply direction (Kampala sourcing); restaurants and liquor retail are owner-stated and need licensing | Preparing to launch (supply), Planned (restaurants, liquor) | Supplies page | Rename and widen |
| Fitness, health and wellness | Owner-stated. Non-clinical only: no medical, clinic or practitioner claims | Planned | None | New division |
| Real estate | Owner-stated, exact services unsettled. No ownership or brokerage implied | Planned | None | New division |
| Leisure and hospitality | Owner-stated: lounges, bars, hotels. "Spear Line Bar" and "Spear Line Club" both appear in the records; name undecided | Planned | Bar teaser | Rebuild as a division, keep the Bar as its first card |
| Digital services | Proposed, not yet owner-approved: websites and landing pages, brand identity, social media growth and advertising management | Planned (needs owner approval first) | None | New |
| Sourcing, transport, warehousing, imports, agribusiness | Shared group capabilities, deliberately not headline divisions | Shown as "how we work", never as separate divisions | Partly in How it works | Add a capabilities band |

## 2. Status rules (new, enforced by tests)

The owner's vocabulary is **Active** (only with evidence), **Preparing to launch** and **Planned**. Implementation:

1. Every division in `content/site.mjs` carries `status`. A test fails if one is missing.
2. `status: 'active'` also requires a non-empty `evidence` string, for example "Owner confirmed, 12 November 2026". A test fails otherwise.
3. Planned divisions show a "Planned" chip, offer **Register interest** (own consent text, no quote promise) instead of **Request a quote**, carry `noindex` and are left out of `sitemap.xml` until they reach Preparing to launch. Thin pages must not compete with the real ones in search.
4. No fixed public prices (owner instruction, 29 October). Calls to action follow the owner's list: Request a Quote, Enquire About a Vehicle, Request Construction Supplies, Discuss Property Needs, Enquire About Membership, Contact Our Hospitality Team.
5. Extend the existing claim tests to block unsupported wording: "licensed", "certified", "our fleet", "our gym", "our hotel", "properties for sale", "in stock", "guaranteed followers" and similar.

## 3. Decisions the owner must make

| # | Decision | Default if unanswered |
| --- | --- | --- |
| D1 | Status of each division, with evidence for any marked Active | Motors and Timber haulage: Preparing to launch. Everything else: Planned |
| D2 | Digital services: a seventh division, or a shared capability under the existing six (the proposal itself leaves this open) | Shown as a shared capability, "Planned", no navigation slot of its own |
| D3 | Founder details: names of everyone to be shown (the records name Joe Ayom only), wording of the role, a verified bio and message in the founder's own words, written approval for the likeness in generated images | Founders page is built but hidden (not in navigation or sitemap) |
| D4 | Timber boundary: transport coordination only, or timber sales as well; routes and carriers | Transport coordination only |
| D5 | Hospitality name: Bar, Club or a wider division name | "Leisure and hospitality" with "Spear Line Bar" as the first card |
| D6 | Typeface. The site uses MTN Brighter Sans Bold and Sky Text (supplied by the owner in V10, licence unconfirmed per `ASSETS.md`). The master register records Archivo and Lexend as the latest requested pair, both open licence | Keep current fonts. Recommended: move to Archivo and Lexend, which removes the licence risk |
| D7 | Scope: the owner-approved plan groups the site into seven pages. The Founders page, a page per division, Timber and Digital go beyond that grouping | Build the seven first; treat the rest as separately agreed additions |
| D8 | Contact details, domain, legal entity name | As in `ROADMAP.md` section 2, items 1 and 2 |
| D9 | Real photographs of the founder and of a timber yard, even if taken on a phone | Generated imagery, clearly labelled |

## 4. Target site map

Tier 1 follows the seven-page grouping in the owner's scope. Tier 2 is the "maximum services" set; it can ship page by page.

| Page | File | Source today | Tier |
| --- | --- | --- | --- |
| Home | `index.html` | Restructured, section 8 | 1 |
| About | `about.html` | Rebuilt, with a founder strip | 1 |
| Our businesses | `businesses.html` | New hub: six divisions plus Digital, with status chips | 1 |
| Trade and supply | `trade-supply.html` | New hub: building materials, Motors, food and beverages | 1 |
| Lifestyle and property | `lifestyle-property.html` | New hub: fitness, real estate, hospitality | 1 |
| Logistics and opportunities | `logistics.html` | Existing, plus the Spear Line Timber section and planned projects | 1 |
| Contact and enquiries | `contact.html`, `enquire.html` | Existing, with new service types | 1 |
| Founders | `founders.html` | New, section 7 | 2 |
| Motors | `motors.html` | From `vehicles.html` | 2 |
| Building supplies | `building-supplies.html` | New | 2 |
| Food and beverages | `food-beverages.html` | From `supplies.html` | 2 |
| Fitness and wellness | `fitness-wellness.html` | New | 2 |
| Real estate | `real-estate.html` | New | 2 |
| Hospitality | `hospitality.html` | From `bar.html` | 2 |
| Spear Line Timber | `timber.html` | New; the old alias becomes a redirect | 2 |
| Spear Line Digital | `digital.html` | New | 2 |

Kept: How it works, FAQ, Privacy, 404. Old URLs (`vehicles.html`, `supplies.html`, `bar.html`, `timber-logistics.html`) stay as meta-refresh aliases with a canonical link to the new page, which also closes the duplicate-content issue (Q10 in `FINISH-PLAN.md`).

**One template, many pages.** Add a `divisions[]` collection to `content/site.mjs` (slug, name, status, evidence, accent, summary, offerings, enquiry type, images, calls to action). One template in `scripts/build.mjs` then generates every division page, the hub cards, the home grid, the footer links, the navigation, the sitemap and the structured data. Adding a division becomes one entry plus images.

**Navigation.** Seven top-level items at most: Businesses (a panel listing the divisions), Logistics, How it works, About, Contact and the primary button "Request a quote". On phones the dock's "Services" opens a sheet with the same list.

## 5. Enquiry model

`validation.js` today allows `vehicle`, `supplies` and `logistics` (the legacy `timber` value maps to logistics). Extend it, and the server, and the tests together:

| Service key | Fields beyond name, contact and notes | Mode |
| --- | --- | --- |
| `vehicle` (Motors, key kept for compatibility) | model, budget, location | Quote |
| `supplies` (Food and beverages) | products, quantity, destination, timing | Quote |
| `logistics` | pickup, destination, load, timing, plus optional `cargo` (for example "timber") | Quote |
| `construction` | materials, quantity, site location, timing | Register interest until D1 moves it |
| `property` | intent (buy, rent, let, manage), area, budget (optional) | Register interest |
| `fitness` | interest (gym, classes, training, corporate) | Register interest |
| `hospitality` | interest (venue, booking, events), party size (optional) | Register interest |
| `digital` | need (website, brand, social media), platform (optional), goal | Quote after approval of D2 |

Shared: an optional preferred reply channel (call, WhatsApp, email). Register-interest submissions use their own consent text and are stored with a different flag so no one mistakes them for a quote request. Timber links open the logistics form pre-filled with `cargo=timber`.

**Lead register.** The owner's workflow runs New, Qualified, Quoted, Negotiation, Accepted, Fulfilled, Closed or Lost. The server already posts each stored enquiry to `NOTIFY_WEBHOOK_URL`; point it at an automation that appends a row to a private Google Sheet or Notion database. Cost, margin and discount fields live only in that private register, never in this repository. The privacy page must name any service added to the chain before it is switched on.

## 6. Spear Line Timber: the visual section

**Where.** A full-bleed section on the home page after the businesses grid, the same module at the top of `timber.html`, and a shorter version on the Logistics page.

**What it may say.** Timber haulage and transport coordination; the information a consignment needs; documented handover; that routes, timing and charges are agreed per consignment. Kampala and the DR Congo may be named once the owner confirms routes (D4).

**What it must not say.** That Spear Line owns, stocks or sells timber; any fleet size, tonnage or transit time; certification or lawful-origin guarantees. The legal checklist treats lawful origin and movement documents as a requirement per consignment, so the page asks for "the documents that apply to your consignment" and goes no further.

**Design.**

1. **Ground.** `--olive` blending into `--earth`, with a tree-ring contour layer (concentric growth rings as one inline SVG, under 3 KB) drifting slowly. It reuses the topographic route technique in `docs/MOTION.md`, so the cost is near zero and it pauses offscreen and under Reduce motion.
2. **Headline** of under nine words on the left; working title for the owner to replace: "Timber, moved with care."
3. **Consignment strip.** Four glass cards in a row: yard check, loading, route, delivery. A spear marker travels along the strip as it scrolls into view (the existing route-line behaviour). It is a normal list, not a carousel, so there is no scroll trap; on phones it becomes a vertical timeline.
4. **Cargo note.** A waybill-style glass card (cargo, volume, pickup, destination, timing) that opens the enquiry pre-filled, matching the home hero.
5. **What we ask for.** A short list: cargo description, estimated weight or volume, packaging, pickup and delivery points, access, timing, applicable documents.
6. **Status chip** from the division entry, and the illustration caption (section 9).

**Imagery** (new, added to `visual-prompts.json` with the existing style brief and its ban on text, logos and plates): `timber-yard-dawn`, `timber-loading`, `timber-grain-detail` (end grain, shallow focus), `timber-road-highland`, `timber-paperwork` (hands and unreadable documents). Plus the founder scene "timber quality review" on the Timber page, captioned as an illustration. Real photographs replace these first when they exist (D9).

**Budget.** Five images at roughly 25 to 60 KB each on a phone, lazy-loaded below the first screen; no new script beyond existing data attributes; layout reserved to keep CLS at 0.

## 7. Founders page

**What the Drive holds.** The master register names **Joe Ayom** as founder; no other founder appears. The "Joe Ayom - Founder Series - 30 Oct 2026" folder holds ten numbered scenes, and the brand folder holds three more images:

| File | Proposed use |
| --- | --- |
| `joe-ayom-founder-cutout.png` (transparent) | Page hero, over the outlined tagline and a golden-hour glow |
| `joe-ayom-founder-portrait.png`, `joe-ayom-founder-hero.png` | Founder card, About strip, share image |
| `01 founder-warm-front-portrait` | Founder card alternative; page and share image |
| `02 vehicle-detail-inspection`, `03 client-vehicle-handover` | Motors |
| `04 shipment-paperwork`, `09 logistics-delivery-coordination` | Logistics |
| `05 food-supply-conversation`, `06 beverage-dispatch-walkthrough` | Food and beverages |
| `07 timber-quality-review` | Timber |
| `08 client-meeting-natural-smile` | Enquiries and Contact |
| `10 founder-environmental-hero` | Home or About banner |

I could not open these images from the Drive connector (it returns no pixels for PNGs, and each file is about 2 MB), so nothing about their content is assumed beyond their names and the register's description.

**They are generated.** The master register states that the founder and operations images are generated visual storytelling assets and "not proof of staff, stock, premises, completed transactions or company-owned facilities". The page therefore follows these rules:

1. Each image entry gets `generated: true` (or `real: true` for a photograph). Any page that shows a generated image of a person carries a caption "AI-generated illustration" on the image and a line in the page note. The global footer note is reworded from "AI-generated imagery illustrates our service areas" to a statement that covers people as well.
2. Scene images appear as a captioned storyboard ("How Joe works"), never as evidence of a specific deal, site or customer.
3. One real photograph of the founder replaces the generated portrait as soon as it exists (D9), because a founder page is the one place where a real face is the point.
4. Nothing is published until D3 is answered: written approval for the likeness, a verified bio and a message in the founder's own words. No biography is invented to fill the page.

**Structure.**

1. Hero: cutout portrait, name, role, one line chosen by the founder.
2. Founder's message (founder's words).
3. How Joe works: a storyboard of the scene images, each tied to a division and captioned.
4. Principles: the existing three (Listen first, Make the details matter, Keep it clear).
5. The businesses: a compact grid with status chips.
6. Call to action: Request a quote, and a link to About.

**Data and build.** A `founders[]` collection (name, role, bio, message, portrait, scenes, `approvedOn`) next to the existing `team[]`, which stays for staff. Support one to many founders without changing the template. In launch mode, add `Person` structured data and an `Organization.founder` link from approved fields only. Images: add portrait ratios and alpha support to `scripts/images.py` (the phone hero is already a portrait master), derive AVIF and WebP at 480, 768 and 1080 px, and keep the original PNG masters out of `public/` (store them under `source-images/`, which is not served).

**Tests.** Add `founders.html` to the page lists in `tests/site.test.mjs` and the e2e axe sweep; assert that every founder has a name, a role and `approvedOn`; assert that every `generated` image on the page has its caption.

## 8. Visual upgrade (V12)

Findings from the 31 October visual review (home, About, Vehicles and Contact at 1440 px; home and About at 390 px):

| # | Finding | Fix |
| --- | --- | --- |
| V1 | No real people anywhere; the only team image shows three people from behind | Founders page, founder strip on About, real photographs as soon as available |
| V2 | About is thin and has large empty bands at 1440 px | Rebuild: hero, founder strip, businesses, principles, closing; cap section padding on wide screens |
| V3 | Contact dead-ends ("Direct contact details will appear here") and the footer "Get in touch" column holds one link | Explain what happens after an enquiry, link the FAQ, show real channels once D8 is answered |
| V4 | The same aerial-road closing banner repeats on home, About and Contact | One closing image and line per page |
| V5 | At 1440 by 900 the service chips at the foot of the home hero are partly hidden by the marquee tape | Re-seat the tape or the chips; check heights from 700 to 1000 px |
| V6 | Vehicles uses three wide alternating rows with large gaps; titles over photographs on the two cross-sell cards sit on busy areas | Denser layout; check legibility and contrast on those cards |
| V7 | The footer note says all imagery is AI-generated and illustrative, which stops being accurate with real photographs | Per-image `generated` and `real` flags, wording derived from them |

New for the expanded site:

1. **Division system.** Six new sprite icons (building, timber, fitness, property, hospitality, digital; `i-home` and `i-glass` already exist), a status chip component, and one accent per division from existing tokens: Motors sun gold, Timber and building olive with gold, Food and beverages deep gold, Fitness and Digital river teal, Real estate sand with olive, Hospitality dusk.
2. **Home restructure.** Hero waybill offers every active or preparing division as a choice (a horizontally scrolling pill row on phones); then the businesses grid; then **The timber line**; then process, gallery and closing. The marquee text and intro statement change from three services to the real set.
3. **Typeface and colour.** Resolve D6. Optionally align the gold with the brand guide's muted gold and ink so print and web match; the current gold is brighter than the guide's.
4. **Motion budget.** No new continuous effects beyond the tree rings; every effect stays behind Reduce motion and paused offscreen; CLS stays 0.
5. **Photography direction.** One brief for real and generated images alike; a shoot list (founder portrait, timber yard, a vehicle handover, an office or desk); generated images retired page by page as real ones arrive. Roughly twenty new generated images are needed for the first release (building materials 3, real estate 3, fitness 3, hospitality 2, digital 3, timber 5, spares), all recorded in `visual-prompts.json`.

## 9. Waves, exit tests and relative size

| Wave | Content | Size | Exit test |
| --- | --- | --- | --- |
| 0 Decisions | D1 to D9 | S (owner) | Each row answered or its default accepted in writing |
| 1 Foundations | `divisions[]` and `founders[]` data, status rules and tests, template, navigation panel and sheet, aliases, enquiry types, claim tests | L | `npm run check`, `npm test` and browser tests pass; a dummy division renders end to end |
| 2 Core pages | Home restructure, Our businesses, Trade and supply, Lifestyle and property, Logistics with the Timber section, About rebuild, Contact, Founders (hidden until D3) | L | axe 0 violations on every page and mode; Lighthouse phone performance at or above 90, accessibility 100; no overflow from 280 to 3440 px |
| 3 Division pages | Motors, building supplies, food and beverages, fitness, real estate, hospitality, Timber, Digital | L | Each page passes the same gates; Planned pages are `noindex` and absent from the sitemap |
| 4 Visual polish | V4 to V7, typeface, photography swaps, closing banners | M | Visual review on every page at 390 and 1440 px, then real devices |
| 5 Operations | Lead register through the webhook, privacy page updated for each processor, owner runbook | S to M | A real enquiry reaches the register and the owner within minutes |

## 10. Not used, on purpose

- Internal rates, bundles and profit arrangements from the social media proposal. The site says "Request a quote" only.
- Payment and quotation records.
- The registration status in the records, which the owner describes as unverified. No registration number or incorporation claim goes on the site.
- The "SPEAR ONE" concept note in Drive. It is a proposal for a different company (Spear Motors Ltd), not for Spear Line; nothing from it should appear here or imply a connection.
