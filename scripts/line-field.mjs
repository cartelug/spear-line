// Generates assets/line-field.svg: the "Line Field" contour texture behind the hero, closing sections and 404.
// Seeded value noise is sampled on a grid and traced into iso-lines with marching squares, so the output is
// original, deterministic (same file every build) and small. Run: node scripts/line-field.mjs
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const W = 1600, H = 900, STEP = 28, LEVELS = 13, SEED = 97;
const cols = Math.ceil(W / STEP) + 1, rows = Math.ceil(H / STEP) + 1;

// Mulberry32 keeps the field identical on every machine.
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rand = rng(SEED), lattice = Array.from({ length: 40 * 40 }, () => rand());
const lat = (x, y) => lattice[((y % 40) + 40) % 40 * 40 + ((x % 40) + 40) % 40];
const smooth = t => t * t * (3 - 2 * t);
function noise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = smooth(x - xi), yf = smooth(y - yi); const a = lat(xi, yi), b = lat(xi + 1, yi), c = lat(xi, yi + 1), d = lat(xi + 1, yi + 1); return (a + (b - a) * xf) * (1 - yf) + (c + (d - c) * xf) * yf; }
// Three octaves of value noise, plus a broad slope so the lines flow left to right like a ridge line.
function height(x, y) { const u = x / W, v = y / H; return 0.55 * noise(u * 3.1, v * 2.2) + 0.3 * noise(u * 6.3 + 9, v * 4.6 + 4) + 0.15 * noise(u * 12.7 + 3, v * 9.4 + 7) + 0.22 * (1 - v) * Math.sin(u * 2.4 + 0.6); }

const grid = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => height(c * STEP, r * STEP)));
let lo = Infinity, hi = -Infinity; for (const row of grid) for (const v of row) { lo = Math.min(lo, v); hi = Math.max(hi, v); }

const lerp = (a, b, level) => (level - a) / (b - a);
function segments(level) {
  const out = [];
  for (let r = 0; r < rows - 1; r++) for (let c = 0; c < cols - 1; c++) {
    const tl = grid[r][c], tr = grid[r][c + 1], br = grid[r + 1][c + 1], bl = grid[r + 1][c];
    const x = c * STEP, y = r * STEP, idx = (tl > level) * 8 + (tr > level) * 4 + (br > level) * 2 + (bl > level);
    if (idx === 0 || idx === 15) continue;
    const top = [x + lerp(tl, tr, level) * STEP, y], right = [x + STEP, y + lerp(tr, br, level) * STEP], bottom = [x + lerp(bl, br, level) * STEP, y + STEP], left = [x, y + lerp(tl, bl, level) * STEP];
    const table = { 1: [[left, bottom]], 2: [[bottom, right]], 3: [[left, right]], 4: [[top, right]], 5: [[top, left], [bottom, right]], 6: [[top, bottom]], 7: [[top, left]], 8: [[top, left]], 9: [[top, bottom]], 10: [[top, right], [left, bottom]], 11: [[top, right]], 12: [[left, right]], 13: [[bottom, right]], 14: [[left, bottom]] };
    out.push(...table[idx]);
  }
  return out;
}
// Join loose segments into polylines so each iso-line is one path, which keeps the file small.
function chains(segs) {
  const key = p => p[0].toFixed(1) + ',' + p[1].toFixed(1), ends = new Map();
  segs.forEach((s, i) => { for (const p of s) { const k = key(p); (ends.get(k) || ends.set(k, []).get(k)).push(i); } });
  const used = new Set(), result = [];
  for (let i = 0; i < segs.length; i++) {
    if (used.has(i)) continue; used.add(i);
    let line = [...segs[i]];
    for (const dir of [1, 0]) {
      for (;;) {
        const tip = dir ? line[line.length - 1] : line[0], next = (ends.get(key(tip)) || []).find(j => !used.has(j));
        if (next === undefined) break; used.add(next);
        const [a, b] = segs[next], other = key(a) === key(tip) ? b : a;
        dir ? line.push(other) : line.unshift(other);
      }
    }
    result.push(line);
  }
  return result;
}
const round = n => Math.round(n);
let paths = '';
for (let i = 1; i <= LEVELS; i++) {
  const level = lo + (hi - lo) * (i / (LEVELS + 1)), major = i % 5 === 0;
  const d = chains(segments(level)).filter(l => l.length > 4).map(l => 'M' + l.map(p => round(p[0]) + ' ' + round(p[1])).join('L')).join('');
  if (d) paths += `<path${major ? ' class="m"' : ''} d="${d}"/>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#fff" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"><style>path{stroke-opacity:.07;vector-effect:non-scaling-stroke}.m{stroke-opacity:.13}</style>${paths}</svg>\n`;
await writeFile(resolve(import.meta.dirname, '../public/assets/line-field.svg'), svg);
console.log('line-field.svg', (svg.length / 1024).toFixed(1), 'KB,', (svg.match(/<path/g) || []).length, 'iso-lines');
