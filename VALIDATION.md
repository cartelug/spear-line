# V6 validation — 24 October 2026

## Automated checks

npm run check and npm test pass. Sixteen tests cover page structure, local and cross-page fragment links, responsive image sources, typography, readable fallback states, current services, the Club coming-soon state, enquiry validation and private storage, disabled submission, and serving the new motion/image assets with the correct MIME types. The publishable root mirrors public/ for 50 files.

## Browser checks

Reviewed same-origin phone frames at 320, 390 and 430 px, tablet at 768 px, and a 1363 px desktop viewport. The settled views reviewed have no horizontal page overflow. Native iOS/Android hardware was not used in this pass.

The homepage registered 308 motion targets on phones and 307 on larger views, including 226 word targets. The tested journeys triggered 145 distinct animated targets on phone and 131 on desktop. These are animated elements, not hundreds of distinct effects. See docs/motion-audit.json.

Verified mobile menu opening/closing and Escape, inert background handling, service tabs and arrow-key navigation, gallery movement and its position counter, accordion expansion and sibling collapse, the Club layouts, full-size radio touch targets, immediate service selection while loading, 16 px form inputs, and hiding/restoring bottom navigation during editing. A completed logistics form produced a downloadable enquiry draft without sending it.

The Reduce motion control cancels active effects and keeps words visible. Its preference survived navigation to the Club page, where no new animations started. System preferences are also honoured by the implementation.

## Existing operational limits

Business contact details are not configured and online enquiry submission remains disabled. Draft preparation continues to work. The Club is announced as coming soon, without membership registration, launch dates, prices or promised benefits.
