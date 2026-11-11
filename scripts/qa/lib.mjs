// Shared helpers for the QA scripts: start the real Node host on a free port and launch Chromium.
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

export const root = resolve(import.meta.dirname, '..', '..');
export const PAGES = ['index', 'divisions', 'digital', 'founder', 'vehicles', 'supplies', 'logistics', 'how-it-works', 'faq', 'contact', 'about', 'bar', 'enquire', 'privacy', 'terms', '404'];

async function freePort() {
  const probe = net.createServer(); probe.listen(0, '127.0.0.1'); await once(probe, 'listening');
  const port = probe.address().port; await new Promise(done => probe.close(done)); return port;
}

export async function startSite() {
  const port = await freePort(), base = 'http://127.0.0.1:' + port, dataDir = await mkdtemp(resolve(tmpdir(), 'spear-line-qa-'));
  const server = spawn(process.execPath, ['server.mjs'], { cwd: root, env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), PUBLIC_ORIGIN: base, DATA_DIR: dataDir, ENQUIRIES_ENABLED: 'false', NODE_ENV: 'test', PUBLIC_CONTACT_EMAIL: 'enquiries@spearline.africa', PUBLIC_CONTACT_PHONE: '+256 708 735 878', PUBLIC_CONTACT_PHONE_SECONDARY: '+211 920 998 562' }, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((done, fail) => { const timer = setTimeout(() => fail(new Error('Server did not start')), 10000); server.stdout.on('data', chunk => { if (String(chunk).includes('listening')) { clearTimeout(timer); done(); } }); });
  const stop = async () => { if (server.exitCode === null) { server.kill('SIGTERM'); await once(server, 'exit'); } await rm(dataDir, { recursive: true, force: true }); };
  return { base, stop };
}

export const launch = () => chromium.launch({ executablePath: process.env.E2E_CHROME || undefined, args: ['--no-sandbox'] });
export const skipIntro = context => context.addInitScript(() => { try { sessionStorage.setItem('spear-line-intro', '1'); } catch { /* storage optional */ } });
