# Asset provenance

## Logo

The approved artwork is retained as two source PNGs in `brand/`: the complete horizontal wordmark and the supplied circular seal. `scripts/trace-brand.mjs` removes transparent colour noise and traces their alpha silhouettes into portable SVG masters within 0.6 source pixels; lettering, hunter and antelope proportions are retained. Production colours are amber `#B8862B`, black `#111111` and white.

- `assets/logo-wordmark-{gold,black,white}.{svg,png}`: transparent horizontal artwork. PNG dimensions remain 2172 × 724. The website keeps the full horizontal mark in its header, footer, preloader and Bar card, with responsive lossless WebP exports at 320 and 640 px. Header and footer apply the existing black and white conversions.
- `assets/logo-seal-{gold,black,white}.{svg,png}`: the complete circular logo for larger square placements, 1254 × 1254 PNG plus scalable SVG.
- `assets/favicon.svg`, `favicon-{16,32,48,96}.png`, `favicon-master.png` and `favicon.ico`: the owner-selected white a-shaped arch with a crouching hunter and horizontal spear, on pure black, with no circle. The low-resolution owner reference was reconstructed with image generation, then traced into `brand/hunter-detail.svg` from `brand/source-hunter.png` for crisp production exports. `logo-hunter-white.{svg,png}` is the transparent standalone version (2048 px PNG). The ICO contains 16, 32 and 48 px frames.
- `assets/apple-touch-icon.png`, `icon-192.png` and `icon-512.png`: opaque square home-screen exports, allowing each operating system to apply its own mask. `icon-maskable-512.png` uses an additional safe zone for Android masking.
- `assets/og-image.png` (1200 × 630) and `og-image-square.png` (1200 × 1200), with corresponding SVGs: black-and-amber share cards using the approved wordmark, current tagline, Brighter Sans and Sky. Their lettering is stored as font outlines in `brand/share-type.json` so rendering stays independent of locally installed fonts.

Run `npm ci` and `npm run brand` (ImageMagick required) to regenerate the production exports and rebuild every page. To retrace the supplied originals and selected favicon master, first run `node scripts/trace-brand.mjs --favicon`. After changing the share-card copy or supplied fonts, run `python3 scripts/brand-type.py` (fonttools and brotli required), then `npm run brand`.

Every page includes absolute Open Graph and Twitter image URLs in its initial HTML, with image type, dimensions and alternative text. Sharing works independently of the search-indexing and enquiry-launch switches. The existing GitHub Pages preview is the default share base; set `SITE_PREVIEW_URL` for another preview URL or `SITE_ORIGIN` for the final deployment. Versioned icon and preview URLs refresh browser and crawler asset caches.

`field-operations.webp` and `field-materials.webp` (1536 × 1024, plus 480 and 768 px versions) remain the supplied field illustrations used on the founder, home and divisions pages and in the company profile. They do not claim to depict Joh Ayom.

## Founder photographs (AI-generated)

`assets/joh/*.webp`: ten AI-generated photographs of Joh Ayom, made on 9 November 2026 from his own reference photos (prompt and reference pack kept outside the repository), each at 480 and 800 px and full size (1024–1280 px). They are used on the founder page (hero portrait and the "On the ground" gallery), the home page founder section and the company profile, always captioned "Joh Ayom, AI-generated image" with a note that they illustrate the work and are not records of specific places, stock or projects. Joh should approve the set before public launch.

## Photography

Twelve illustrative scenes plus a portrait phone hero were generated with the built-in image tool on 24 October 2026. Ten more (stems 14 to 23) were generated on 26 October 2026 with GPT Image 1.5 through the Zapier ChatGPT (OpenAI) action "Generate An Image", at 1536 × 1024 and high quality, using the owner's OpenAI account. Every prompt is recorded in visual-prompts.json; they share one style brief (cinematic golden-hour East African light, amber, umber and olive palette, shallow depth of field, clear space for headlines, and a strict ban on text, logos, brand marks and licence plates). They are not documentary photographs of Spear Line staff, stock, facilities or vehicles, and the footer says so. Each master is a 1536 px WebP in `assets/visuals/`. `scripts/images.py` derives AVIF at 480, 768, 1080 and 1536 px and WebP at 480, 768 and 1080 px; pages serve AVIF first with WebP as the fallback, choosing the width from the layout. The phone hero master is `13-mobile-hero-1024.webp`, with 480 and 768 px variants. All AVIF files together are 2.3 MB on disk; a phone typically downloads 20–60 KB per photograph.

| Stem | Use |
| --- | --- |
| 01-hero-road | Home hero, closing |
| 02-vehicles-suv | Vehicles hero and card |
| 03-vehicles-pickup | Pickups, intro float, gallery |
| 04-logistics-truck | Logistics hero and card |
| 05-foodstuffs | Supplies hero and card |
| 06-beverages | Beverages, intro float, gallery |
| 07-warehouse | Approach, supplies |
| 08-dispatch-team | About, contact, approach inset, process |
| 09-highland-road | Route, closing banners |
| 10-last-mile-van | Business vehicles, logistics |
| 11-container-port | Logistics, gallery |
| 12-sourcing-detail | Enquiry, process |
| 13-mobile-hero | Portrait phone hero (not used by the site since V15, kept for the image pipeline) |
| 14-keys-handover | Vehicles page, process step 4, gallery |
| 15-bar-lounge | Bar page hero, home Bar teaser |
| 16-aerial-road | Home closing banner |
| 17-loading-bay | Home approach section, logistics page |
| 18-market-produce | Supplies page, process step 2, gallery |
| 19-topo-route | Home route section texture, 404 page (an illustration, not a photograph) |
| 20-desk-contact | Contact hero, process step 1, enquiry backdrop |
| 21-team-yard | About hero |
| 22-wheel-detail | Vehicles closing banner, gallery |
| 23-bar-glass | Bar page backdrop |

The two Bar images show amber drinks over ice. The Bar's menu, and whether it serves alcohol, are still undecided (see docs/ROADMAP.md), so replace 15-bar-lounge and 23-bar-glass if the Bar will not serve drinks like these.

Eighteen more scenes (stems 24 to 41) were supplied by the site owner on 10 November 2026, selected from a 50-image set he generated through his own ChatGPT account in early November 2026; the prompts and the full-resolution originals (including portrait phone variants) are kept outside the repository. They follow the same style brief — golden-hour East African light, people at work, no text, logos, brand marks or licence plates — and the same rules: they are illustrative, not documentary photographs of Spear Line staff, stock, facilities or vehicles. Masters were resized to 1536 px WebP and run through `scripts/images.py` like the rest.

| Stem | Use |
| --- | --- |
| 24-site-materials | Building Materials division card |
| 25-track-sunrise | Fitness & Wellness division card |
| 26-rooftop-social | Hospitality division card |
| 27-property-visit | Real Estate division card |
| 28-river-landing | Logistics trade-coordination feature |
| 29-warehouse-crew | Supplies business-requirements feature |
| 30-forklift-bay | Logistics cargo-movement feature |
| 31-van-loading | Vehicles business-vehicles feature |
| 32-cargo-strapping | Logistics brief moment |
| 33-road-freight | Logistics page backdrop |
| 34-shop-delivery | Logistics delivery-planning feature |
| 35-delivery-confirm | How-it-works step 3 |
| 36-market-vendor | Supplies foodstuffs feature |
| 37-crates-loading | Supplies beverages feature |
| 38-mist-route | Default closing banner, every page |
| 39-city-dusk | Contact hero |
| 40-night-haul | Logistics closing banner |
| 41-dusk-loading | Home hero |

The remaining 26 photographs of that set (stems 42 to 67) are shown as photo strips ("strips" in `content/site.mjs`): vehicles (42–46, 66), supplies (47, 48, 50, 62, 65, 67), logistics (49, 63, 64), digital (52–56, 59), about (57, 58, 61) and divisions (51, 60). Portrait originals were cropped to 3:2. The six gold-on-navy emblems supplied with the set are 160 px WebP files in `assets/emblems/emblem-45..50.webp`, used as the division card icons (01 trowel and bricks, 02 SUV, 03 grain and bottle, 04 runner, 05 house and key, 06 glass and lamp). Every strip carries the "illustrative AI-generated" note.

## Backdrops and texture

- `assets/backdrops/*.webp`: 480 px wide, low-quality versions of each photograph (1.5–2 KB each, 56 KB total) used as blurred, drifting section backgrounds so each section's colour comes from a real image.
- `assets/grain.png`: a small tiling noise texture for the film-grain overlay.

## Icons

`assets/icons.svg`: 35 original symbols on a 48 px grid with 2 px round strokes (the spear and quote marks are solid). Original 23: spear, mark, arrow, chevron, vehicle, supplies, logistics, glass, route, brief, chat, check, pin, clock, shield, mail, phone, WhatsApp, star, grid, home, search and quote. Added in V15, each used on the site: materials, wellness (non-clinical), property, web, brand, booking, video, megaphone, automation, commerce, analytics and AI (the six divisions and nine digital capabilities). No emojis; no handshake or partnership symbol.

## Line Field and the preloader route

- `assets/line-field.svg` (about 12 KB, 5.5 KB gzipped): contour lines for the hero and closing backgrounds. Generated by `node scripts/line-field.mjs` (seeded noise, marching squares); the file is identical on every run. Original artwork, not a photograph.
- The hero route and the preloader route are inline SVG in `scripts/build.mjs` (`routeArt()` and `preloader()`); they are the same gold line.

## Fonts

Supplied by the site owner, downloaded from OnlineWebFonts.com, and used on the owner's confirmation that they hold a licence for web use:

- `mtn-brighter-sans-bold.woff2` (13 KB): MTN Brighter Sans Bold. Name table: Copyright © 2017 Newlyn Works Limited, all rights reserved; licensing at newlyn.com/licensing.
- `sky-text-regular.woff2` (27 KB): Sky Text. Name table: Copyright (c) 2009 BSkyB Ltd.

Both were converted to WOFF2 from the supplied TrueType files with all glyphs and layout features kept. `License-OnlineWebFonts.txt` is the notice that came with the download, and every page footer carries the credit it asks for, plus the icon credit line the owner requested. Note that these are corporate typefaces of MTN and Sky; keep the licence on file, and if it does not cover web embedding, swap them for open-licence fonts (two `@font-face` blocks in `src/styles/00-tokens.css`).

Earlier fonts (Hubot Sans, Mona Sans; before them Big Shoulders Display and Atkinson Hyperlegible) were removed.
