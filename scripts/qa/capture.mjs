// Full-page screenshots of every page at phone and desktop widths, plus preloader frames.
// Usage: node scripts/qa/capture.mjs <outDir> [--static]   (default: skips the preloader, reduced motion off)
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { startSite, launch, skipIntro, PAGES } from './lib.mjs';

const out = resolve(process.argv[2] || 'docs/v15/shots');
await mkdir(out, { recursive: true });
const { base, stop } = await startSite(), browser = await launch();
try {
  for (const [width, height, mobile] of [[390, 844, true], [1440, 900, false]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
    await skipIntro(context);
    for (const name of PAGES) {
      const page = await context.newPage();
      await page.goto(`${base}/${name}.html`, { waitUntil: 'networkidle' });
      // Scroll through the page at reading speed so lazy images load and reveals fire, then return to the top.
      await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(img => { img.loading = 'eager'; }));
      await page.evaluate(async () => { const step = Math.round(innerHeight * 0.6); for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise(r => setTimeout(r, 160)); } scrollTo(0, document.documentElement.scrollHeight); await new Promise(r => setTimeout(r, 300)); scrollTo(0, 0); });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${out}/${name}-${width}.jpg`, fullPage: true, type: 'jpeg', quality: 62 });
      await page.close();
    }
    await context.close();
  }
  // Preloader frames on a first visit (not skipped).
  for (const [width, height, mobile, tag] of [[1440, 900, false, 'desktop'], [390, 844, true, 'phone']]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    const t0 = Date.now(); let i = 0;
    page.goto(`${base}/index.html`, { waitUntil: 'load' }).catch(() => {});
    await page.waitForSelector('.preloader', { state: 'attached' });
    while (Date.now() - t0 < 3400) {
      const at = Date.now() - t0;
      try { await page.screenshot({ path: `${out}/preloader-${tag}-${String(i++).padStart(2, '0')}-${at}ms.jpg`, type: 'jpeg', quality: 55, timeout: 3000 }); } catch { /* frame skipped */ }
      await page.waitForTimeout(100);
    }
    await context.close();
  }
  console.log('Screenshots written to', out);
} finally { await browser.close(); await stop(); }
