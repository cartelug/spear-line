// Measures how long the first-visit preloader holds the page, in several conditions.
// Usage: node scripts/qa/preloader.mjs   (prints a markdown table)
import { startSite, launch } from './lib.mjs';
const cases = [
  { name: 'desktop, normal', viewport: { width: 1440, height: 900 } },
  { name: 'phone, normal', viewport: { width: 390, height: 844 }, mobile: true },
  { name: 'phone, slow 4G + 4x CPU', viewport: { width: 390, height: 844 }, mobile: true, slow: true },
  { name: 'desktop, images and fonts blocked', viewport: { width: 1440, height: 900 }, block: /\.(avif|webp|woff2)(\?|$)/ },
  { name: 'desktop, Save-Data', viewport: { width: 1440, height: 900 }, saveData: true }
];
const { base, stop } = await startSite(), browser = await launch(), rows = [];
try {
  for (const c of cases) {
    const context = await browser.newContext({ viewport: c.viewport, isMobile: !!c.mobile, hasTouch: !!c.mobile });
    if (c.saveData) await context.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true } }));
    await context.addInitScript(() => {
      window.__pl = { start: 0, end: -1, inertAtStart: false };
      new MutationObserver(() => { const on = document.documentElement.classList.contains('is-preloading'); if (on && !window.__pl.start) window.__pl.start = performance.now(); if (!on && window.__pl.start && window.__pl.end < 0) window.__pl.end = performance.now(); }).observe(document, { subtree: true, attributes: true, attributeFilter: ['class'] });
    });
    const page = await context.newPage();
    if (c.block) await page.route(c.block, route => route.abort());
    if (c.slow) { const cdp = await context.newCDPSession(page); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 0.75e6 / 8 }); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
    await page.goto(base + '/index.html', { waitUntil: 'commit' });
    await page.waitForFunction(() => window.__pl && (window.__pl.end > 0 || (document.readyState === 'complete' && !document.documentElement.classList.contains('is-preloading'))), null, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => ({ ...window.__pl, inert: document.querySelector('main').inert, stillOn: document.documentElement.classList.contains('is-preloading') }));
    rows.push(`| ${c.name} | ${r.start ? 'played' : 'skipped'} | ${r.start ? Math.round(r.end - r.start) + ' ms' : '-'} | ${r.inert ? 'LOCKED' : 'unlocked'} |`);
    await context.close();
  }
} finally { await browser.close(); await stop(); }
console.log('| Case | Preloader | Held the page | Focus/page after |\n|---|---|---|---|\n' + rows.join('\n'));
