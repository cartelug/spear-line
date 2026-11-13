# Spear Line website

A responsive company site for Spear Line's trading, supply and logistics enquiries, six business divisions, digital services and founder profile, built around one idea: a single route line that connects opportunities. See [DESIGN.md](DESIGN.md) and [docs/MOTION.md](docs/MOTION.md). The site uses the approved complete horizontal gold wordmark. Its photography is illustrative and labelled accordingly.

## Run locally

Node 22.21 or newer is required. The build and unit tests have no installation step.

```sh
npm run build       # Generate 16 pages, stylesheet and service worker; mirror public/ to root
npm run dev         # Serve the site at http://localhost:3000
npm run check       # Syntax and generated-file consistency
npm test            # Content, accessibility structure, validation and server behavior
```

For browser tests, run `npm ci`, install Playwright Chromium once, then `npm run test:e2e`. CI runs these checks on every push and pull request. `npm run critical` regenerates the first-screen CSS selections after a layout change in a browser-capable environment.

## Source map

| Path | Purpose |
| --- | --- |
| `content/site.mjs` | Copy, services, divisions and image descriptions |
| `content/vehicle-prices.mjs` | Dated external exporter examples, USD vehicle prices and source references |
| `scripts/build.mjs` | Page templates, metadata, service worker and sitemap generation |
| `src/styles/*.css` | Layered styles, bundled into `public/site.css` |
| `src/styles/critical.json` | Rules inlined for the first screen (regenerate with `npm run critical` after style changes) |
| `scripts/line-field.mjs` | Generates the Line Field contour background (`assets/line-field.svg`) |
| `scripts/qa/` | Screenshots, responsive audit, preloader timing and lab performance (`npm run qa:shots`, `qa:responsive`, `qa:preloader`, `qa:perf`) |
| `public/app.js` and `public/validation.js` | Navigation and enquiry behavior |
| `server.mjs` | Node host with private enquiry storage, notification and security headers |
| `scripts/render-brand-assets.mjs` | Transparent logo family, compact icons, maskable mobile icon and social artwork |

`public/` is the Node server's web root. `npm run build` also mirrors its files into the repository root for a static GitHub Pages preview. The mirror is a preview; it cannot accept enquiries.

## Enquiries and launch

Online submission is currently disabled. The static form prepares a downloadable draft and explicitly says that nothing has been sent. The Node host can accept and store enquiries when its verified public contact, origin, retention and notification settings are configured. Do not place customer records inside `public/`.

The default build is `noindex` and blocks crawlers. A public, indexable build requires `SITE_LAUNCH=1` and passes `npm run launch:check` first; the gate requires a verified HTTPS origin, matching server origin, legal name, monitored email, enabled enquiries, retention period and HTTPS owner notification endpoint. See [docs/DEPLOY.md](docs/DEPLOY.md) for deployment, the real enquiry smoke test, backup and retention steps.

The public phone contacts and `enquiries@spearline.africa` are published; the mailbox and final enquiry delivery still need setting up. The plan to finish is in [docs/ROADMAP.md](docs/ROADMAP.md) and the step-by-step instructions are in [docs/FINISHING-MANUAL.md](docs/FINISHING-MANUAL.md). Do not turn on the public switch with placeholder values. See [the business email plan](docs/EMAIL_SETUP.md), [ASSETS.md](ASSETS.md) for brand and imagery provenance, and [CONTENT.md](CONTENT.md) for editing content.

## Brand assets and link previews

`npm run brand` regenerates SVG/PNG/WebP production exports and rebuilds the site (run `npm ci` first; ImageMagick is required). See [ASSETS.md](ASSETS.md) for masters and font-outline regeneration. Every page includes the current preview card even before the enquiry/search launch switches are enabled. `SITE_PREVIEW_URL` optionally sets a preview base URL; otherwise `SITE_ORIGIN` or the existing GitHub Pages preview is used. Keep any deployment subdirectory, such as `/spear-line`, in that URL.

## Market references and service status

Service details and dated market examples are maintained in `content/page-guides.mjs`. They distinguish outside advertised prices, inferred planning budgets and requirement-specific quotations. See [the research record](docs/MARKET_PRICES.md). The owner confirmed active service divisions and a 2027 opening for Spear Line Bar. Enquiry hours are Monday–Saturday, 9 am–6 pm EAT; the fitness page publishes standard hours with phone confirmation before attending.
