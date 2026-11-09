# Spear Line design system (V15): one line connecting opportunities

Spear Line trades vehicles, supplies and freight across East and Central Africa, and is growing into six divisions. The site is a premium trade-and-logistics front door: deep navy and warm paper, gold for action, photography that is plainly labelled illustrative, and one idea carried through every motion, graphic and icon: **a single route line that connects opportunities.**

The stack is `src/styles/*.css`, bundled into `public/site.css` by `npm run build`. This file replaces the V10 "golden hour" description; the V12 documents in `docs/` are history.

## Tokens (`src/styles/00-tokens.css`)

| Group | Tokens | Use |
| --- | --- | --- |
| Dark tones | `--abyss #061F30`, `--navy #082F47`, `--ocean #0D3F5C`, `--umber #2B2016` | Heroes and bands (navy), footer (abyss), second dark (ocean), warm dark for digital, founder and the Bar (umber) |
| Light tones | `--paper #FBF8F2`, `--sand #F0E7D8`, `--mist #EDF3F6` | Editorial sections, cards, form surfaces |
| Image-derived | `--tone-port #44392B`, `--tone-ground #493926`, `--tone-bar #3B2512` | Average of the 480 px photographs, darkened: the warm light the dark sections borrow |
| Text | `--ink #162C39`, `--ink-2 #4B6270`, `--chalk #fff`, `--chalk-2 #C9DCE5` | Text on light and dark grounds |
| Accents | `--gold #EB9122`, `--gold-2 #F6AD46`, `--gold-3 #FFD08A`, `--gold-deep #A45B0C`, `--sky #0B9DCB`, `--sky-deep #086E93` | Gold fills for action (navy text, 6.9:1); `--gold-deep` for gold text on paper; sky for links and focus |
| Gradients | `--g-navy`, `--g-horizon`, `--g-dawn`, `--g-umber`, `--g-paper`, `--g-veil-navy`, `--g-veil-up`, `--g-gold` | Depth that guides the eye without muddying text: veils sit under copy, never over photographs' subjects |
| Space | `--section`, `--blend`, `--gap`, `--gap-lg`, `--gutter` | Fluid with `clamp()`; layouts adapt without per-device overrides |
| Motion | `--dur-1..5` (120/200/360/600/900 ms), `--ease-out/-io/-std/-spring`, `--dist-1..3` (8/16/28 px), `--stagger` (60 ms) | Every animation uses these |

The older names (`--soil`, `--earth`, `--olive`, `--dusk`, `--bone`, `--sun*`, `--river*`) survive as aliases for a few legacy page rules.

## Type

MTN Brighter Sans Bold (`Spear Display`: headlines, buttons, labels) and Sky Text (`Spear Text`: reading). Fluid scale `--t-xs` to `--t-6xl`. Metric-matched Arial fallbacks mean no layout shift when the fonts arrive. Sentence case, no tracked caps, no emoji. **Licence:** both are corporate typefaces taken from a free-font site; see ASSETS.md and the launch blockers in `docs/V15-QA.md`.

## Wordmark

`assets/logo-wordmark-gold.png` (2172 × 724, RGBA) is the only logo. It is never redrawn, stacked, cropped, outlined or stretched. The approved ochre (about `#985800`) is 5.8:1 on white and 2.4:1 on navy, so:

- on light grounds (preloader, paper sections) it is used as supplied;
- in the header it is the permitted black conversion (`filter: brightness(0)`);
- on dark grounds (footer, giant footer mark) it is the white conversion (`brightness(0) invert(1)`), which is the same alpha mask, so the geometry is identical.

## Section architecture

Every section is `.section.tone-X` with `from-Y`/`to-Z` classes naming its neighbours (the build adds them). The first and last `--blend` of its height mixes 50% of the neighbour's colour in OKLab, so seams are soft. Where a light section meets a dark one the build adds `.seam`: a thin gold route line with a single node. Pages alternate **editorial paper** (cards, grids), **deep navy and umber** (heroes, bands), **photographic panels** (closing, panels) and **quiet route moments** (the four-step "How we work" route).

## Line Field (the hero background)

An original, build-generated background, reused on heroes and closing sections: a navy gradient, a warm horizon glow (`--g-horizon`), contour lines (`assets/line-field.svg`, ~12 KB, made by `scripts/line-field.mjs` from seeded noise with marching squares, identical on every build), a dot lattice at 900 px and wider, and a photograph panel carrying the route: one gold line through three stops (vehicles, supplies, logistics). Heroes for digital, divisions and contact swap the three icons for their own topic. No filters or blend modes sit on the LCP photograph; the grade comes from an overlay gradient.

## Motion

See `docs/MOTION.md`: four patterns (route trace, directional rise, photo reveal, symbol feedback), the safety model (nothing is hidden until JavaScript proves it can reveal it), and the preloader.

## Icons

`assets/icons.svg`: 35 symbols on a 48 px grid, 2 px round strokes. New in V15: materials, wellness, property, web, brand, booking, video, megaphone, automation, commerce, analytics and AI (the six divisions and the nine digital capabilities). Icons answer hover, focus and touch (`:active`) with a small scale and tilt; nothing depends on hover alone. No handshake or other symbol that implies a confirmed partnership.

## Responsive

Intrinsic: `clamp()` type and space, `minmax()` grids, container queries for the consignment note, `aspect-ratio` panels. Verified at 320, 360, 390, 430, 600, 768, 1024, 1280, 1440 and 1920 px, three landscape phones, 200% zoom and 200% text (see `docs/V15-QA.md`). On phones the hero photograph sits under the buttons, the note comes last, and the dock gives thumb navigation.

## Accessibility

axe passes on every page with and without Reduce motion. Visible focus (3 px, gold on dark, sky on light), 44 px targets, the page is `inert` while the menu or preloader is open, the phone menu is a sheet with both call lines, and Reduce motion (system or site control) shows a complete static design.
