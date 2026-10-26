# Asset provenance

The existing Spear Line white transparent logo is unchanged: public/assets/spear-line-logo.png.

Archivo and Lexend are self-hosted in public/assets/fonts/. The existing OFL.txt licence is retained.

## New imagery

Twelve original visual concepts were generated with the built-in image-generation tool on 24 October 2026. The complete prompts are in visual-prompts.json. These are illustrative scenes; they are not documentary photographs of Spear Line staff, inventory, facilities or vehicles.

| Asset stem | Use |
| --- | --- |
| 01-hero-road | Homepage road hero |
| 02-vehicles-suv | Vehicle service hero and showcase |
| 03-vehicles-pickup | Vehicle types and gallery |
| 04-logistics-truck | Logistics hero and showcase |
| 05-foodstuffs | Supplies hero and showcase |
| 06-beverages | Beverages and gallery |
| 07-warehouse | Supply coordination and company story |
| 08-dispatch-team | About page and story inset |
| 09-highland-road | Journey and closing banner |
| 10-last-mile-van | Delivery and business vehicles |
| 11-container-port | Trade coordination and gallery |
| 12-sourcing-detail | Enquiry, process and planning |

Each image is available as a full-width .webp and a -768.webp variant under public/assets/visuals/. The complete 1536 px set is approximately 2.28 MB; individual full-width files are below 280 KB. Responsive srcset and lazy loading limit unnecessary transfers. The matching root assets/ directory is maintained by sync:pages for GitHub Pages.

## V6 phone hero

A portrait companion was generated with the built-in image tool from the original road hero reference. The full prompt is included as 13-mobile-hero in visual-prompts.json. The vehicle identities, landscape and warm colour direction follow the desktop image. Optimised files are 13-mobile-hero-1024.webp (1024 × 1536), 13-mobile-hero.webp (768 × 1152) and 13-mobile-hero-480.webp (480 × 720). The mobile picture source selects these variants; desktop keeps the original hero.

## V7 symbol, icons and fonts

- assets/spear-mark.svg and assets/favicon.svg: an original spear-and-line symbol drawn as vector paths for this site. The existing logo was not modified.
- assets/icons.svg: 16 original line icons (spear and arrow marks, vehicle, supplies, logistics, route, brief, chat, check, pin, clock, shield, mail, phone, a chat-and-phone bubble and a star).
- assets/favicon-32.png, favicon-48.png, favicon.ico, apple-touch-icon.png, icon-192.png and icon-512.png are rendered from favicon.svg.
- assets/og-image.jpg (1200 × 630) combines the existing hero image, logo and tagline.
- Fonts (SIL Open Font Licence 1.1, licence texts alongside): Bricolage Grotesque, Fraunces italic and Instrument Sans, latin subsets of the variable files published by Fontsource. The Archivo and Lexend files were removed; OFL.txt remains from that set.
