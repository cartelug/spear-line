# Spear Line

A complete six-page website for vehicle sales and timber transportation to Kampala and the Democratic Republic of Congo.

The design uses the original Spear Line logo, an ink / warm-white / muted-gold palette, Archivo and Source Sans 3 typography, representative photography, and dedicated enquiry journeys for both services.

## Run

Use Node.js 22.21 or later. There are no npm dependencies to install.

```sh
npm start
```

Open http://localhost:3000. The default mode prepares downloadable enquiries on the visitor's device; it does not submit them.

```sh
npm run check
npm test
```

The Node test suite covers validation, HTTP routes, private storage, rejected submissions, and the disabled form state. **It is included but was not executed during authoring because no shell/runtime was available.** In-memory JavaScript checks are documented in VALIDATION.md. Browser, accessibility and responsive rendering checks remain outstanding.

## Pages

- Home — `public/index.html`
- Vehicle sales — `public/vehicles.html`
- Timber logistics — `public/timber-logistics.html`
- About — `public/about.html`
- Enquire — `public/enquire.html`
- Privacy — `public/privacy.html`
- Supporting 404 page

## Configure real enquiries

Copy `.env.example` to `.env`. Confirm the actual business details before filling them in.

Required to enable server submission:

- `ENQUIRIES_ENABLED=true`
- `BUSINESS_LEGAL_NAME`
- `PUBLIC_CONTACT_EMAIL` — the published contact/rights-request address
- `RETENTION_DAYS` — the operator's chosen retention period
- `PUBLIC_ORIGIN` — the exact public origin, with no trailing slash

Optional: `PUBLIC_CONTACT_PHONE`, `PUBLIC_WHATSAPP` (international digits), `PUBLIC_ADDRESS`. Missing public contact links stay hidden. The server refuses to enable enquiries without the required identity/contact/retention values. In production, it also requires an HTTPS origin.

Every successful request creates a private JSON file in `DATA_DIR` and returns a reference only after the file write has completed and flushed. This implementation does **not** send email or WhatsApp notifications. The operator must establish a monitored workflow for reading enquiries from the protected server volume, or add an authenticated CRM/email integration before relying on it for business. Never publish the data directory or commit real enquiries.

Set `DATA_DIR` to a persistent private volume outside `public/`. This initial backend is designed for one Node instance. If deploying multiple instances or to ephemeral/serverless infrastructure, replace the file store with a suitable database before accepting enquiries.

The request limiter uses the socket IP and deliberately does not trust arbitrary forwarded headers. Behind a reverse proxy, configure rate limiting at the trusted edge or implement trusted-proxy handling; otherwise visitors may share one application limit.

## Retention

Schedule the purge script once a day using the same environment and private volume as the server. Preview first:

```sh
node --env-file=.env scripts/purge-enquiries.mjs
node --env-file=.env scripts/purge-enquiries.mjs --apply
```

The second command permanently removes expired enquiry JSON files. Establish appropriate backup expiry and handling of records associated with transactions separately. No retention job runs automatically until the operator schedules it.

## Deploy

Run `npm start` on a Node host behind HTTPS. Bind `HOST=0.0.0.0` if the host requires it, set the correct `PORT`, and configure the exact `PUBLIC_ORIGIN`. Keep `NODE_ENV=production` and a persistent private data volume.

Static-only hosting can serve `public/` with enquiries in preparation mode. **GitHub Pages cannot run this Node backend.** Do not enable the front-end submission setting without deploying the server.

## Launch checklist

- Verify business name, public contact details and privacy/retention information.
- Verify the service copy, timber destinations and future-business wording with the owner.
- Run the Node suite and test both forms against the deployed server.
- Check desktop and mobile layouts, keyboard navigation, screen-reader error feedback and reduced-motion behavior.
- Verify that external images and fonts load, or self-host approved versions.
- Confirm the enquiry-monitoring process and daily purge job.
- Keep stock photos labelled as representative. Replace them with approved owned imagery when available.
- Choose the domain; add canonical URLs, social share images, sitemap and appropriate structured data.
- Remove the deliberate `noindex,nofollow` meta tags and replace the blocking `robots.txt` only after launch readiness is confirmed.
- Test HTTPS, headers, form errors, duplicate/timeout handling, backups and a real receipt before promotion.

No stock catalogue, prices, guarantees, testimonials, fleet ownership, office address or company registration claims have been invented.

## GitHub

Repository: https://github.com/cartelug/spear-line

The source was uploaded after the repository was created. Its visibility is public at the owner's direction. The website remains blocked from search indexing until launch checks and business details are complete.

## Source package

The accompanying preview HTML includes a “Download source ZIP” button. The JSON bundle is a lossless fallback containing each path, encoding and file content, including the original PNG in base64. The preview sets `SPEAR_PREVIEW=true` and never submits enquiries.

## Credits

See ASSETS.md. The Spear Line identity remains its original artwork; no substitute logo was generated.
