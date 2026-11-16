// Builds the internal vehicle price list for owner review:
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
const RATE = 0.10;                   // PROPOSED markup rate
const MIN_MARGIN = 400;              // PROPOSED minimum markup per car, USD
const FREIGHT_PLACEHOLDER = 1300;    // USD, sea freight Japan to Mombasa: PLACEHOLDER, to confirm
const INSURANCE_RATE = 0.015;        // placeholder, to confirm
const UG = { duty: 0.25, vat: 0.18, wht: 0.06, infra: 0.015 }; // from a URA 2023/24 document: to confirm

const n = v => new Intl.NumberFormat('en-US').format(Math.round(v));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const priceNow = fob => Math.round(fob * (1 + CURRENT));
const priceNew = fob => Math.round(fob + Math.max(fob * RATE, MIN_MARGIN));
const trans = v => ({ AT: 'Auto', MT: 'Manual', CVT: 'CVT' }[v] || v);
const fuel = v => ({ 'Hybrid(Petrol)': 'Petrol hybrid', 'Hybrid(Diesel)': 'Diesel hybrid' }[v] || v);

const cars = [...vehiclePriceGuide.vehicles].sort((a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model) || a.year - b.year || a.priceUsd - b.priceUsd);
const makes = new Set(cars.map(c => c.make)), models = new Set(cars.map(c => c.make + c.model));
const prices = cars.map(c => c.priceUsd).sort((a, b) => a - b);
const checked = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(vehiclePriceGuide.checkedOn + 'T00:00:00Z'));
const prepared = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date());

// ---- Worked Uganda examples (draft arithmetic on the stated placeholder assumptions) --------
function example(car) {
  const fob = car.priceUsd, margin = priceNew(fob) - fob, freight = FREIGHT_PLACEHOLDER;
  const insurance = Math.round((fob + freight) * INSURANCE_RATE), cif = fob + freight + insurance;
  const duty = cif * UG.duty, vat = (cif + duty) * UG.vat, wht = cif * UG.wht, infra = cif * UG.infra;
  const taxes = duty + vat + wht + infra;
  return { car, fob, margin, freight, insurance, cif, duty, vat, wht, infra, taxes, total: fob + margin + freight + insurance + taxes };
}
const pick = (make, model, which) => { const l = cars.filter(c => c.make === make && c.model === model).sort((a, b) => a.priceUsd - b.priceUsd); return which === 'low' ? l[0] : l.at(-1); };
const examples = [pick('Toyota', 'Vitz', 'low'), pick('Toyota', 'RAV4', 'low'), pick('Toyota', 'Land Cruiser Prado', 'low')].map(example);

// ---- Pages -----------------------------------------------------------------------------------
const rows = cars.map((c, i) => {
  const first = i === 0 || cars[i - 1].make !== c.make;
  return `<tr${first ? ' class="new-make"' : ''}><td class="num">${i + 1}</td><td class="ref">${esc(c.sourceRef)}</td><td>${c.year}</td><td class="name"><b>${esc(c.make)}</b> ${esc(c.model)}</td><td>${esc(vehicleCategories[c.id] || '')}</td><td class="r">${n(c.mileageKm)}</td><td class="r">${n(c.engineCc)}</td><td>${esc(trans(c.transmission))}</td><td>${esc(fuel(c.fuel))}</td><td>${esc(c.country)}</td><td class="r">${n(c.priceUsd)}</td><td class="r opt">${n(priceNow(c.priceUsd))}</td><td class="r">${n(priceNew(c.priceUsd) - c.priceUsd)}</td><td class="r strong">${n(priceNew(c.priceUsd))}</td></tr>`;
}).join('');

const exampleTable = `<table class="calc"><thead><tr><th>USD</th>${examples.map(e => `<th class="r">${e.car.year} ${esc(e.car.make)} ${esc(e.car.model)}<small>ref ${esc(e.car.sourceRef)}</small></th>`).join('')}<th>Basis</th></tr></thead><tbody>
<tr><td>Exporter vehicle price (FOB)</td>${examples.map(e => `<td class="r">${n(e.fob)}</td>`).join('')}<td>Researched ${esc(checked)}</td></tr>
<tr><td>Spear Line markup, proposed</td>${examples.map(e => `<td class="r">${n(e.margin)}</td>`).join('')}<td>Greater of 10% or USD ${MIN_MARGIN}; outside the tax base here</td></tr>
<tr class="sub"><td>Spear Line vehicle price</td>${examples.map(e => `<td class="r">${n(e.fob + e.margin)}</td>`).join('')}<td>Proposed price; the website still shows 8% until confirmed</td></tr>
<tr class="ph"><td>Sea freight Japan to Mombasa</td>${examples.map(e => `<td class="r">${n(e.freight)}</td>`).join('')}<td>PLACEHOLDER: shipping agent to confirm</td></tr>
<tr class="ph"><td>Marine insurance, 1.5%</td>${examples.map(e => `<td class="r">${n(e.insurance)}</td>`).join('')}<td>PLACEHOLDER: to confirm</td></tr>
<tr class="sub"><td>CIF value (tax base)</td>${examples.map(e => `<td class="r">${n(e.cif)}</td>`).join('')}<td>FOB + freight + insurance. URA actually values used cars from its own database, so the real base can be higher or lower</td></tr>
<tr><td>Import duty, 25% of CIF</td>${examples.map(e => `<td class="r">${n(e.duty)}</td>`).join('')}<td rowspan="4">Rates from a URA 2023/24 document. 2026/27 rates not confirmed. TO CONFIRM</td></tr>
<tr><td>VAT, 18% of CIF + duty</td>${examples.map(e => `<td class="r">${n(e.vat)}</td>`).join('')}</tr>
<tr><td>Withholding tax, 6% of CIF</td>${examples.map(e => `<td class="r">${n(e.wht)}</td>`).join('')}</tr>
<tr><td>Infrastructure levy, 1.5% of CIF</td>${examples.map(e => `<td class="r">${n(e.infra)}</td>`).join('')}</tr>
<tr class="open"><td>Environmental levy, older vehicles</td>${examples.map(() => '<td class="r">not included</td>').join('')}<td>A URA document gives 50% for vehicles over 8 to 9 years old; a 13-year age limit was proposed for 2026/27. Needs URA confirmation: it would add a large amount to most of the older cars in this list</td></tr>
<tr class="open"><td>Port, clearing agent, inspection</td>${examples.map(() => '<td class="r">to confirm</td>').join('')}<td>Clearing agent quote</td></tr>
<tr class="open"><td>Inland transport to Kampala</td>${examples.map(() => '<td class="r">to confirm</td>').join('')}<td>Transporter quote</td></tr>
<tr class="open"><td>Registration and plates</td>${examples.map(() => '<td class="r">to confirm</td>').join('')}<td>URA and police fees</td></tr>
<tr class="total"><td>Estimated total so far</td>${examples.map(e => `<td class="r">${n(e.total)}</td>`).join('')}<td>Before the open lines above. DRAFT arithmetic, not a quote</td></tr></tbody></table>`;

const markupExamples = [pick('Toyota', 'Vitz', 'low'), pick('Toyota', 'RAV4', 'low'), pick('Toyota', 'Land Cruiser Prado', 'low')];
const markupTable = `<table class="calc"><thead><tr><th>Example (USD)</th><th class="r">Exporter FOB</th><th class="r">Now: 8% markup</th><th class="r">Now: price</th><th class="r">Proposed: markup</th><th class="r">Proposed: price</th><th class="r">Change</th></tr></thead><tbody>${markupExamples.map(c => `<tr><td>${c.year} ${esc(c.make)} ${esc(c.model)}</td><td class="r">${n(c.priceUsd)}</td><td class="r">${n(priceNow(c.priceUsd) - c.priceUsd)}</td><td class="r">${n(priceNow(c.priceUsd))}</td><td class="r">${n(priceNew(c.priceUsd) - c.priceUsd)}</td><td class="r">${n(priceNew(c.priceUsd))}</td><td class="r">+${n(priceNew(c.priceUsd) - priceNow(c.priceUsd))}</td></tr>`).join('')}</tbody></table>`;
const cheapCount = cars.filter(c => c.priceUsd * RATE < MIN_MARGIN).length;
const avgNow = cars.reduce((t, c) => t + priceNow(c.priceUsd) - c.priceUsd, 0) / cars.length, avgNew = cars.reduce((t, c) => t + priceNew(c.priceUsd) - c.priceUsd, 0) / cars.length;

const taxCountries = [
  ['Uganda', 'Import duty 25%, VAT 18%, withholding tax 6%, infrastructure levy 1.5%; environmental levy 50% on older vehicles', 'URA 2023/24 valuation document. One dealer guide says 15% duty. 2026/27 changes (13-year age limit, levy) were proposals in the sources found. URA values from its own vehicle database, not the invoice'],
  ['Kenya', 'Duty 25% or 35%, excise 20% to 35% by engine size, VAT 16%, IDF 2% to 3.5%, RDL 1.5% to 2%; vehicles up to 8 years from manufacture; right-hand drive', 'KRA material and dealer calculators disagree. Only about 60 of the 233 cars are 2018 or newer'],
  ['South Sudan', 'Duty quoted from 0% to 45% (or 10% to 40%) by type and value; VAT 18% on CIF plus duty; age limit disputed', 'Exporter and dealer sources only. Right-hand drive ban announced March 2026, then reported revoked or suspended: unclear. South Sudan drives on the right'],
  ['DR Congo', 'Duty about 8% to 46%; VAT 8% to 13%; age tiers disputed; left-hand drive only per exporter guides', 'Exporter sources only. All 233 cars in this list are right-hand drive, so none can be offered here as listed']
];

const competitors = [
  ['BE FORWARD', 'Exporter, Japan', 'The source of every price in this list. Sells direct to buyers worldwide. The FOB price is the vehicle only; freight, tax and clearing are separate.', 'FOB prices public. Total price depends on destination.'],
  ['SBI Motor Japan', 'Exporter, Japan', 'Has Uganda and South Sudan pages. Can deliver from Mombasa or the Sudan port; delivery cities include Kampala and Nimule.', 'FOB public; total shows "ASK" until a port is chosen.'],
  ['SAT Japan', 'Exporter, Japan', 'Uganda service; lists Juba as a delivery point from Mombasa.', 'No all-in price found.'],
  ['EVERY Co Ltd', 'Exporter with Uganda office', 'Inspects and prepares vehicles for inland delivery from Mombasa or Dar es Salaam to Kampala; says it has served South Sudan since 2007.', 'No all-in price found.'],
  ['MHH Japanese Cars', 'Importer', 'Japan to Uganda, either CIF Uganda or cleared and registered in Uganda; says about 65 days from deposit to delivery.', 'Quote on request.'],
  ['Tokyo Carz, JGLOGI, CarFromJapan, Car Imports Auction', 'Exporters, Japan', 'Publish Uganda and Kenya import guides and sell to East African buyers.', 'FOB; guides give rate ranges only.'],
  ['carimports.co.ke', 'Importer, Kenya', 'Shows a CIF Mombasa price and an estimated delivered price for each car. The closest to what Spear Line plans.', 'Public per car, for Kenya.'],
  ['Autochek Uganda, usedcars.co.ug, local dealers', 'Kampala sellers', 'Cars already in Uganda. What a buyer compares our landed price against.', 'Asking prices public; some "duty not paid".'],
  ['Light Heart General Trading, LTA-Juba', 'Juba traders', 'Import and sell vehicles, parts and Toyota supply in Juba. Showrooms and social media, not price lists.', 'None found.']
];
const logoGold = A('logo-wordmark-gold.png'), logoWhite = A('logo-wordmark-white-640.webp');
const head = title => `<header class="ph-head"><img src="${logoGold}" alt="Spear Line"><span class="draft">DRAFT · TO BE UPDATED</span></header><p class="kicker">${esc(title.k)}</p><h2>${esc(title.h)}</h2>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Spear Line vehicle price list: DRAFT, to be updated</title><style>
@font-face{font-family:D;src:url(${A('fonts/mtn-brighter-sans-bold.woff2')})}
@font-face{font-family:T;src:url(${A('fonts/sky-text-regular.woff2')})}
@page{size:A4 landscape;margin:12mm 12mm 17mm;
  @bottom-left{content:"Spear Line Global Limited · Vehicle price list · DRAFT, to be updated · prepared ${prepared}";font:700 7pt D,Arial;color:#6C808C}
  @bottom-right{content:counter(page) " / " counter(pages);font:700 7pt D,Arial;color:#6C808C}}
@page cover{margin:0;@bottom-left{content:none}@bottom-right{content:none}}
*{box-sizing:border-box;margin:0;padding:0}
body{font:400 9.5pt/1.5 T,Arial,sans-serif;color:#162C39;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1,h2,h3,b,strong,th{font-family:D,Arial,sans-serif;font-weight:700}
h1{font-size:40pt;line-height:1.02;letter-spacing:-.02em}h1 span{color:#F6AD46}
h2{font-size:20pt;line-height:1.1;letter-spacing:-.02em;margin:1mm 0 4mm}h3{font-size:11pt;margin-bottom:1.5mm}
.kicker{font:700 8.5pt D,Arial;color:#A45B0C}
.cover{page:cover;width:297mm;height:210mm;padding:22mm 24mm;background:linear-gradient(160deg,#061F30,#082F47 45%,#0F4766);color:#fff;position:relative;overflow:hidden;break-after:page}
.cover .lf{position:absolute;inset:0;background:url(${A('line-field.svg')}) center/cover;opacity:.9}
.cover>*{position:relative}.cover img{width:88mm;display:block;margin-bottom:24mm}
.cover .kicker{color:#F6AD46}.cover p{color:#D5E4EC;font-size:12pt;max-width:170mm;margin-top:5mm}
.stamp{display:inline-block;margin-top:9mm;font:700 13pt D,Arial;color:#061F30;background:#F6AD46;padding:3mm 7mm;border-radius:12mm}
.cover .meta{position:absolute;left:24mm;bottom:18mm;font-size:9.5pt;color:#A9C4D2;max-width:230mm}
.sec{break-before:page}
.ph-head{display:flex;justify-content:space-between;align-items:center;background:#061F30;margin:-0mm 0 5mm;padding:3mm 5mm;border-radius:3mm}
.ph-head img{height:7.5mm;display:block}
.draft{font:700 8pt D,Arial;color:#061F30;background:#F6AD46;padding:1.2mm 3.5mm;border-radius:9mm}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;margin:2mm 0 5mm}
.grid div{background:#fff;border:.5pt solid #D9E3E8;border-radius:3mm;padding:3mm 4mm}.grid strong{display:block;font-size:15pt}.grid span{font-size:8pt;color:#4B6270}
.two{display:grid;grid-template-columns:1fr 1fr;gap:8mm}
ul{margin-left:5mm}li{margin-bottom:1.3mm}
.note{background:#FFF3DD;border-left:1.2mm solid #F6AD46;padding:3mm 4mm;border-radius:0 2mm 2mm 0;margin:3mm 0;font-size:9pt}
table{border-collapse:collapse;width:100%}
.list{font-size:7pt;line-height:1.25}
.list thead{display:table-header-group}
.list th{background:#082F47;color:#fff;text-align:left;padding:1.4mm 1.5mm;font-size:6.6pt;vertical-align:bottom}
.list td{padding:.8mm 1.5mm;border-bottom:.3pt solid #E1E8EC}
.list tr:nth-child(even) td{background:#F6F9FA}
.list tr.new-make td{border-top:.8pt solid #082F47}
.listnote{font-size:7.2pt;color:#4B6270;margin:0 0 1.5mm 1mm}
.list .r,.calc .r{text-align:right;white-space:nowrap}.list th.r{text-align:right}
.list .num{color:#8A9AA4}.list .ref{font-size:6.3pt;color:#4B6270}.list .name{white-space:nowrap}
.list .strong{font-family:D,Arial;font-weight:700;color:#061F30}.list .opt{color:#6C808C}
.list tr{break-inside:avoid}
.listhead{display:flex;align-items:center;justify-content:space-between;background:#061F30;padding:2.5mm 5mm;border-radius:3mm;margin-bottom:2mm}
.listhead img{height:6.5mm}.listhead b{color:#fff;font-size:9pt}
.calc{font-size:8pt;margin:2mm 0 3mm}.calc th{background:#082F47;color:#fff;text-align:left;padding:1.8mm 2mm;vertical-align:bottom}.calc th small{display:block;font-weight:400;font-size:6.5pt;color:#C9DCE5}
.calc td{padding:1.3mm 2mm;border-bottom:.3pt solid #D9E3E8;vertical-align:top}
.calc tr.sub td{font-weight:700;background:#EEF4F7}.calc tr.ph td{background:#FFF8EC}.calc tr.open td{color:#85470A}
.calc tr.total td{font-family:D,Arial;font-weight:700;background:#082F47;color:#fff;font-size:9pt}
.calc td:not(.r):not(:first-child){font-size:7pt;color:#4B6270;max-width:70mm}.calc tr.total td:not(.r):not(:first-child){color:#C9DCE5}
.tax{font-size:8pt}.tax th{background:#082F47;color:#fff;text-align:left;padding:1.8mm 2mm}.tax td{padding:1.8mm 2mm;border-bottom:.3pt solid #D9E3E8;vertical-align:top}
.tag{display:inline-block;font:700 6.5pt D,Arial;background:#FFEFD6;color:#85470A;padding:.6mm 2mm;border-radius:6mm;white-space:nowrap}
.check li{list-style:none;margin-left:0;padding-left:7mm;position:relative}.check li:before{content:"";position:absolute;left:0;top:1mm;width:3.5mm;height:3.5mm;border:.7pt solid #082F47;border-radius:.8mm}
.sign{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10mm;margin-top:10mm}.sign div{border-top:.6pt solid #162C39;padding-top:1.5mm;font-size:8.5pt;color:#4B6270}
</style></head><body>

<section class="cover"><div class="lf"></div><img src="${logoGold}" alt="Spear Line"><p class="kicker" style="margin:0;font-size:11pt">Vehicle price list</p><h1>All Spear Line<br><span>vehicles listed currently.</span></h1><p>${n(cars.length)} vehicles across ${makes.size} makes and ${models.size} models, with exporter prices, Spear Line markup and a draft tax and landing-cost framework, for the owner to review and confirm.</p><span class="stamp">DRAFT · TO BE UPDATED</span><p class="meta">Prepared ${prepared} from the Spear Line website data. Exporter prices researched ${esc(checked)} (FOB, BE FORWARD, USD). Spear Line Global Limited. Internal document: not for customers.</p></section>

<section class="sec">${head({ k: 'Read this first', h: 'What this document is, and what is still open.' })}
<div class="grid"><div><strong>${n(cars.length)}</strong><span>vehicles listed</span></div><div><strong>${makes.size} makes · ${models.size} models</strong><span>Japan ${cars.filter(c => c.country === 'Japan').length}, Thailand ${cars.filter(c => c.country === 'Thailand').length}</span></div><div><strong>USD ${n(prices[0])} to ${n(prices.at(-1))}</strong><span>exporter prices (FOB)</span></div><div><strong>${esc(checked)}</strong><span>date prices were researched</span></div></div>
<div class="two"><div><h3>What is in it</h3><ul><li><b>The full vehicle list</b> as it is on the website today, with year, mileage, engine, fuel, exporter reference and price.</li><li><b>Markup and competitors.</b> The website adds 8% to the exporter's price today. This draft proposes the greater of ${RATE * 100}% or USD ${MIN_MARGIN}, with the competitor evidence behind it.</li><li><b>Tax and landing costs.</b> Draft rates by country and a worked Uganda example, with every unconfirmed figure marked.</li><li><b>A confirmation sheet</b> listing the decisions needed.</li></ul></div>
<div><h3>How to read the prices</h3><ul><li>Prices are USD. They are <b>exporter listings, not Spear Line stock</b>. They were checked on ${esc(checked)} and can be sold or changed at any time.</li><li>"Exporter FOB" is the vehicle itself. Freight, insurance, taxes, clearing, transport and registration are <b>not</b> included in the list prices.</li><li>"Proposed Spear Line price" is FOB plus the proposed markup, before import costs. The website still shows 8% until the owner confirms.</li><li>Everything marked <span class="tag">TO CONFIRM</span> or <span class="tag">PLACEHOLDER</span> is a draft figure that must be confirmed before it is shown to a customer.</li></ul></div></div>
<div class="note"><b>To be updated.</b> This list will be refreshed when exporter prices are rechecked, when tax rates are confirmed for each destination, and when the vehicles that sell are decided. Do not quote these totals to a customer.</div></section>

<section class="sec"><div class="listhead"><img src="${logoGold}" alt="Spear Line"><b>Vehicle price list · ${n(cars.length)} vehicles · DRAFT, to be updated · USD</b></div>
<p class="listnote">All vehicles are right-hand drive. The proposed markup is the greater of ${RATE * 100}% or USD ${MIN_MARGIN}; ${cheapCount} of ${cars.length} vehicles (exporter price under USD ${n(MIN_MARGIN / RATE)}) are at the minimum. References are BE FORWARD listing references.</p><table class="list"><thead><tr><th>#</th><th>Exporter ref</th><th>Year</th><th>Make and model</th><th>Type</th><th class="r">Mileage km</th><th class="r">Engine cc</th><th>Gearbox</th><th>Fuel</th><th>Origin</th><th class="r">Exporter FOB</th><th class="r">Website now (8%)</th><th class="r">Proposed markup</th><th class="r">Proposed Spear Line price</th></tr></thead><tbody>${rows}</tbody></table>
</section>

<section class="sec">${head({ k: 'Markup', h: `Proposed: the greater of ${RATE * 100}% or USD ${MIN_MARGIN}.` })}
<p>The website adds a flat 8% to the exporter's price. That is under USD 120 on a USD 1,500 car, which does not cover time, transfer costs or a deal that falls through. This draft proposes <b>10%, never less than USD ${MIN_MARGIN}</b>: a modest rise that keeps Spear Line's fee small beside the cost of the car, and sits at the low end of what a Nairobi importer-dealer reports (below). Average markup per car moves from USD ${n(avgNow)} to USD ${n(avgNew)}. <b>The owner sets the final markup.</b></p>
${markupTable}
<div class="two"><div><h3>Things the markup has to cover</h3><ul><li>Sourcing, inspection requests and exporter follow-up; money transfer and exchange-rate movement.</li><li>A buyer who cancels after the exporter has reserved the car, or a condition dispute after arrival.</li></ul></div><div><h3>Questions for the owner</h3><ul><li>One rate for every car, or a higher rate on cheaper cars?</li><li>Is Spear Line paid in USD, and who carries exchange-rate risk?</li></ul></div></div>
<div class="two" style="margin-top:3mm"><div><h3>What this means for our price</h3><ul><li><b>Buyers can go direct.</b> BE FORWARD, SBI Motor and others sell the same kind of car at the plain FOB price. Our markup has to be paid for by something they do not give: delivery to the buyer's city, clearing, registration and one written all-in price.</li><li><b>Nobody publishes an all-in price.</b> Exporters show FOB and "ask" for the total; MHH offers cleared and registered but not on a price list. A clear landed price per destination is where Spear Line can stand out, so long as it is correct.</li><li><b>Do not go far above 10% to 15%</b> until local benchmarks exist.</li></ul></div>
<div><h3>Margin and market evidence (low confidence)</h3><ul><li>A Nairobi importer-dealer reports a 10% to 15% profit margin before tax (one dealer's own account). A Kenyan business blog claims 15% to 30% on imports; it is promotional and unsourced.</li><li>No Uganda or South Sudan dealer margin found.</li><li>Local anchors, all undated or secondary: 2015 Harrier UGX 60 to 70 million (Carkibanda review); 2010 Harrier UGX 65 million (Autochek); 2019 RAV4 and 2020 Harrier about UGX 155 million (Autochek); 2024 RAV4 hybrid UGX 180 to 203 million, duty not paid (usedcars.co.ug).</li><li>SBI Motor, 2016 RAV4: FOB USD 14,248 (4WD, 104,600 km, sold) and USD 16,500 (G Z package), total price "ASK".</li></ul></div></div>
</section>

<section class="sec">${head({ k: 'Competitors', h: 'Who a buyer compares us with, and what they publish.' })}
<table class="tax"><thead><tr><th style="width:17%">Competitor</th><th style="width:12%">Type</th><th style="width:36%">What they offer</th><th>What is public on price</th></tr></thead><tbody>${competitors.map(([a, b, c, d]) => `<tr><td><b>${esc(a)}</b></td><td>${esc(b)}</td><td>${esc(c)}</td><td>${esc(d)}</td></tr>`).join('')}</tbody></table>
<p class="note"><b>Next step.</b> Ask two importers (MHH, SBI or EVERY) for written cleared-in-Kampala quotes on the same three cars as the worked example, and collect Juba dealer prices. Then compare with our landed price before any markup is final.</p></section>

<section class="sec">${head({ k: 'Tax and landing costs', h: 'What a buyer pays on top, by country (draft).' })}
<table class="tax"><thead><tr><th style="width:15%">Country</th><th style="width:45%">Rates and rules found</th><th>What is uncertain</th><th style="width:9%">Status</th></tr></thead><tbody>${taxCountries.map(([c, r, u]) => `<tr><td><b>${esc(c)}</b></td><td>${esc(r)}</td><td>${esc(u)}</td><td><span class="tag">TO CONFIRM</span></td></tr>`).join('')}</tbody></table>
<div class="note"><b>Why nothing here is final.</b> The sources are mainly importer and dealer guides; official rates were found for Uganda only in an older document. Tax rules change at each budget (July in Uganda and Kenya). Each country needs a written check with the revenue authority or a clearing agent before any total is shown to a customer.</div></section>

<section class="sec">${head({ k: 'Worked example: Uganda (Kampala)', h: 'How a landed price is built, on stated assumptions.' })}
${exampleTable}
<p style="font-size:8.5pt;color:#4B6270">On these draft rates, duty, VAT, withholding tax and infrastructure levy add up to about 55% of the CIF value before the environmental levy. Uganda's route is by sea to Mombasa or Dar es Salaam, then by road. Freight and insurance are placeholders, and the real tax base is URA's valuation, not the invoice. For Kenya, South Sudan and Congo the same layout applies with their own rates, once those are confirmed.</p></section>

<section class="sec">${head({ k: 'Confirmation sheet', h: 'Decisions needed before this goes on the website.' })}
<div class="two"><div><h3>Prices and markup</h3><ul class="check"><li>Markup: 8% (now) / greater of ${RATE * 100}% or USD ${MIN_MARGIN} (proposed) / other: ______________</li><li>Same markup for every destination: yes / no</li><li>Vehicles to remove from the list (European, Lexus, kei cars): yes / no / some: ______</li><li>Models to add (Land Cruiser VX, 70 Series, Patrol, more Prado, Hilux, RAV4, Harrier): ______</li></ul><h3 style="margin-top:4mm">Destinations to offer first</h3><ul class="check"><li>Uganda</li><li>Kenya (cars 2018 or newer only)</li><li>South Sudan (needs the drive-side rule settled)</li><li>DR Congo (needs left-hand-drive cars)</li></ul></div>
<div><h3>Rates and costs to confirm</h3><ul class="check"><li>Uganda duty, VAT, withholding tax, infrastructure levy and environmental levy for 2026/27</li><li>Sea freight Japan to Mombasa by vehicle size (placeholder USD ${n(FREIGHT_PLACEHOLDER)})</li><li>Insurance rate (placeholder ${INSURANCE_RATE * 100}%)</li><li>Clearing agent fees, port charges and transit costs</li><li>Inland transport: Mombasa to Kampala, and onward to Juba or Goma</li><li>Registration and plate fees</li><li>Juba and Kampala dealer prices for the same models, to compare</li></ul>
<h3 style="margin-top:4mm">Who confirms</h3><ul class="check"><li>Owner: markup and which cars to show</li><li>Clearing agent in Kampala, Juba and Goma: taxes and fees in writing</li></ul></div></div>
<div class="sign"><div>Confirmed by (name)</div><div>Signature</div><div>Date</div></div>
<p class="note" style="margin-top:8mm">Prices are indicative and change without notice. Vehicles are external exporter listings, not confirmed Spear Line stock. Availability, final price and delivery are confirmed in writing for each enquiry.</p></section>
</body></html>`;

await writeFile(resolve(out, 'price-list.html'), html);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(out, 'price-list.html')).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: resolve(out, 'Spear-Line-Vehicle-Price-List-DRAFT.pdf'), preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log(`Wrote ${cars.length} vehicles to docs/price-list/Spear-Line-Vehicle-Price-List-DRAFT.pdf`);
