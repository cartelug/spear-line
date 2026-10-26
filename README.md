# Spear Line — V9

Vehicles, foodstuffs and beverages, and logistics, plus the coming-soon Spear Line Bar. A cinematic, image-led static site with self-hosted Hubot Sans and Mona Sans, a traced vector logo, blended photographic section backgrounds, glass cards and a logo preloader. Ready to be filled with real content.

## What V9 changes

- Complete redesign: warm golden-hour palette sampled from the photography (umber, earth, olive, sand, sun gold), sections that blend into one another instead of hard edges, image-derived blurred backdrops, glass and image cards, a 12-column bento of services that becomes a swipe carousel on phones. See DESIGN.md.
- Variable-font typography: Hubot Sans display with width-axis animation, Mona Sans text, metric-matched fallbacks so nothing shifts as fonts load.
- A preloader built from the logo itself: the traced letterforms rise in, the spear travels the line with real load progress, the doors open and the logo flies into the header.
- Much more motion (split headings, clip reveals, image panning, parallax, tilt, marquee, route line, sticky process, counters, pour) — all guarded, all off under Reduce motion. See docs/MOTION.md.
- One content file (`content/site.mjs`) with empty slots for inventory, stats, testimonials, partners and team that appear when filled. See CONTENT.md.

## Local development

Node 22.21 or newer. No package installation is required for building or unit tests.

```sh
npm run dev       # serve on http://localhost:3000
npm run build     # content/site.mjs + scripts/build.mjs -> public/*.html, src/styles -> public/site.css, mirror to root
npm run check     # syntax checks, CSS bundle and root mirror are up to date
npm test          # unit and server tests
```

Where things live:

| Path | What |
| --- | --- |
| `content/site.mjs` | All words, image keys and optional collections |
| `scripts/build.mjs` | Page templates and layout |
| `src/styles/*.css` | Styles by layer (tokens, base, sections, components, chrome, home, pages, motion); bundled into `public/site.css` |
| `public/boot.js` | Runs in `<head>`: motion preference, preloader |
| `public/app.js` | Menu, header, forms, accordions, gallery rail, enquiry draft |
| `public/motion.js` | Reveals, split text, route, process, parallax, tilt, counters |
| `public/validation.js` | Enquiry validation shared by browser and server |
| `server.mjs` | Optional Node server (compression, CSP, enquiries) |

`npm run build` mirrors `public/` into the repository root for GitHub Pages (tracked in `scripts/pages-files.json` so only mirrored files are ever removed). After a direct CSS or JavaScript edit run `npm run sync:pages`; `npm run check` catches mismatches.

## Enquiries

GitHub Pages serves the static configuration in site-config.js. Online submission is currently disabled and no company contact information is configured. The form validates requirements and creates a downloadable text draft in the browser. It does not claim to send anything.

The Node server can accept enquiries when the operator configures ENQUIRIES_ENABLED, BUSINESS_LEGAL_NAME, PUBLIC_CONTACT_EMAIL, RETENTION_DAYS and PUBLIC_ORIGIN. See .env.example. Enquiries are stored outside public/; preserve that separation. Old service=timber requests are normalised to logistics.

## Deploy and test

See docs/DEPLOY.md for the container, environment variables, owner notification webhook, retention and backups. Browser tests (including axe accessibility checks) run with `npm run test:e2e` after a one-time `npm ci && npx playwright install chromium`; CI runs them on every push.

## Launch

By default every page carries noindex and robots.txt blocks crawlers, because no production address or business details exist yet. When they do:

```sh
SITE_ORIGIN=https://your-domain SITE_LAUNCH=1 npm run build
```

This publishes indexable pages with canonical links, Open Graph and Twitter tags, Organization and FAQ structured data, robots.txt with a sitemap reference and sitemap.xml. The 404 page stays noindex. Then fill in site-config.js (legal name, email, phone, WhatsApp, address) so the Contact page, footer and privacy page show real details.

## More

CONTENT.md (editing content), DESIGN.md (design system), docs/MOTION.md (motion), ASSETS.md (provenance), VALIDATION.md (checks), docs/ROADMAP.md (what only the owner can unblock). Keep the logo and font licence files intact.
