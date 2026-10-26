# Editing Spear Line content

All words, images and optional real-world material live in one file: `content/site.mjs`. After any edit:

```sh
npm run build   # writes the pages to public/, bundles CSS, mirrors to the repository root
npm test        # confirms nothing broke (links, claims, structure)
```

You never edit the HTML files directly; they are regenerated on every build.

## Ground rules (enforced by tests)

- Publish only what Spear Line can stand behind. No invented stock, prices, figures, testimonials or partner names.
- Contact details are not written in `content/site.mjs`. Static hosting reads them from `site-config.js`; the Node server reads them from environment variables (see `docs/DEPLOY.md`). Fill one place and the contact page, footer and privacy page update together.
- Keep text plain: no emojis, no all-caps words, no arrows typed into link text. Icons come from the sprite.

## Copy

Each section of the file matches a page or block: `brand`, `services` (vehicles, supplies, logistics), `home`, `process`, `about`, `faq`, `bar`, `contactPage`. Change the strings and rebuild. Headings animate word by word, so a short heading (under about 9 words) reads best.

FAQ answers that depend on online enquiries use `null`; the build swaps in the right text depending on whether `enquiriesEnabled` is on.

## Images

Every image is referenced by key in `images`, which also holds its alt text and aspect ratio.

Supply one master per photograph: 1536 px wide, 3:2 (1536 × 1024) or 16:9 (1536 × 864), saved as WebP. The phone hero master is portrait, 1024 × 1536.

To use a real photograph:

1. Save the master to `public/assets/visuals/` with a number prefix, for example `14-yard-photo.webp`.
2. Run `python3 scripts/images.py` (needs Pillow: `pip install pillow`). It writes the AVIF and WebP sizes the pages use and a backdrop.
3. Add an entry: `'yard-photo': { file: '14-yard-photo', alt: 'Describe what is in the photo', ratio: [1536, 1024] }`.
4. Point any `image:` or `backdrop:` field at `'yard-photo'` and run `npm run build`.

Section backdrops (the soft colour behind dark sections) are the small 480 px WebP files in `public/assets/backdrops/`; `scripts/images.py` creates one for each new photograph. When the photos become real, remove `brand.imageNote` or change it.

If you change styles or the layout of a page's first screen, run `npm run critical` so the inlined first-screen styles stay in step (a test fails when they drift).

## Optional collections

These are empty by default and appear on the site automatically once they have entries.

```js
// Vehicles page: listings grid replaces the "Looking for something specific?" card.
export const inventory = [
  { title: 'Toyota Land Cruiser 300', year: 2023, details: ['Diesel', 'Automatic'], price: 'On request', status: 'Available', image: 'vehicles-suv' }
];

// Home intro and About page: numbers count up when they come into view.
export const stats = [
  { value: 12, suffix: '+', label: 'Years in vehicle trading' }
];

// Home page: glass quote cards. Only with the customer's permission.
export const testimonials = [
  { quote: 'Clear from the first call to delivery.', name: 'Name', role: 'Role, Company' }
];

// Home page: moving strip of names. Only with permission.
export const partners = [{ name: 'Partner name' }];

// About page: team cards.
export const team = [{ name: 'Name', role: 'Role', image: 'dispatch-team' }];
```

## The Bar

`bar.share` holds the three "To be announced" cards (location, opening, menu). Replace each `text` when the details are confirmed. Do not add licensing or alcohol claims until they are settled.

## Going live

When the domain and business details exist:

```sh
SITE_ORIGIN=https://your-domain SITE_LAUNCH=1 npm run build
```

This removes `noindex`, adds canonical links, share tags, structured data and a sitemap. See README.md.
