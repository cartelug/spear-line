# Asset provenance

## Logo

- `assets/spear-line-logo.png`: the original Spear Line white transparent logo, unchanged.
- `assets/logo.svg`: a vector trace of that logo made for V9, with each letterform as its own `<symbol>` (`g-s`, `g-p`, `g-e1`, `g-a`, `g-r`, …) so the preloader can animate them individually and the header can draw the logo crisply at any size. It is a trace, not a redesign.
- `assets/spear-mark.svg`, `assets/favicon.svg`: the spear-and-line symbol from V7, recoloured to the V9 palette (`#211A13` ground, `#F2B65A` mark). `favicon-32.png`, `favicon-48.png`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png` and `icon-512.png` are rendered from it.
- `assets/og-image.jpg` (1200 × 630): the road hero, logo and tagline, regenerated for V9.

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
| 13-mobile-hero | Phone hero |
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

## Founder pictures

The master information register in the owner's Drive describes the "Joe Ayom - Founder Series" (the folder's name in Drive; the site displays "Joh Ayom", as the owner confirmed) (ten numbered scenes) and three other portraits as generated visual-storytelling assets, "not proof of staff, stock, premises, completed transactions or company-owned facilities". They are used only as captioned illustrations on the Founders page (and a founder strip on About). The masters (about 2 MB each) are not in this repository: they are stored in the owner's Drive and are copied into `source-images/founders/` (ignored by git) when the pages are built. `scripts/images.py --founders-only` derives `f-<name>-<width>` AVIF and WebP files and `content/founder-images.json`; metadata from the originals is not carried over. Written approval from the founder for the use of his likeness is still to be recorded in `founders[0].approvedOn`.

## Queued images

`visual-prompts.json` holds thirteen prompts under `queued` (timber ×5, building supplies ×2, fitness ×2, real estate ×2, hospitality ×1, digital ×1). They were not generated: on 31 October 2026 the OpenAI account connected through Zapier returned "no credits remaining". Until they run, the new pages reuse existing photographs or the contour illustration. Prefer real photographs where possible.

## Backdrops and texture

- `assets/backdrops/*.webp`: 480 px wide, low-quality versions of each photograph (1.5–2 KB each, 56 KB total) used as blurred, drifting section backgrounds so each section's colour comes from a real image.
- `assets/grain.png`: a small tiling noise texture for the film-grain overlay.

## Icons

`assets/icons.svg`: 28 original line icons in one sprite (2 px round strokes): spear, mark, arrow, chevron, vehicle, supplies, logistics, glass, route, brief, chat, check, pin, clock, shield, mail, phone, WhatsApp, star, grid, home, search and quote, plus timber (growth rings), build (brickwork), fitness (dumbbell), property (house) and digital (code in a screen) added in V12. No emojis are used anywhere.

## Fonts

Supplied by the site owner, downloaded from OnlineWebFonts.com, and used on the owner's confirmation that they hold a licence for web use:

- `mtn-brighter-sans-bold.woff2` (13 KB): MTN Brighter Sans Bold. Name table: Copyright © 2017 Newlyn Works Limited, all rights reserved; licensing at newlyn.com/licensing.
- `sky-text-regular.woff2` (27 KB): Sky Text. Name table: Copyright (c) 2009 BSkyB Ltd.

Both were converted to WOFF2 from the supplied TrueType files with all glyphs and layout features kept. `License-OnlineWebFonts.txt` is the notice that came with the download, and every page footer carries the credit it asks for, plus the icon credit line the owner requested. Note that these are corporate typefaces of MTN and Sky; keep the licence on file, and if it does not cover web embedding, swap them for open-licence fonts (two `@font-face` blocks in `src/styles/00-tokens.css`).

Earlier fonts (Hubot Sans, Mona Sans; before them Big Shoulders Display and Atkinson Hyperlegible) were removed.
