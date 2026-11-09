# Asset provenance

## Logo

- `assets/logo-wordmark-gold.png`: the approved complete horizontal lowercase gold Spear Line wordmark, with the hunter and antelope details intact and the circle removed. The exact supplied 2172 × 724 artwork is used in the header, footer, preloader and Bar card. Its geometry has not been redrawn or rearranged. The header applies the permitted black production conversion on white; the footer applies the white conversion (the same alpha mask, so the geometry is unchanged). The ochre is 5.8:1 on white but 2.4:1 on navy, so it is not used unconverted on dark grounds.
- `favicon-32.png`, `favicon-48.png`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png` and `icon-512.png`: square production exports with the complete wordmark centred on navy.
- `field-operations.webp` and `field-materials.webp` (1536 × 1024, with 480 and 768 px versions): the two supplied field illustrations used on the founder, home and divisions pages and in the company profile. They are illustrative; the person in them is not claimed to be Joh Ayom.
- `assets/og-image.png` (1200 × 630): a launch share card pairing the exact wordmark with the current port illustration and headline.

Run `node scripts/render-brand-assets.mjs` (needs ImageMagick 7, `magick`) to regenerate the icon and share exports from the approved PNG. The script scales the supplied wordmark proportionally; no isolated figure or alternate lettering is used.

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
