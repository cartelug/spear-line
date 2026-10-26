# Spear Line motion system (V9)

Motion lives in three places: `public/boot.js` (preference and preloader, runs before paint), `public/motion.js` (scroll and pointer effects) and `src/styles/70-motion.css` (states and keyframes).

## Safety model

- Every hidden starting state is guarded by `html.motion-ok`. boot.js adds it before first paint; motion.js confirms with `motion-live`. If motion.js has not confirmed within 4 s, boot.js swaps `motion-ok` for `motion-late` and all content shows. Without JavaScript nothing is ever hidden.
- `html.motion-reduced` (set from the system preference or the saved site control) and `@media (prefers-reduced-motion: reduce)` both stop every animation and transition, remove parallax and show final states (route drawn, process lit, words lit, glass full).
- Continuous effects (panning, marquee, glow, backdrops) pause when offscreen via `.is-paused`, and the marquee pauses on hover.

## Effects

| Effect | Where | How |
| --- | --- | --- |
| Preloader | First external visit | Logo glyphs rise in sequence, spear travels with real load progress, doors open, logo FLIPs into the header (1.3–3 s on phones, 1.9–3.8 s on desktop, hard cap +0.4 s) |
| Split headings | Every `h2[data-split]` and hero titles | Words rise out of a mask while the width axis opens 78% → final; widths reserved |
| Reveals | `data-reveal` up / fade / scale / clip | Intersection Observer adds `.is-in`; clip reveals un-crop the frame and settle the image scale |
| Stagger | `data-stagger` lists | Children get `--d` delays |
| Reading reveal | Intro statement | Words brighten as the statement scrolls through the viewport |
| Image panning | `.pan-a`, `.pan-b` | 26–30 s alternating scale and drift |
| Parallax | `data-parallax` | rAF-throttled translate from scroll, fine pointers and wide screens only |
| Tilt | `data-tilt` cards | Pointer-driven rotateX/Y, fine pointers only |
| Counters | Stats (when filled) | Count up once on entry |
| Marquee | Tape, partners | 42 s loop, paused offscreen or on hover |
| Route line | Home | SVG path drawn from scroll, spear positioned with `getPointAtLength`, nodes light |
| Process | Home, How it works | Sticky image swaps as steps become active |
| Stamp | Hero waybill | Once, 1.1 s after load (held while the preloader runs) |
| Bar pour | Bar card | Liquid scales up, ice drops, pick stirs, once |
| Menu | Phone | Circular clip reveal from the button, links rise in |
| Header | All | Hides on scroll down, returns on scroll up, glass when scrolled |
| Page transitions | Supported browsers | Cross-document view transitions: fade out, lift in |
| 404 | Lost page | Spear travels a broken route |
| Cursor | Fine pointers | Soft ring that grows over interactive elements |

## Performance

Animations use transform, opacity, clip-path and font-stretch only. Measured CLS is 0.001 with all motion running. Observers disconnect after one-shot effects.
