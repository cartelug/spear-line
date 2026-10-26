# Spear Line V7 design

The visual direction combines warm ivory, charcoal, forest green and brass. Photography and generous typography carry the story: the next move, three connected services, the details behind a requirement, then a practical enquiry.

The existing white logo is retained and is never redrawn. Bricolage Grotesque (variable weight and optical size) sets headings, labels and controls; Instrument Sans sets body copy and forms; a Fraunces italic is reserved for the single accent word in a heading. All three are self-hosted variable fonts under the SIL Open Font Licence. On light sections accent words use the dark brass for contrast; on dark and photographic sections they use the bright brass.

## Symbol and icons

The Spear Line symbol is a spear head on a shaft with a trailing line, set at 45° so it reads as forward movement and echoes the arrow used throughout the interface. It is drawn in assets/spear-mark.svg (currentColor) and assets/favicon.svg (brass on ink). Service and interface icons share one 2 px round-cap line style in assets/icons.svg and are referenced with `<use>`.

## Layout

The homepage moves through a full-height hero, editorial introduction, three-service switcher, warehouse/people story, swipeable image rail, process accordions and a photographic closing. Service pages use alternating image/text sections. The enquiry page presents only the fields required for the selected service.

The grid adapts at 899 px and 599 px. Horizontal image scrolling is contained in its gallery. Mobile inputs use 16 px text to avoid unwanted focus zoom on common phone browsers.

## V7 pages

How it works explains the four steps and what to bring for each service. Questions answered keeps every answer to claims the site already makes and switches its enquiry answer when online submission is enabled. Contact reveals email, phone, WhatsApp and address cards only when they are configured, and otherwise points to the enquiry form.

## Motion

The shared V6 motion layer is documented in docs/MOTION.md. It replaces the earlier scroll-reveal controller with finite word, image, rule and component timelines. Phones open directly into their portrait hero, and visitors can use the saved Reduce motion control.

- The opening logo plays once per tab on an eligible first home-page visit, with a two-second fail-safe and a reduced-motion exemption.
- Scroll reveals are triggered by registered observers. Default HTML/CSS does not hide narrative content.
- Desktop parallax is limited to 24 px. It is disabled below 900 px and when reduced motion is requested through the system or website control.
- Service tabs support Left/Right, Home and End. Without the module, all three service panels stay readable.
- Gallery controls scroll one image at a time and reflect the start/end state. Native horizontal scrolling remains available.
- Native details elements provide the process interaction.
- The mobile menu supports Escape, a focus loop and inert background content.

Use real inventory, project and team photographs when those become available. The generated images are illustrative and are identified in the footer; do not turn them into claims of owned assets or completed work.

## Spear Line Bar

The bar page keeps the earlier Club layout (coming-soon pill, large title, tilted card on orbit rings, launch note) with a warmer, lower-lit palette. The card carries a rocks glass with a spear-shaped pick that pours, drops its ice and settles once when the card first enters view (static under Reduce motion). Because no location, hours, menu or prices exist, the page lists three things to look out for (where, when, what is pouring), each marked "To be announced", and makes no booking or membership offer.
