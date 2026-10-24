# Spear Line — V4

Vehicles, foodstuffs and beverages, and logistics. A responsive, presentation-led website using self-hosted Archivo and Lexend, the existing Spear Line logo and twelve coordinated generated photographs.

## Experience

- Cinematic road hero and a brief first-visit logo entrance.
- Keyboard-accessible service tabs, horizontal image gallery, scroll reveals and restrained desktop parallax.
- Dedicated vehicles, supplies, logistics, about and enquiry pages.
- Responsive phone/tablet navigation with Escape dismissal and focus management.
- Reduced-motion support and readable content if animation scripts fail.
- Local WebP imagery in 1536 px and 768 px versions; no external image or font requests.
- The former timber-logistics.html address remains an alias for logistics.html.

## Local development

Node 22.21 or newer. No package installation is required.

```sh
npm run dev
npm run render:pages
npm run check
npm test
```

Edit public/ for direct source changes. Shared HTML structure and content are authored in scripts/render-pages.mjs. Run render:pages after changing the generator; it generates the pages and mirrors public/ into the repository root for GitHub Pages. After direct CSS or JavaScript edits, run npm run sync:pages. The check command catches mismatches between the two locations.

The server accepts HOST/PORT environment variables and --host / --port arguments. Reload the browser after edits; restart the server when adding new asset filenames.

## Enquiries

GitHub Pages serves the static configuration in site-config.js. Online submission is currently disabled and no company contact information is configured. The form validates requirements and creates a downloadable text draft in the browser. It does not claim to send a draft.

The existing Node server can accept enquiries when the operator configures ENQUIRIES_ENABLED, BUSINESS_LEGAL_NAME, PUBLIC_CONTACT_EMAIL, RETENTION_DAYS and PUBLIC_ORIGIN. See .env.example for the remaining optional contact settings. Enquiries are stored outside public/; preserve that separation. The browser and server share public/validation.js. Supplies, vehicles and logistics have different required fields. Old service=timber requests are normalised to logistics.

## Assets and maintenance

See ASSETS.md for provenance, visual-prompts.json for the complete generation prompts, DESIGN.md for design and motion notes, and VALIDATION.md for checks completed for this upgrade. Keep source logo and font licence files intact.
