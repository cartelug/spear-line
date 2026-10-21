# Validation status

See “V3 design verification” at the end for the current redesign. The sections below describe the original build.

Authoring date: 2026-10-20.

## Completed in the available JavaScript environment

- 4 validation test groups passed with 33 assertions. The included validation test source was executed against the actual validation function using small in-memory assertion adapters.
- 8 JavaScript files parsed successfully in V8 after substituting module import declarations and import.meta for syntax checking. This is not a Node module-resolution or runtime test.
- 7 HTML pages checked for one H1, unique IDs and image alt attributes.
- 140 local file references checked against the source manifest; local fragment destinations also checked.
- package.json parsed and private package flag verified.
- Original logo supplied as base64 without artwork changes.

## GitHub verification

- Commit `d46b78d387db65bc2e5a73e377aecea1b3ec9bdb` contained all 25 expected source files, including the original PNG logo. GitHub's tree was complete and the uploaded blobs matched the source package.
- The [GitHub Actions check](https://github.com/cartelug/spear-line/actions/runs/39488892512) completed successfully. It ran the Node syntax check and automated tests, including server startup, HTTP handling, validation and private file storage.

## Still to verify before launch

- Browser rendering, navigation, keyboard/screen-reader behavior, responsive crops and widths, network image/font loading.
- Node server deployment and real contact delivery, performance and accessibility tooling.
- Actual business identity and contact details, HTTPS, monitoring and scheduled retention purge.

The repository is public at the owner's direction. The static [GitHub Pages site](https://cartelug.github.io/spear-line/) deployed successfully from `main` → `/(root)` (Pages run 39557581265). Online form submission remains disabled by default; GitHub Pages does not run the Node server.

## Result

The in-memory checks and GitHub Actions suite passed.

## V3 design verification (2026-10-21)

Run locally against `server.mjs` (real Content Security Policy) with headless Chromium 141 (Playwright 1.56) on Linux. The sandbox could not reach `images.unsplash.com` or the live Pages site, so **every browser result below used clearly labelled stand-in images** (1600×1067, same aspect ratio) or no images. The real photographs were not seen.

- `npm run check` and `npm test`: 12 tests pass (validation 4, server 3, static site 5).
- Viewport matrix: 320, 360, 375, 390, 430, 600, 768, 1024, 1280, 1440, 1920, 2560, plus 390×520 (short phone), 844×390 (landscape phone) and 720×450 (200% zoom of 1440), across all 7 pages: no horizontal scroll, no clipped headings, no text under 12 px, no tap target under 44 px (tap targets were measured at 390 and 1440 only). The off-screen honeypot field is intentional.
- axe-core 4.x (WCAG 2.0/2.1/2.2 A and AA plus best practice) at 390 and 1440, including the open mobile menu: 0 violations after fixing the 404 footer heading order. Text over the hero/forest gradients is reported “needs review” by axe; the underlying colour pairs were computed by hand (lowest 6.2:1, most above 8:1). No text sits over a photograph.
- State contract (22 scripted checks): first-visit intro timeline and cleanup, skip on reload and internal navigation, bfcache restore, reduced motion, blocked `sessionStorage`, JavaScript disabled (390 px), fast scroll fling, menu open/Escape/focus return/7 rapid taps/resize, and keyboard focus visibility. All pass.
- Measured with web-vitals under stated profiles (stand-in images, local server): mobile 390×844 @2×, 4× CPU slowdown, 1.6 Mbps / 150 ms RTT, first visit with intro: LCP 1.1–2.1 s, CLS 0, INP 40–80 ms. Desktop 1440×900, 10 Mbps / 40 ms: LCP 0.25–1.2 s, CLS 0, INP ≤ 32 ms. With fonts deliberately delayed 900 ms, the metric-matched fallbacks reduced desktop CLS from 0.0235 to 0.0002. These are lab numbers, not claims about production.
- Failed-image check: with every photograph blocked the layout is unchanged, alt text is legible on the tonal fallback, and all copy and actions remain.

Not verified: the real photographs and their crops; the deployed Pages URL; Safari, Firefox and real phones; screen readers (VoiceOver, TalkBack, NVDA); slow-device recordings of the opening; Lighthouse or field data; browser back/forward cache beyond a synthetic `pageshow` event.
