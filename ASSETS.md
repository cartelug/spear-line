# Asset provenance

## Logo

- `assets/spear-line-logo.png`: the original Spear Line white transparent logo, unchanged.
- `assets/logo.svg`: a vector trace of that logo made for V9, with each letterform as its own `<symbol>` (`g-s`, `g-p`, `g-e1`, `g-a`, `g-r`, …) so the preloader can animate them individually and the header can draw the logo crisply at any size. It is a trace, not a redesign.
- `assets/spear-mark.svg`, `assets/favicon.svg`: the spear-and-line symbol from V7, recoloured to the V9 palette (`#211A13` ground, `#F2B65A` mark). `favicon-32.png`, `favicon-48.png`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png` and `icon-512.png` are rendered from it.
- `assets/og-image.jpg` (1200 × 630): the road hero, logo and tagline, regenerated for V9.

## Photography

Twelve illustrative scenes plus a portrait phone hero, generated with the built-in image tool on 24 October 2026 (prompts in visual-prompts.json). They are not documentary photographs of Spear Line staff, stock, facilities or vehicles, and the footer says so. Each master is a 1536 px WebP in `assets/visuals/`. `scripts/images.py` derives AVIF at 480, 768, 1080 and 1536 px and WebP at 480, 768 and 1080 px; pages serve AVIF first with WebP as the fallback, choosing the width from the layout. The phone hero master is `13-mobile-hero-1024.webp`, with 480 and 768 px variants. All AVIF files together are 2.3 MB on disk; a phone typically downloads 20–60 KB per photograph.

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

## Backdrops and texture

- `assets/backdrops/*.webp`: 480 px wide, low-quality versions of each photograph (1.5–2 KB each, 56 KB total) used as blurred, drifting section backgrounds so each section's colour comes from a real image.
- `assets/grain.png`: a small tiling noise texture for the film-grain overlay.

## Icons

`assets/icons.svg`: 23 original line icons in one sprite (2 px round strokes): spear, mark, arrow, chevron, vehicle, supplies, logistics, glass, route, brief, chat, check, pin, clock, shield, mail, phone, WhatsApp, star, grid, home, search and quote. No emojis are used anywhere.

## Fonts

Supplied by the site owner, downloaded from OnlineWebFonts.com, and used on the owner's confirmation that they hold a licence for web use:

- `mtn-brighter-sans-bold.woff2` (13 KB): MTN Brighter Sans Bold. Name table: Copyright © 2017 Newlyn Works Limited, all rights reserved; licensing at newlyn.com/licensing.
- `sky-text-regular.woff2` (27 KB): Sky Text. Name table: Copyright (c) 2009 BSkyB Ltd.

Both were converted to WOFF2 from the supplied TrueType files with all glyphs and layout features kept. `License-OnlineWebFonts.txt` is the notice that came with the download, and every page footer carries the credit it asks for, plus the icon credit line the owner requested. Note that these are corporate typefaces of MTN and Sky; keep the licence on file, and if it does not cover web embedding, swap them for open-licence fonts (two `@font-face` blocks in `src/styles/00-tokens.css`).

Earlier fonts (Hubot Sans, Mona Sans; before them Big Shoulders Display and Atkinson Hyperlegible) were removed.
