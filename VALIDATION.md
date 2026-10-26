# V8 validation — 26 October 2026

## Automated checks

`npm run check` and `npm test` pass: 21 tests covering page structure, link and fragment resolution, self-hosted typography (Bricolage Grotesque, Instrument Sans, Fraunces), guarded hidden states, no invented claims, the Bar's coming-soon state, enquiry validation and private storage, server MIME types and CSP (self-only images, no third-party hosts), icon references against the sprite, favicon/manifest/share-image presence, the three new pages and their navigation links, the default noindex state and the motion safeguards. The publishable root mirrors `public/` for 70 files, and the file list is now generated from one manifest shared by the server and the mirror.

## Browser checks (Chromium via Playwright, same-origin)

- All 12 pages at 320, 390, 768 and 1363 px: no horizontal overflow, no console errors, no failed requests (48 combinations). A tablet overflow caused by the new tab icons at 768 px was found and fixed.
- Behaviour: ticker animates and pauses offscreen; the route spear moves with scroll and lights three nodes; the timeline lights 0, 2 then 4 steps as the page scrolls; FAQ accordion collapses siblings and the topic index follows the scroll; the menu lists How it works and closes on Escape; `?service=supplies` still preselects the enquiry form; magnetic offsets are applied for a fine pointer.
- Reduced motion, both the saved site control and the system setting: ticker static, route fully drawn, timeline fully lit, reading-reveal words lit.
- Launch build (`SITE_ORIGIN=https://example.test SITE_LAUNCH=1`) produces canonical links, `index,follow` robots tags (404 stays noindex), valid Organization and FAQPage JSON-LD, robots.txt with a sitemap line and sitemap.xml; the default build restores noindex and removes the sitemap. The example origin was only used for this check.

Payload: three variable fonts total about 153 KB (previously about 55 KB); all CSS and JavaScript about 117 KB uncompressed.

## Bar rework

The Club concept was renamed and rebuilt as Spear Line Bar (bar.html, nav, dock, footer, FAQ, tests). Verified: no remaining "Club" wording in any page, the card's pour animation fires once and ends at full level, the home teaser and bar page render at phone and desktop widths without overflow, and a pre-existing garbling of the "Coming soon" pill on the home teaser (word splitting broke its dot) was fixed.

## Not verified

Native iOS and Android hardware, Safari and Firefox rendering, cross-document view transitions in browsers that do not support them (they fall back to normal navigation), screen-reader walkthroughs, and a Lighthouse or axe run. The new FAQ and process copy should be read by the business owner before launch.

## Existing operational limits

Business contact details are not configured, so the Contact page shows its empty state, and online enquiry submission remains disabled. The site stays hidden from search engines until it is built with a launch origin. The Bar is announced as coming soon, without a location, hours, menu, prices or booking.

## V8 redesign checks

- Tests: 25 pass, including new checks for template tells (no `<em>`, eyebrow labels, dot-joined strings, arrow glyphs or uppercase transforms), the hero note's markup and prefill support, one stylesheet bundle, and compression.
- axe-core: no violations on 12 pages at phone and desktop, with and without Reduce motion. It caught and the build fixed low contrast from the new greys and orange.
- Hero note: submitting it opens the enquiry page with the right service and destination field filled for vehicles, supplies and logistics; it also works with JavaScript disabled and the radios respond to arrow keys.
- Text size: a script checks that rendered text is at least 14 px (18 px for the condensed face); remaining exceptions are 13 px dock and "Soon" tags and the footer tagline.
- Layout: no overflow at 320, 390, 768 and 1363 px; the tablet hero was fixed during the pass.
