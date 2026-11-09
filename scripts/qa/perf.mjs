// Lab performance: FCP, LCP, CLS, long tasks, transfer size and request count for key pages.
// Mobile profile = Moto-class phone, Slow 4G (1.6 Mbps, 150 ms RTT), 4x CPU slowdown. Desktop = unthrottled.
// Usage: node scripts/qa/perf.mjs [label] [runs]  -> prints a markdown table and writes docs/v15/perf-<label>.json
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { startSite, launch, skipIntro, root } from './lib.mjs';

const label = process.argv[2] || 'run', RUNS = Number(process.argv[3] || 3);
const targets = ['index', 'divisions', 'contact'];
const profiles = [
  { name: 'phone slow-4G', viewport: { width: 390, height: 844 }, mobile: true, net: { download: 1.6e6 / 8, upload: 0.75e6 / 8, latency: 150 }, cpu: 4 },
  { name: 'desktop', viewport: { width: 1440, height: 900 }, mobile: false, net: null, cpu: 1 }
];
const median = list => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)];

const observers = () => {
  window.__m = { lcp: 0, cls: 0, long: 0, longCount: 0 };
  new PerformanceObserver(list => { for (const e of list.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver(list => { for (const e of list.getEntries()) { window.__m.longCount++; window.__m.long += Math.max(0, e.duration - 50); } }).observe({ type: 'longtask', buffered: true });
};

const { base, stop } = await startSite(), browser = await launch(), results = [];
try {
  for (const profile of profiles) for (const name of targets) for (const intro of [false, true]) {
    if (intro && name !== 'index') continue;
    const runs = [];
    for (let i = 0; i < RUNS; i++) {
      const context = await browser.newContext({ viewport: profile.viewport, isMobile: profile.mobile, hasTouch: profile.mobile });
      if (!intro) await skipIntro(context);
      await context.addInitScript(observers);
      const page = await context.newPage(), cdp = await context.newCDPSession(page);
      let bytes = 0, requests = 0;
      await cdp.send('Network.enable');
      cdp.on('Network.loadingFinished', e => { bytes += e.encodedDataLength; requests++; });
      if (profile.net) await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: profile.net.latency, downloadThroughput: profile.net.download, uploadThroughput: profile.net.upload });
      if (profile.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu });
      await page.goto(`${base}/${name}.html`, { waitUntil: 'load' });
      await page.waitForTimeout(intro ? 3500 : 1800);
      const m = await page.evaluate(() => ({ ...window.__m, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0 }));
      runs.push({ ...m, bytes, requests });
      await context.close();
    }
    results.push({ profile: profile.name, page: name + (intro ? ' (first visit, preloader)' : ''), fcp: median(runs.map(r => r.fcp)), lcp: median(runs.map(r => r.lcp)), cls: median(runs.map(r => r.cls)), tbt: median(runs.map(r => r.long)), kb: median(runs.map(r => r.bytes)) / 1024, requests: median(runs.map(r => r.requests)) });
  }
} finally { await browser.close(); await stop(); }

await mkdir(resolve(root, 'docs/v15'), { recursive: true });
await writeFile(resolve(root, `docs/v15/perf-${label}.json`), JSON.stringify(results, null, 2));
console.log('| Profile | Page | FCP ms | LCP ms | CLS | Long-task excess ms | Transfer KB | Requests |\n|---|---|---|---|---|---|---|---|');
for (const r of results) console.log(`| ${r.profile} | ${r.page} | ${r.fcp.toFixed(0)} | ${r.lcp.toFixed(0)} | ${r.cls.toFixed(3)} | ${r.tbt.toFixed(0)} | ${r.kb.toFixed(0)} | ${r.requests} |`);
