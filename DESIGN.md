# Spear Line V6 design

The visual direction combines warm ivory, charcoal, forest green and brass. Photography and generous typography carry the story: the next move, three connected services, the details behind a requirement, then a practical enquiry.

The existing white logo is retained. Archivo is used for headings, labels and controls; Lexend is used for body copy and forms. Both font files are self-hosted.

## Layout

The homepage moves through a full-height hero, editorial introduction, three-service switcher, warehouse/people story, swipeable image rail, process accordions and a photographic closing. Service pages use alternating image/text sections. The enquiry page presents only the fields required for the selected service.

The grid adapts at 899 px and 599 px. Horizontal image scrolling is contained in its gallery. Mobile inputs use 16 px text to avoid unwanted focus zoom on common phone browsers.

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
