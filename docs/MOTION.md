# Spear Line motion system

The V6 experience uses finite Web Animations timelines on mobile, tablet and desktop. The first homepage audit registered 308 animated targets on phones and 307 on tablet/desktop, including 226 individually revealed words. These counts describe unique elements, rather than claiming hundreds of unrelated visual styles.

## Coordinated effects

- Word-by-word heading, eyebrow and selected short-copy entrances, preserving the original text nodes' whitespace and heading semantics.
- Scroll-triggered image masks, copy entrances, section-rule drawing and footer letter reveals.
- Opening logo/hero sequences, with a direct, shorter entrance on phones.
- Staggered navigation opening and a closing transition with focus and inert-background handling.
- Service-tab image/copy replay, gallery position feedback and touch/button press responses.
- Animated accordion expansion and collapse, with rapid-toggle cancellation.
- Club-card depth and detail reveals, plus restrained desktop hover effects.
- Form label focus feedback and enquiry-result entrances.

## Timing and safeguards

Text stagger is capped at 360 ms. Word duration is 500 ms on phones and 690 ms on larger screens. Image reveals take 650–900 ms; menu closing takes 210 ms. Animations do not run in indefinite loops. Scroll observers release completed groups, and hidden/offscreen panels are not animated until they become relevant.

Content is readable in default CSS. The application loads the motion layer progressively; a motion-module failure leaves navigation, tabs and enquiry validation available. Visibility/page lifecycle cleanup cancels active timelines. Reduced motion follows the system setting or the visitor's saved Reduce motion preference. That control cancels active effects, disables CSS transitions/parallax and persists across page navigation. Preference storage failure is harmless.

The phone floating navigation hides while editing a text field. Radio-card inputs fill their visible touch targets. Native service choices made before the application module finishes loading are preserved.

## Verification

During the audited service/gallery journey, 145 distinct mobile targets and 131 desktop targets had started an actual animation. The homepage's initial 308/307 target inventories can be inspected through data-motion-targets on the document element; data-motion-played records the distinct targets triggered in that session. See motion-audit.json and VALIDATION.md.

## V7 layer (public/fx.js, public/pro.css)

- **Ticker.** The only continuous animation. CSS runs it at 52 s per loop; fx.js pauses it when it is offscreen, the tab is hidden, or the pointer or focus is on it. With Reduce motion it stops and becomes a horizontally scrollable strip.
- **Route line.** The SVG path is drawn and the spear glyph is positioned along it from scroll position (getPointAtLength), three stop nodes light as it passes, and the matching service cards highlight. Reduce motion shows the completed route.
- **Timeline and reading reveal.** Scroll position fills the timeline and lights its steps; words of the introduction statement brighten in sequence. Reduce motion shows both fully lit.
- **Pointer effects.** Spotlight on cards, magnetic buttons and image tilt are limited to fine pointers, use individual transform properties so they compose with the Web Animations timelines, and are skipped for touch input and Reduce motion.
- **Page transitions.** Cross-document view transitions (a short fade and lift) where supported, disabled for the system preference and the site's Reduce motion control.
- Default HTML and CSS remain readable if fx.js fails; its states are guarded by `html.fx-ready`.
