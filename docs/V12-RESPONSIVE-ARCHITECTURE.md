# Spear Line V12 — Complete Responsive Layout & Device Architecture

**Status:** detailed engineering/design plan for V12. Existing V12 CSS and core V11 routes supply a starting point, not proof of universal responsiveness. All stated dimensions and layouts are targets to validate in browser.

**Goal:** one unified premium corporate experience across 320–2560+ CSS px, phones with dynamic browser chrome and safe areas, tablets, desktop, 200–400% zoom, long translated titles, touch/keyboard/pointer and unreliable networks. Mobile must be deliberately composed, not a shrunken desktop.

## 1. Eight responsive operating contexts

| Context | Width / behavior | Grid and navigation | Visual emphasis |
|---|---|---|---|
| Micro / extreme reflow | below 360 px | single reading column; controls stack; nav overlay | readable long words; minimal visual effects |
| Standard phone | 360–479 px | single column; 44–48 px targets | image-first vertical story |
| Large phone | 480–599 px | single column; some two-column chips | generous photos, less cropped text |
| Small tablet/phablet | 600–767 px | 1–2 visual columns when content fits | alternating feature can split selectively |
| Tablet portrait | 768–899 px | 2-column cards; menu overlay | sectional image/text balance |
| Tablet landscape | 900–1099 px | 2-column cards; menu overlay until tested fit | deliberate asymmetry |
| Laptop/desktop | 1100–1439 px | up to 12 columns; full nav | editorial split compositions |
| Wide/ultrawide | 1440–2560+ px | capped content width, broad canvas margins | cinematic images, never sprawling text |

**Breakpoint implementation policy:** use content-led rules, not device names. The current CSS uses 1100, 760 and 540 px breakpoints; new rules should harmonise with these and app.js's 1100 px menu threshold rather than adding conflicting breakpoints. Container queries are encouraged only after a supported baseline layout exists.

## 2. Grid, container and spacing contract

**Frame:** max reading width ~1360 px for primary page content, with intentional exceptions for full-bleed hero, cinematic section photography, one marquee and closing wordmark. Center content at wide sizes; do not stretch text to an ultrawide monitor's edge.

**Horizontal gutter:** clamp(20px, 5vw, 96px) with safe-area adjustments when relevant. On 320 px screens the effective left/right padding must leave >=280 px for content unless safe areas require otherwise.

**Grid logic:**
- >=1280 px: conceptual 12-column underlying grid, 24–32 px gap; use deliberate spans 7/5, 8/4, 6/6 and 4/4/4.
- 900–1279 px: conceptual 8 columns, 20–26 px gap; key image/copy = 4/4, portfolio = 2 cards.
- 600–899 px: 4–6 columns; 16–22 px gap, cards = 2 columns only when actual min width stays readable.
- <600 px: 4-column design subdivisions inside a single main reading column; gap 12–16 px and no tiny service-card columns.

**Vertical rhythm:**
- In-section component gap: 8, 12, 16, 24, 32, 48 px scale.
- Mobile section padding: 64–88 px (some hero/immersive exceptions).
- Tablet: 80–120 px.
- Desktop: 104–160 px.
- Section headlines to paragraphs: 20–36 px; headlines to grids: 32–64 px.
- Big image/copy split: 40–96 px desktop; 24–40 px mobile.
- Closing/footers remain spacious without leaving a half-screen of accidental blank height.

**Constraint:** avoid fixed px widths on text columns. Use minmax(0, 1fr), max-width in ch/rem and explicit min-width:0 for grid/flex items. Do not use 100vw for child content inside a guttered container; it commonly creates horizontal overflow.

## 3. Type system — fluid but art-directed

| Hierarchy | Phone target | Tablet target | Desktop target | Notes |
|---|---|---|---|---|
| Hero H1 | 3.0–4.5 rem | 4.4–6.2 rem | 6.2–10.0 rem | line-height .88–1.02; carefully proof all strings |
| Page H1 | 2.7–4.2 rem | 4–5.6 rem | 5.2–8.0 rem | no hard line breaks at phone widths |
| Main H2 | 2.3–3.7 rem | 3.5–4.9 rem | 4.6–7.0 rem | max readable line width ~12–17ch |
| H3/card | 1.45–2.2 rem | 1.6–2.4 rem | 1.8–3.1 rem | long company division names wrap fully |
| Body/lede | 1.0–1.15 rem | 1.03–1.2 rem | 1.08–1.32 rem | line-height 1.5–1.75 |
| Eyebrow | .69–.81 rem | .70–.83 rem | .72–.88 rem | letter spacing reduced for narrow screens |
| Metadata/status | .78–.88 rem | .8–.9 rem | .82–.92 rem | never sacrifice legibility for design |

Use Brighter Sans display and Sky Text body only under confirmed licensing. Define fluid clamp formulas by type role, not one magic viewport-only scale. Prevent single long words such as “Entertainment”, “Infrastructure” or an email address from forcing overflow. Prefer natural wrapping, controlled max-width, sensible overflow-wrap, balanced wrapping for large headings only if visually verified.

**Zoom and settings:** do not disable pinch zoom. At 200% and 400% reflow, body text must remain readable; labels may wrap into two lines; buttons may increase height. Avoid fixed-height cards that clip content. At text resize, decorative icon layouts may shrink/rearrange while controls remain operable.

## 4. Global header, navigation and information access

**Desktop >=1100 px** (subject to content fit): compact logo, prominent divisions/digital/founder navigation and one enquiry CTA. If links no longer fit at 1100 with font scaling, switch earlier to overlay; do not shrink the font to microscopic sizes. Keep background transparent on hero only while contrast remains adequate.

**Mobile/tablet <1100 px:** one clear logo, menu trigger, optional short enquiry link; full-height/viewport-aware overlay inside safe areas. Main categories are immediately visible: Business Divisions, Motors, Logistics, Digital, Founder, About. Essential secondary destinations: Supplies, How It Works, Bar (coming soon), FAQ, Contact, Enquiry, Privacy, without burying them offscreen with inaccessible overflow.

**Overlay details:**
- overlay should be a flex column with scrollable menu content rather than fixed clipped links;
- top inset covers status bar/notch; bottom padding covers home indicator;
- links min touch target 44×44 px, preferred 48–56 px;
- sections of links remain reachable on small-height landscape phones and at 200% zoom;
- no horizontal swipe gesture needed to access site navigation;
- focus trap and restore; background inert only during overlay;
- opening/closing transitions never determine whether a link can be activated.

**Sticky header:** no overlapping main heading on anchor navigation; use scroll-margin-top. Header hidden-on-down behavior should pause when focus, form input or menu is active.

**Bottom dock:** existing mobile dock is useful for four key actions but competes with browser chrome and keyboard. Audit safe-area bottom and available viewport. Hide or reduce when input is focused if needed; it must not cover Submit, consent, FAQ actions, or screen reader announcement.

## 5. Homepage: responsive composition by section

### S01 Hero
- Wide desktop: cinematic image across the viewport; H1 and lead on the left, compact enquiry waybill on right, both anchored within a 12-column layout. Allocate ~7 columns for message and 4 for quick action; preserve clear negative space.
- Laptop 1100–1279: reduce headline size and hero side gaps; never let form exceed 42% of space. Keep CTA above fold where practical.
- Tablet <1100: stack headline and interactive waybill or move form into a second section after hero; do not overlay form onto faces or key vehicles.
- Mobile: use existing purpose-made 13-mobile-hero portrait rendition, subject-safe crop and a strong gradient. H1 must sit on unbusy area, CTAs full-width/stack where required. Avoid fixed 100vh traps; use min-height plus content-driven growth and 100svh/dvh with fallbacks.
- On phones 320×568, ensure both primary CTA and menu are reachable without content clipping. Scrolling to lower CTA is acceptable; hiding it under the dock is not.
- Hero image must reserve its aspect and have a clear dominant object; do not force text across busy foreground.

### S02 Company direction
- Desktop: 4/8 or 5/7 asymmetry—small eyebrow/index column and expressive title/body column.
- Tablet: 1/2 split only if line lengths remain balanced.
- Mobile: linear sequence eyebrow → bold statement → meaningful summary → two links. No empty decorative index column.

### S03 Six division portfolio
- >=1100: 3-column mosaic; first card may span two columns and should feel editorial rather than repetitive. Maintain equal visual optical weight with uneven content.
- 768–1099: 2 columns; first card may span both for orientation, remaining paired by row.
- <=767: one card per row, each aspect deliberately composed and visually distinct. Status is readable immediately; title not hidden by gradient or hover dependence.
- Use min-height only as a design floor and allow larger content at 200% zoom. Never crop the final line of long “Leisure, Entertainment & Hospitality.”
- Each card links to a functioning service destination or contact page and indicates stage accurately.
- Image fallback uses flat brand tone and readable content, not blank image space.

### S04 Practical trade cards
- >=1100: 3 columns for Vehicles / Supplies / Logistics with image-first treatment and aligned CTA lines.
- Tablet: 2 columns, third intentionally spans full row or uses centered 2-column feature; avoid lonely narrow card.
- Mobile: 1 full-width card per category; image focal point clearly readable and CTA at bottom of its own card.
- Ensure every card conveys a real enquiry path and does not simulate actual stock.

### S05 Digital solutions
- Desktop: 50/50 editorial split; left conceptual design/working imagery and right vertical content. A small services index is fine.
- Tablet: choose order based on reading priority; image after summary or before title, never between H2 and its first paragraph.
- Phone: full-width text first, then narrower supporting imagery or vice versa if image is a genuine anchor; compress capability index to 1-column on small phones.
- THE 97 World relationship caveat is visible without opening a tooltip; never embed small disclaimer into the image.

### S06 Founder
- Desktop: monogram/approved portrait ~45% and name/story ~55%. Authentic image uses natural face crop and enough space for gaze.
- Tablet: portrait and text split only when it fits without portrait becoming too small.
- Phone: portrait/monogram is cropped purposefully; name must remain large but fit. Biography text appears below in a single column. Do not use portrait as a full-bleed low-contrast text background.
- At 200% zoom, prioritize complete approved biography over keeping decorative initials huge.

### S07 Principles
- Desktop: four equal numbered columns or a strong 2×2 grid depending copy length.
- Tablet: 2×2.
- Phone: 1 column/stack, smaller minimum heights, numbers remain visible, no tiny four-column presentation.

### S08 Bar teaser
- Desktop: image and atmospheric card within generous split.
- Tablet: one large image with adjacent text if it fits.
- Phone: vertical teaser, readable “coming soon” before any action, no implied booking; safe image crop.

### S09 Closing invitation / footer
- Desktop: oversized typographic CTA plus 4-column informational footer and enlarged wordmark.
- Tablet: 2-column footer.
- Phone: one stack: company → services → company links → contact → legal. Links must not break under wide logo; avoid horizontal wordmark overflow. Footer legal/privacy visible without moving layers.

## 6. New and existing route responsive plans

| Page | >=1100 | 768–1099 | <768 | Critical constraint |
|---|---|---|---|---|
| Divisions | 2-column large portfolio, elegant header | 2 cards where legible | single card and status | no false “active” claims, every card link works |
| Digital | hero plus 2-col six-capability grid | 2-col or 1 as min widths dictate | single capability list | disclaimer and CTA visible |
| Founder | dramatic type + approved portrait/monogram | split if >650px usable width | single reading column | no synthetic founder photography |
| About | alternating split narrative | balanced image/text | single ordered story | factual biography/milestones only |
| Vehicles | hero + cards + verified listings | 2-column features/listing | 1-column, accessible enquiry | inventory empty state stays honest |
| Supplies | category editorial rows | adaptive split | image → copy → CTA | quantity/product labels wrap |
| Logistics | route/cargo hero with sections | 2-col detail where fits | straightforward cargo brief | route coordinates only if verified |
| How It Works | timeline with supporting media | 2-col if readable | vertical steps and controls | reduced motion shows complete steps |
| Enquire | optional form-side assistance | form max ~700px | fields single column | keyboard and dock do not obscure controls |
| Contact | contact options + form split | one/two depending width | contact info then form | disabled/unverified channels clearly marked |
| FAQ | sidebar index + content | compact sidebar or top anchors | search first, accordion list | no clipped long answers |
| Bar | layered atmospheric composition | reduced layering | short, readable teaser | coming soon; never fake reservations |
| Privacy | readable narrow text column + optional TOC | narrow text column | one column; TOC collapses gracefully | legal text and rights accessible |
| 404 | visually striking single message | one column if needed | direct links and enquiry | back/home accessible |

## 7. Card, list, button and form component contract

**Cards:** min-width:0, no fixed height if copy can expand. A decorative photo behind text requires sufficient gradient contrast. Do not make the entire card unclickable just because a hover layer sits above it. Keyboard focus-outline must remain outside overflow clipping when possible; if card clips, put outline on a visible inset child or use box-shadow inset.

**CTAs:** min-height 44 px, preferred 48–56 px. Long labels (“Discuss your requirements”) wrap without obscuring icon or text. Two horizontal CTAs only when each remains >=150 px wide; otherwise stack. No two links overlap on small screens.

**Inputs:** font-size at least 16 px on iOS to avoid unwanted zoom, line-height 1.4+, labels above fields, clear required/error text, no placeholder-only labels. Single column under 768 px; optional 2-column layouts only for simple paired fields when actual usable width >640 px. Postal/phone/email can be longer than mockup examples. Provide native input types and autocomplete values.

**Form feedback:** error summary near start, field-level descriptions, focus management after submit, no motion-dependent success state. Consent and privacy text must be readable without scrolling a tiny nested pane. Enquiry is draft-only until a monitored backend is enabled; this must remain obvious.

**Tables / product specifications:** prefer adaptive definition lists or horizontally scrollable semantic tables with visible scroll affordance. Never shrink product text to fit.

**Images / media:** every photograph has exact dimension reservations; responsive source widths tied to actual slot sizes, not arbitrary 100vw. Dominant hero uses AVIF/WebP with fallback and fetch priority; below-fold images lazy-load. Use object-position from a content model focal point, not generic center for all founder/vehicle scenes.

## 8. Height, orientation, notches and browser UI

- Use a content-driven hero min-height, not an inflexible 100vh height that fails when mobile Safari/Chrome toolbars appear.
- Use 100svh when an overlay must fit the stable small viewport; optionally 100dvh for dynamic sizing with fallback. Overlay internals scroll if shorter than their content.
- respect env(safe-area-inset-top) and env(safe-area-inset-bottom) for menu, bottom dock and fixed CTAs.
- Landscape phone at ~844×390: hero should grow beyond the viewport naturally, menu links remain scrollable, no portrait-styled giant heading blocks controls.
- Virtual keyboard: keep focused field and submit message visible; bottom dock does not cover keyboard or caret; do not scroll the page to a fixed offset before keyboard settles.
- Foldable / split screen: rely on actual CSS viewport; no detection by guessed phone model.

## 9. Visual hierarchy and visual-content integrity

On every viewport, the first reading order is **brand/role → H1 → clear two-sentence purpose → primary action**. Decorative images and numbers can move around this hierarchy but may not interrupt it. Place status labels near the related division, not floating far away on wide screens.

Photography selection:
- Desktop hero: 16:9 or 3:2 documentary composition with safe negative space.
- Mobile hero: portrait 4:5 or 2:3 art-directed crop; separate asset if needed.
- Division cards: 4:5 or 3:4 where text overlay needs space; avoid faces directly under headings.
- Founder: original approved 4:5 portrait with face inside safe crop; alt text describes actual photo only.
- Detail/page content: 3:2, 4:3 and 1:1 for variation; no AI facsimile of actual premises or people.

Use proper sizes/srcset/picture, image width/height and CSS aspect-ratio; maintain focal point across widths. For AI concept visuals, keep the existing explicit illustration disclaimer.

## 10. Accessibility and reflow contract

- WCAG 2.2 AA layout target; full keyboard functionality; visible focus; heading hierarchy/landmarks; screen-reader reading order same as visual sequence.
- 200% zoom: no hidden CTA, no clipped descriptions, no two-column form requiring sideways panning.
- 400% zoom at 1280 CSS px original viewport (~320 CSS px effective): content reflows into a single column; vertical scrolling permitted, two-dimensional scrolling not required for ordinary prose.
- 200% browser text-only resize where available: badges expand, list heights grow, overlay scrolls.
- Touch: 44×44 px preferred minimum targets and clear spacing. No interaction is hover-only or dependent on swiping a hidden carousel.
- High-contrast/forced-colors mode: borders/labels/focus remain visible with imagery and gradients removed.
- Reduced motion: no hidden scroll-reveal content, no auto-smooth-scroll and no parallax at mobile/zoom widths.
- Language/content expansion: budget +30–50% line length without structural failure, even though initial site is English-only.

## 11. Performance, image and rendering rules

Target LCP <=2.5 s, INP <=200 ms, CLS <=0.10 at p75 and mobile Lighthouse >=90 on measured, documented test conditions. These are goals, not presently validated scores. Ensure high-resolution artwork does not dominate poor mobile networks.

- No mobile autoplay background video as the only hero asset.
- Serve responsive images at sizes matched to display width and device pixel ratio; inspect actual encoded KB budgets rather than trusting file extensions.
- Below-fold video, if future-approved, should have poster, user-controlled playback and motion-safe fallback.
- Font preload only necessary first-screen faces; use correct licensing, display behavior and fallback metrics.
- Keep blur, fixed backdrops and many simultaneous shadows limited on low-end devices.
- If container queries and subgrid are introduced, keep safe fallback styles and check browser support on actual target devices.

## 12. Device QA and exact acceptance matrix

**Widths to test:** 320, 344, 360, 375, 390, 412, 430, 480, 600, 768, 820, 900, 1024, 1099, 1100, 1280, 1363, 1440, 1728, 1920, 2560 CSS px.

**Heights/orientations:** 320×568, 360×640, 390×844, 430×932, 768×1024, 820×1180, 1024×768, 1363×768, 1440×900 and 1920×1080. Test address bar changes, keyboard visible and short landscape heights.

**Browser/device matrix:** Chrome Android (midrange and fast), Safari iOS (at least one current and one older supported version), Firefox desktop, Chromium desktop and tablet touch emulation. Browser tests complement, not replace, physical-device checks.

**Matrix dimensions:** every route × width group × JS on/off × reduced motion on/off × fine/coarse pointer × keyboard × 200%/400% zoom × long text. A complete all-combinations Cartesian product is unnecessary; use pairwise cases plus mandatory critical flows.

**Core assertions:**
1. documentElement.scrollWidth minus clientWidth <=1 CSS px on ordinary content.
2. H1 single, visible, wrapping without clipping; target max lines set by design, not forced by overflow hidden.
3. No fixed panel covers a focus target, important disclaimer or form submit.
4. Menu opens/closes/scrolls and restores focus at each tested width and orientation.
5. Cards and real links resolve correctly; status copy survives photo failures.
6. Image source set delivers appropriate rendition; no 404 or decoding overflow.
7. No console exceptions, layout shift from font/image/animation, or navigation/scroll restoration error.
8. Accessible labels and validation work at all widths; draft-only enquiry message is accurate.
9. Reduced motion and no-JS leave text and links available.
10. Performance trace shows no persistent animation CPU work on hidden pages.

## 13. Implementation milestones and ownership

**R0 — shared foundations:** audit current breakpoints; align JS and CSS nav thresholds; define container/gutter/spacing/type tokens; fix overflow and safe-area risks.

**R1 — homepage:** hero, six-division mosaic, three trade cards, digital split, founder split, principles, teaser, CTA/footer through all width regimes.

**R2 — landing pages:** divisions/digital/founder plus existing routes and their forms. Replace temporary visuals as approved content arrives.

**R3 — micro-interaction and motion integration:** motion-spec choreography adapted by device width/capability; no touch hover or runaway parallax.

**R4 — QA:** automated screenshot baselines, Playwright reflow/zoom/keyboard/axe, physical devices, content/factual checks and performance benchmarking.

**Sign-off:** no clipped text, hidden controls, horizontal overflow, involuntary zoom, consent/CTA overlap, false operating claim or inaccessible animation on any critical route. The responsive design should feel *authored* at every breakpoint, not merely technically fitted.
