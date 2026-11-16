// Builds the internal vehicle price list for owner review (kept short on purpose):
//   docs/price-list/Spear-Line-Vehicle-Price-List-DRAFT.pdf (A4 landscape, printed by Chromium)
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
const trans = v => ({ AT: 'Auto', MT: 'Manual', CVT: 'CVT' }[v] || v);
const fuel = v => ({ 'Hybrid(Petrol)': 'Hybrid', 'Hybrid(Diesel)': 'Hybrid diesel' }[v] || v);

const cars = [...vehiclePriceGuide.vehicles].sort((a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model) || a.year - b.year || a.priceUsd - b.priceUsd);
const makes = new Set(cars.map(c => c.make)), models = new Set(cars.map(c => c.make + c.model));
const prices = cars.map(c => c.priceUsd).sort((a, b) => a - b);
const fmtDate = d => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
const checked = fmtDate(new Date(vehiclePriceGuide.checkedOn + 'T00:00:00Z')), prepared = fmtDate(new Date());
const atMin = cars.filter(c => c.priceUsd * RATE < MIN_MARGIN).length;
const avg = f => cars.reduce((t, c) => t + f(c.priceUsd) - c.priceUsd, 0) / cars.length;

// ---- Worked Uganda example (draft arithmetic on the stated placeholder assumptions) ---------
function example(car) {
  const fob = car.priceUsd, margin = priceNew(fob) - fob, freight = FREIGHT_PLACEHOLDER;
  const insurance = Math.round((fob + freight) * INSURANCE_RATE), cif = fob + freight + insurance;
  const taxes = cif * UG.duty + (cif * (1 + UG.duty)) * UG.vat + cif * UG.wht + cif * UG.infra;
  return { car, fob, margin, freight, insurance, cif, taxes, total: fob + margin + freight + insurance + taxes };
}
const pick = (make, model) => cars.filter(c => c.make === make && c.model === model).sort((a, b) => a.priceUsd - b.priceUsd)[0];
const ex = [pick('Toyota', 'Vitz'), pick('Toyota', 'RAV4'), pick('Toyota', 'Land Cruiser Prado')].map(example);
const exRow = (label, f, cls = '') => `<tr class="${cls}"><td>${label}</td>${ex.map(e => `<td class="r">${f(e)}</td>`).join('')}</tr>`;
const exampleTable = `<table class="calc"><thead><tr><th>Uganda example, USD</th>${ex.map(e => `<th class="r">${e.car.year} ${esc(e.car.model)}</th>`).join('')}</tr></thead><tbody>
${exRow('Exporter price (FOB)', e => n(e.fob))}
${exRow('Spear Line markup, proposed', e => n(e.margin))}
${exRow('Freight to Mombasa + insurance (placeholders)', e => n(e.freight + e.insurance), 'plc')}
${exRow('Duty, VAT, withholding tax, infrastructure levy (draft rates)', e => n(e.taxes))}
${exRow('Total so far', e => n(e.total), 'total')}</tbody></table>
<p class="small">Not included, to confirm: environmental levy (a URA document gives 50% for vehicles over 8 to 9 years old, which covers most cars here), clearing, transport to Kampala, registration. Tax is worked on FOB + freight + insurance; URA actually values used cars from its own database.</p>`;

// ---- List -------------------------------------------------------------------------------------
const rows = cars.map((c, i) => {
  const first = i === 0 || cars[i - 1].make !== c.make;
  return `<tr${first ? ' class="nm"' : ''}><td class="g">${esc(c.sourceRef)}</td><td>${c.year}</td><td class="nw"><b>${esc(c.make)}</b> ${esc(c.model)}${c.country === 'Thailand' ? ' <i>(TH)</i>' : ''}</td><td>${esc(vehicleCategories[c.id] || '')}</td><td class="r">${n(c.mileageKm)}</td><td class="r">${n(c.engineCc)}</td><td>${esc(trans(c.transmission))}</td><td>${esc(fuel(c.fuel))}</td><td class="r">${n(c.priceUsd)}</td><td class="r g">${n(priceNow(c.priceUsd))}</td><td class="r">${n(priceNew(c.priceUsd) - c.priceUsd)}</td><td class="r s">${n(priceNew(c.priceUsd))}</td></tr>`;
}).join('');

const taxCountries = [
  ['Uganda', 'Duty 25%, VAT 18%, withholding tax 6%, infrastructure levy 1.5%; environmental levy on older cars', 'Rates from a 2023/24 URA document; 2026/27 changes (13-year age limit, levy) only proposals in sources found; URA values from its own database'],
  ['Kenya', 'Duty 25% or 35%, excise 20% to 35%, VAT 16%, IDF and RDL; cars up to 8 years old, right-hand drive', 'Sources disagree. Only about 60 of 233 cars are 2018 or newer'],
  ['South Sudan', 'Duty quoted 0% to 45% by type and value; VAT 18%', 'Dealer sources only. Right-hand-drive ban announced March 2026, then reported suspended: unclear'],
  ['DR Congo', 'Duty about 8% to 46%; VAT 8% to 13%; left-hand drive only per exporter guides', 'Exporter sources only. All cars here are right-hand drive, so none can be offered as listed']
];

const logo = A('logo-wordmark-gold.png');
const head = (k, h) => `<header class="ph"><img src="${logo}" alt="Spear Line"><span class="draft">DRAFT · TO BE UPDATED</span></header><h2><span>${esc(k)}</span> ${esc(h)}</h2>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Spear Line vehicle price list: DRAFT, to be updated</title><style>
@font-face{font-family:D;src:url(${A('fonts/mtn-brighter-sans-bold.woff2')})}
@font-face{font-family:T;src:url(${A('fonts/sky-text-regular.woff2')})}
@page{size:A4 landscape;margin:8mm 11mm 12mm;
  @bottom-left{content:"Spear Line Global Limited · Vehicle price list · DRAFT, to be updated · ${prepared}";font:700 6.5pt D,Arial;color:#6C808C}
  @bottom-right{content:counter(page) " / " counter(pages);font:700 6.5pt D,Arial;color:#6C808C}}
*{box-sizing:border-box;margin:0;padding:0}
body{font:400 8.6pt/1.42 T,Arial,sans-serif;color:#162C39;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1,h2,h3,b,strong,th{font-family:D,Arial,sans-serif;font-weight:700}
.hero{background:linear-gradient(160deg,#061F30,#082F47 50%,#0F4766);color:#fff;border-radius:4mm;padding:6mm 10mm;position:relative;overflow:hidden;margin-bottom:3mm}
.hero:before{content:"";position:absolute;inset:0;background:url(${A('line-field.svg')}) center/cover;opacity:.8}
.hero>*{position:relative}.hero img{height:9mm;display:block;margin-bottom:4mm}
.hero h1{font-size:25pt;line-height:1.05;letter-spacing:-.02em}.hero h1 span{color:#F6AD46}
.hero p{color:#D5E4EC;font-size:9.5pt;margin-top:2.5mm;max-width:190mm}
.stamp{position:absolute;right:10mm;top:8mm;font:700 9pt D,Arial;color:#061F30;background:#F6AD46;padding:2mm 5mm;border-radius:9mm}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin-bottom:4mm}
.grid div{background:#fff;border:.5pt solid #D9E3E8;border-radius:2.5mm;padding:2.2mm 3.5mm}.grid strong{display:block;font-size:12pt}.grid span{font-size:7.5pt;color:#4B6270}
.two{display:grid;grid-template-columns:1fr 1fr;gap:6mm}
h3{font-size:9.5pt;margin-bottom:1mm}ul{margin-left:4.5mm}li{margin-bottom:.9mm}
.note{background:#FFF3DD;border-left:1mm solid #F6AD46;padding:2mm 3.5mm;border-radius:0 2mm 2mm 0;margin:3mm 0;font-size:8.3pt}
.tag{display:inline-block;font:700 6pt D,Arial;background:#FFEFD6;color:#85470A;padding:.4mm 1.6mm;border-radius:5mm;white-space:nowrap}
.sec{break-before:page}.lst{margin-top:1mm}
.ph{display:flex;justify-content:space-between;align-items:center;background:#061F30;padding:2mm 4mm;border-radius:2.5mm;margin-bottom:3mm}
.ph img{height:6.5mm;display:block}.draft{font:700 7pt D,Arial;color:#061F30;background:#F6AD46;padding:1mm 3mm;border-radius:8mm}
h2{font-size:14pt;line-height:1.15;letter-spacing:-.01em;margin-bottom:2.5mm}h2 span{color:#A45B0C;font-size:9pt;display:block;letter-spacing:0}
table{border-collapse:collapse;width:100%}
.list{font-size:6.2pt;line-height:1.1}.list thead{display:table-header-group}
.list th{background:#082F47;color:#fff;text-align:left;padding:1mm 1.3mm;font-size:6pt;vertical-align:bottom}
.list th.logo{background:#061F30;padding:1.6mm 2mm}.list th.logo img{height:5.5mm;vertical-align:middle}.list th.logo span{float:right;font-size:7pt;line-height:5.5mm}
.list td{padding:.12mm 1.3mm;border-bottom:.25pt solid #E1E8EC;white-space:nowrap}
.list tr:nth-child(even) td{background:#F6F9FA}.list tr.nm td{border-top:.7pt solid #082F47}
.list .r{text-align:right}.list th.r{text-align:right}.list .g{color:#7C8E98}.list .s{font-family:D,Arial;color:#061F30}.list i{font-style:normal;color:#7C8E98}
.list tr{break-inside:avoid}
.calc{font-size:7.8pt;margin:1.5mm 0 1.5mm}.calc th{background:#082F47;color:#fff;text-align:left;padding:1.4mm 2mm}.calc th.r,.calc td.r{text-align:right}
.calc td{padding:1mm 2mm;border-bottom:.3pt solid #D9E3E8}.calc tr.plc td{background:#FFF8EC}.calc tr.total td{font-family:D,Arial;font-weight:700;background:#082F47;color:#fff}
.small{font-size:7.2pt;color:#4B6270}
.tax{font-size:7.6pt}.tax th{background:#082F47;color:#fff;text-align:left;padding:1.4mm 2mm}.tax td{padding:1.2mm 2mm;border-bottom:.3pt solid #D9E3E8;vertical-align:top}
.check li{list-style:none;margin-left:0;padding-left:5.5mm;position:relative}.check li:before{content:"";position:absolute;left:0;top:.7mm;width:3mm;height:3mm;border:.7pt solid #082F47;border-radius:.7mm}
.sign{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8mm;margin-top:4mm}.sign div{border-top:.6pt solid #162C39;padding-top:1mm;font-size:7.5pt;color:#4B6270}
</style></head><body>

<section class="hero"><span class="stamp">DRAFT · TO BE UPDATED</span><img src="${logo}" alt="Spear Line"><h1>All Spear Line <span>vehicles listed currently.</span></h1><p>Exporter prices, current website price and a proposed higher markup for each vehicle, with a draft tax and landing-cost note, for the owner to review and confirm. Internal document: not for customers.</p></section>
<div class="grid"><div><strong>${n(cars.length)}</strong><span>vehicles listed</span></div><div><strong>${makes.size} makes · ${models.size} models</strong><span>Japan ${cars.filter(c => c.country === 'Japan').length}, Thailand ${cars.filter(c => c.country === 'Thailand').length} (TH)</span></div><div><strong>USD ${n(prices[0])} to ${n(prices.at(-1))}</strong><span>exporter prices (FOB)</span></div><div><strong>${esc(checked)}</strong><span>prices researched</span></div></div>
<div class="two"><div><h3>How to read the list</h3><ul><li>Prices are USD and are <b>exporter listings (BE FORWARD), not Spear Line stock</b>. They can sell or change at any time.</li><li>"Exporter price" is the vehicle only. Freight, insurance, taxes, clearing, transport and registration are <b>not</b> included.</li><li>"Website now" is FOB + 8%, as shown today. "Proposed" is FOB + the greater of ${RATE * 100}% or USD ${MIN_MARGIN}; ${atMin} of ${cars.length} cars (FOB under USD ${n(MIN_MARGIN / RATE)}) are at the minimum.</li></ul></div>
<div><h3>Status</h3><ul><li>Everything marked <span class="tag">TO CONFIRM</span> or <span class="tag">PLACEHOLDER</span> is a draft figure.</li><li>Average markup per car: USD ${n(avg(priceNow))} now, USD ${n(avg(priceNew))} proposed.</li><li>The website still shows 8% until the owner confirms. Markup, tax rates and which cars to keep are decided on the last page.</li></ul></div></div>
<div class="note"><b>To be updated</b> when exporter prices are rechecked, tax rates are confirmed per destination, and the cars that sell are decided. Do not quote these totals to a customer.</div>

<section class="lst"><table class="list"><thead><tr><th class="logo" colspan="12"><img src="${logo}" alt="Spear Line"><span style="color:#fff">Vehicle price list · ${n(cars.length)} vehicles · DRAFT, to be updated · USD</span></th></tr><tr><th>Exporter ref</th><th>Year</th><th>Make and model</th><th>Type</th><th class="r">Mileage km</th><th class="r">Engine cc</th><th>Gearbox</th><th>Fuel</th><th class="r">Exporter price</th><th class="r">Website now (8%)</th><th class="r">Proposed markup</th><th class="r">Proposed price</th></tr></thead><tbody>${rows}</tbody></table></section>

<section class="sec">${head('Markup, tax and confirmation', `Proposed markup: the greater of ${RATE * 100}% or USD ${MIN_MARGIN}, up from a flat 8%.`)}
<div class="two"><div><p>8% is under USD 120 on a USD 1,500 car: too little for sourcing time, transfer costs and deals that fall through. <b>The owner sets the final markup.</b></p>
<table class="calc"><thead><tr><th>Example, USD</th><th class="r">Exporter</th><th class="r">Now (8%)</th><th class="r">Proposed</th></tr></thead><tbody>${ex.map(e => `<tr><td>${e.car.year} ${esc(e.car.model)}</td><td class="r">${n(e.fob)}</td><td class="r">${n(priceNow(e.fob))}</td><td class="r"><b>${n(priceNew(e.fob))}</b></td></tr>`).join('')}</tbody></table>
<h3 style="margin-top:3mm">Competitors</h3><ul><li><b>Exporters</b> (BE FORWARD, SBI Motor, SAT Japan, EVERY, Tokyo Carz, JGLOGI) sell the same cars at plain FOB. SBI delivers to Kampala and Nimule; SAT lists Juba.</li><li><b>Importers:</b> MHH Japanese Cars (CIF or cleared and registered in Uganda, about 65 days); carimports.co.ke (shows a delivered price per car, for Kenya).</li><li><b>Local:</b> Autochek Uganda, usedcars.co.ug, Kampala dealers; in Juba, Light Heart General Trading and LTA-Juba. No prices found.</li><li><b>None publishes an all-in price</b> for Kampala or Juba. Buyers can go direct, so our fee must be earned by delivery, clearing, registration and one written price.</li></ul>
<p class="small">Margin evidence (low confidence): one Nairobi importer-dealer reports 10% to 15% before tax; a Kenyan blog's 15% to 30% is promotional. No Uganda or South Sudan figure found. Local asking prices found were undated or secondary. Next step: written cleared-in-Kampala quotes from two importers on these three cars, and Juba dealer prices.</p><p class="note" style="margin-top:4mm">Prices are indicative and change without notice. Vehicles are external exporter listings, not confirmed Spear Line stock. Availability, final price and delivery are confirmed in writing for each enquiry.</p></div>
<div><h3>Worked example: Uganda (Kampala), draft</h3>${exampleTable}<h3 style="margin-top:3mm">Tax by country (all <span class="tag">TO CONFIRM</span>)</h3><table class="tax"><tbody>${taxCountries.map(([c, r, u]) => `<tr><td style="width:17%"><b>${esc(c)}</b></td><td>${esc(r)}. <span class="small">${esc(u)}.</span></td></tr>`).join('')}</tbody></table></div></div>
<div class="two" style="margin-top:3mm"><div><h3>Decisions</h3><ul class="check"><li>Markup: 8% (now) / greater of ${RATE * 100}% or USD ${MIN_MARGIN} (proposed) / other: ____________</li><li>Same markup for every destination: yes / no</li><li>Remove European, Lexus and kei cars: yes / no / some: ____</li><li>Add models (Land Cruiser VX, 70 Series, Patrol, more Prado, Hilux, RAV4, Harrier): ____</li><li>Offer first: Uganda / Kenya (2018 or newer) / South Sudan / DR Congo</li></ul></div>
<div><h3>To confirm in writing</h3><ul class="check"><li>Uganda duty, VAT, withholding and environmental levy, 2026/27</li><li>Sea freight Japan to Mombasa by size (placeholder USD ${n(FREIGHT_PLACEHOLDER)}) and insurance (placeholder ${INSURANCE_RATE * 100}%)</li><li>Clearing, port, transit, inland transport and registration costs</li><li>Juba and Kampala dealer prices for the same models</li></ul></div></div>
<div class="sign"><div>Confirmed by (name)</div><div>Signature</div><div>Date</div></div>
</section>
</body></html>`;

await writeFile(resolve(out, 'price-list.html'), html);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(out, 'price-list.html')).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: resolve(out, 'Spear-Line-Vehicle-Price-List-DRAFT.pdf'), preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log(`Wrote ${cars.length} vehicles to docs/price-list/Spear-Line-Vehicle-Price-List-DRAFT.pdf`);
