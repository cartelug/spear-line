// A public, indexable build is only useful when its address and enquiry path are real.
import { env } from 'node:process';

export function launchErrors(config) {
  const errors = [];
  let origin;
  try {
    origin = new URL(config.SITE_ORIGIN);
    if (origin.protocol !== 'https:' || origin.username || origin.password || origin.origin !== config.SITE_ORIGIN || origin.search || origin.hash || /^(localhost|127\.|0\.0\.0\.0|your-|example\.|test\.)/i.test(origin.hostname)) errors.push('SITE_ORIGIN must be the verified public HTTPS origin without a trailing slash or path.');
  } catch { errors.push('SITE_ORIGIN must be the verified public HTTPS root URL.'); }
  if (config.PUBLIC_ORIGIN !== config.SITE_ORIGIN) errors.push('PUBLIC_ORIGIN must match SITE_ORIGIN exactly.');
  if (!config.BUSINESS_LEGAL_NAME?.trim() || /^(your|example|test)\b/i.test(config.BUSINESS_LEGAL_NAME.trim())) errors.push('Set the verified BUSINESS_LEGAL_NAME.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.PUBLIC_CONTACT_EMAIL || '') || /@(?:example\.|your-|test\.)/i.test(config.PUBLIC_CONTACT_EMAIL || '')) errors.push('Set a monitored PUBLIC_CONTACT_EMAIL.');
  if (config.ENQUIRIES_ENABLED !== 'true') errors.push('ENQUIRIES_ENABLED must be true for a public enquiry path.');
  if (!Number.isInteger(Number(config.RETENTION_DAYS)) || Number(config.RETENTION_DAYS) < 1 || Number(config.RETENTION_DAYS) > 3650) errors.push('Set RETENTION_DAYS to a whole number from 1 to 3650.');
  if (!config.NOTIFY_WEBHOOK_URL || !/^https:\/\//.test(config.NOTIFY_WEBHOOK_URL)) errors.push('Set an HTTPS NOTIFY_WEBHOOK_URL so new enquiries reach the owner.');
  return errors;
}

export function assertLaunchConfig(config = env) {
  const errors = launchErrors(config);
  if (errors.length) throw new Error('Public launch is blocked:\n- ' + errors.join('\n- '));
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  try { assertLaunchConfig(); console.log('Public launch settings are complete. Verify DNS, webhook delivery, and persistent storage on the host.'); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
