# Spear Line V8 design: the consignment note

Spear Line moves vehicles, food and drink, and freight. The objects of that world are consignment notes, stencilled crate and sack markings, and shipping containers, so the site is one dispatch document. Layout and section order are unchanged from V7; the visual language is new.

## Tokens

| Name | Hex | Use |
| --- | --- | --- |
| Concrete paper | `#F2F3F0` | Page ground (cool, not cream) |
| Manifest navy | `#12243A` | Text and dark sections |
| Container steel | `#1D3A56` | Second dark tone for alternating sections |
| Dispatch orange | `#F26A1B` | Flat fills (buttons, ticker, stamps) with navy text, small icons on dark; step numbers on dark use `#FF9B5C`, text on light uses `#9A3E00` |
| Ballpoint blue | `#2342C8` | Entries and focus on the consignment note only |
| Steel grey | `#4A5766` | Secondary text (5.4:1 on concrete) |

## Type

- **Big Shoulders Display** (variable, scaled 122% so sizes read like a normal face): headlines and freight lettering, sentence case, never tracked negatively.
- **Atkinson Hyperlegible Next**: body and interface, chosen for legibility.
- **Atkinson Hyperlegible Mono**: only the entries on the consignment note.
All self-hosted, SIL Open Font Licence.

## Principles

1. **One memorable thing: the consignment note** in the hero. A visitor chooses vehicles, supplies or logistics and says where it is going; the enquiry page opens with both filled in. A single stamp lands on load. It also works without JavaScript.
2. **Quiet everywhere else.** Ruled rows (a 3 px navy rule above each item) replace card grids; hover is an inked colour change, not a glow; there are no gradient washes, drop shadows on every card, or tinted near-black.
3. **No template chrome.** No accent word in headings, no tracked all-caps labels, no eyebrow labels above headings, no numbered markers except real sequences (the process steps and timeline), no dot-joined strings, no arrows appended to links. Tests enforce these.
4. **Motion explains something.** The stamp, the route line that follows scroll, the timeline that fills as you read, the ticker as container corrugation (paused when offscreen or hovered), the bar's pour, and the reading reveal. Per-section fade-ups, word-by-word copy, spotlight, tilt and magnetic effects were removed. Everything stops under Reduce motion.
5. **Symbol, not logo redraw.** The spear-and-line symbol and a 17-icon line set (2 px round caps) sit alongside the unchanged wordmark.

## Pages

Home, three service pages, How it works (timeline and what to bring), Questions answered, Contact (shows only configured channels), About, Spear Line Bar (the same document after dark, with a glass that pours once), Enquire, Privacy and 404.

## Responsive

Below 1100 px the note moves under the headline and the hero grows with its content; below 600 px tab icons drop out and the note's label is hidden. A script checks that no text renders below 14 px (18 px for the condensed face).
