# Spear Line website: finishing manual

Updated 11 November 2026. Step-by-step instructions for everything in [ROADMAP.md](ROADMAP.md). Written for the owner and for anyone (or any AI assistant) finishing the site. Do the parts in order; each one leaves the site working.

Contents

1. How the site is built
2. Images: where to get them legally, how to generate the missing ones, how to add them
3. Listings and in-depth pages
4. Business email on spearline.africa
5. Domain and hosting
6. Turning on live enquiries
7. Legal and compliance
8. Going public in search
9. Testing before launch
10. After launch
11. Master checklist

---

## 1. How the site is built

| What | Where |
| --- | --- |
| All words, services, divisions, FAQ | `content/site.mjs` |
| Page layouts | `scripts/build.mjs` |
| Styles | `src/styles/*.css` |
| Contact details shown on the site | `public/site-config.js` (static site) or `.env` (Node host) |
| Photographs | `public/assets/visuals/` (masters and sizes) and `public/assets/backdrops/` (small blurred versions) |
| Founder photos | `public/assets/joh/` |
| Image notes and licences | `ASSETS.md`, `visual-prompts.json` |

Commands (Node 22.21 or newer):

```bash
npm ci
```

```bash
npm run build
```

```bash
npm test
```

```bash
npm run test:e2e
```

```bash
npm run dev
```

`npm run build` regenerates every page and copies `public/` to the repository root for GitHub Pages. After a layout change also run `npm run critical`. The owner's standing rule: every finished change is pushed to `main`.

---

## 2. Images

### 2.1 The rule: only use images you have the right to use

| Source | Can we use it? | Conditions |
| --- | --- | --- |
| Photos Spear Line takes itself (phone or photographer) | Yes, best option | Get written permission (a model release) from any recognisable person. Keep the originals. |
| A hired photographer | Yes | Contract must give Spear Line the right to use the photos on the web and in print. |
| Unsplash (unsplash.com) | Yes, for individual photos | Free for commercial use, no credit required. You may not sell the photos as they are, or collect them to build a competing photo service. Logos, brands and recognisable people in a photo can still need permission. |
| Pexels (pexels.com) | Yes, with care | Free for commercial use. Do not imply a person or brand in the photo endorses Spear Line, do not show identifiable people in a negative way, and do not resell the photos. |
| Paid stock (Shutterstock, Adobe Stock, Getty) | Yes | Buy the standard web licence; keep the licence receipt. |
| Manufacturer media sites (for example a car maker's press site) | Only with permission | Usually "editorial use only". Ask the dealer or manufacturer in writing before using them to sell vehicles. |
| Supplier photos of their own products | Only with permission | Ask the supplier by email and keep the reply. |
| Competitor websites, car marketplaces, property portals, Google Images, Facebook | **No** | These photos belong to someone else. Copying them is copyright infringement, and showing another seller's vehicle or property as ours misleads customers. Use them only to research what to show, never the image itself. |
| AI-generated images (ChatGPT, etc.) | Yes, for illustrations | Must not show real brands, logos, number plates or real people's faces. Keep the footer and FAQ disclosure while AI images are on the site. Never use AI images to depict a specific vehicle or property that is for sale; use them for categories and atmosphere. |

When a real item is listed for sale (a specific vehicle, a specific apartment), it must use a real photo of that item.

### 2.2 How to "extract" an image from a website you have the right to use

Only for Unsplash, Pexels, paid stock, your own website or a supplier who agreed in writing:

1. Open the photo's own page (not a search result).
2. Use the site's **Download** button and choose the largest size (at least 2000 px wide).
3. Save the page address and the photographer's name in a note.
4. Put the file in a folder called `incoming/` on your computer, named as in section 2.4.
5. Add a line to `ASSETS.md` (section 2.7).

Never right-click and save images from competitor or marketplace sites.

### 2.3 Size and format rules

| Use | Shape | Minimum size | Notes |
| --- | --- | --- | --- |
| Page hero and section photos | Landscape 3:2 | 1536 × 1024 | Subject in the centre third; the site crops to 4:3, 16:10 and 1:1 |
| Listing card photos | Landscape 3:2 | 1536 × 1024 | One clear subject, plain background, nothing important at the edges |
| Founder portrait | Square | 1254 × 1254 | Shoulders up, face in the upper third, warm plain background |
| Founder working photos | Landscape 3:2 or portrait 2:3 | 1536 on the long side | |
| Share image (link previews) | 1200 × 630 | exactly | Already made; only change for a rebrand |

Send JPG or PNG at full quality. The build makes the small, fast versions (AVIF and WebP) automatically.

### 2.4 File names

- Section photos: next free number plus a short name, lower case with hyphens: `68-materials-hero.webp`, `69-fitness-hero.webp`.
- Listing card photos: `<page>-<item>.webp`, for example `motors-toyota-land-cruiser-prado.webp`, `fitness-monthly-membership.webp`.
- Founder: `joh-portrait-real.jpg`, `joh-yard-real.jpg`.

### 2.5 Missing images to create now

Generate these with ChatGPT (or take them as real photos). Paste the **shared style** first, then the line for the image.

**Shared style (paste before every prompt):**

> Photorealistic editorial photograph for the Spear Line website, an East African trading, supply and logistics business. Authentic Ugandan or South Sudanese setting, understated cinematic realism, charcoal shadows, warm ivory and olive tones, restrained golden sunlight, natural textures, fine photographic detail, no oversaturation. No text, no logos, no brand names, no number plates, no watermarks. Any people are anonymous, natural and not posed like stock photos, faces turned away or not recognisable. One single photograph, no borders. Landscape 3:2, 1536 × 1024, main subject in the centre third with calm space on the left for a heading.

| # | File | Page | Image line |
| --- | --- | --- | --- |
| 1 | `68-materials-hero.webp` | Building Materials | A building-supply yard at golden hour: stacked cement bags under a canopy, bundles of iron sheets and steel bars, a forklift at rest, red-earth ground, Kampala hills behind. |
| 2 | `69-materials-detail.webp` | Building Materials | Close view of neatly stacked roofing sheets, rebar bundles tagged with blank labels and timber planks in a covered store. |
| 3 | `70-fitness-hero.webp` | Fitness | A bright modern gym in Kampala in the early morning: racks of weights, rowing machines, large windows with city view, one person training in the distance. |
| 4 | `71-fitness-class.webp` | Fitness | A small group exercise class on a covered rooftop at sunrise, mats in rows, instructor seen from behind. |
| 5 | `72-fitness-recovery.webp` | Fitness | A calm recovery corner: stretching mats, foam rollers, water bottles without labels, soft daylight. |
| 6 | `73-realestate-hero.webp` | Real Estate | A modern apartment block on a green hillside in Kampala at dusk, warm lights in windows, palm trees, paved driveway. |
| 7 | `74-realestate-interior.webp` | Real Estate | A furnished living room in a new apartment: neutral sofa, wooden floor, large windows onto a balcony with city view. |
| 8 | `75-realestate-house.webp` | Real Estate | A family house with a gated compound and small garden in a quiet Kampala suburb, afternoon light. |
| 9 | `76-realestate-land.webp` | Real Estate | An open, gently sloping plot of land with boundary pegs and a dirt access road, green hills behind. |
| 10 | `77-digital-team.webp` | Digital | A designer reviewing a website layout on a laptop and phone at a wooden desk, screens showing abstract shapes only. |
| 11 | `78-bar-evening.webp` | Bar (when the concept is final) | A warm rooftop lounge at blue hour with string lights, low seating and an empty bar counter, no bottles with labels. |

**Listing card images:** use the numbered image prompts ChatGPT produces with `docs/CHATGPT-PROMPT-LISTINGS.md` (about 8 to 12 per page). For listing images add to the shared style: *"Product or subject centred on a clean, softly lit background or a simple real setting; whole item visible; nothing cut off at the edges."*

**Check every generated image before using it:** no text or fake lettering, no logos or badges on vehicles, no number plates, hands and faces natural, vehicle wheels and doors correct, nothing that implies a specific real business. Regenerate if any fail.

**Real photos still needed from the owner:** Joh's portrait and 2 to 4 working photos; the yard, store or office; any real vehicles or stock to be listed; the team (with written permission).

### 2.6 How to add images to the site

Easiest: upload the files to the repository (for example into a folder named `incoming/`) and ask Claude Code: *"Add the images in incoming/ to the site as described in the finishing manual."*

By hand:

1. Save section photos as `public/assets/visuals/<number>-<name>.webp` at 1536 px wide (convert with any editor, or upload JPG and ask Claude to convert).
2. Install the image tool once, then run the image script to make every size and the blurred backdrop:

```bash
pip install pillow
```

```bash
python3 scripts/images.py
```

3. Register the photo in `content/site.mjs` under `images`, with a short key, the file stem, a factual alt text and the size, for example: `'materials-hero': { file: '68-materials-hero', alt: 'Cement bags and roofing sheets in a building-supply yard', ratio: [1536, 1024] }`.
4. Use the key in the page layout, then run `npm run build`, `npm test` and look at the page with `npm run dev`.

Founder photos go in `public/assets/joh/` at 480, 800 and full width (`<name>-480.webp`, `<name>-800.webp`, `<name>-1280.webp`) and are registered in `johPhotos` in `content/site.mjs`.

### 2.7 Record every image

Add one line per new image to `ASSETS.md`: file, where it came from (own photo, photographer, Unsplash link, AI with date and tool), licence or permission, and whether it shows real stock. Keep model releases and supplier permissions in a shared folder outside the website.

---

## 3. Listings and in-depth pages

1. Run the prompt in `docs/CHATGPT-PROMPT-LISTINGS.md`, one page at a time.
2. Check every price and spec against real supplier or market quotes. ChatGPT figures are estimates and are marked `"confirmed": false`.
3. Save each page's result as `content/listings/<page>.json` (`motors`, `food`, `materials`, `logistics`, `fitness`, `realestate`, `bar`, `digital`).
4. Put the matching card images in `incoming/`.
5. Ask Claude Code: *"Build the listings in content/listings/ into the site, with filters and an 'Ask about this' button on each card, and create the materials, fitness and real-estate pages."*
6. Wording rules the tests enforce: no "in stock", "available now", "guaranteed", "award-winning", "trusted by" or invented numbers until they are true. Prices show as ranges with "from" or "indicative" until confirmed.
7. When a price or item is confirmed, set `"confirmed": true` in the JSON so the card can drop the "indicative" note.

---

## 4. Business email on spearline.africa

The site already shows `enquiries@spearline.africa`. It starts working once the mailbox exists.

1. **Domain:** register `spearline.africa` with a registrar that sells `.africa` domains, if not already owned. Keep the login in a password manager and turn on two-factor sign-in.
2. **Mailbox provider:** choose one: Google Workspace, Microsoft 365 or Zoho Mail (lower cost). Create `enquiries@spearline.africa` as a shared inbox and, if wanted, `joh@spearline.africa`.
3. **DNS records** (in the registrar's DNS settings; the provider gives exact values):
   - MX records for receiving mail.
   - One SPF TXT record, for example `v=spf1 include:<provider> ~all`. Only one SPF record per domain.
   - DKIM: turn it on in the provider and add the TXT or CNAME records it shows.
   - DMARC: a TXT record at `_dmarc` starting with `v=DMARC1; p=none; rua=mailto:enquiries@spearline.africa`. After a few weeks of clean reports, change `p=none` to `p=quarantine`.
4. **Test:** send to and from Gmail, Outlook and a Ugandan and a South Sudanese address; check nothing lands in spam.
5. **Phone:** set up the mailbox on the phones of whoever answers enquiries, with a signature showing both phone numbers.

Full detail: `docs/EMAIL_SETUP.md`.

---

## 5. Domain and hosting

Two options. Choose A now and B when online enquiries go live.

**A. Static site on GitHub Pages (free, what runs today)**

1. In the registrar's DNS: add `A` records for `spearline.africa` pointing to 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153, and a `CNAME` for `www` pointing to `cartelug.github.io`.
2. Ask Claude Code to add a `CNAME` file containing `spearline.africa` to the site root and push to `main`.
3. In GitHub: repository Settings, Pages, Custom domain: `spearline.africa`, then tick **Enforce HTTPS** once the certificate is issued (can take up to a day).

Limitation: GitHub Pages cannot receive enquiries. Visitors can call, email, or download their enquiry draft.

**B. Node host for live enquiries**

A small managed host that runs Node with a persistent disk (for example Render, Railway, Fly.io or a VPS). The repository already has a `Dockerfile` and `docs/DEPLOY.md`. Point the domain at this host instead of GitHub Pages once it works.

---

## 6. Turning on live enquiries

1. Deploy `server.mjs` on the Node host (option B above).
2. Set these environment variables on the host (copy `.env.example`):
   - `PUBLIC_ORIGIN=https://spearline.africa`
   - `ENQUIRIES_ENABLED=true`
   - `BUSINESS_LEGAL_NAME=Spear Line Global Limited`
   - `PUBLIC_CONTACT_EMAIL=enquiries@spearline.africa`
   - `PUBLIC_CONTACT_PHONE=+256 708 735 878` and `PUBLIC_CONTACT_PHONE_SECONDARY=+211 920 998 562`
   - `RETENTION_DAYS=180` (or what the lawyer advises)
   - `DATA_DIR` pointing at the persistent disk, never inside `public/`
   - `NOTIFY_WEBHOOK_URL`: an HTTPS address that alerts you (for example a Zapier or Make webhook that emails or WhatsApps the team)
3. Schedule `node scripts/purge-enquiries.mjs` to run daily.
4. Back up `DATA_DIR` daily and test a restore once.
5. Send a real test enquiry and confirm it arrives within minutes. Then update the privacy policy's retention line if it changed.

---

## 7. Legal and compliance

| Task | Why | Who |
| --- | --- | --- |
| Lawyer review of `terms.html` and `privacy.html` | They are good drafts, not legal advice | Ugandan lawyer |
| Register with Uganda's Personal Data Protection Office (pdpo.go.ug) | The Data Protection and Privacy Act 2019 and its 2021 regulations require data controllers and collectors to register; the PDPO has enforced this | Owner, with the lawyer |
| Font licence | MTN Brighter Sans and Sky Text were taken from a free-font site; web use is unconfirmed. Either get written permission or let Claude swap to a free licensed font (a two-file change) | Owner |
| Trade licences | Vehicle dealing, food handling and storage, alcohol (the Bar), real estate agency, transport: confirm what is needed in Uganda and South Sudan before advertising each | Owner, lawyer |
| Model releases | Any recognisable person in a real photo signs a short release | Owner |
| AI image disclosure | Keep the footer and FAQ statements while AI images are used | Built in |
| Price wording | Listing prices stay "indicative" until confirmed; the terms say the site is not an offer | Built in |

---

## 8. Going public in search

Only after sections 4 to 7 are done.

1. Set every variable from section 6 in your shell (or `.env`), then run the launch check. It lists anything still missing:

```bash
SITE_ORIGIN=https://spearline.africa PUBLIC_ORIGIN=https://spearline.africa npm run launch:check
```

2. Build the public version and deploy:

```bash
SITE_ORIGIN=https://spearline.africa SITE_LAUNCH=1 npm run build
```

3. Google Search Console: add the domain, verify with a DNS TXT record, submit `https://spearline.africa/sitemap.xml`.
4. Bing Webmaster Tools: import from Search Console.
5. Google Business Profile: create the Kampala listing with the phone numbers, email, hours and real photos.
6. Add the social profile links to the footer (ask Claude Code).

---

## 9. Testing before launch

Automated (all must pass):

```bash
npm run check && npm test && npm run test:e2e
```

```bash
npm run qa:responsive
```

```bash
npm run qa:perf
```

By hand, on real devices:

- iPhone (Safari) and an Android phone (Chrome and Samsung Internet): open every page, scroll top to bottom, open the menu, tap Call, send yourself an enquiry draft, rotate to landscape.
- Desktop: Chrome, Safari, Firefox, Edge at full width and at 1024 px.
- Screen reader: VoiceOver (iPhone) and TalkBack (Android) on the home page, one listing page and the enquiry form.
- Check every phone link dials, every email link opens the mail app, and no page shows "To be announced" for something already decided.

Send screenshots of anything that looks wrong to Claude Code.

---

## 10. After launch

- Uptime monitoring (for example UptimeRobot, free) on the home page and `/healthz`.
- Weekly: answer enquiries, check the backup ran, update listings that changed.
- Monthly: review DMARC reports, replace one AI image with a real photo, check prices.
- Analytics only if wanted, using a privacy-friendly tool, and update the privacy policy first.
- Add real testimonials and case studies only with the customer's written permission.

---

## 11. Master checklist

- [ ] ChatGPT listings done for all 8 pages and prices checked
- [ ] Listing and hero images created and checked (section 2.5)
- [ ] Real photos of Joh received and added
- [ ] Materials, fitness and real-estate pages built
- [ ] `timber-logistics.html` redirects to logistics
- [ ] Domain owned; mailbox live; MX, SPF, DKIM, DMARC set and tested
- [ ] Domain pointed at the host with HTTPS
- [ ] Live enquiries tested end to end (if using the Node host)
- [ ] Lawyer reviewed terms and privacy
- [ ] PDPO registration done
- [ ] Font licence confirmed or fonts swapped
- [ ] Trade licences confirmed for each advertised service
- [ ] Real-device and screen-reader testing done
- [ ] Launch build deployed; Search Console and Business Profile set up

Sources used for the licensing and data-protection notes: [Unsplash on compiling photos](https://help.unsplash.com/articles/2612331-why-can-t-i-compile-photos-from-unsplash-to-replicate-a-similar-or-competing-service), [Unsplash licence](https://unsplash.com/license), [Pexels usage rules](https://help.pexels.com/hc/en-us/articles/360042332714-What-are-the-rules-for-using-Pexels-photos-or-videos), [Pexels terms](https://pexels.com/terms-of-service), [PDPO registration requirement (NITA-U press release)](https://demo.nita.go.ug/sites/default/files/2024-09/Press%20Release%20-%20Requirement%20to%20register%20with%20PDPO%20-%2002%20Nov%2021%281%29.pdf), [Afriwise on the PDPO's 2025 registration decision](https://www.afriwise.com/blog/to-register-or-not-to-register-the-ugandan-personal-data-protection-offices-decision-on-the-registration-of-data-controllers). Check the current terms on each site before relying on them; this is not legal advice.
