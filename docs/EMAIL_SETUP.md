# Spear Line business email plan

The intended domain is `spearline.africa`. This is a plan, not an active email address: do not publish a `mailto:` link until the domain is controlled, the mailbox is provisioned, and messages are verified in both directions.

1. Confirm ownership of `spearline.africa` and the DNS provider. Verify the exact spelling; a double dot in a domain is invalid.
2. Choose a mailbox provider and create `enquiries@spearline.africa` as the monitored public inbox. Add `joh@spearline.africa` only if Joh wants a direct address. Decide who can access the shared inbox and who receives after-hours alerts.
3. Add the provider's MX records and one SPF TXT record. Enable DKIM with the provider's exact selectors. Start DMARC at `p=none` with reporting to a monitored mailbox, review legitimate traffic, then tighten enforcement as delivery is proven. Do not combine two SPF records.
4. Set up the website's HTTPS origin and the Node enquiry host with persistent private storage. Configure `PUBLIC_CONTACT_EMAIL=enquiries@spearline.africa`, `BUSINESS_LEGAL_NAME=Spear Line Global Limited`, both public phones, retention and the owner's HTTPS notification endpoint. See `docs/DEPLOY.md` and run `npm run launch:check`.
5. Test inbound mail from a separate provider, outbound replies to Uganda and South Sudan contacts, spam placement, and the site's real enquiry receipt and owner notification. Only then update the public email field and enable `SITE_LAUNCH=1` for the verified origin.

For now, the public static site shows the two telephone contacts and keeps online form submission disabled. Its downloadable enquiry draft is not sent to Spear Line. The intended business mailbox is described as planned in the company profile and contact page.
