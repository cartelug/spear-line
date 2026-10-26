# Spear Line V9 design: golden hour on the line

Spear Line moves vehicles, food and drink, and freight across warm, green, sunlit country. V9 takes its whole palette and mood from that photography: dark earth sections lit by a low sun, light sand sections like dust on a loading bay, and gold reserved for action. Layout order follows V7/V8; the visual language, type, motion and preloader are new.

## Tokens (`src/styles/00-tokens.css`)

| Token | Hex | Use |
| --- | --- | --- |
| `--soil` | `#15110C` | Deepest ground: preloader, footer, theme colour |
| `--umber` | `#211A13` | Hero and dark sections |
| `--earth` | `#2E241A` | Second dark tone, warmer |
| `--olive` | `#232A1D` | Green-shifted dark tone (fields, roads) |
| `--dusk` | `#2A1E24` | Evening tone for the Bar |
| `--sand` | `#E9DFCE` | Light section, warm |
| `--bone` | `#F5F0E7` | Lightest section |
| `--sun` / `--sun-2` | `#F2B65A` / `#FFD08A` | Primary buttons, marquee tape, highlights on dark |
| `--sun-deep` | `#8F5308` | Gold text on light grounds (AA) |
| `--river` / `--river-deep` | `#6CC0B4` / `#1E6C64` | Focus rings and secondary accents |
| `--ink` / `--ink-2` | `#1B1611` / `#4D4237` | Text on light |
| `--chalk` / `--chalk-2` | `#F5EFE6` / `#CFC3B2` | Text on dark |

Radii 10/16/24/32 px; two shadows; easings `--ease-out` (expo), `--ease-io`, `--ease-spring`.

## Type

- **Hubot Sans** (variable weight 200–900, width 75–125%): display. Headlines sit at 108–118% width and weight 750–850; the width axis animates (condensed to wide) as headings enter, with each word's final width reserved so nothing shifts.
- **Mona Sans** (variable weight): body and interface, 1.0625–1.125 rem, line height 1.6, 62ch measure.
- Fluid scale `--t-xs` to `--t-6xl` with `clamp()`. Fallbacks are Arial with `size-adjust` and ascent/descent overrides measured in Chromium, so swapping fonts causes no layout shift.
- Sentence case everywhere, no tracked caps, no emojis. Kicker labels pair a sprite icon with plain text.

## Sections that blend

Every section declares a tone and the tones of its neighbours (`.section.tone-earth.from-umber.to-sand`). The top and bottom `--blend` (48–104 px) of each section is a gradient from the neighbour's colour mixed in OKLab, so the page reads as one continuous surface. Dark sections can add:

- a **backdrop**: a 48 px WebP of a photograph, blurred and scaled to fill, slowly drifting, so each section's light comes from a real image;
- **glow orbs**: two soft gold/river radial lights that drift;
- a fixed **grain** overlay across the page for a filmic finish.

## Cards

- **Glass**: translucent gradient, 1 px light border, 18 px backdrop blur, inset highlight. On light grounds it turns into frosted white with a warm shadow.
- **Image cards** (bento services, gallery, listings): photograph with a dark gradient veil, panning slowly; title and tags sit on glass; pointer tilt on fine pointers.
- **Empty cards**: glass panel with an icon disc, a plain explanation and a single action. Used wherever real content is not yet available (listings, contact details).

## Buttons and links

Pill buttons with an icon disc that slides on hover; primary is sun gold with ink text, secondary is glass. Text links carry an icon that moves, never a typed arrow. Every control is at least 44 px tall.

## Signature moments

1. **Preloader**: the traced logo letterforms rise one by one, the spear travels a line driven by real load progress (fonts, hero image, window load), two doors open and the logo flies into its place in the header. Once per tab, only for arrivals from outside, never under Reduce motion or Save-Data.
2. **Hero waybill**: a glass consignment note over the cinematic road image. Choose a service and destination; the enquiry page opens pre-filled. A stamp lands once. Works without JavaScript.
3. **Rotated marquee tape** in sun gold across the seam between hero and intro.
4. **Route line**: the spear travels a drawn path between the three services as you scroll.
5. **Sticky process**: steps light up as their images pass.
6. **Bar card**: a glass that pours, ice drops and a pick stirs, once.

## Responsive

Phone first. Below 600 px the hero uses a portrait photograph, the bento becomes a snap carousel, the dock gives thumb navigation, and the menu opens as a circular reveal from its button. Tested with no horizontal overflow from 320 to 1920 px and at 200% zoom.

## Accessibility

AA contrast throughout (checked by axe on every page and mode), visible focus on glass and imagery, 44 px targets, page `inert` while the preloader runs, all motion off under the system preference or the site's own Reduce motion control.
