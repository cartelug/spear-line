# V12 validation — 31 October 2026

Release focus: ten new pages (Our businesses, Trade and supply, Lifestyle and property, Founders, Spear Line Timber, Building supplies, Fitness and wellness, Real estate, Leisure and hospitality, Digital services), status labels on every business, the Spear Line Timber section, interest enquiries for the new businesses, and the founder-picture pipeline.

## Automated checks

- `npm run check`: syntax of every script, CSS bundle and root mirror up to date.
- `npm test`: 39 unit and server tests pass. New: status rules (known status; Active needs evidence), planned pages offer Register interest and say nothing is open, a launch build in a temporary copy keeps planned pages out of the sitemap and `noindex`, the Timber section on three pages and no timber supply claim anywhere, every founder illustration carries its caption, every enquiry link opens a form that exists, interest enquiries validate and store with `mode: interest`.
- `npm run test:e2e`: 7 Playwright tests pass, including axe with 0 violations on all 22 pages at phone and desktop, with and without Reduce motion. A separate sweep of the same 22 pages at 1363 and 390 px found 0 violations and no horizontal overflow, also with the founder pictures present.
- Found and fixed by axe: the new hub pages skipped from the page title straight to card headings (heading order); each hub now has its own section heading.

## Reviewed by eye (screenshots)

Home, Timber, Businesses, Founders (empty state, and with temporary pictures to prove the pipeline, since removed), Fitness and wellness, Enquire, About and Contact at 1440 px; Timber and Founders at 390 px. Fixed after review: status chips collided with card labels on the home service cards; the home "Built around what you need" heading sat in the wrong column (the gold rule counted as a grid item); the Timber page repeated its hero headline; the fourth "shared" card was orphaned in a three-column grid; a link on Contact was not visibly a link.

## Not verified

Lighthouse was not re-run on the new pages, so the V11 scores below do not yet cover them. Pages not reviewed by eye on screen: Building supplies, Real estate, Hospitality, Digital, Trade and supply, Lifestyle and property, How it works, FAQ, Privacy, Bar and 404 (axe and the structure tests do cover them). Real founder pictures: none were available, so the layout with real pictures is untested. No real devices, Safari, Firefox or screen readers. The two V12 visual-review items still open are V5 (hero chips behind the marquee tape) and V6 (Vehicles layout density).

# Previous release: V11 validation — 26 October 2026

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
