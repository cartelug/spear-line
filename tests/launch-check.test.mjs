import test from 'node:test';
import assert from 'node:assert/strict';
import { launchErrors, assertLaunchConfig } from '../scripts/launch-check.mjs';

const complete = {
  SITE_ORIGIN: 'https://spearline.africa',
  PUBLIC_ORIGIN: 'https://spearline.africa',
  BUSINESS_LEGAL_NAME: 'Spear Line Global Limited',
  PUBLIC_CONTACT_EMAIL: 'hello@spearline.africa',
  ENQUIRIES_ENABLED: 'true',
  RETENTION_DAYS: '180',
  NOTIFY_WEBHOOK_URL: 'https://notify.spearline.africa/enquiries'
};

test('the public build rejects incomplete and placeholder deployment values', () => {
  assert.equal(launchErrors(complete).length, 0);
  assert.throws(() => assertLaunchConfig({ ...complete, PUBLIC_ORIGIN: 'https://another.example', ENQUIRIES_ENABLED: 'false' }), /PUBLIC_ORIGIN must match SITE_ORIGIN[\s\S]*ENQUIRIES_ENABLED must be true/);
  assert.ok(launchErrors({ ...complete, SITE_ORIGIN: 'https://your-domain/', NOTIFY_WEBHOOK_URL: '' }).length >= 2);
  assert.ok(launchErrors({ ...complete, RETENTION_DAYS: '0', PUBLIC_CONTACT_EMAIL: 'owner@example.com' }).length >= 2);
});
