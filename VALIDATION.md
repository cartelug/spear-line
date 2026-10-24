# V4 validation — 24 October 2026

## Automated checks

npm run check and npm test pass. Fifteen tests cover page structure and local links; self-hosted typography; script-guarded reveal states; current service navigation and imagery disclosure; field validation, contact validation and consent; supplies requirements; legacy timber compatibility; static image MIME types; server submission and private record storage; and disabled online submission.

The GitHub Pages root mirrors public/ for all 43 publishable files, including the new service pages and 24 responsive image files.

## Browser checks

The development preview was inspected at a 1363 px desktop viewport and in same-origin frames with 390 px and 768 px viewports. The tested views have no horizontal page overflow.

Verified the homepage imagery, service tab click and keyboard switching, gallery advancement, process accordion expansion and sibling collapse, the phone menu opening/Escape/navigation behaviour, the supply form's field errors, and preparation of a completed supply enquiry. The resulting draft link reports that no enquiry has been sent.

The motion fallback is implemented through prefers-reduced-motion CSS and a preference-change listener. Native mobile devices and an emulated reduced-motion browser were not available for this pass.

## Existing operational limits

The static site has no configured business contact details and online sending remains disabled. This upgrade preserves that state; it does not invent a phone number or claim an enquiry was delivered.
