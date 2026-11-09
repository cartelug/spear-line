// One-off screenshot while designing. Usage: node scripts/qa/shot.mjs <page> <width> <height> <out.png> [--full] [--intro] [--reduced]
import { startSite, launch, skipIntro } from './lib.mjs';
const [page, width, height, out, ...flags] = process.argv.slice(2);
const { base, stop } = await startSite(), browser = await launch();
try {
  const mobile = Number(width) < 600;
  const context = await browser.newContext({ viewport: { width: +width, height: +height }, isMobile: mobile, hasTouch: mobile, reducedMotion: flags.includes('--reduced') ? 'reduce' : 'no-preference' });
  if (!flags.includes('--intro')) await skipIntro(context);
  const tab = await context.newPage(); const problems = [];
  tab.on('pageerror', e => problems.push('pageerror ' + e.message)); tab.on('console', m => { if (m.type() === 'error') problems.push('console ' + m.text()); });
  await tab.goto(`${base}/${page}.html`, { waitUntil: 'networkidle' });
  if (flags.includes('--full')) {
    await tab.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }));
    await tab.evaluate(async () => { const step = Math.round(innerHeight * .6); for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise(r => setTimeout(r, 140)); } scrollTo(0, 0); });
    await tab.waitForLoadState('networkidle');
  }
  await tab.waitForTimeout(2200);
  await tab.screenshot({ path: out, fullPage: flags.includes('--full') });
  if (problems.length) console.log(problems.join('\n'));
} finally { await browser.close(); await stop(); }
