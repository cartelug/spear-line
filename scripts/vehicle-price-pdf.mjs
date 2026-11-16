// Builds the internal vehicle price list for owner review (portrait, readable):
//   docs/price-list/Spear-Line-Vehicle-Price-List-DRAFT.pdf (A4 portrait, printed by Chromium)
//   docs/price-list/price-list.html (the editable source; opens in any browser)
// Data comes from content/vehicle-prices.mjs, so the PDF and the website cannot disagree.
// Run: npm run pricelist
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { vehiclePriceGuide } from '../content/vehicle-prices.mjs';
import { vehicleCategories } from '../content/vehicle-categories.mjs';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'docs/price-list');
await mkdir(out, { recursive: true });
const A = p => '../../public/assets/' + p; // relative to docs/price-list/

// ---- Pricing rules shown to the owner (change here, rebuild) --------------------------------
const CURRENT = 0.08;                // what the website adds today to the exporter FOB price
const RATE = 0.12;                   // PROPOSED markup rate
const MIN_MARGIN = 500;              // PROPOSED minimum markup per car, USD
const FREIGHT_PLACEHOLDER = 1300;    // USD, sea freight Japan to Mombasa: PLACEHOLDER, to confirm
const INSURANCE_RATE = 0.015;        // placeholder, to confirm
const UG = { duty: 0.25, vat: 0.18, wht: 0.06, infra: 0.015 }; // from a URA 2023/24 document: to confirm

const n = v => new Intl.NumberFormat('en-US').format(Math.round(v));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const priceNow = fob => Math.round(fob * (1 + CURRENT));
const priceNew = fob => Math.round(fob + Math.max(fob * RATE, MIN_MARGIN));
const fuel = v => ({ 'Hybrid(Petrol)': 'Hybrid', 'Hybrid(Diesel)': 'Hybrid diesel' }[v] || v);
const gear = v => ({ AT: 'Auto', MT: 'Manual', CVT: 'Auto' }[v] || v);

const cars = [...vehiclePriceGuide.vehicles].sort((a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model) || a.year - b.year || a.priceUsd - b.priceUsd);
const byMake = [...new Set(cars.map(c => c.make))].map(make => [make, cars.filter(c => c.make === make)]);
const models = new Set(cars.map(c => c.make + c.model));
const prices = cars.map(c => c.priceUsd).sort((a, b) => a - b);
const fmtDate = d => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
const checked = fmtDate(new Date(vehiclePriceGuide.checkedOn + 'T00:00:00Z')), prepared = fmtDate(new Date());
const atMin = cars.filter(c => c.priceUsd * RATE < MIN_MARGIN).length;
const avg = f => cars.reduce((t, c) => t + f(c.priceUsd) - c.priceUsd, 0) / cars.length;

// ---- Worked Uganda example (draft arithmetic on the stated placeholder assumptions) ---------
function example(car) {
  const fob = car.priceUsd, margin = priceNew(fob) - fob, freight = FREIGHT_PLACEHOLDER;
  const insurance = Math.round((fob + freight) * INSURANCE_RATE), cif = fob + freight + insurance;
  const duty = cif * UG.duty, vat = (cif + duty) * UG.vat, other = cif * (UG.wht + UG.infra);
  return { car, fob, margin, freightIns: freight + insurance, cif, duty, vat, other, total: fob + margin + freight + insurance + duty + vat + other };
}
const pick = (make, model) => cars.filter(c => c.make === make && c.model === model).sort((a, b) => a.priceUsd - b.priceUsd)[0];
const ex = [pick('Toyota', 'Vitz'), pick('Toyota', 'RAV4'), pick('Toyota', 'Land Cruiser Prado')].map(example);
const exRow = (label, f, cls = '') => `<tr class="${cls}"><td>${label}</td>${ex.map(e => `<td class="r">${f(e)}</td>`).join('')}</tr>`;
const exHead = label => `<thead><tr><th>${label}</th>${ex.map(e => `<th class="r">${e.car.year} ${esc(e.car.model)}</th>`).join('')}</tr></thead>`;

// ---- Vehicle list, grouped by make ------------------------------------------------------------
const listBody = byMake.map(([make, list]) => `<tbody class="grp"><tr class="mk"><td colspan="9"><b>${esc(make)}</b><span>${list.length} vehicle${list.length > 1 ? 's' : ''}</span></td></tr>${list.map(c => `<tr><td><b>${esc(c.model)}</b>${c.country === 'Thailand' ? ' <i>Thailand</i>' : ''}<small>${esc(c.sourceRef)}</small></td><td>${c.year}</td><td>${esc(vehicleCategories[c.id] || '')}</td><td class="r">${n(c.mileageKm)}</td><td class="r">${n(c.engineCc)}</td><td>${esc(fuel(c.fuel))}${c.transmission === 'MT' ? ', manual' : ''}</td><td class="r">${n(c.priceUsd)}</td><td class="r g">${n(priceNow(c.priceUsd))}</td><td class="r p">${n(priceNew(c.priceUsd))}</td></tr>`).join('')}</tbody>`).join('');

const taxCountries = [
  ['Uganda', 'Duty 25%, VAT 18%, withholding tax 6%, infrastructure levy 1.5%, environmental levy on older cars.', 'Rates from a 2023/24 URA document. 2026/27 changes (13-year age limit, levy) were only proposals in the sources found. URA values used cars from its own database, not the invoice.'],
  ['Kenya', 'Duty 25% or 35%, excise 20% to 35%, VAT 16%, IDF and RDL. Cars up to 8 years old, right-hand drive.', 'Sources disagree. Only about 60 of the 233 cars are 2018 or newer.'],
  ['South Sudan', 'Duty quoted from 0% to 45% by type and value; VAT 18%.', 'Dealer sources only. A right-hand-drive ban was announced in March 2026, then reported suspended.'],
  ['DR Congo', 'Duty about 8% to 46%; VAT 8% to 13%. Left-hand drive only, per exporter guides.', 'Exporter sources only. Every car here is right-hand drive, so none can be offered as listed.']
];

const logo = A('logo-wordmark-gold.png');
const band = `<header class="band"><img src="${logo}" alt="Spear Line"><span class="draft">Draft · to be updated</span></header>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Spear Line vehicle price list: draft, to be updated</title><style>
@font-face{font-family:D;src:url(${A('fonts/mtn-brighter-sans-bold.woff2')})}
@font-face{font-family:T;src:url(${A('fonts/sky-text-regular.woff2')})}
@page{size:A4 portrait;margin:14mm 14mm 16mm;
  @bottom-left{content:"Spear Line · Vehicle price list · Draft, to be updated · ${prepared}";font:700 7pt D,Arial;color:#7C8E98}
  @bottom-right{content:counter(page) " of " counter(pages);font:700 7pt D,Arial;color:#7C8E98}}
:root{--navy:#061F30;--navy2:#0B3550;--gold:#F6AD46;--ink:#162C39;--muted:#5A6F7B;--line:#E2E9ED;--soft:#F5F8FA}
*{box-sizing:border-box;margin:0;padding:0}
body{font:400 9.6pt/1.5 T,Arial,sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1,h2,h3,b,strong,th{font-family:D,Arial,sans-serif;font-weight:700}
h2{font-size:17pt;line-height:1.15;letter-spacing:-.01em;margin:0 0 1.5mm}h3{font-size:10.5pt;margin:0 0 1.5mm}
.kick{font:700 8.5pt D,Arial;color:#A45B0C;margin-bottom:1mm}
.lede{color:var(--muted);margin-bottom:5mm;max-width:165mm}
.page{break-before:page}
.band{display:flex;justify-content:space-between;align-items:center;margin-bottom:7mm;padding-bottom:3mm;border-bottom:.8pt solid var(--line)}
.band img{height:8mm;display:block}
.draft{font:700 7.5pt D,Arial;color:var(--navy);background:var(--gold);padding:1.2mm 3.5mm;border-radius:8mm}
/* Cover */
.hero{background:linear-gradient(155deg,var(--navy),var(--navy2) 60%,#0F4766);color:#fff;border-radius:5mm;padding:11mm 11mm 12mm;position:relative;overflow:hidden;margin-bottom:6mm}
.hero:before{content:"";position:absolute;inset:0;background:url(${A('line-field.svg')}) center/cover;opacity:.75}
.hero>*{position:relative}.hero img{height:11mm;display:block;margin-bottom:14mm}
.hero .draft{position:absolute;right:11mm;top:12mm}
.hero h1{font-size:30pt;line-height:1.04;letter-spacing:-.02em}.hero h1 span{color:var(--gold);display:block}
.hero p{color:#D5E4EC;font-size:10.5pt;margin-top:4mm;max-width:150mm}
.goal{margin-top:7mm;padding-top:5mm;border-top:.6pt solid rgba(255,255,255,.25);font:700 11pt D,Arial;color:#fff}.goal span{color:var(--gold)}
.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin-bottom:6mm}
.facts div{border:.6pt solid var(--line);border-radius:3mm;padding:3mm 3.5mm}.facts strong{display:block;font-size:12pt;line-height:1.2;white-space:nowrap}.facts span{font-size:8pt;color:var(--muted)}
.markup{display:grid;grid-template-columns:62mm 1fr;gap:6mm;background:var(--soft);border-radius:4mm;padding:6mm;margin-bottom:6mm;align-items:center}
.markup .big{font:700 26pt/1 D,Arial;color:var(--navy)}.markup .big small{display:block;font-size:10pt;color:var(--muted);margin-top:2mm;font-weight:700}
.markup p{font-size:8.6pt;color:var(--muted);margin-top:2mm}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:7mm}
ul{margin-left:4.5mm}li{margin-bottom:1.4mm}
.note{background:#FFF4E0;border-left:1.2mm solid var(--gold);padding:3mm 4mm;border-radius:0 2.5mm 2.5mm 0;margin-top:5mm;font-size:9pt}
/* Tables */
table{border-collapse:collapse;width:100%}
.t th{background:var(--navy);color:#fff;text-align:left;font-size:8pt;padding:2mm 2.5mm}.t th:first-child{border-radius:2mm 0 0 0}.t th:last-child{border-radius:0 2mm 0 0}
.t td{padding:1.8mm 2.5mm;border-bottom:.5pt solid var(--line);vertical-align:top}
.r{text-align:right;white-space:nowrap}th.r{text-align:right}
.t tr.hl td{background:#FFF8EC}.t tr.tot td{background:var(--navy);color:#fff;font-family:D,Arial;font-weight:700}
.small{font-size:8.2pt;color:var(--muted)}
/* Vehicle list */
.list{font-size:8pt;line-height:1.3}
.list thead{display:table-header-group}
.list thead th{background:var(--navy);color:#fff;text-align:left;font-size:7.2pt;padding:2mm 2mm;vertical-align:bottom}
.list thead th.r{text-align:right}
.list td{padding:1.15mm 2mm;border-bottom:.4pt solid var(--line);white-space:nowrap}
.list td small{display:block;font-size:6.5pt;color:#8A9AA4;line-height:1.1}
.list td i{font-style:normal;font-size:6.8pt;color:#85470A;background:#FFF1DA;padding:0 1.2mm;border-radius:2mm}
.list .g{color:#8A9AA4}.list .p{font-family:D,Arial;font-weight:700;color:var(--navy);background:#FFF8EC}
.list tr.mk td{background:var(--soft);padding:2.2mm 2mm 1.6mm;border-bottom:.8pt solid var(--navy);font-size:9.5pt}
.list tr.mk span{float:right;font-size:7.5pt;color:var(--muted);padding-top:.6mm}
.list tbody.grp tr.mk{break-after:avoid}.list tr{break-inside:avoid}
.legend{display:flex;gap:6mm;font-size:8pt;color:var(--muted);margin:1mm 0 4mm}
.check{list-style:none;margin:0}.check li{padding-left:7mm;position:relative;margin-bottom:2.6mm}.check li:before{content:"";position:absolute;left:0;top:.6mm;width:3.6mm;height:3.6mm;border:.8pt solid var(--navy);border-radius:.8mm}
.sign{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8mm;margin-top:14mm}.sign div{border-top:.7pt solid var(--ink);padding-top:1.5mm;font-size:8pt;color:var(--muted)}
.box{border:.6pt solid var(--line);border-radius:3mm;padding:5mm;margin-bottom:5mm}
</style></head><body>

<!-- Page 1: summary -->
<section class="hero"><span class="draft">Draft · to be updated</span><img src="${logo}" alt="Spear Line"><h1>Vehicle price list<span>All vehicles listed currently.</span></h1><p>Exporter prices, today's website price and a proposed higher markup for every vehicle, with a draft tax note, for the owner to review and confirm.</p><p class="goal">Our goal: <span>the best online, and in time physical, car dealership in East Africa.</span></p></section>
<div class="facts"><div><strong>${n(cars.length)}</strong><span>vehicles listed</span></div><div><strong>${byMake.length} makes</strong><span>${models.size} models</span></div><div><strong>USD ${n(prices[0])}+</strong><span>up to USD ${n(prices.at(-1))}</span></div><div><strong>${esc(checked.replace(/ (\w{3})\w* /, ' $1 '))}</strong><span>prices researched</span></div></div>
<div class="markup"><div><div class="big">${RATE * 100}%<small>minimum USD ${MIN_MARGIN} per car</small></div><p>Proposed markup, up from a flat 8% today. Average per car: USD ${n(avg(priceNow))} now, USD ${n(avg(priceNew))} proposed.</p></div>
<table class="t"><thead><tr><th>Example (USD)</th><th class="r">Exporter</th><th class="r">Now, 8%</th><th class="r">Proposed</th></tr></thead><tbody>${ex.map(e => `<tr><td>${e.car.year} ${esc(e.car.model)}</td><td class="r">${n(e.fob)}</td><td class="r">${n(priceNow(e.fob))}</td><td class="r"><b>${n(priceNew(e.fob))}</b></td></tr>`).join('')}</tbody></table></div>
<div class="cols"><div><h3>How to read the prices</h3><ul><li>All prices are <b>USD</b>, from <b>exporter listings (BE FORWARD)</b>. They are not Spear Line stock and can sell or change.</li><li>The <b>exporter price</b> is the car only. Freight, tax, clearing, transport and registration are extra.</li><li><b>${atMin} of ${cars.length}</b> cars (exporter price under USD ${n(MIN_MARGIN / RATE)}) are at the USD ${MIN_MARGIN} minimum.</li></ul></div>
<div><h3>Decisions needed</h3><ul><li>Confirm the markup.</li><li>Choose which cars to remove and which to add.</li><li>Choose the countries to offer first.</li><li>Get written tax and clearing quotes.</li></ul><p class="small" style="margin-top:1mm">Sign-off sheet on the last page.</p></div></div>
<p class="note"><b>Draft.</b> This list will be updated when prices are rechecked and taxes are confirmed. The website still shows 8%. Please do not quote these prices to customers yet.</p>

<!-- Vehicle list -->
<section class="page">${band}<p class="kick">Vehicle list</p><h2>All ${n(cars.length)} vehicles, by make.</h2><div class="legend"><span>USD · exporter price is the car only</span><span>Grey: website today (8%)</span><span><b style="color:#061F30">Bold: proposed price</b></span></div>
<table class="list"><thead><tr><th>Model · exporter ref</th><th>Year</th><th>Type</th><th class="r">Mileage km</th><th class="r">Engine cc</th><th>Fuel</th><th class="r">Exporter</th><th class="r">Now 8%</th><th class="r">Proposed</th></tr></thead>${listBody}</table></section>

<!-- Markup and competitors -->
<section class="page">${band}<p class="kick">Markup and competitors</p><h2>Why ${RATE * 100}% with a USD ${MIN_MARGIN} minimum.</h2><p class="lede">A flat 8% earns under USD 120 on a USD 1,500 car. That does not cover sourcing time, money transfer, exchange-rate movement or a deal that falls through. The owner sets the final markup.</p>
<div class="box"><h3>Competitors</h3><table class="t"><thead><tr><th style="width:32%">Who</th><th>What they offer</th></tr></thead><tbody>
<tr><td><b>Exporters</b><br><span class="small">BE FORWARD, SBI Motor, SAT Japan, EVERY, Tokyo Carz, JGLOGI</span></td><td>Sell the same cars to buyers directly at the plain FOB price. SBI delivers to Kampala and Nimule; SAT lists Juba.</td></tr>
<tr><td><b>Importers</b><br><span class="small">MHH Japanese Cars; carimports.co.ke</span></td><td>MHH: CIF or cleared and registered in Uganda, about 65 days. carimports.co.ke shows a delivered price per car, for Kenya.</td></tr>
<tr><td><b>Local sellers</b><br><span class="small">Autochek Uganda, usedcars.co.ug, Kampala dealers; Light Heart General Trading and LTA-Juba</span></td><td>Cars already in the country. No Juba price lists found.</td></tr></tbody></table></div>
<div class="cols"><div><h3>What it means for us</h3><ul><li><b>Buyers can go direct</b> to exporters, so our fee has to be earned by delivery, clearing, registration and one written price.</li><li><b>No competitor publishes an all-in price</b> for Kampala or Juba. A clear, correct landed price is how Spear Line can stand out.</li></ul></div>
<div><h3>Margin evidence</h3><ul><li>One Nairobi importer-dealer reports <b>10% to 15%</b> before tax. A Kenyan blog's 15% to 30% is promotional.</li><li>No Uganda or South Sudan figure found. Local asking prices found were undated or secondary.</li></ul></div></div>
<p class="note"><b>Next step.</b> Ask two importers for written cleared-in-Kampala quotes on the three example cars, and collect Juba dealer prices, before the markup is final.</p></section>

<!-- Tax -->
<section class="page">${band}<p class="kick">Tax and landing costs</p><h2>What a buyer pays on top (draft).</h2><p class="lede">A worked Kampala example on stated assumptions. Freight and insurance are placeholders and every tax rate is still to be confirmed.</p>
<table class="t" style="margin-bottom:2mm">${exHead('Uganda example, USD')}<tbody>
${exRow('Exporter price', e => n(e.fob))}
${exRow('Spear Line markup (proposed)', e => n(e.margin))}
${exRow('Freight to Mombasa + insurance (placeholder)', e => n(e.freightIns), 'hl')}
${exRow('Import duty, 25%', e => n(e.duty))}
${exRow('VAT, 18%', e => n(e.vat))}
${exRow('Withholding tax and infrastructure levy, 7.5%', e => n(e.other))}
${exRow('Total so far', e => n(e.total), 'tot')}</tbody></table>
<p class="small" style="margin-bottom:7mm">Not yet included: environmental levy (a URA document gives 50% for cars over 8 to 9 years old, which covers most cars here), clearing, transport to Kampala and registration. Tax is worked on exporter price + freight + insurance; URA actually values used cars from its own database.</p>
<h3>Rates found by country (all to be confirmed)</h3><table class="t"><thead><tr><th style="width:17%">Country</th><th style="width:40%">Rates and rules</th><th>What is uncertain</th></tr></thead><tbody>${taxCountries.map(([c, r, u]) => `<tr><td><b>${esc(c)}</b></td><td>${esc(r)}</td><td class="small">${esc(u)}</td></tr>`).join('')}</tbody></table>
<p class="small" style="margin-top:3mm">Rules change each budget (July in Uganda and Kenya). Each country needs written confirmation from the revenue authority or a clearing agent before a total is shown to a customer.</p></section>

<!-- Sign-off -->
<section class="page">${band}<p class="kick">Confirmation</p><h2>Decisions before this goes live.</h2><p class="lede">Tick or write in, then sign. Prices go on the website only after this is confirmed.</p>
<div class="cols"><div class="box"><h3>Prices and cars</h3><ul class="check"><li>Markup: 8% (now) / ${RATE * 100}%, minimum USD ${MIN_MARGIN} (proposed) / other: ________</li><li>Same markup for every country: yes / no</li><li>Remove European, Lexus and kei cars: yes / no / some</li><li>Add Land Cruiser, Patrol, more Prado, Hilux, RAV4, Harrier: yes / no</li></ul></div>
<div class="box"><h3>Countries to offer first</h3><ul class="check"><li>Uganda</li><li>Kenya (cars 2018 or newer only)</li><li>South Sudan (drive-side rule to settle)</li><li>DR Congo (needs left-hand-drive cars)</li></ul></div></div>
<div class="box"><h3>To confirm in writing</h3><ul class="check"><li>Uganda duty, VAT, withholding tax and environmental levy for 2026/27</li><li>Sea freight Japan to Mombasa by car size (placeholder USD ${n(FREIGHT_PLACEHOLDER)}) and insurance (placeholder ${INSURANCE_RATE * 100}%)</li><li>Clearing, port, transit, inland transport and registration costs</li><li>Juba and Kampala dealer prices for the same models</li></ul></div>
<div class="sign"><div>Name</div><div>Signature</div><div>Date</div></div>
<p class="small" style="margin-top:10mm">Prices are indicative and change without notice. Vehicles are external exporter listings, not confirmed Spear Line stock. Availability, final price and delivery are confirmed in writing for each enquiry.</p></section>
</body></html>`;

await writeFile(resolve(out, 'price-list.html'), html);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(out, 'price-list.html')).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: resolve(out, 'Spear-Line-Vehicle-Price-List-DRAFT.pdf'), preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log(`Wrote ${cars.length} vehicles to docs/price-list/Spear-Line-Vehicle-Price-List-DRAFT.pdf`);
