# Spear Line motion system (V15)

One language: **a route that traces.** Everything that moves is a version of four patterns, built from the tokens in `00-tokens.css` (durations 120/200/360/600/900 ms, easings `--ease-out/-io/-std/-spring`, distances 8/16/28 px, stagger 60 ms capped at six steps). Motion lives in `src/boot.js` (preference and preloader, inlined into every page), `public/motion.js` (reveals, pausing, timeline, FAQ index) and `src/styles/45-preloader.css` and `70-motion.css`.

## Four patterns

| Pattern | Where | How |
| --- | --- | --- |
| **Route trace** | Preloader line, hero route, "How we work" route, section seams, process timeline | A gold line draws (`stroke-dashoffset` or `scaleY`), and the stops appear as it reaches them |
| **Directional rise** | Copy, cards, CTAs, headings | 28 px rise and fade (`data-reveal`), headings rise word by word out of a mask (`data-split`); first-screen headings are split at build time and animate in CSS from the first paint |
| **Photo reveal** | Panels, feature images | A clip that opens (`data-reveal="clip"`) while the photograph settles from 1.08 to 1 |
| **Symbol feedback** | Icons, buttons, cards | Hover, keyboard focus and touch (`:active`) nudge or tilt the icon and lift the card; the arrow disc slides on buttons |

Page transitions use cross-document view transitions where supported (`@view-transition`): 200 ms out, 360 ms in, a 28 px shift that reverses on back (`pagereveal` sets the `back` or `forward` type in boot.js). A service card's photograph grows into that service page's hero. Other browsers navigate normally.

## Coordinated scenes (V17)

`public/scenes.js` adds a small set of scroll scenes on top of the patterns above, using GSAP 3 and ScrollTrigger (vendored at `public/vendor/gsap/<version>/`, loaded same-origin, once, after the page is usable and only on pages that have a scene hook). They are decoration over a complete static layout: with the runtime blocked, late, unsupported, a constrained network (`saveData`, 2g) or reduced motion, nothing is hidden and nothing is requested.

| Scene | Hook | What it owns | Notes |
| --- | --- | --- | --- |
| Hero | `.hero--home` | `.hero-photo img` translate (up to 28 px wide / 8 px phone), `.hero-seam` scaleY, `.gs-owned` | Progress p runs 0–1 from page top until the hero's bottom reaches the top. Photo 0–0.6, seam segment 0.45–0.85. The hero copy never fades or moves. |
| Services | `[data-scene=services]` | `.is-staged`, `.svc-stage-item.is-active`, `.svc-card.is-current`, `--stage-i` | Only at ≥1100 px wide, ≥720 px tall, stage ≥320 px high and chapters ≥320 px wide. The chapter nearest 45% of the usable viewport picks the photograph (36 px hysteresis); focus on a chapter syncs it; the image swaps only once decoded and only if still current. Crossfade is a 220 ms CSS transition. Otherwise chapters stay stacked with their own photographs. |
| Process | `[data-scene=process]` | `--rp`, `.is-current`, `.gs-owned` | Fill runs from the first to the last node against the 62% reading band. All four steps stay visible. |
| Digital | `[data-scene=digital]` | `--dl`, `.ico` transform, `.dg-arm` | One 0.6 s line + two-group icon sequence on entry, only when the list starts below the first screen. |

Property ownership: where a scene owns a property, the native CSS timeline / JS fallback for that element stands down (`.gs-owned`). Scenes are created inside `gsap.matchMedia()` (wide-and-tall vs everything else) and reverted as a unit; `createMotion()` returns `{ scenes, refreshLayout, destroy }`. Layout changes (`spear:layout` events from the catalogue and FAQ, fonts, bfcache restore) coalesce into one ScrollTrigger refresh.

Without GSAP: division cards enter in adjacent pairs, the founder rule and closing rule complete on entry (CSS), catalogue filters give at most six cancellable 200 ms feedback animations on newly visible cards, and the photo viewer swaps images only when ready and only for the newest selection.

Extra budget notes: the optional runtime plus `scenes.js` is about 51 KB gzip (core 28.4, ScrollTrigger 18.0, scenes.js 4.5), under the 60 KB budget.

## Safety model

- **Nothing is hidden at start-up.** A reveal state exists only on an element carrying `.rv-arm`, which motion.js adds after confirming `IntersectionObserver` works, and only to elements below the first screen. `html.rv-on` turns the states on. If scripts or the observer are missing, nothing is ever armed and everything is visible. A safety net lifts anything still hidden on screen after four seconds.
- `html.motion-reduced` (system preference or the saved site control) and `@media (prefers-reduced-motion: reduce)` stop every animation and transition. The design is complete without motion: routes are drawn, every section is visible.
- **Only transform, opacity, clip-path, stroke offset and offset-distance animate**; no keyframe touches layout (a unit test enforces it).
- Ambient loops (image drift, glows, the Bar lamp) pause when offscreen (`.is-paused`), while the page is being scrolled (`html.is-scrolling`) and when the tab is hidden. The reading progress bar and header state are the only scroll-linked work, in one rAF loop that reads first and writes after.
- No scroll-jacking, no cursor follower, no pointer tilt.

## Preloader

Every arrival: when the site is opened, when a page is refreshed, and (a shorter sequence) when a link is followed within the site. Each page shows its own icon and name in a chip under the route, set in `PL_PAGES` in `scripts/build.mjs`. Never for back/forward, Save-Data, 2g connections, a hidden tab or Reduce motion. A page prerendered from a touched link plays its preloader when the visitor arrives, and the cross-document view transition is skipped whenever the preloader runs.

Moving between pages: the wordmark is smaller, the page chip leads, and the panel lifts from 0.52 s on phones (0.6 s on desktop), no later than 0.68 s (0.8 s); lift 0.26 s. The table below is the full sequence for an open or a refresh.

| Step | Desktop | Phone |
| --- | --- | --- |
| Paper panel with the exact wordmark at full contrast (a 160 ms fade at most, never blurred or dimmed) | 0 s | 0 s |
| The route line draws, the spear motif travels it (SVG animation, locked together), nodes appear, a soft sheen passes over the wordmark | 0 to 0.6 s | 0 to 0.6 s |
| The panel lifts once the sequence has played and the hero photograph and fonts are ready | from 1.05 s, no later than 1.35 s; lift 0.45 s | from 0.8 s, no later than 0.94 s; lift 0.26 s |
| The hero route is already drawing in the same place, and the headline rises | continuous | continuous |

Measured with `npm run qa:preloader`: 1.52 s on desktop and 1.08 s on a phone, with the page unlocked even when images and fonts are blocked. There is no progress counter and no delay for effect.

**Fail-safes:** the `finish` timer is registered before any other preloader code; a CSS animation on `.preloader` hides it at 2.4 s even if scripts stop; the page (`main`, header, footer, dock, skip link) is `inert` only while the panel is up.

## V16 mobile motion upgrade

Researched against current guidance (WebKit's scroll-driven animations guide, Chrome's motion guidance): animate only compositor properties (`transform`, `opacity` and the individual `translate`/`scale`), keep parallax small because wide-field motion causes discomfort, feature-detect scroll timelines, and handle reduced motion case by case.

| Upgrade | How | Fallback |
| --- | --- | --- |
| Hero sequence | Breadcrumb, kicker, lede and buttons rise in order after the headline; the photo settles in. `backwards` fill, so nothing is ever left hidden | none needed |
| Hero depth | The photo drifts 8% and the copy softens as you scroll away (`animation-timeline: scroll(root)`) | `motion.js` sets `--hy` in the shared rAF loop (`html.sd-js`) |
| Photo depth | Strip, division and service photographs counter-drift 4% inside their frames (`view()` timeline) | `--py` from `motion.js` |
| Seam | The gold seam line draws from the centre and its node pops as the section enters | seam is simply drawn |
| Swipe galleries | Under 560 px each photo strip is a snap-scrolling row: the centred photo is full size, neighbours recede (`view(inline)`), a gold progress bar tracks the swipe; the row is a labelled, focusable scroll region | `IntersectionObserver` marks the centred photo |
| Touch feedback | Cards and buttons press in (`:active`, 90 ms) and a gold ripple spreads from the finger; Android buttons and dock links give an 8 ms haptic tap | none for mouse or keyboard |
| Dock | Springs up after the preloader; the current tab's icon pops | none needed |

All of it is behind `html.motion-ok`: Reduce motion (system or the site control) shows the finished design, and `motion.js` stops the ripple and fallback loop.
