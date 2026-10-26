# V9 validation — 26 October 2026

## Automated checks

- `npm run check`: syntax of every script, CSS bundle and root mirror up to date.
- `npm test`: 32 unit and server tests pass. They cover page structure, link and fragment resolution, self-hosted fonts (Hubot Sans, Mona Sans), icon references against the sprite, guarded hidden states and the motion failsafe, no invented claims, the Bar's coming-soon state, optional collections rendering only when filled, enquiry validation and private storage, server MIME types, CSP and compression, the default noindex state and launch-mode SEO.
- `npm run test:e2e`: 7 Playwright browser tests pass, including axe accessibility checks, the preloader (runs once, page inert while closed, logo lands in the header), the waybill prefilling the enquiry, the menu, the route, the marquee and FAQ search.

## Accessibility

axe-core: 0 violations on all 12 pages at phone and desktop widths, with and without Reduce motion. Lighthouse accessibility 100. Every control is at least 44 px tall; focus is visible on glass and photographs; the page is inert while the preloader runs; layout holds at 200% zoom.

## Performance (Lighthouse)

| | Mobile (throttled) | Desktop |
| --- | --- | --- |
| Performance | 91–96 | 99–100 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| CLS | 0.001 | 0.001 |

SEO scores 63–66 by default only because pages are deliberately `noindex`; the launch build carries canonical links, share tags and structured data.

## Layout

No horizontal overflow on 12 pages from 320 to 1920 px. Hero headline holds to three lines on phones; the bento becomes a swipe carousel below 600 px.

## Security

Security review of the branch: no high-confidence findings. All content passes through an HTML escaper at build time, JSON-LD escapes `<`, client scripts use `textContent` and cloned nodes only (no `innerHTML`, `eval` or `document.write`), and the server is unchanged.

## Not verified

Native iOS and Android hardware, Safari and Firefox rendering, screen-reader walkthroughs (VoiceOver, NVDA, TalkBack) and the Docker image build. The copy should be read by the business owner before launch.

## Operational limits

No business contact details are configured, so the Contact page shows its empty state and online enquiry submission stays disabled. The site stays hidden from search engines until built with a launch origin. The Bar is announced as coming soon, without location, hours, menu, prices or booking.
