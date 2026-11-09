// Static dead-rule finder: a style rule is dead when every selector in its list names a class, id or data
// attribute that appears in no built page and in no script. Usage: node scripts/qa/dead-css.mjs [--write]
// With --write it removes the dead rules from src/styles/*.css (comments are kept).
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseCss } from '../css-rules.mjs';
import { root } from './lib.mjs';

const pagesDir = resolve(root, 'public'), stylesDir = resolve(root, 'src/styles');
const corpus = (await Promise.all([...(await readdir(pagesDir)).filter(f => f.endsWith('.html')), 'app.js', 'motion.js', 'site-config.js'].map(f => readFile(resolve(pagesDir, f), 'utf8')))).join('\n') + await readFile(resolve(root, 'src/boot.js'), 'utf8');
// Vocabulary kept on purpose (not dead): tone, from- and to- classes are the authoring set for any page.
const present = new Set([...corpus.matchAll(/[\w-]+/g)].map(m => m[0]));
const dead = selector => {
  const parts = selector.split(/,(?![^(]*\))/).map(s => s.trim());
  return parts.every(part => {
    const tokens = [...part.replace(/\[[^\]]*\]/g, m => ' ' + (m.match(/data-[\w-]+/g) || []).join(' ') + ' ').matchAll(/[.#]([\w-]+)|\b(data-[\w-]+)\b/g)].map(m => m[1] || m[2]);
    return tokens.some(t => !present.has(t) && !/^(tone|from|to)-/.test(t));
  });
};
const write = process.argv.includes('--write');
let totalDead = 0, total = 0;
for (const file of (await readdir(stylesDir)).filter(f => f.endsWith('.css')).sort()) {
  const source = await readFile(resolve(stylesDir, file), 'utf8'), body = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const tree = parseCss(body); let deadBytes = 0, count = 0, out = source;
  (function walk(rules) { for (const r of rules) { if (r.type === 'group') walk(r.children); else if (r.type === 'style') { total += r.text.length; if (!/^(from|to|\d+%)/.test(r.prelude) && dead(r.prelude)) { deadBytes += r.text.length; count++; if (write) out = out.replace(r.text, ''); } } } })(tree);
  totalDead += deadBytes; console.log(file.padEnd(28), String(count).padStart(4), 'dead rules', String(deadBytes).padStart(6), 'bytes');
  if (write && out !== source) await writeFile(resolve(stylesDir, file), out);
}
console.log('TOTAL dead', totalDead, 'of', total, 'bytes of style rules');
