# Spear Line V12 — Complete Motion, Interaction & Transition System

**Design status:** architectural specification. Individual timings and routines below are TARGETS, not a claim they are implemented. Current V12 code already has a progressive motion module, a tab-scoped preloader, a reveal observer, some CSS scroll-driven animations, fine-pointer interactions, an accessible mobile menu and reduced-motion controls. These must be audited and rationalised before adding more.

**Identity:** composed confidence, precision of trade, modern African enterprise. Spear Line must feel like a carefully directed institutional film, not an animation demo. The site should have a few intentional moments of surprise surrounded by clear, fast, usable interfaces.

## 1. Motion philosophy — six non-negotiable rules

1. **Meaning before movement.** Every animated element must communicate entrance, hierarchy, location, response or progress. Decorative motion without a purpose is removed.
2. **One star per viewport.** While the hero reveals, do not run a competing marquee, rotating symbols, cursor spectacle and card entrance at full intensity. Sections have one dominant gesture and optional supporting micro-interactions.
3. **Never make reading wait.** Source HTML contains all meaningful words, links and controls. No animation can defer critical content, CTAs or focusable elements. On slow devices show the final state immediately.
4. **Physical plausibility.** Short vertical translations, layer depth, restrained scale and gentle easing. No default bounces, random rotation, excessive zooms, violent perspective or perpetual text scrambling.
5. **Reduced motion is an equally designed product.** Remove spatial, scroll-linked and background movement, but retain instant feedback, hierarchy, focus and state changes. Never use opacity:0 as a permanent reduced-motion state.
6. **Motion remains subordinate to performance.** The animation system cannot compromise Core Web Vitals, low-end Android usability, text input, accessibility or battery life.

## 2. Motion inventory: current versus V12

| Existing component/selector | Existing behaviour in source | V12 decision |
|---|---|---|
| src/boot.js preloader; HTML preloader | First-visit logo doors, skipped after session/reduced/hidden | Keep only with strict exit budget and immediate content availability |
| public/motion.js data-split and .w/.wi | Word-split headings and reveal | Use for first hero and selected section headings, not every subheading |
| data-reveal and data-stagger | IntersectionObserver progressive reveal; 90 ms stagger | Keep, standardise and cap group staggering |
| data-parallax and .pan | Native timeline when supported; JavaScript fallback on wide displays | Cap movement, disable on phones and reduced motion |
| .marquee, .glow, .backdrop, .topo | Existing ambient visual treatments pause offscreen | Restrict to rare editorial sequences; do not reintroduce every loop |
| .site-header / .progress | Sticky/hidden-on-scroll header and progress indicator | Refine for stable scroll direction, nav-open and focus |
| .menu-toggle / #site-menu | Menu state, inert background, focus trap and Escape | Refine choreography without altering keyboard semantics |
| .card [data-tilt], magnetic buttons, cursor | Fine pointer visual response | Reduce amplitude and use only on select callouts |
| [data-route], [data-process], [data-read] | Scroll-linked narrative sequences in older homepage | Review and remove unused scripts when V12 homepage no longer renders these; do not leave dead work |
| .bar-card | One-time reveal/pour on intersection | Preserve only on upcoming-Bar sections; must never imply venue is open |
| V12 .v12-division-card | Hover image enlargement and scroll reveal | Elevate to controlled image-mask/number/text sequence |
| V12 digital cards, monogram founder art | Mostly static presentation today | Add measured sequencing and persistent non-motion fallback |

**Audit prerequisite:** catalogue CSS keyframes, JS observers, requestAnimationFrame loops and root-state classes; map each to a visible page or remove it. Never install GSAP or Lenis purely for prestige. The current native/CSS approach is preferred unless a genuine requirement cannot be met within measured performance limits.

## 3. Motion tokens: the universal grammar

| Token | Value target | Intended use |
|---|---|---|
| instant | 0–80 ms | State changes and reduced-motion fallback |
| tap | 100–140 ms | Pressed states, icon response |
| quick | 160–220 ms | Hover underline, border, icon nudge |
| control | 220–320 ms | Accordions, filter feedback, header transitions |
| reveal | 420–580 ms | Text blocks, list items, interface sections |
| editorial | 600–850 ms | Image masks, cards and major text entrances |
| hero | 720–980 ms | First-screen narrative, image and title |
| overlay | 360–520 ms | Mobile menu and page-level sheets |
| ambient | 8–20 s | Rare subtle decorative drift, not essential meaning |
| within-list stagger | 45–75 ms each, cap total 320 ms | Cards or short navigation groups |
| section stagger | 90–130 ms | Kicker → title → description → CTA |

**Easing (token names, not universal hard-coded keyframes):**
- Exit / smooth deceleration: cubic-bezier(0.22, 1, 0.36, 1)
- General / even: cubic-bezier(0.25, 0.46, 0.45, 0.94)
- Deliberate mask / reveal: cubic-bezier(0.65, 0, 0.35, 1)
- Press / focus: cubic-bezier(0.2, 0, 0.2, 1)
- Tiny playful accent only: cubic-bezier(0.18, 0.89, 0.32, 1.16)

**Distance and scale constraints:**
- Text entrance: 12–24 CSS px vertical, never more than 30.
- Card entrance: 18–30 px vertical with 0.96–1 opacity.
- Image zoom: from 1.025–1.045 to 1, or max 1.04–1.055 on hover; avoid cumulative image+container zoom.
- Image drift/parallax: ±12–28 CSS px on large screens, bounded regardless of section height.
- Tilt: max 2–3 degrees on optional selected cards; no tilt on full-width text surfaces.
- Buttons: 0–2 px upward hover or 2–4 px arrow motion. Magnetic translation is optional, capped ±4 px, never displaces focus outlines.
- Ambient layers: optical motion less than 15 px over a long interval; pause when outside viewport, tab hidden or user scrolling heavily.

## 4. Hero choreography — above the fold

**First-load timeline measured from when content is paint-ready, not when the network begins:**

| Relative moment | Element | Behaviour |
|---|---|---|
| t = 0 | Background and core copy | Visible fallback, hero image decoded/reserved, semantic H1 present |
| t + 100 ms | Background | Very light scale correction and contrast settle; optional |
| t + 150 ms | Eyebrow | Opacity + 10 px rise, 420 ms |
| t + 240 ms | Headline line 1 | Mask reveal and 16 px rise, 720 ms |
| t + 330 ms | Headline line 2 | Same with 90 ms offset, 720 ms |
| t + 480 ms | Lead paragraph | Opacity and 12 px rise, 520 ms |
| t + 570 ms | Primary/secondary CTAs | Opacity and 8 px rise, 430 ms |
| t + 640 ms | Enquiry panel/waybill | Opacity and 14 px rise, 500 ms |
| t + 900 ms | Quiet state | No new ornamental entrances; user is in control |

On revisit, browser back/forward cache, reduced motion or a delayed JS load, display the settled state without replay. If a first-visit preloader is retained, it must never hide the entire page behind a prolonged flourish. Target an optional total visual sequence under ~1.4 s; hard graceful exit at 1.8 s; logo doors do not await video, font or third-party network activity. The first input must work immediately after the overlay's visual exit. Restore focus without scrolling a hidden element into view.

**Hero interaction:** cursor-based depth only when pointer:fine, hover:hover, adequate CPU and motion allowed. Use two restrained layers, not continuous 3D tilting of text. A scroll cue is discoverability, never a scroll trap.

## 5. Global navigation and route transitions

### Header states
- At top: low-contrast transparent treatment over hero with clear white logo and controls.
- After first ~24 px scroll: solid or frosted dark surface with predictable text contrast, 200–260 ms.
- Downward scroll after a deliberate threshold: optional header retreat. Must remain pinned if it contains keyboard focus, menu is open or a text field is active.
- Upward scroll: header returns within 180–240 ms; do not oscillate on tiny touch scrolls (use direction hysteresis).
- Progress line: informational but nonessential; obey reduced motion; never require user to scroll to activate content.

### Desktop navigation
- Link focus and hover: underline or color reveal in ~180 ms; no slot-machine word swaps that reduce readability.
- Divisions menu, if implemented: 2-column/3-column panel with obvious labels and keyboardable links. Open by click and keyboard; if hover supports opening, click must still work. Escape returns focus to trigger.
- Any mega-menu panel must have a clear pointer path, no accidental dismiss gap and zero content flashing when moving between trigger and submenu.
- No decorative autoplay inside navigation.

### Mobile full-screen menu
- Functional state machine: CLOSED → OPENING → OPEN → CLOSING → CLOSED.
- Open overlay: 380–480 ms visual transition; under 500 ms to an actionable link.
- Link entry: 40–60 ms stagger, no more than 300 ms total; all links remain semantically present during animation.
- Close: ~260–350 ms and restore focus to the menu button after Escape.
- Background inert and scroll locked only while menu is open; close on route selection, Escape, large-screen breakpoint transition, bfcache restoration and outside-click when intended.
- Rapid double taps, changing orientation, zoom changes, reduced-motion toggle and browser back should never leave the page inert or body scroll locked.
- Visible focus style and 44×44 px target for all links and close controls.
- Use overlay as an editorial index, not a hidden carousel.

### Route changes
Preferred default: native navigation, existing prerender/prefetch only where appropriate, instant functional response. Add View Transitions only as progressive enhancement when supported, with stable fallback. Limit any transition to 140–250 ms crossfade or small content shift; never intercept navigation to play a 1.5 s cinematic wipe. Disable under reduced motion, when back/forward navigation would break state, or on unsupported browsers. Never duplicate H1, trap focus or block the browser's back action.

## 6. Homepage V12: full section-by-section motion storyboard

| Stage | Existing V12 section | Dominant motion cue | Supporting motion / exit |
|---|---|---|---|
| 01 | Cinematic hero | Word-mask H1 reveal with image settle | 2-CTA stagger; then stillness |
| 02 | Company direction | Big typographic reveal when 18% visible | One vertical rule extending; paragraph appears |
| 03 | Six divisions | Featured tile unveils first, remaining tiles follow reading order | Number/status/title rise; hover image depth only on fine pointer |
| 04 | Trade pathways | Three large service cards enter left-to-right | Icon nudge and single hover scale |
| 05 | Digital feature | Image mask horizontal crop while title lifts | Capability index draws; no spinning mockup |
| 06 | Joh Ayom founder feature | Monogram geometry resolves into stable composition | Once photo approved, light crop-to-frame reveal, never synthetic face morph |
| 07 | Principles / work method | Four numbered statements appear with measured stagger | Thin divider line gently extends |
| 08 | Bar teaser (coming soon) | Warm light detail / card reveal once | Bar illustration finishes once, then stops |
| 09 | Closing invitation | Headline reveal and accent hairline | Primary enquiry CTA immediately usable |

**First-section isolation:** while the hero is playing, pause decorative motion behind it; do not run the six-division cards until within their observer threshold.

**Story chapters should not block:** repeated scrolling never forces the user to wait for animation; wheel and touch movement remain native. If the user jumps via an anchor or keyboard focus, content is immediately complete.

## 7. Other page motion plans

### Business Divisions page
- Hero photograph slight downward camera settle as heading rises.
- Six cards animate by row: 1 featured, 2/3, then remaining; cap full grid visual sequence under ~950 ms once in view. On mobile cards animate one by one only as each individually enters.
- Card index appears immediately; overlay title can reveal only after background visual is perceptible, but never behind a delay in screen readers.
- On pointer-fine hover: photo zoom max 1.05, light gradient deepens, arrow moves 3 px; focus-visible achieves equivalent emphasis without motion.
- Status remains clearly legible and never pulses or changes wording during entrance.

### Digital Solutions page
- Open with typographic stagger and a static conceptual visual.
- Six capabilities use a two-column editorial list: small index → title → description; fade and 10 px lift, 45–65 ms stagger inside one short visible row.
- Optional single diagonal data line or SVG trace (decorative only) that completes once; do not create fake scrolling software dashboards, percentages or client results.
- Proposal CTA and terms are entirely visible without movement.

### Joh Ayom Founder page
- Keep authenticity central. Monogram J/A may subtly offset 12–18 px and settle once.
- Real portrait, if approved: cinematic single-mask reveal 750 ms; image must not be distorted, face-swapped, animated into speech or made to appear at fabricated business events.
- A short approved quote may appear with a thin underline or left-side rule, 400 ms.
- Biography, timeline and factual milestones appear cleanly in reading order; never parallax the portrait on small screens or crop eyes behind text.
- Leadership cards, when supplied, use ordinary focus/hover feedback and respectful portrait motion.

### Existing commercial pages (Vehicles, Supplies, Logistics)
- Preserve hero image first paint and clear route to enquiry.
- Alternating feature images get single edge-mask reveals while text lifts 16 px.
- Vehicle availability is never fabricated through animated badges.
- Process/how-it-works: existing timeline fills only after user scroll; static full list under reduced motion.
- Enquiry form: show validation immediately; error summary and focus should not wait for reveal. Success/download draft state changes 150–220 ms without confetti.
- FAQ: accordion expands with stable height (if animated) within 200–260 ms; avoid smooth height animation for large unknown content or prefer immediate open/close when reduced.
- Bar: one warm illustrative flourish maximum; no live-booking or "open" animation.
- Contact/footer/privacy/404: simple hierarchy reveal or none.

## 8. Interaction choreography — precise event contracts

| Interaction | Required feedback | Motion target | Special cases |
|---|---|---|---|
| Button hover | contrast/border + optional arrow | 160–200 ms | focus gets same visibility; touch has no hover requirement |
| Button press | direct opacity/scale micro-response | 90–130 ms | never suppress click; disabled is not animated as active |
| Card hover | image scale, arrow nudge | 240–450 ms | pointer-fine only; no parallax on touch |
| Keyboard focus | highly visible outline instantly | 0–80 ms | no moving focus outline or delayed focus |
| Tabs/filters | selected state and panel swap | 150–220 ms | aria state changes before visual tween |
| Accordion | disclosure state | 0–250 ms | native details semantics retained |
| Slider/rail | pointer/keyboard scroll | 180–280 ms if requested | reduced uses instant; no scroll-snap lock |
| Form field error | message and border appear immediately | 0–160 ms | place focus on summary/field, live announcement |
| Form status | clear text/icon response | 120–180 ms | accurate sending vs drafted states |
| Mobile menu | overlay and ordered links | 380–480 ms | focus trapped, background inert, Escape works |
| Navigation | route begins promptly | 0–250 ms | no artificial loading state |

## 9. Pointer, touch, keyboard and system preference policy

- Never infer hover capability from viewport width. Use hover:hover AND pointer:fine.
- Coarse touch: no custom cursor, no hover-only disclosure, no magnetic button physics, no card tilt.
- Stylus, keyboard and voice navigation: all controls reachable; no essential information dependent on pointer movement.
- Disable cursor animation while touch input is primary, tab hidden, modal/menu open or reduced motion is enabled.
- Apply the operating system's prefers-reduced-motion setting, then respect the existing local site toggle; avoid a separate conflicting preference source.
- Under reduced motion: disable masks that create spatial travel, parallax, smooth anchor scroll, marquee, looping lights and major camera zooms. Retain instant content/state visibility and focus.
- On visibilitychange/pagehide/pageshow: pause decorative requestAnimationFrame loops, cancel stale RAF where safe, restore correct menu state and avoid replaying hero/intro on bfcache restoration.
- Battery saver/Save-Data and slow device strategies: avoid starting decorative background loops and expensive image transitions; do not detect hardware by intrusive fingerprinting.
- Screen reader text must be semantically contiguous. Heading word splitting may create visual spans but must not duplicate words or disrupt accessible names.

## 10. Technical architecture and source-file contract

**Authoritative files**
- src/boot.js: immediate first-paint state, safe one-time preloader and no-FLASH fallback.
- public/motion.js: a single progressive animation coordinator, observers, preference and pointer logic.
- public/app.js: navigation state, real interaction handlers, form/rail behavior; do not merge it with visual effect timing in a way that blocks usability.
- src/styles/*.css: original CSS tokens, transitions, media preferences and responsive states; src/styles/zz-v12-redesign.css is the current V12 last-layer module.
- scripts/build.mjs and content/site.mjs: content markup and semantic data-motion hooks; never hand-edit generated HTML.
- tests/e2e/site.e2e.mjs and tests/site.test.mjs: behavior, keyboard/zoom/mobile, reduced-motion and structural contracts.

**Coordinator design**
1. Identify and classify each motion trigger: on-load, in-view, hover, click, scroll, data-state.
2. Provide component-level animation variants, plus ONE global token dictionary.
3. Register observers only for elements actually present on the current page.
4. Prefer CSS keyframes/transitions/scroll timelines when they run without layout thrash; keep JavaScript for state coordination and unsupported cases.
5. Batch DOM reads before writes. Avoid querying layouts separately for every mouse move and card if no corresponding card is active.
6. Use IntersectionObserver instead of scroll handlers for one-time entrances; unobserve after completion.
7. Only use requestAnimationFrame while something visible actually needs a frame.
8. Keep animateable surfaces on transform and opacity; do not animate width, margin, top, left or heavy full-screen backdrop-filter unless specifically benchmarked.
9. Do not pin huge image layers with will-change permanently. Turn on per interaction and remove when settled.
10. Add a debug flag for QA to reveal active observers and disabled motion; never ship debug overlays by default.

**Important:** A smooth-scroll library is not automatically superior. Native scrolling protects accessibility, touch and input latency. Adding GSAP/ScrollTrigger or Lenis would require a separate bundle, motion-preference, battery, browser-history and regression review.

## 11. Performance budgets and failure modes

| Measure | Gate |
|---|---|
| Mobile Lighthouse Performance | 90+ target on tested routes, with actual machine/network noted |
| Accessibility | 95+ target; zero axe WCAG 2.x A/AA critical violations |
| LCP | <=2.5 s at field 75th percentile target; hero must not wait for motion |
| INP | <=200 ms at p75 target; interaction handler work must not introduce long tasks |
| CLS | <=0.10 at p75 target; animation must not alter layout geometry unexpectedly |
| Interactive animation | Prefer 60fps on midrange tested phone; no persistent visible frame drops |
| JS main-thread tasks | Avoid work over 50 ms; throttle and coalesce reads/writes |
| Preloader | Optional first-view only, visually <=1.4 s target, hard fallback ~1.8 s |
| Ambient motion | 0 on reduced motion/hidden tab/Save-Data; minimal or none on phone |

Critical failures: animated opacity leaves content invisible after JS error; footer is unreachable; heading split duplicates accessible text; focus moves behind menu; horizontal overflow arises on scroll; animation causes an enquiry submission double-click; preloader remains inert; animation runs after unmount/page hide.

## 12. QA matrix, regression and sign-off

**Functional:** hero before JS, with JS late, with JS blocked, with images delayed; menu quick taps, Escape, Tab/Shift-Tab, orientation/resize; reduced-motion both OS and site toggle; bfcache; anchor navigation; form error and drafted enquiry; rail drag/swipe/keyboard; FAQ open/close; long service titles; no fake numerical counters.

**Visual:** capture settled state and entrance progression at 320, 390, 768, 1024, 1363, 1440, 1920 CSS px; test 200% and 400% text/zoom reflow; check large body font, high contrast, light/dark system, slow paint and image placeholders.

**Performance:** Chrome performance traces with CPU throttling and midrange Android reference; confirm no overlapping animation/scroll handlers; inspect paint flashing/compositing; audit image decode impact and layout bounds. Prefer native tool measurements instead of self-reported scores.

**Acceptance:** every meaningful element is available immediately, visual cues match the choreography, reduced-motion completion has no hidden content, menu/focus state is correct, no animation requires a purchase/booking claim, and all routes pass automated and manual QA.

## 13. Motion implementation backlog / priorities

**P0 — architecture and accessibility:** inventory and remove obsolete effects; consolidate tokens; enforce reduced-motion and preloader safety; keyboard/menu state; static fallback; first-screen load budget.

**P1 — complete V12 story:** tuned hero, six-division card entrances, digital feature, founder reveal, CTA and footer; mobile-specific reductions; hover/focus parity.

**P2 — polish:** careful cross-page transitions (only if safe), optional SVG path/detail, rail feedback, scroll header tuning, fine-pointer microinteractions. No decorative features ship if budgets fail.

**P3 — verification:** performance traces, realistic network/CPU, mobile Safari, Chrome Android, Firefox, keyboard/screen-reader, zoom, bfcache, owners' visual review.

**Definition of done:** motion feels intentional when enabled, perfectly usable when reduced or unavailable, and does not make Spear Line appear more operational than its verified business record.
