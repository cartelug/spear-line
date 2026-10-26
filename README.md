# Spear Line — V8

Vehicles, foodstuffs and beverages, and logistics. A responsive, presentation-led website using self-hosted Big Shoulders Display, Atkinson Hyperlegible Next and Atkinson Hyperlegible Mono, the existing Spear Line logo, a new spear symbol and icon set, and thirteen coordinated generated photographs.

## What V8 changes

- A new visual language built around the consignment note: condensed freight lettering, flat navy / concrete / dispatch orange, ruled rows instead of cards, and a hero note that starts an enquiry with the chosen service and destination. See DESIGN.md.
- Template habits removed and tested for: accent words, eyebrow labels, tracked caps, arrows on links, non-sequence numerals.
- Decorative pointer effects and per-section fade-ups removed; meaningful motion kept.

## What V7 added

- Three new pages: How it works (animated timeline and per-service checklists), Questions answered (grouped accordions with a scrolling topic index) and Contact (shows only the channels configured in site-config.js).
- A Spear Line symbol (assets/spear-mark.svg), favicon set, app icons, web manifest, 1200×630 share image and a 17-symbol icon sprite (assets/icons.svg). The logo itself is unchanged.
- Upgraded typography: Bricolage Grotesque headings, Instrument Sans body copy, italic Fraunces accents.
- New motion: a pausable service ticker, a scroll-driven route line on which the spear travels between the three services, a reading reveal on the introduction, timeline scrubbing, pointer spotlight cards, magnetic buttons, gentle image tilt and cross-page view transitions. All of it honours Reduce motion.
- Search switches: pages stay hidden from search engines until you build with SITE_ORIGIN and SITE_LAUNCH=1 (see Launch below).

## Experience

- A dedicated Spear Line Bar coming-soon page and homepage feature (the venue idea formerly drafted as a Club).
- A phone-specific portrait hero, thumb navigation, larger controls and keyboard-aware enquiry layout.
- More than 300 registered animation targets, coordinated text/scroll/component timelines and a saved Reduce motion control. See docs/MOTION.md.

- Cinematic road hero and a brief first-visit logo entrance.
- Keyboard-accessible service tabs, horizontal image gallery, scroll reveals and restrained desktop parallax.
- Dedicated vehicles, supplies, logistics, about and enquiry pages.
- Responsive phone/tablet navigation with Escape dismissal and focus management.
- Reduced-motion support and readable content if animation scripts fail.
- Local WebP imagery in 1536 px and 768 px versions; no external image or font requests.
- The former timber-logistics.html address remains an alias for logistics.html.

## Local development

Node 22.21 or newer. No package installation is required.

```sh
npm run dev
npm run render:pages
npm run check
npm test
```

Edit public/ for direct source changes. Shared HTML structure and content are authored in scripts/render-pages.mjs, with the homepage additions and the How it works, FAQ and Contact pages in scripts/content-extra.mjs. Run render:pages after changing the generator; it generates the pages and mirrors public/ into the repository root for GitHub Pages. After direct CSS or JavaScript edits, run npm run sync:pages. The check command catches mismatches between the two locations.

The server accepts HOST/PORT environment variables and --host / --port arguments. Reload the browser after edits; restart the server when adding new asset filenames.

## Enquiries

GitHub Pages serves the static configuration in site-config.js. Online submission is currently disabled and no company contact information is configured. The form validates requirements and creates a downloadable text draft in the browser. It does not claim to send a draft.

The existing Node server can accept enquiries when the operator configures ENQUIRIES_ENABLED, BUSINESS_LEGAL_NAME, PUBLIC_CONTACT_EMAIL, RETENTION_DAYS and PUBLIC_ORIGIN. See .env.example for the remaining optional contact settings. Enquiries are stored outside public/; preserve that separation. The browser and server share public/validation.js. Supplies, vehicles and logistics have different required fields. Old service=timber requests are normalised to logistics.

## Launch

By default every page carries noindex and robots.txt blocks crawlers, because no production address or business details exist yet. When they do:

```sh
SITE_ORIGIN=https://your-domain SITE_LAUNCH=1 npm run render:pages
```

This publishes indexable pages with canonical links, Open Graph and Twitter share tags, Organization and FAQ structured data, robots.txt with a sitemap reference and sitemap.xml. The 404 page stays noindex. Then fill in site-config.js (legal name, email, phone, WhatsApp, address) so the Contact page, footer and privacy page show real details, and set the enquiry server variables described above.

## Assets and maintenance

See ASSETS.md for provenance, visual-prompts.json for the complete generation prompts, DESIGN.md for design and motion notes, and VALIDATION.md for checks completed for this upgrade. Keep source logo and font licence files intact.
