# Spear Line company profile

- `Spear-Line-Company-Profile.pdf`: the exported A4 profile (8 pages, fonts embedded, tagged, about 4.4 MB).
- `profile.html`: the generated page source, which opens in any browser.
- `build-profile.mjs`: layout and styles. `content.mjs`: profile-only copy. Shared facts (divisions, services, capabilities, sourcing topics, process steps) come from `content/site.mjs`, so the profile and the website cannot disagree.
- Rebuild with `npm run profile` (needs the Playwright dev dependency).

## Status: draft from the website copy

The supplied company profile PDF has not been received. This version is built from the confirmed website copy. When the PDF arrives:

1. Replace `founderQuote` in `content.mjs` with the PDF's exact wording and set `founderQuoteVerified: true`.
2. Check every fact against the PDF, and list any disagreement in `DISCREPANCIES.md`. Where they differ, the most recently confirmed facts win (company name, founder, the two phone lines, email planned on spearline.africa).

## Rules the profile follows

- The wordmark appears only as supplied, or as its white conversion (`assets/logo-wordmark-white.png`: the same alpha mask, so the geometry is unchanged).
- Photographs are the two supplied field images, labelled illustrative. The person shown is not claimed to be Joh Ayom.
- Division status labels are honest (Enquiry-led, Developing, Concept). THE 97 World is a proposed collaboration.
- No email address is printed. Both phone lines appear on the closing page.
