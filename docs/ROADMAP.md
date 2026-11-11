# Spear Line: plan to finish the website

Updated 11 November 2026. This replaces the October roadmap (still in git history). The step-by-step instructions for every item are in [FINISHING-MANUAL.md](FINISHING-MANUAL.md).

Legend: **Done**, **Next** (can start now), **Needs you** (needs the owner's input, accounts or money), **Later** (after launch).

## 1. Where the site stands

| Area | State |
| --- | --- |
| Pages | 17 pages: home, divisions, digital, founder, vehicles, supplies, logistics (plus a duplicate `timber-logistics`), how it works, FAQ, contact, about, Bar, enquire, privacy policy, terms of use, 404 |
| Design and motion | Finished design system, per-page preloader, phone dock with Call button, swipe rails on phones |
| Phones | Responsive audit clean on every page at 15 sizes; iPhone fixes for clipped cards, call icons and seam lines are in |
| Contact | Both phone lines live; `enquiries@spearline.africa` published (the mailbox itself still has to be set up, see item 3) |
| Enquiries | The form only prepares a downloadable draft; nothing is sent yet |
| Search | Hidden from search engines on purpose until launch |
| Imagery | All AI-generated, including Joh Ayom; footer and FAQ disclose this |
| Tests | 41 unit and server tests and 18 browser tests pass |

## 2. The plan

### Phase 1. Content depth (Next; uses the ChatGPT prompt)

| # | Item | Notes |
| --- | --- | --- |
| 1.1 | Run `docs/CHATGPT-PROMPT-LISTINGS.md` for every division | Gives listing cards, packages, prices (indicative) and image prompts |
| 1.2 | Vehicles page: listing cards with filters (type, budget, fuel, drive) | Data in `content/listings/motors.json` |
| 1.3 | Supplies page: food and beverage product cards, pack sizes, minimum orders | `content/listings/food.json` |
| 1.4 | **New page** `materials.html` for Building Materials & Equipment | Division card currently links to Contact |
| 1.5 | Logistics page: route and service cards (Mombasa, Kampala, Juba lanes), what affects price | `content/listings/logistics.json` |
| 1.6 | **New page** `fitness.html`: membership packages, comparison table, class timetable, facilities | Division card currently links to Contact |
| 1.7 | **New page** `real-estate.html`: rent, sale and land cards by area; property services | Division card currently links to Contact |
| 1.8 | Bar page: concept menu, events and hire packages; replace "To be announced" when decided | Needs you for location and licensing |
| 1.9 | Digital page: priced packages (starter site, business site, shop, branding, social, content) | |
| 1.10 | Each listing card gets an "Ask about this" button that opens the enquiry pre-filled with that item | |
| 1.11 | Every page ends with a short FAQ for that division | |
| 1.12 | Turn `timber-logistics.html` into a redirect to `logistics.html` | Avoids duplicate content in search |

### Phase 2. Images (Next / Needs you)

| # | Item | Notes |
| --- | --- | --- |
| 2.1 | Real portrait of Joh Ayom, plus 2 to 4 real working photos | Needs you. Replaces the AI hero on the founder page and home |
| 2.2 | Hero image for each new page (materials, fitness, real estate) | Generate (spec in the manual, section 2.5) |
| 2.3 | One image per listing card (about 80 to 100 in total) | Generate from the ChatGPT image prompts |
| 2.4 | Real photos of stock, yard, warehouse, vehicles and team, as they become available | Needs you. Replace AI images one at a time |
| 2.5 | Record where every image came from in `ASSETS.md` | Needed for licensing and honesty |

### Phase 3. Email, domain and hosting (Needs you)

| # | Item | Notes |
| --- | --- | --- |
| 3.1 | Register or confirm `spearline.africa`; choose a mailbox provider | |
| 3.2 | Create `enquiries@spearline.africa` (and `joh@spearline.africa` if wanted); add MX, SPF, DKIM, DMARC | Test send and receive both ways |
| 3.3 | Point the domain at the website host (GitHub Pages for the static site, or the Node host for live enquiries) | |
| 3.4 | Turn on live enquiries: deploy `server.mjs`, set the environment, owner notification webhook, daily purge job, backups | |
| 3.5 | Optional: WhatsApp Business number, office address, opening hours | Fill `site-config.js` and `.env` |

### Phase 4. Legal and compliance (Needs you)

| # | Item | Notes |
| --- | --- | --- |
| 4.1 | **Done:** Terms of use and full Privacy policy pages | |
| 4.2 | Lawyer review of the terms, privacy policy and any listing wording | Before launch |
| 4.3 | Register with Uganda's Personal Data Protection Office (PDPO) as a data controller | Required under the Data Protection and Privacy Act 2019 and its 2021 regulations |
| 4.4 | Confirm the font licence (MTN Brighter Sans, Sky Text) for web use, or swap fonts | Legal risk until confirmed |
| 4.5 | Trade licences as needed: vehicle dealing, food handling, alcohol (the Bar), real estate agency, in Uganda and South Sudan | Before advertising those services |
| 4.6 | Model releases for any real people photographed | |

### Phase 5. Go public (after Phases 3 and 4)

| # | Item |
| --- | --- |
| 5.1 | Launch build: `SITE_ORIGIN=https://spearline.africa SITE_LAUNCH=1 npm run launch:check` then build and deploy |
| 5.2 | Google Search Console and Bing Webmaster Tools: verify, submit `sitemap.xml` |
| 5.3 | Google Business Profile for Kampala (and Juba if eligible) |
| 5.4 | Social profiles linked from the footer (Facebook, Instagram, LinkedIn, TikTok, as used) |

### Phase 6. Quality before launch (Next)

| # | Item |
| --- | --- |
| 6.1 | Test on real phones: iPhone Safari, Android Chrome, Samsung Internet; also Firefox and desktop Safari |
| 6.2 | Screen-reader pass: VoiceOver and TalkBack on home, a listing page and the enquiry form |
| 6.3 | Re-measure speed (Lighthouse) after listings and images are added; budget: phone performance 90+ |
| 6.4 | Add the Lighthouse budget to the automated checks |
| 6.5 | Listings filter and search on pages with many cards |

### Phase 7. After launch (Later)

| # | Item |
| --- | --- |
| 7.1 | Uptime monitoring and enquiry backups |
| 7.2 | Privacy-friendly analytics (update the privacy policy first) |
| 7.3 | Real case studies and testimonials, only with permission |
| 7.4 | News or updates section |
| 7.5 | Arabic or other languages for South Sudan, if wanted |
| 7.6 | Online payments or bookings (fitness memberships, Bar events), if wanted |

## 3. Decisions only the owner can make

1. Real photos: when and who takes them (Joh first).
2. Domain registrar, mailbox provider and host (see the manual for options).
3. Which listings and prices you will stand behind once ChatGPT's indicative figures are checked.
4. Whether fitness and real estate are live services or still "coming soon".
5. The Bar: location, opening date, menu, licensing.
6. Budget for a lawyer review and for licensed fonts if needed.
