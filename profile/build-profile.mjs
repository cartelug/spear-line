// Builds the Spear Line company profile: profile/profile.html (editable source) and
// profile/Spear-Line-Company-Profile.pdf (A4, printed by Chromium). Run: npm run profile
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import * as site from '../content/site.mjs';
import { profile as p } from './content.mjs';

const dir = import.meta.dirname, root = resolve(dir, '..');
const A = path => '../public/assets/' + path;
const J = (file, w = 1280) => A('joh/' + file + '-' + w + '.webp');
const JOH = 'Joh Ayom, AI-generated image'; // relative to profile/, so profile.html opens from any checkout
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sprite = (await import('node:fs/promises')).readFile(resolve(root, 'public/assets/icons.svg'), 'utf8');
const icon = id => `<svg class="ico" viewBox="0 0 48 48" aria-hidden="true"><use href="#${id}"/></svg>`;
const status = s => ({ 'Enquiry-led': 'led', Developing: 'dev', Concept: 'concept' }[s]);
const route = `<svg class="route" viewBox="0 0 800 220" preserveAspectRatio="none" aria-hidden="true"><path d="M-20 190 C 160 190, 220 70, 400 70 S 640 170, 820 40" fill="none" stroke="#F6AD46" stroke-width="3" vector-effect="non-scaling-stroke"/></svg>`;
let n = 0;
const page = (cls, body, { dark = false, label = '' } = {}) => { n++; return `<section class="page ${cls}${dark ? ' dark' : ''}">${body}<footer class="folio"><span>${label || 'Spear Line Global Limited · Company profile'}</span><span>${String(n).padStart(2, '0')}</span></footer></section>`; };

const pages = [
  page('cover', `<div class="lf"></div>${route}<img class="cover-logo" src="${'assets/logo-wordmark-white.png'}" alt="Spear Line"><div class="cover-copy"><p class="kicker">Company profile</p><h1>Practical trade.<br><span>Bigger possibilities.</span></h1><p class="lede">${esc(site.brand.description)}</p></div><figure class="cover-photo"><img src="${J('portrait', 800)}" alt="Joh Ayom"><figcaption>${JOH}</figcaption></figure>`, { dark: true }),
  page('intro', `<p class="kicker">Who we are</p><h2>${esc(site.about.who.title)}</h2><div class="cols"><div>${site.about.who.text.map(t => `<p class="big">${esc(t)}</p>`).join('')}</div><div class="facts"><div><strong>${esc(p.legalName)}</strong><span>Company</span></div><div><strong>${esc(p.founder)}</strong><span>Founder</span></div><div><strong>06</strong><span>Business divisions</span></div><div><strong>03</strong><span>Core service paths</span></div><div><strong>Uganda · South Sudan</strong><span>Contact lines</span></div></div></div><div class="principles">${site.about.principles.map(x => `<div>${icon(x.icon)}<h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`).join('')}</div>`),
  page('divisions', `<p class="kicker">Six divisions</p><h2>One company, six directions.</h2><p class="lede">Each division states its present stage. Concepts are shown as concepts; nothing here claims stock, permits, facilities or partnerships.</p><div class="legend"><span class="badge led">Enquiry-led</span> discussed and confirmed per enquiry <span class="badge dev">Developing</span> scope being confirmed <span class="badge concept">Concept</span> under consideration</div><div class="div-grid">${site.divisions.map(d => `<article><div class="d-top"><span class="d-ico">${icon(d.icon)}</span><span class="badge ${status(d.status)}">${esc(d.status)}</span></div><p class="cat">${esc(d.number)} / ${esc(d.category)}</p><h3>${esc(d.name)}</h3><p>${esc(d.text)}</p></article>`).join('')}</div>`),
  page('services', `<p class="kicker">Core service paths</p><h2>Where the work begins.</h2><div class="svc">${site.services.map(s => `<article><div class="s-head"><span class="d-ico">${icon(s.icon)}</span><div><p class="cat">${esc(s.label)}</p><h3>${esc(s.name)}</h3></div></div><p>${esc(s.card)}</p><p class="incl">Bring us</p><ul>${s.include.map(i => `<li>${esc(i)}</li>`).join('')}</ul></article>`).join('')}</div><div class="strip">${[['logistics-yard', 'Logistics'], ['market', 'Supplies'], ['beside-4x4', 'Vehicles']].map(([f, l]) => `<figure><img src="${J(f, 800)}" alt="Joh Ayom: ${l.toLowerCase()}"><figcaption>${l}</figcaption></figure>`).join('')}</div><div class="steps">${site.process.map((s, i) => `<div><span class="num">0${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`).join('')}</div>`, { dark: true }),
  page('sourcing', `<div class="split"><figure class="photo"><img src="${J('timber', 800)}" alt="Joh Ayom checking timber"><figcaption>${JOH}</figcaption></figure><div><p class="kicker">Beyond the core portfolio</p><h2>Bring us the requirement.</h2><p class="big">We can discuss these adjacent requests and assess the right supplier, delivery route and permissions before proposing any work. This list does not claim current stock or licensed operations.</p><ul class="topics">${site.sourcingTopics.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></div>`),
  page('founder', `<div class="split"><div><p class="kicker">A word from the founder</p><h2>${esc(p.founder)}</h2><blockquote><p>“${esc(p.founderQuote)}”</p><cite>${esc(p.founder)}, Founder</cite></blockquote>${p.founderMessage.map(t => `<p class="big">${esc(t)}</p>`).join('')}</div><figure class="photo tall"><img src="${J('office-reading', 800)}" alt="Joh Ayom reading a document"><figcaption>${JOH}</figcaption></figure></div>`, { dark: true }),
  page('digital', `<p class="kicker">A proposed capability</p><h2>Digital that has a purpose.</h2><p class="lede">Nine areas to explore with THE 97 World as a proposed collaborator. Scope, pricing and delivery responsibilities are agreed before work is offered. This is not a statement of an executed partnership.</p><div class="caps">${site.digitalCapabilities.map(d => `<article><div class="d-top"><span class="d-ico">${icon(d.icon)}</span><span class="cat">${esc(d.number)}</span></div><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p></article>`).join('')}</div>`),
  page('contact', `<div class="lf"></div>${route}<p class="kicker">Next step</p><h2>Let’s move something forward.</h2><p class="lede">${esc(site.home.closing.text)} Share the requirement, destination and timing, and the next step is a conversation about scope and arrangements.</p><div class="phones">${p.phones.map(x => `<div><span>${esc(x.label)}</span><strong>${esc(x.number)}</strong></div>`).join('')}</div><p class="note">${esc(p.emailNote)}</p><img class="end-logo" src="${'assets/logo-wordmark-white.png'}" alt="Spear Line"><p class="note small">${esc(p.imageNote)} © ${new Date().getFullYear()} ${esc(p.legalName)}.</p>`, { dark: true, label: esc(site.brand.tagline) })
];

const css = `
@font-face{font-family:D;src:url(${A('fonts/mtn-brighter-sans-bold.woff2')})}
@font-face{font-family:T;src:url(${A('fonts/sky-text-regular.woff2')})}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font:400 10.5pt/1.55 T,Arial,sans-serif;color:#162C39;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;width:210mm;height:297mm;padding:22mm 18mm 24mm;overflow:hidden;background:#FBF8F2;page-break-after:always;display:flex;flex-direction:column;gap:6mm}
.dark{background:linear-gradient(160deg,#061F30,#082F47 45%,#0F4766);color:#fff}
.lf{position:absolute;inset:0;background:url(${A('line-field.svg')}) center/cover;opacity:.9}
.route{position:absolute;left:0;right:0;bottom:30mm;width:100%;height:46mm;opacity:.9}
h1,h2,h3,strong{font-family:D,Arial,sans-serif;font-weight:700;letter-spacing:-.02em}
h1{font-size:40pt;line-height:1.02}h1 span{color:#F6AD46}
h2{font-size:26pt;line-height:1.08;max-width:15ch}h3{font-size:12.5pt;line-height:1.2}
.kicker{font:700 9pt D,Arial;color:#A45B0C;text-transform:none}.dark .kicker{color:#F6AD46}
.lede{font-size:12pt;max-width:150mm;color:#4B6270}.dark .lede,.dark p{color:#D5E4EC}
.big{font-size:11.5pt;margin-bottom:3mm}
.ico{width:18px;height:18px;fill:none}
.folio{position:absolute;left:18mm;right:18mm;bottom:10mm;display:flex;justify-content:space-between;font:700 7.5pt D,Arial;color:#8A9AA4;border-top:.5pt solid currentColor;padding-top:2.5mm}
.dark .folio{color:#8FB0C2}
.cover{justify-content:flex-start}.cover-logo{position:relative;width:78mm;margin-bottom:28mm}
.cover-copy{position:relative;max-width:120mm;display:grid;gap:5mm}
.cover-photo{position:absolute;right:18mm;bottom:40mm;width:92mm;height:104mm;border-radius:6mm 6mm 6mm 22mm;overflow:hidden;border:.6pt solid rgba(255,208,138,.5)}
.cover-photo img,.photo img{width:100%;height:100%;object-fit:cover;display:block}
.cover-photo figcaption,.photo.tall figcaption{left:auto;right:3mm}
figure{position:relative}figcaption{position:absolute;left:3mm;bottom:3mm;background:rgba(6,31,48,.8);color:#fff;font:700 7pt D,Arial;padding:1.2mm 2.5mm;border-radius:9mm}
.cols{display:grid;grid-template-columns:1.3fr 1fr;gap:10mm}
.facts{display:grid;gap:2.5mm}.facts div{background:#fff;border:.5pt solid #D9E3E8;border-radius:3mm;padding:3mm 4mm;display:grid}
.facts strong{font-size:12pt}.facts span{font-size:8.5pt;color:#4B6270}
.principles{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm;margin-top:auto}
.principles div{background:#082F47;color:#fff;border-radius:4mm;padding:5mm}.principles .ico{color:#F6AD46;width:22px;height:22px}
.principles h3{margin:3mm 0 2mm}.principles p{color:#C9DCE5;font-size:9pt}
.legend{font-size:8.5pt;color:#4B6270;display:flex;flex-wrap:wrap;align-items:center;gap:2mm}
.badge{display:inline-block;font:700 7.5pt D,Arial;padding:1mm 2.5mm;border-radius:9mm}
.badge.led{background:#E2F3EC;color:#0D5642}.badge.dev{background:#FFEFD6;color:#85470A}.badge.concept{background:#EEF2F5;color:#37505F;border:.5pt solid #C3D0D8}
.div-grid,.caps{display:grid;grid-template-columns:repeat(2,1fr);gap:4mm}.caps{grid-template-columns:repeat(3,1fr)}
.div-grid article,.caps article{background:#fff;border:.5pt solid #D9E3E8;border-radius:4mm;padding:4.5mm;display:grid;gap:1.6mm;align-content:start}
.d-top{display:flex;justify-content:space-between;align-items:center}
.d-ico{display:grid;place-items:center;width:9mm;height:9mm;border-radius:2.5mm;background:#082F47;color:#F6AD46}
.cat{font-size:8pt;color:#4B6270;font-weight:700}.div-grid p,.caps p{font-size:9pt;color:#4B6270}
.svc{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
.svc article{background:rgba(255,255,255,.07);border:.5pt solid rgba(255,255,255,.2);border-radius:4mm;padding:5mm;display:grid;gap:2.5mm;align-content:start}
.s-head{display:flex;gap:3mm;align-items:center}.dark .cat{color:#F6AD46}
.svc .d-ico{background:#F6AD46;color:#061F30}
.incl{font:700 8pt D,Arial;color:#FFD08A!important}.svc ul{padding-left:4mm;font-size:9pt;color:#D5E4EC}.svc p{font-size:9.5pt}
.strip{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}.strip figure{height:38mm;border-radius:3mm;overflow:hidden}.strip img{width:100%;height:100%;object-fit:cover;display:block}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;margin-top:auto;border-top:.6pt solid #F6AD46;padding-top:5mm}
.num{display:grid;place-items:center;width:9mm;height:9mm;border-radius:50%;border:1pt solid #F6AD46;color:#FFD08A;font:700 8pt D,Arial;margin-bottom:2mm}
.steps p{font-size:8.5pt}
.split{display:grid;grid-template-columns:1fr 1fr;gap:9mm;align-items:start;height:100%}
.photo{height:120mm;border-radius:5mm;overflow:hidden}.photo.tall{height:200mm;border-radius:5mm 5mm 5mm 22mm}
.split>div{display:grid;gap:4mm;align-content:start}
.topics{list-style:none;display:grid;gap:2mm}.topics li{background:#fff;border:.5pt solid #D9E3E8;border-radius:2.5mm;padding:2.2mm 3mm;font-weight:700;font-size:9.5pt;display:flex;gap:2.5mm;align-items:center}
.topics li::before{content:"";width:2.2mm;height:2.2mm;border-radius:50%;background:#EB9122;flex:none}
.sourcing .split{grid-template-columns:.9fr 1.1fr}
blockquote{border-left:1.6mm solid #EB9122;background:rgba(255,255,255,.08);padding:5mm 6mm;border-radius:0 4mm 4mm 0}
blockquote p{font:700 15pt/1.32 D,Arial;color:#fff!important}cite{display:block;margin-top:3mm;font-style:normal;font-size:9pt;color:#C9DCE5}
.contact{justify-content:center}.contact>*:not(.folio){position:relative}.contact h2{font-size:34pt;max-width:12ch}
.phones{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:4mm}
.phones div{background:#fff;color:#082F47;border-radius:5mm;padding:6mm;display:grid;gap:1.5mm}
.phones span{font:700 9pt D,Arial;color:#A45B0C}.phones strong{font-size:20pt}
.note{font-size:10pt}.note.small{font-size:8pt;color:#8FB0C2!important;margin-bottom:8mm}
.end-logo{width:60mm;margin-top:10mm}
`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Spear Line Global Limited — Company profile</title><style>${css}</style></head><body><div hidden>${(await sprite).replace(/^<svg[^>]*>/, '<svg xmlns="http://www.w3.org/2000/svg">')}</div>${pages.join('\n')}</body></html>`;
const htmlPath = resolve(dir, 'profile.html');
await writeFile(htmlPath, html);
const browser = await chromium.launch({ args: ['--no-sandbox'] });
try {
  const tab = await browser.newPage(); await tab.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
  await tab.evaluate(() => document.fonts.ready);
  await tab.pdf({ path: resolve(dir, 'Spear-Line-Company-Profile.pdf'), preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
} finally { await browser.close(); }
console.log('Wrote profile/profile.html and profile/Spear-Line-Company-Profile.pdf (' + pages.length + ' pages)' + (p.founderQuoteVerified ? '' : '. Founder quote NOT yet verified against the supplied PDF.'));
