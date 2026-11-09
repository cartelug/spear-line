# Deploying Spear Line

The site is static pages plus a small Node server that serves them with compression and security headers and, when enabled, stores enquiries. GitHub Pages can show the pages but cannot run the enquiry server, so **host the whole site on the Node server** once enquiries go live. Pages keeps working as a static preview in the meantime.

## What you need first

A verified legal business name, a monitored public contact email, a retention period, the verified HTTPS domain, a working owner notification webhook, and a place to run a container with a persistent volume. These values are intentionally absent from the repository.

## Run it

```sh
docker build -t spear-line .
docker run -d --name spear-line --restart unless-stopped -p 3000:3000 \
  -v spear-line-data:/data \
  -e PUBLIC_ORIGIN=https://your-domain \
  -e SITE_ORIGIN=https://your-domain \
  -e ENQUIRIES_ENABLED=true \
  -e BUSINESS_LEGAL_NAME="Your Legal Name" \
  -e PUBLIC_CONTACT_EMAIL=you@your-domain \
  -e RETENTION_DAYS=180 \
  -e NOTIFY_WEBHOOK_URL=https://hooks.example/your-webhook \
  spear-line
```

Put an HTTPS reverse proxy or platform router in front of port 3000. The image runs as a non-root user, listens on `0.0.0.0`, and reports health at `/healthz` (also used by the image's own health check). Without Docker: `NODE_ENV=production npm start` with the same variables in a `.env` file (see `.env.example`).

Optional public details shown on the Contact page, footer and privacy page: `PUBLIC_CONTACT_PHONE`, `PUBLIC_WHATSAPP`, `PUBLIC_ADDRESS`.

## Owner notification

When `NOTIFY_WEBHOOK_URL` is set, every stored enquiry is also POSTed as JSON: `{"text": "New vehicle enquiry from … Reference …", "enquiry": {…the stored record…}}`. The `text` field works with Slack-style incoming webhooks; automation tools (Make, Zapier, n8n) can turn it into an email or message. A slow, failing or unreachable webhook is logged without personal details and never affects the visitor's receipt. HTTPS is required in production.

The enquiry details travel to whichever service you choose, so name that service in your privacy information before enabling it.

## Go public

```sh
export SITE_ORIGIN=https://your-domain PUBLIC_ORIGIN=https://your-domain
export BUSINESS_LEGAL_NAME="Your verified legal name" PUBLIC_CONTACT_EMAIL=owner@your-domain
export ENQUIRIES_ENABLED=true RETENTION_DAYS=180
export NOTIFY_WEBHOOK_URL=https://your-real-notification-endpoint
npm run launch:check
SITE_LAUNCH=1 npm run render:pages
```

The example values above show the required keys, not deployable values. The build rejects `SITE_LAUNCH=1` until every key is present. A local build without this switch remains `noindex` with search crawling disallowed. Verify the domain's DNS and HTTPS certificate, send a real enquiry through the hosted form, check its notification and stored record, and test a restore from the persistent volume before turning traffic on. Host the form on the Node deployment: a static GitHub Pages mirror cannot submit enquiries.

Keep `public/site-config.js` in preparation mode on the static Pages preview. The Node host serves the public values from its environment; do not commit private webhook URLs or customer records.

## Keep it healthy

- **Retention:** schedule a daily purge, for example `0 3 * * * docker exec spear-line node scripts/purge-enquiries.mjs --apply`. Run it without `--apply` first to see what it would delete.
- **Backups:** the volume at `/data` holds one JSON file per enquiry. Snapshot it on your host's schedule and test a restore. Files are mode 600 and are never inside `public/`.
- **Reading enquiries:** each file is named by its reference. Open the files directly or rely on the webhook messages.
- **Updates:** rebuild the image after pulling; the volume is untouched.
- **Checks before shipping:** `npm run check`, `npm test`, and `npm run test:e2e` (browser tests with axe; run `npx playwright install chromium` once).

## Verified and not verified

The Dockerfile's file list is verified by a test that copies exactly what it copies, boots the server there with production settings, checks `/healthz` and runs the purge script. The image itself was not built in this environment because no Docker daemon was available; run the build once on your host.
