# V10 validation — 26 October 2026

Release focus: speed, smoothness and responsiveness, plus the owner's fonts.

## Automated checks

- `npm run check`: syntax of every script, CSS bundle and root mirror up to date.
- `npm test`: 32 unit and server tests pass. New in V10: every inline script and style is allowed by its exact hash in the Content Security Policy (and nothing else is), first-screen styles are inlined with the full stylesheet deferred and a no-script fallback, `critical.json` matches the current stylesheet, AVIF is served with the right type, the supplied fonts are preloaded with real bold mapping and metric-matched fallbacks, and every page carries the font and icon credits.
- `npm run test:e2e`: 7 Playwright browser tests pass, including axe with 0 violations on all 12 pages at phone and desktop, with and without Reduce motion.

## Speed (Lighthouse, local Node server)

| | Phone (simulated slow 4G, 4× CPU) | Desktop |
| --- | --- | --- |
| Performance | 99–100 on all 12 pages (V9: 91–96) | 99–100 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| Largest paint | 1.65–2.0 s (V9: 1.9–2.9 s) | 0.36–0.55 s |
| Layout shift | 0 | 0–0.001 |

Measured directly in Chromium with a throttled phone profile (150 ms latency, 1.6 Mbit/s, 4× CPU): first paint 0.56–0.72 s (V9: 1.04–1.19 s); the vehicles page's hero photograph paints at about 2.0 s (V9: 3.2 s). Lighthouse varies by about ±2 points between runs.

Visual check of the critical-path split: for 12 pages at 6 screen sizes, the first screen styled only by the inlined rules matches the fully styled page pixel for pixel (0.00 % difference); preloader frames differ by at most 0.12 %.

## Smoothness

Scrolling each page top to bottom in headless Chromium (software rendering, so slower than a real GPU): phones hold 58–60 fps on every page; desktop pages 51–60 fps (V9: home 42 fps, services section 22 fps, now 52 fps). The remaining cost is the frosted enquiry card over the moving hero photograph, kept on purpose.

## Navigation and offline

- No console errors or policy violations on any page; no duplicate view-transition names (a duplicate would cancel the photo morph).
- Service worker (enabled on HTTPS, or with `?sw` locally): installs, controls the page, a visited page reloads offline, an unvisited page falls back to the home page, and an offline notice appears.

## Responsive

No horizontal overflow, clipped text or element outside the viewport on 12 pages at 23 sizes: 280 × 653, 320 × 568, 360 × 740, 390 × 844, 414 × 896, 430 × 932, 540 × 720, 600 × 960, 667 × 375, 844 × 390, 768 × 1024, 820 × 1180, 912 × 1368, 1024 × 768, 1024 × 1366, 1180 × 820, 1280 × 720, 1366 × 768, 1440 × 900, 1536 × 864, 1920 × 1080, 2560 × 1440 and 3440 × 1440. Fixed in this pass: overflow at 280 px, 36 px navigation targets on touch tablets in landscape (now 44 px), an 11 px badge (now 12 px), and a cramped landscape phone layout.

## Security

New code reviewed: inline blocks are hash-allowed per page (no `unsafe-inline`), the service worker only handles same-origin GET requests and never touches `/api/` or `site-config.js`, and the cache policy marks only versioned files immutable.

## Not verified

Real iOS and Android hardware, Safari and Firefox rendering (speculation rules and scroll-driven animations fall back as designed but were not seen), screen-reader walkthroughs, the Docker image build, and the service worker on the live GitHub Pages address.

## Operational limits

No business contact details are configured, so the Contact page shows its empty state and online enquiry submission stays disabled. The site stays hidden from search engines until built with a launch origin. The supplied fonts are used on the owner's statement that they hold a licence (see ASSETS.md).
