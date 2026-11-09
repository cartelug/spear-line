// Deterministic production exports from the approved, unmodified horizontal wordmark.
// Requires ImageMagick 7. No letterform, figure, or proportion is redrawn.
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const asset = path => resolve(root, 'public/assets', path);
const logo = asset('logo-wordmark-gold.png');
const temp = await mkdtemp(join(tmpdir(), 'spear-brand-'));
const run = args => new Promise((done, fail) => {
  const child = spawn('magick', args, { stdio: 'inherit' });
  child.on('error', fail);
  child.on('exit', code => code === 0 ? done() : fail(new Error(`ImageMagick exited ${code}`)));
});

try {
  for (const [name, size] of [['favicon-32.png', 32], ['favicon-48.png', 48], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    await run([logo, '-resize', `${Math.round(size * .86)}x`, '-background', '#082f47', '-gravity', 'center', '-extent', `${size}x${size}`, asset(name)]);
  }
  await run([asset('favicon-48.png'), asset('favicon-32.png'), resolve(root, 'public/favicon.ico')]);

  const backdrop = join(temp, 'backdrop.png');
  const wordmark = join(temp, 'wordmark.png');
  await run([asset('visuals/11-container-port.webp'), '-resize', '1200x630^', '-gravity', 'center', '-extent', '1200x630', '-fill', 'rgba(8,47,71,0.83)', '-draw', 'rectangle 0,0 1200,630', backdrop]);
  await run([logo, '-resize', '320x', wordmark]);
  await run([backdrop, wordmark, '-gravity', 'northwest', '-geometry', '+68+55', '-compose', 'over', '-composite',
    '-font', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '-fill', '#f2b65a', '-draw', 'rectangle 70,252 134,257',
    '-fill', '#ffffff', '-pointsize', '70', '-annotate', '+68+274', 'Practical trade.',
    '-fill', '#f2b65a', '-pointsize', '68', '-annotate', '+68+370', 'Bigger possibilities.',
    '-fill', '#e1edf2', '-pointsize', '24', '-annotate', '+70+540', 'Vehicles  /  Supply  /  Logistics',
    asset('og-image.png')]);
  console.log('Rendered approved wordmark into favicons, app icons and social artwork.');
} finally {
  await rm(temp, { recursive: true, force: true });
}
