# Asset provenance

## Logo

- `assets/spear-line-logo.png`: the original Spear Line white transparent logo, unchanged.
- `assets/logo.svg`: a vector trace of that logo made for V9, with each letterform as its own `<symbol>` (`g-s`, `g-p`, `g-e1`, `g-a`, `g-r`, …) so the preloader can animate them individually and the header can draw the logo crisply at any size. It is a trace, not a redesign.
- `assets/spear-mark.svg`, `assets/favicon.svg`: the spear-and-line symbol from V7, recoloured to the V9 palette (`#211A13` ground, `#F2B65A` mark). `favicon-32.png`, `favicon-48.png`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png` and `icon-512.png` are rendered from it.
- `assets/og-image.jpg` (1200 × 630): the road hero, logo and tagline, regenerated for V9.

## Photography

Twelve illustrative scenes plus a portrait phone hero, generated with the built-in image tool on 24 October 2026 (prompts in visual-prompts.json). They are not documentary photographs of Spear Line staff, stock, facilities or vehicles, and the footer says so. Each is a 1536 px WebP with a 768 px variant in `assets/visuals/`; the phone hero adds 1024, 768 and 480 px portrait versions.

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

SIL Open Font Licence 1.1, licence texts alongside in `assets/fonts/`:

- Hubot Sans, variable weight and width, latin subset (92 KB).
- Mona Sans, variable weight, latin subset (40 KB).

The V8 fonts (Big Shoulders Display, Atkinson Hyperlegible Next and Mono) were removed.
