# V11 validation — 26 October 2026

Release focus: ten new photographs, new motion layers, finishing touches. The speed and responsive work from V10 was re-checked against the new content.

## Automated checks

- `npm run check`: syntax of every script, CSS bundle and root mirror up to date.
- `npm test`: 32 unit and server tests pass (the content-guard test now also recognises the `is-scrolling` state class that fades ambient layers).
- `npm run test:e2e`: 7 Playwright browser tests pass, including axe with 0 violations on all 12 pages at phone and desktop, with and without Reduce motion.

## Speed (Lighthouse, local Node server, simulated slow 4G with 4× CPU on phones)

| | Phone | Desktop |
| --- | --- | --- |
| Performance | 97–100 on 11 of 12 pages; home 98–99 | 99–100 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| Largest paint | 1.65–2.1 s | 0.37–0.56 s |
| Layout shift | 0 | 0 |

Regression found and fixed during this release: the new beam of light and drifting dust over every hero cost 100–300 ms of blocking time at start-up (FAQ page: 0 ms before, up to 230 ms with the effect; 0 ms again with it removed). They now start only after the page has loaded and the browser is idle, and fade in. Side-by-side with the previous release, three runs per page: FAQ 13–27 ms vs 0, logistics 15–19 ms vs 0–17; home page, five runs: score 98–99 vs 99, blocking time 15–52 ms vs 0–18 (the home page now carries nine gallery photographs, a map texture and more layers). Lighthouse varies by several points between runs.

## Smoothness

Scrolling each page top to bottom in headless Chromium (software rendering, so slower than a real GPU): phones 56–60 fps on every page; desktop 47–57 fps (home hero section 34 fps, Bar hero 28 fps; both are the heaviest scenes: a full-screen photograph under a frosted glass note). Dust, beam and lamp fade out while scrolling and settle back, which recovered the hero from 23 to 34 fps in this test.

## Images

Ten photographs generated with GPT Image 1.5 (Zapier ChatGPT action), checked one by one: no stray text, logos, licence plates or brand marks; hands correct; clear space for headlines. Each is served as AVIF with WebP fallback in four widths. Hero images preload per page.

## Responsive

No horizontal overflow, clipped text or element outside the viewport on 12 pages at 23 sizes from 280 × 653 to 3440 × 1440, including landscape phones and touch tablets (the only flags are the intentionally screen-reader-only dock labels on landscape phones and decorative layers clipped by their sections). Phone screenshots of the new sections were reviewed.

## Not verified

Real iOS and Android hardware, Safari and Firefox rendering (scroll-driven animations and speculation rules fall back as designed but were not seen), screen-reader walkthroughs, the Docker image build, and the service worker on the live GitHub Pages address. The copy should be read by the business owner before launch.

## Operational limits

No business contact details are configured, so the Contact page shows its empty state and online enquiry submission stays disabled. The site stays hidden from search engines until built with a launch origin. The supplied fonts are used on the owner's statement that they hold a licence (see ASSETS.md). The two Bar photographs show amber drinks over ice; the Bar's menu is undecided (see docs/ROADMAP.md).
