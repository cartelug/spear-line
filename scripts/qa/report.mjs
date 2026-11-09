// Assembles docs/V15-QA.md from the measurements in docs/v15 (qa-matrix.md, perf-before/after.json, preloader.md, tests.txt).
// Usage: node scripts/qa/report.mjs <commit-hash-or-label>
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root } from './lib.mjs';

const read = async name => readFile(resolve(root, 'docs/v15', name), 'utf8').catch(() => '(not recorded)\n');
const perfTable = (before, after) => {
  const key = r => r.profile + '|' + r.page, prior = new Map(before.map(r => [key(r), r]));
  const rows = after.map(r => { const b = prior.get(key(r)); const d = (x, y, f = 0) => b ? `${b[x].toFixed(f)} → **${y.toFixed(f)}**` : y.toFixed(f); return `| ${r.profile} | ${r.page} | ${d('fcp', r.fcp)} | ${d('lcp', r.lcp)} | ${d('cls', r.cls, 3)} | ${d('tbt', r.tbt)} | ${d('kb', r.kb)} | ${b ? b.requests + ' → **' + r.requests + '**' : r.requests} |`; });
  return '| Profile | Page | FCP ms | LCP ms | CLS | Long-task excess ms | Transfer KB | Requests |\n|---|---|---|---|---|---|---|---|\n' + rows.join('\n');
};
const before = JSON.parse(await read('perf-before.json').then(t => t.startsWith('(') ? '[]' : t)), after = JSON.parse(await read('perf-after.json').then(t => t.startsWith('(') ? '[]' : t));
const commit = process.argv[2] || 'working tree';

const md = `# V15 launch design pass: QA report

Build: \`${commit}\`. Everything below was measured in this repository's own environment (Chromium via Playwright, the real Node host serving \`public/\`). Where something could not be verified here, it says so.

## 1. What shipped

| Brief section | Shipped |
| --- | --- |
| **Motion and preloader** | One motion language (route trace, directional rise, photo reveal, symbol feedback) on shared tokens. A new paper-ground preloader (about 1.5 s on desktop, 1.1 s on phones): the route line draws, the spear motif travels it, the exact wordmark stays at full contrast throughout, then the panel lifts onto a hero whose own route is already drawing. Once per tab, skipped for reload, back/forward, same-site arrival, Save-Data, 2g and Reduce motion; unlocks even if images, fonts or scripts fail. Content is never hidden until JavaScript proves it can reveal it. No scroll-jacking; ambient loops pause offscreen, while scrolling and in hidden tabs. |
| **Icons** | 12 new line symbols for the divisions and the nine digital capabilities, in the same 48 px / 2 px system with hover, focus and touch states (35 in all). |
| **View transitions** | Cross-document transitions where supported (200 ms out, 360 ms in, direction-aware on back/forward, the service photograph morphs into its hero). Plain navigation elsewhere; focus and history verified. |
| **Responsive and visual design** | New hero: "Line Field" navy background (gradient, horizon glow, generated contour lines, dot lattice) with a photograph panel carrying the route. Section architecture alternates paper, navy, ocean, umber and photographic panels with OKLab seams and a gold route line where light meets dark. One consolidated style stack (see below). Rebuilt home, divisions, digital, founder and contact pages; new phone menu sheet with both call lines. |
| **Performance** | See section 6: CSS −34% gzipped, motion.js −47%, no new third-party code, no new blocking request. |
| **Company profile** | **Not started: waiting for the uploaded PDF** (agreed sequencing). |

### Style consolidation

The old bundle was four generations of overrides (13 files, 115 KB, with the V13 layer redefining the V10 tokens). It is now **11 files, 74.6 KB (16.1 KB gzipped)**: tokens (palette, gradients, motion, space), base, sections, components, chrome, preloader, home, portfolio, pages, motion and devices. The V12–V14 layers and every statically dead rule are gone, and \`scripts/qa/dead-css.mjs\` finds any new ones. \`DESIGN.md\` and \`docs/MOTION.md\` describe the live system (they described V10 and V11).

## 2. Before and after

Screenshots (full page, phone 390 px and desktop 1440 px). Before images are at \`docs/v15/before/\`, after images at \`docs/v15/after/\`.

| Page | Before | After |
| --- | --- | --- |
${['index', 'divisions', 'digital', 'founder', 'contact'].map(p => `| ${p} | [phone](v15/before/${p}-390.jpg) · [desktop](v15/before/${p}-1440.jpg) | [phone](v15/after/${p}-390.jpg) · [desktop](v15/after/${p}-1440.jpg) |`).join('\n')}
| Preloader | [old frames](v15/before/preloader-desktop-sheet.jpg) | [new frames](v15/after/preloader-desktop-sheet.jpg) |

## 3. Preloader timing (\`npm run qa:preloader\`)

${await read('preloader.md')}
The brief asked for 1–1.8 s on desktop and a quicker phone version.

## 4. Route and breakpoint matrix (\`npm run qa:responsive\`)

Every page at 320, 360, 390, 430, 600, 768, 1024, 1280, 1440 and 1920 px; landscape phones 667×375, 844×390 and 932×430; 200% zoom (a 640 px viewport); and 200% text size. Each cell checks horizontal overflow, text clipped by its container, tap targets under 44 px (inline links in running text excepted), distorted images, the phone dock covering footer links, and, below 1100 px, that the menu sheet fills the screen with both call lines at least 44 px tall. **ok** means every check passed; a number is the count of failed checks, listed in \`docs/v15/qa-matrix.json\`.

${await read('qa-matrix.md')}

## 5. Tests

${await read('tests.txt')}

## 6. Performance (lab, Chromium; before → after)

Phone profile: 390 px viewport, Slow 4G (1.6 Mbps, 150 ms RTT) and 4× CPU slowdown. Desktop: unthrottled. Median of three runs. Lab numbers on a shared machine: use them for direction, not as field data.

${perfTable(before, after)}

| Asset | Before (raw / gzip) | After (raw / gzip) |
| --- | --- | --- |
| \`site.css\` | 115,033 / 24,257 B | **74,617 / 16,059 B** |
| \`motion.js\` | 16,523 / 5,396 B | **7,456 / 2,863 B** |
| \`app.js\` | 19,997 / 6,838 B | 19,997 / 6,843 B (unchanged) |
| \`boot.js\` (inlined) | gzip 2,317 B | gzip 2,352 B |
| \`index.html\` | 86,799 B | **73,697 B** |
| \`line-field.svg\` (new, requested by CSS, not render-blocking) | n/a | 12,752 / 5,529 B |

Against the budgets: **CLS stays 0.000** everywhere; **LCP is inside the 2.5 s budget** on every page and profile (0.13–0.15 s on desktop, 0.63–1.09 s on the throttled phone); CSS gzip is smaller; JS gzip is smaller (motion.js −47%, app.js unchanged); there is no new blocking request (the contour SVG is a CSS background and the preloader is inline); total transfer fell (desktop home 896 → 663 KB, phone home 589 → 561 KB). **One regression to be honest about:** on the throttled phone profile LCP rose by about 0.3 s on the divisions page (788 → 1,092 ms) and the contact page (552 → 860 ms). The hero photograph is now a framed panel and is the largest paint, where text used to be; its AVIF is preloaded at the 480 px size and the figure is still under 1.1 s. FCP on the phone home page moved 532 → 600 ms (within the run-to-run spread of this lab setup).

Considered and rejected: \`content-visibility:auto\` on below-fold sections (a mismatch between estimated and real height shifts the scroll position, risking CLS for a small paint saving).

## 7. Decisions and deviations

- **Home page:** the "Business divisions / Digital solutions" tile pair was dropped; the divisions and digital sections that follow it carry the same links. Copy is otherwise unchanged.
- **Removed on purpose:** the custom cursor ring, pointer tilt, magnetic buttons, hero pointer drift, light beam and dust, outlined tagline, marquee tape and the reading-reveal statement. They cost battery without telling anyone anything, and some were hover-only.
- **Removed copy:** the unexplained "Next move" stamp on the consignment note.
- **Added copy:** the status legend on the divisions page describes the three existing labels in one line each ("Requirements are discussed and confirmed for each enquiry"; "The direction is taking shape and its scope is still being confirmed"; "An idea under consideration. Nothing is available yet."). The founder quote, nine capabilities, six divisions, nine sourcing topics and the "THE 97 World is proposed" wording are unchanged. **The founder quote has not yet been checked against the supplied profile PDF.**
- **Contact numbers** still come from configuration (\`site-config.js\` on Pages, environment variables on the Node host), not from page source. Both lines are \`tel:\` links on the contact page, menu, footer and closing section. The e2e server is given the same numbers.
- \`npm run critical\` was regenerated for the new stylesheet.

## 8. Launch blockers (unresolved)

1. **Business email.** \`spearline.africa\`, the mailbox, DNS (SPF, DKIM, DMARC) and the owner notification path are unverified. No \`mailto:\` link or address is published; the site says the email is planned. Tests enforce this.
2. **Online enquiries.** No HTTPS origin or Node enquiry host is deployed; GitHub Pages is a static preview that cannot accept enquiries, and \`npm run launch:check\` still refuses \`SITE_LAUNCH=1\`. The site stays \`noindex\`.
3. **Fonts.** MTN Brighter Sans and Sky Text are corporate typefaces taken from a free-font site. The licence for web (and, later, PDF) embedding is unconfirmed (\`ASSETS.md\`). If it does not cover embedding, swapping them is a two-block change in \`00-tokens.css\`.
4. **Imagery.** All photography is AI-generated and labelled illustrative; there is no verified stock, permit, facility, partnership or previous project, and the Bar's menu and alcohol status are undecided.
5. **Company profile.** Waiting for the uploaded PDF (the founder quote must match it exactly). A re-upload of the logo, if different from \`logo-wordmark-gold.png\`, has not been seen.
6. **Published link.** The sandbox's network policy blocks \`github.io\`, so the live Pages site could not be fetched from here. Check the deployed site after the push.
`;
await writeFile(resolve(root, 'docs/V15-QA.md'), md);
console.log('docs/V15-QA.md written,', md.length, 'bytes');
