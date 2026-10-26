// Development tool: finds the style rules each page needs for its first screen and writes src/styles/critical.json.
// The build inlines those rules in <head> and loads the full stylesheet without blocking the first paint.
// Run after changing styles or page structure:  npm run critical   (needs the Playwright dev dependency)
import { spawn } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCss, styleRules } from './css-rules.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import('playwright');
const port = 3900 + Math.floor(Math.random() * 90);
const server = spawn(process.execPath, ['server.mjs', '--port', String(port)], { cwd: root, stdio: 'ignore' });
await new Promise(done => setTimeout(done, 600));

// Over-include on purpose: drop pseudo-elements, interactive states, :not()/:has() and JavaScript state classes,
// so a rule that only applies after a click, a scroll or the preloader's exit is still part of the first screen.
const STATE_CLASS = /\.(?:is-[\w-]+|has-[\w-]+|pl-run|pl-exit|motion-[\w-]+|menu-open|cursor-on|js)(?![\w-])/g;
const STATE_PSEUDO = /:(?:hover|focus|focus-visible|focus-within|active|visited|target|checked|disabled|enabled|invalid|valid|user-invalid|user-valid|placeholder-shown|empty|indeterminate|default|required|optional|read-only|autofill|-webkit-autofill|popover-open|modal|fullscreen|open)(?![\w-])/g;
function splitList(selector) {
  const parts = []; let depth = 0, start = 0;
  for (let i = 0; i < selector.length; i++) {
    if (selector[i] === '(') depth++; else if (selector[i] === ')') depth--;
    else if (selector[i] === ',' && !depth) { parts.push(selector.slice(start, i)); start = i + 1; }
  }
  return [...parts, selector.slice(start)].map(s => s.trim()).filter(Boolean);
}
function loosen(part) {
  let s = part;
  for (let guard = 0; guard < 4 && /:(not|has)\(/.test(s); guard++) s = s.replace(/:(?:not|has)\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)/g, '');
  s = s.replace(/::?(?:before|after|placeholder|marker|selection|backdrop|details-content|file-selector-button|-webkit-[\w-]+|-moz-[\w-]+)(?:\([^)]*\))?/g, '')
    .replace(STATE_PSEUDO, '').replace(STATE_CLASS, '').replace(/\[[^\]]*\]/g, '')
    .replace(/\s*([>+~])\s*/g, ' $1 ').replace(/(^|\s)[>+~]\s*$/, '').replace(/^\s*[>+~]\s*/, '').trim();
  return s || '*';
}

const css = await readFile(resolve(root, 'public/site.css'), 'utf8');
const rules = styleRules(parseCss(css.replace(/\/\*[\s\S]*?\*\//g, '')));
const tests = rules.map(rule => ({ key: rule.key, selectors: [...new Set(splitList(rule.prelude).map(loosen))] }));
const pages = (await readdir(resolve(root, 'public'))).filter(name => name.endsWith('.html') && name !== 'timber-logistics.html').sort();
const viewports = [[320, 640], [360, 780], [390, 844], [430, 932], [600, 960], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080], [2560, 1440]];
const result = {};
const browser = await chromium.launch();
try {
  for (const page of pages) {
    const keys = new Set();
    for (const [width, height] of viewports) for (const intro of [true, false]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'no-preference' });
      if (!intro) await context.addInitScript(() => { try { sessionStorage.setItem('spear-line-intro', '1'); } catch { /* optional */ } });
      const tab = await context.newPage();
      await tab.goto(`http://127.0.0.1:${port}/${page}`, { waitUntil: 'domcontentloaded' });
      // Measure with the full stylesheet applied, as a visitor sees the page once everything has loaded.
      await tab.waitForFunction(() => !document.querySelector('link[data-defer]') || document.documentElement.classList.contains('css-ready'));
      await tab.waitForTimeout(intro ? 150 : 50);
      const found = await tab.evaluate(tests => {
        const roots = document.querySelectorAll('.preloader, .skip, .progress, .site-header, .dock, .cursor, main > section:first-child');
        const critical = new Set([document.documentElement, document.body]);
        for (const el of roots) { critical.add(el); for (const child of el.querySelectorAll('*')) critical.add(child); }
        for (const el of document.querySelectorAll('body *')) {
          const box = el.getBoundingClientRect();
          if (box.bottom > -40 && box.top < innerHeight + 40 && box.right > 0 && box.left < innerWidth) critical.add(el);
        }
        const hits = [];
        for (const { key, selectors } of tests) {
          let hit = false;
          for (const selector of selectors) {
            let matches;
            try { matches = document.querySelectorAll(selector); } catch { hit = true; break; }
            for (const el of matches) if (critical.has(el)) { hit = true; break; }
            if (hit) break;
          }
          if (hit) hits.push(key);
        }
        return hits;
      }, tests);
      found.forEach(key => keys.add(key));
      await context.close();
    }
    result[page] = rules.map(rule => rule.key).filter(key => keys.has(key));
    console.log(page.padEnd(20), result[page].length, 'of', rules.length, 'rules');
  }
} finally {
  await browser.close();
  server.kill();
}
await writeFile(resolve(root, 'src/styles/critical.json'), JSON.stringify(result, null, 1) + '\n');
console.log('Wrote src/styles/critical.json');
