# Design notes — V3, "a line that carries the story forward"

These notes record what V3 does and how to tune it. Edit `public/` and run `npm run sync:pages`.

## The line

One brass thread (2 px, square-cut, drawn from its origin) recurs as a datum, a rail, a spine and a closing connector. It is a separate graphic device; the Spear Line logo and its lettering are untouched. The thread never implies a route, corridor or timing.

## Tokens (`:root` in `styles.css`)

Ink `#141719` · forest `#202d28` · paper `#f4f2ed` · stone `#e8e5dc` · brass `#c8a66b` (decorative/dark grounds) · brass-deep `#7a581c` (text and focus on light). Surfaces are set with `.on-ink`, `.on-forest`, `.on-paper`, `.on-stone`, which define `--fg`, `--fg-2`, `--accent`, `--thread-c`, `--rule` and `--focus` for everything inside. Measured text contrast on these pairs is 4.8:1 or higher (most above 8:1).

Type: **Archivo** 500–800 for headings, menus, buttons, labels and numbers; **Lexend** 400–600 for paragraphs, forms and small text. No third family. Both are self-hosted variable subsets (see ASSETS.md) with metric-matched fallbacks.

## Layout

`.wrap` is the only grid: gutter / content / gutter on phones; from 900 px the same outer tracks hold 12 content columns (`c 1` … `c 12`, `content-start`, `content-end`, `full-start`, `full-end`). A child can bleed to the viewport edge with `grid-column: c 7 / full-end`, with no `vw` maths or negative margins. Inside a `subgrid`, line indexes are relative to the subgrid (use `1 / content-end`, not `c 8 / content-end`).

## Seams (as built)

| Seam | Handoff | Where |
| --- | --- | --- |
| Opening → hero | Intro stroke travels to the hero rule (`[data-hero-rule]`) | `boot.js`, `.intro-*` |
| Hero → services | Photo straddles the ink/paper boundary; datum line turns into a vertical drop | `.hero` two-tone background, `--seam` |
| Vehicles → timber | Paper gives way to a forest panel offset downward; number changes side | `.svc-timber` |
| Timber panel → destinations | Panel's brass left edge and the destination spine share one axis (column 8); the panel's green becomes the full-width chapter | `.svc-timber::before`, `.dest-list::before` |
| Destinations → process | Paper panel rises into the green on the left; green tab remains on the right | `.dest-rise` |
| Process → future | Shared paper; only density changes | `.start + .future` |
| Future → enquiry | Hard ink band; the line resolves at the button's left edge | `.closing-row` |

If `clip-path` or `subgrid` is missing, the seam falls back to a solid colour change and content stays in normal flow.

## Motion state contract

- `boot.js` runs first, synchronously, and adds `js`. The opening plays only on the **first visit to the home page in a tab**, with motion allowed, a navigation load (not reload/back-forward), no same-origin referrer and no `sessionStorage` flag. It always exits: after the ~1 s sequence once the document is interactive, or at a 2 s fail-safe registered before the class is applied. bfcache restores clear it.
- `app.js` adds `reveal-ready` only after it runs, only without reduced motion, and only hides elements still below the fold. Elements already in view are revealed first. A settle check reveals anything a fast scroll skipped.
- Nothing is hidden by default CSS. `tests/site.test.mjs` checks this.
- Animation uses opacity, transform and one `clip-path` reveal. Durations: micro 150 ms, UI 280 ms, reveal 620 ms, line 850 ms.

## Imagery

Four representative Unsplash photographs (credits in ASSETS.md). Each frame reserves its box, has a tonal fallback, and carries a focal-point class (`.fp-road`, `.fp-desert`, `.fp-lorry`, `.fp-yard`) setting `--fx` and `--fy`. **These values are untested against the real photographs** and should be tuned by eye. Text is never set over a photograph; captions sit below. Images are never framed as stock or owned assets.
