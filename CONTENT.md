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

Each section of the file matches a page or block: `brand`, `services` (vehicles, supplies, logistics), `divisions` (timber, building supplies, fitness, real estate, hospitality, digital), `statuses`, `timber`, `hubs`, `digitalOffers`, `founders`, `foundersPage`, `home`, `process`, `about`, `faq`, `bar`, `contactPage`. Change the strings and rebuild. Headings animate word by word, so a short heading (under about 9 words) reads best.

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

## Businesses and their status

`services` and `divisions` share one shape and one page template. Every entry needs a `status`:

- `preparing` (Preparing to launch): enquiries are welcome and the page offers a quote route.
- `planned` (Planned): nothing is open or listed. The page offers Register interest, carries `noindex` in launch mode and stays out of the sitemap.
- `active`: only with an `evidence` note, for example `evidence: 'Owner confirmed, 12 November 2026'`. The build and a test both fail without it.

To add a business, add one entry to `divisions` (copy an existing one: `id`, `slug`, `name`, `label`, `icon`, `status`, `group`, `enquiry`, images, `card`, `tags`, `hero`, `items`, `include`, `brief`, `cta`, `boundary`), add its enquiry fields in `public/validation.js` and `scripts/build.mjs` if it needs a new enquiry type, and run `npm run build`. Use `boundary` for the plain "this is not X" line that every planned business needs. Do not add prices, stock, availability or licence claims.

## Spear Line Timber

`timber` holds the section shown on the home, Logistics and Timber pages: the title, the four stops, what to include and the note. The section describes transport only. If the owner decides to supply timber as well, change the boundary note and the copy together, and confirm routes before naming any destination.

## The founder

`founders` holds only confirmed facts. `message` and `bio` stay empty until the founder supplies them in his own words; the page shows a plain empty state until then. Set `approvedOn` (for example `'12 November 2026'`) once he has approved the page and the use of his likeness in generated images: that adds the page to the sitemap and adds `Person` structured data in launch mode.

Pictures: save the PNG masters in `source-images/founders/` (ignored by git) using the names in `founders[0]` (the file names keep the spelling used in Drive, `joe-ayom-...`, even though the displayed name is Joh Ayom): `joe-ayom-founder-cutout`, `joe-ayom-founder-portrait`, `07-joe-ayom-timber-quality-review` and so on), then run `python3 scripts/images.py --founders-only` and `npm run build`. The script writes `f-<name>-<width>` AVIF and WebP files (alpha kept for cut-outs) and `content/founder-images.json`. Any picture that is missing is left out. Every picture is shown with the caption "AI-generated illustration"; when a real photograph exists, add it as another image and adjust `founderPortrait` in `scripts/build.mjs` so that picture does not carry the AI caption (every founder picture is captioned today).

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
