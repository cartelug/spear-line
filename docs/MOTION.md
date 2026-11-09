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

## Safety model

- **Nothing is hidden at start-up.** A reveal state exists only on an element carrying `.rv-arm`, which motion.js adds after confirming `IntersectionObserver` works, and only to elements below the first screen. `html.rv-on` turns the states on. If scripts or the observer are missing, nothing is ever armed and everything is visible. A safety net lifts anything still hidden on screen after four seconds.
- `html.motion-reduced` (system preference or the saved site control) and `@media (prefers-reduced-motion: reduce)` stop every animation and transition. The design is complete without motion: routes are drawn, every section is visible.
- **Only transform, opacity, clip-path, stroke offset and offset-distance animate**; no keyframe touches layout (a unit test enforces it).
- Ambient loops (image drift, glows, the Bar lamp) pause when offscreen (`.is-paused`), while the page is being scrolled (`html.is-scrolling`) and when the tab is hidden. The reading progress bar and header state are the only scroll-linked work, in one rAF loop that reads first and writes after.
- No scroll-jacking, no cursor follower, no pointer tilt.

## Preloader

First visit only: once per browser tab, on a fresh navigation, never for reload, back/forward, same-site arrival, Save-Data, 2g connections, a hidden tab or Reduce motion.

| Step | Desktop | Phone |
| --- | --- | --- |
| Paper panel with the exact wordmark at full contrast (a 160 ms fade at most, never blurred or dimmed) | 0 s | 0 s |
| The route line draws, the spear motif travels it (SVG animation, locked together), nodes appear, a soft sheen passes over the wordmark | 0 to 0.8 s | 0 to 0.8 s |
| The panel lifts once the sequence has played and the hero photograph and fonts are ready | from 1.05 s, no later than 1.35 s; lift 0.45 s | from 0.8 s, no later than 0.94 s; lift 0.26 s |
| The hero route is already drawing in the same place, and the headline rises | continuous | continuous |

Measured with `npm run qa:preloader`: 1.52 s on desktop and 1.08 s on a phone, with the page unlocked even when images and fonts are blocked. There is no progress counter and no delay for effect.

**Fail-safes:** the `finish` timer is registered before any other preloader code; a CSS animation on `.preloader` hides it at 2.4 s even if scripts stop; the page (`main`, header, footer, dock, skip link) is `inert` only while the panel is up.
