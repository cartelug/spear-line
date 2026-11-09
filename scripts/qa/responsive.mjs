// Responsive audit: every page at ten widths plus landscape phones, 200% zoom and large text.
// Checks horizontal overflow, clipped text, tap targets under 44 px, distorted images, and the phone dock covering footer links.
// Usage: node scripts/qa/responsive.mjs [--pages a,b] [--out docs/v15/qa-matrix]   -> writes .json and .md
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { startSite, launch, skipIntro, PAGES, root } from './lib.mjs';

const arg = name => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : ''; };
const pages = arg('--pages') ? arg('--pages').split(',') : PAGES;
const out = resolve(root, arg('--out') || 'docs/v15/qa-matrix');
const modes = [
  ...[320, 360, 390, 430, 600, 768, 1024, 1280, 1440, 1920].map(w => ({ label: String(w), width: w, height: w < 600 ? 800 : w < 1100 ? 1000 : 900 })),
  { label: '667x375 land', width: 667, height: 375 }, { label: '844x390 land', width: 844, height: 390 }, { label: '932x430 land', width: 932, height: 430 },
  { label: '200% zoom', width: 640, height: 450 }, { label: 'large text', width: 390, height: 800, largeText: true }
];

function audit() {
  const vw = document.documentElement.clientWidth, issues = [];
  const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const overflow = document.documentElement.scrollWidth - vw;
  if (overflow > 1) {
    const offenders = [...document.body.querySelectorAll('*')].filter(el => { const r = el.getBoundingClientRect(); return r.width && (r.right > vw + 1 || r.left < -1) && !el.closest('[aria-hidden=true],.preloader,.skip'); }).slice(0, 4).map(name);
    issues.push('overflow +' + overflow + 'px: ' + offenders.join(', '));
  }
  const visible = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden],[inert],.preloader'); };
  for (const el of document.querySelectorAll('h1,h2,h3,.btn,.btn-label,.badge,.chips li,.call-number a')) {
    if (!visible(el)) continue;
    const cs = getComputedStyle(el);
    if (el.scrollWidth > el.clientWidth + 2 && /hidden|clip/.test(cs.overflowX)) issues.push('text clipped: ' + name(el));
  }
  const small = [];
  for (const el of document.querySelectorAll('a[href],button,summary,select,textarea,input:not([type=hidden]):not(.honey)')) {
    if (!visible(el) || el.closest('.skip,.honey') || el.matches('.skip')) continue;
    let r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    // A checkbox or radio inside its label is operated through the label, which is the real target.
    if (el.matches('input[type=checkbox],input[type=radio]') && el.closest('label')) r = el.closest('label').getBoundingClientRect();
    if (cs.display === 'inline' && el.closest('p,.fine,.answer,.prose,.consent,.footer-credits,.footer-bottom')) continue; // inline links in running text
    if (r.height < 43.5 || (r.width < 43.5 && !el.closest('label'))) small.push(name(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
  }
  if (small.length) issues.push(small.length + ' tap targets under 44px: ' + small.slice(0, 3).join('; '));
  for (const img of document.querySelectorAll('img')) {
    if (!img.complete || !img.naturalWidth || !visible(img)) continue;
    const w = img.offsetWidth, h = img.offsetHeight, fit = getComputedStyle(img).objectFit; // offset sizes ignore rotation
    if (fit === 'fill' && h && Math.abs(w / h - img.naturalWidth / img.naturalHeight) > 0.06 * (img.naturalWidth / img.naturalHeight)) issues.push('image distorted: ' + (img.getAttribute('src') || '').slice(-32));
  }
  return issues;
}

await mkdir(dirname(out), { recursive: true });
const { base, stop } = await startSite(), browser = await launch(), results = {};
try {
  for (const mode of modes) {
    const touch = mode.width < 1100 || /land/.test(mode.label);
    const context = await browser.newContext({ viewport: { width: mode.width, height: mode.height }, isMobile: touch && mode.width < 1000, hasTouch: touch });
    await skipIntro(context);
    for (const name of pages) {
      const page = await context.newPage();
      await page.goto(`${base}/${name}.html`, { waitUntil: 'networkidle' });
      if (mode.largeText) await page.evaluate(() => document.documentElement.style.setProperty('font-size', '200%', 'important'));
      await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }));
      await page.evaluate(async () => { const step = Math.max(300, Math.round(innerHeight * .8)); for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } });
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(250);
      let issues = await page.evaluate(audit);
      if (mode.width < 900) {
        await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(200);
        const covered = await page.evaluate(() => [...document.querySelectorAll('.footer-bottom a,.footer-credits a,.to-top')].filter(el => { const r = el.getBoundingClientRect(); if (r.width === 0) return false; const top = document.elementFromPoint(r.left + r.width / 2, Math.min(r.top + r.height / 2, innerHeight - 1)); return top && !el.contains(top) && !!top.closest('.dock'); }).length);
        if (covered) issues.push(covered + ' footer links covered by the dock');
      }
      if (mode.width < 1100 && !mode.largeText) {
        await page.evaluate(() => scrollTo(0, 0));
        const toggle = page.locator('.menu-toggle');
        if (await toggle.isVisible()) {
          await toggle.click(); await page.waitForTimeout(450);
          const sheet = await page.evaluate(() => { const nav = document.querySelector('#site-menu').getBoundingClientRect(); const calls = [...document.querySelectorAll('#site-menu .call-list a')].map(a => a.getBoundingClientRect()); return { fills: nav.height >= innerHeight - 2 && nav.width >= innerWidth - 2, overflow: document.documentElement.scrollWidth - innerWidth, callsVisible: calls.length === 2 && calls.every(r => r.width > 0 && r.height >= 43.5), cta: !!document.querySelector('#site-menu .nav-cta') }; });
          if (!sheet.fills) issues.push('menu sheet does not fill the screen');
          if (sheet.overflow > 1) issues.push('menu overflows by ' + sheet.overflow + 'px');
          if (!sheet.callsVisible) issues.push('menu is missing a call line or its call lines are too small');
          await page.keyboard.press('Escape');
        }
      }
      (results[name] ||= {})[mode.label] = issues;
      await page.close();
    }
    await context.close();
    await writeFile(out + '.partial.json', JSON.stringify(results)).catch(() => {});
    process.stdout.write(mode.label + ' ');
  }
} finally { await browser.close(); await stop(); }

await writeFile(out + '.json', JSON.stringify(results, null, 1));
const cols = modes.map(m => m.label);
let md = '| Page | ' + cols.join(' | ') + ' |\n|---|' + cols.map(() => '---').join('|') + '|\n';
for (const name of pages) md += `| ${name} | ` + cols.map(c => (results[name][c].length ? '**' + results[name][c].length + '**' : 'ok')).join(' | ') + ' |\n';
await writeFile(out + '.md', md);
const failing = pages.flatMap(n => cols.filter(c => results[n][c].length).map(c => `${n} @ ${c}: ${results[n][c].join(' | ')}`));
console.log('\n' + md + '\n' + (failing.length ? failing.join('\n') : 'No issues.'));
