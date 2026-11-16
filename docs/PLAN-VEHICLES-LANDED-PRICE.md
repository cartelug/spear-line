# Plan: vehicle photo angles, listing clean-up and landed prices

Written 16 November 2026. This is a plan only; no site code has changed. Figures about the catalogue come from the data in `content/` on this date.

## Why this is needed

1. **Photos are in the exporter's order, not a sales order.** Checked on a sample: a gallery can open with a VIN plate, an odometer, a TV screen, an engine bay or a tyre. Some cars have 3 to 5 photos and no clean front three-quarter view. The site stores only the first 10 of each car's photos (2,245 stored of 6,765 available; 201 of 233 cars have more photos on the exporter's page than we kept).
2. **The prices shown are not what a buyer pays.** Cards show the exporter's FOB price plus our 8%, "before import costs". A buyer in Kampala, Juba, Nairobi or Goma needs the total delivered to them, with duty and tax.
3. **Many listings cannot be sold to many destinations.** All 233 cars are right-hand drive (222 Japan, 11 Thailand). 173 are 2017 or older. Destination rules make a large share of the catalogue unsellable or unpriceable for some countries (see the eligibility table).

## Scope

In scope: photo angle selection and ordering; a listing keep or archive process; a destination-based landed-price estimate; a "car already in another country" mode (for example Juba to Uganda).
Out of scope for now: online payment, live exporter price feeds, confirmed quotes (a quote stays a human step).

## Part A. Best angles for each car

### A1. Target gallery for every car

| Order | Angle | Notes |
| --- | --- | --- |
| 1 (hero and card cover) | Front three-quarter, whole car in frame | Same side on every card so the grid looks consistent |
| 2 | Rear three-quarter | |
| 3 | Side profile | |
| 4 | Front | |
| 5 | Rear | Shows the boot and rear lights |
| 6 | Dashboard and front seats | Shows the steering side and transmission |
| 7 | Rear seats | |
| 8 | Boot or load area | Pickups: the tray |
| 9 | Odometer | Supports the stated mileage |
| 10 | Engine bay | Optional |

Never shown in the gallery: VIN or chassis plates, screens showing TV, tyres or underbody close-ups that add nothing, duplicates, blurred frames, photos with a person's face or another car's number plate in focus.

Exporter watermarks and reference text stay as they are. The repo rule is that vendor marks are retained; we do not crop or paint them out.

### A2. How

1. Fetch all available photos for each car, not just the first 10 (the exporter page lists up to 6,765 in total). Keep the stored size rule (640 px WebP) and the provenance fields already in `vehicle-galleries.mjs`.
2. Tag every photo with an angle label and a quality flag using a vision model run offline in a script (`scripts/vehicles/tag-angles.mjs`). Output goes to `content/vehicle-photo-tags.json`, one record per photo: `{ src, angle, sharp, junk, reason }`. Tags are committed so builds stay deterministic and need no API key.
3. Review: generate one contact sheet per 20 cars so a person can scan all 233 in about 30 minutes and override any tag. Overrides live in `content/vehicle-photo-overrides.json` and win over the model.
4. Build step orders each gallery by the table above, drops junk and duplicates, and picks the cover. If a car has no usable front three-quarter photo, it is flagged for Part B instead of showing a poor cover.
5. Replace the current AI-styled covers (233 files in `assets/car-covers/`) with the real hero photo. The page already admits the covers are "AI-styled settings", which can mislead on a real listing. This also removes the AI-image disclosure from the vehicle cards.

### A3. Done when

- Every card cover is a real front three-quarter photo, same side, same crop ratio.
- No gallery contains a VIN plate, TV screen or tyre close-up.
- A test fails if a car has fewer than 6 usable photos or no tagged hero angle.

## Part B. Remove listings that will not sell or cannot be priced properly

Nothing is deleted silently. A listing moves to `content/vehicle-archive.mjs` with a reason code, so it can come back after a refresh.

### B1. Rules (a listing is archived if it fails any "hard" rule, or two "soft" rules)

| Rule | Type | Check |
| --- | --- | --- |
| Not sellable anywhere we serve | Hard | Fails the destination eligibility table for every destination we offer |
| Listing gone | Hard | Exporter page shows sold, reserved or removed at the recheck |
| Cannot be priced | Hard | Missing engine size, first registration, or a duty-relevant field; or no landed-price rule exists for it |
| No usable hero photo | Hard | Fewer than 6 usable photos or no front three-quarter (after Part A, and after trying all available photos) |
| Landed price above local market | Soft | Landed estimate in the main destination exceeds a comparable local asking price. Needs a market benchmark (Kampala and Nairobi listings for the same model and year) kept in `content/market-benchmarks.mjs` with source and date |
| Weak demand | Soft | Kei cars (660 cc or less; 9 listings) and similar niches with little local demand. Decide from enquiries and local listing counts, not from guesses |
| Thin photo set | Soft | 6 to 8 usable photos |
| Price outlier | Soft | More than 2 standard deviations from the same model and year group (needs a human check; may be a cheap listing hiding damage or an error) |

### B2. Likely effect (to be confirmed once rules are coded)

- **Kenya** accepts vehicles up to 8 years from year of manufacture and right-hand drive: only the 60 cars from 2018 onwards pass.
- **Uganda** accepts right-hand drive; the age rule is moving (a 13-year limit was proposed for 2026/27; not confirmed as law in anything I found). A 2014 car is 12 years old.
- **South Sudan and DRC** drive on the right. DRC sources say left-hand drive only. South Sudan banned RHD in March 2026 and the order was reported revoked or suspended soon after; the position is unclear. Today the whole catalogue is RHD, so it cannot honestly be offered to either until that is settled or left-hand-drive stock is added (see Part C4).

## Part C. Landed price by destination

### C1. What the price shows

For each car and destination, show the total estimated delivered price and the breakdown behind it:

```
Vehicle price (exporter FOB)
+ Spear Line sourcing margin (currently 8%, owner to confirm)
+ Sea freight to the entry port
+ Marine insurance
= CIF value
+ Import duty
+ Excise, VAT, withholding tax, infrastructure or railway levies, environmental levy (as each country applies them)
+ Port, clearing agent and inspection fees
+ Inland transport to the destination city (with transit charges across a border where needed)
+ Registration and plates
= Estimated total in <city>
```

Important detail for Uganda: URA taxes a used car on its own valuation database, not the invoice price. A cheaper purchase does not lower the tax. The calculator must use the official valuation basis, or it will be wrong by a wide margin.

### C2. Destinations, first release

| Destination | Route | Main rules to model (all to be verified; see C3) |
| --- | --- | --- |
| Uganda (Kampala) | Japan to Mombasa or Dar es Salaam, truck to Kampala | Duty, VAT, withholding tax, infrastructure levy, environmental levy by age, URA valuation basis |
| Kenya (Nairobi, Mombasa) | Japan to Mombasa | 8-year limit, duty, excise by engine size, VAT, IDF and RDL, valuation basis |
| South Sudan (Juba) | Mombasa then truck via Uganda and Nimule, or via Kenya | Duty bands, VAT, drive-side and age rules, transit bonds. Status unclear |
| DR Congo (Goma, Bunia, Kinshasa) | Mombasa or Dar es Salaam, overland | Left-hand drive only per exporter guides, age tiers, duty and VAT bands. Status unclear |

Later: Tanzania, Rwanda, Burundi. They need their own rule sets and drive-side checks.

### C3. Tax data: do not guess

My research on 16 November 2026 found official rates unconfirmed and sources in conflict:

| Country | What conflicted |
| --- | --- |
| Uganda | Duty 25%, VAT 18%, withholding tax 6%, infrastructure levy 1.5% in a 2023/24 URA document; one dealer guide says 15% duty; the environmental levy and age cut-off for 2026/27 were only proposals in the sources found (50% levy, 13-year limit); 2026/27 guidance exists but I could not read it |
| Kenya | Duty quoted as 25% in KRA material and 35% in newer dealer material; excise 20% to 35%; IDF 2% to 3.5%; RDL 1.5% to 2% |
| South Sudan | Duty ranges quoted as 0% to 45% or 10% to 40%; RHD ban announced then suspended; age limit disputed |
| DRC | Duty 8% to 46%; age limit disputed; LHD only per exporters |

So the rates must not be typed into the page. They go in a data file, each with a source, a checked date and a status:

```js
// content/destination-costs.mjs (shape)
{ country: 'UG', rules: [
  { id: 'import-duty', label: 'Import duty', base: 'cif', rate: 0.25,
    source: 'https://…', checkedOn: '2026-11-16', status: 'unverified' } ] }
```

A destination is shown to visitors only when every rule in it is `verified`. Until then the card says "Ask for a landed quote to Juba" and nothing numeric.

Verification, per destination: run three real cars (cheap, mid, expensive) through the official calculator or an agent's written quote (URA vehicle calculator, KRA calculator, a Juba and a Goma clearing agent) and require our result to land within 5%. Re-run at every budget change (July in Uganda and Kenya) and on any news of a rule change.

### C4. Left-hand drive and nearer-source stock

If South Sudan and DRC are real markets, the catalogue needs LHD cars. Options to research: LHD listings from Dubai, Korea, the US and Europe, and cars already in Mombasa or Kampala yards. This is a sourcing decision for the owner; the plan only adds a `steering` and `sourceMarket` filter so these can be mixed in later.

### C5. "Car already in another country" mode

For a buyer who already has, or has found, a car in Juba, Nairobi or elsewhere and wants it in Uganda:

- Input: current country, price paid or asking price, year, engine size, fuel, drive side, and whether it is already duty-paid there.
- Output: re-import duties and taxes for the destination (Uganda uses its valuation database, not the Juba price), transit and clearing at the border, inland transport, registration, and a plain warning when the car cannot be registered (age or drive-side rule).
- Same data file and same verified-only rule as above. A duty-paid car from another EAC country follows that country's origin and transit rules; this must be confirmed with an agent before any number is shown.

### C6. Where it shows on the site

- Car card: "Estimated total in Kampala: USD X" as the headline, with the vehicle-only price below it. A destination switch (Uganda, Kenya, later others) above the grid. The default destination is Uganda.
- Static HTML renders the default destination so the page works without JavaScript; a small script recalculates when the destination changes. The same calculator code runs at build time and in the browser, so there is one set of rules.
- A "How this is worked out" panel with the breakdown, the verified date and the authority link.
- Enquiry form carries the selected destination, the estimate and the date it was made.
- Copy says "estimate, not a quote", names what can change (exchange rate, freight, valuation, rules) and that the final price is confirmed in writing. This keeps the existing site rule that no invented or unqualified prices are published.

### C7. Code changes

| File | Change |
| --- | --- |
| `content/destination-costs.mjs` | New. Rules, sources, dates, status per destination |
| `content/freight-routes.mjs` | New. Freight, insurance, port, clearing, inland transport by route, with dates |
| `scripts/lib/landed-cost.mjs` | New. Pure calculator, shared by build and browser |
| `scripts/build.mjs` | Use the calculator for the default card price and breakdown (replaces the `retail()` headline) |
| `public/app.js` (or new `vehicles.js`) | Destination switch and recalculation; keeps no-JS fallback |
| `tests/landed-cost.test.mjs` | New. Worked examples per destination from the three-car verification, plus tests that unverified rules never render a number |
| `tests/site.test.mjs` | Update the vehicle price test: the page must show the basis, date and "estimate" wording |
| `docs/VEHICLE-PRICES.md`, `CONTENT.md` | Document the refresh and verification routine |

## Order of work

| Step | Work | Needs from the owner |
| --- | --- | --- |
| 1 | Settle open questions below | Decisions |
| 2 | Fetch all photos; tag angles; build contact sheets; review | About 30 minutes of review |
| 3 | Rebuild galleries and covers from real hero photos | None |
| 4 | Recheck every listing is still live; apply Part B hard rules | None |
| 5 | Verify tax rules for Uganda first (largest market), then Kenya; build the calculator for them | Agent contacts or URA and KRA access |
| 6 | Ship Uganda and Kenya landed prices; South Sudan and DRC stay "ask for a quote" | |
| 7 | Resolve the South Sudan and DRC drive-side and age rules with a clearing agent in each country; add LHD stock | Agent contacts; sourcing decision |
| 8 | Add the "car already in another country" mode | Agent confirmation of transit rules |
| 9 | Market benchmarks, then Part B soft rules; archive what will not sell | Local price research |

## Decisions needed from you

1. **Margin.** Keep the flat 8%, or set it by price band so cheap cars still earn something after fixed costs and expensive cars stay competitive?
2. **First destinations.** Uganda and Kenya first (what the data and rules support today), with South Sudan and DRC as "ask for a quote" until rules and LHD stock are settled. Agree?
3. **Who verifies rates.** Do you have a clearing agent in Kampala, Juba and Goma who can give written sample quotes?
4. **Keep or drop old cars.** The 2014 to 2017 cars are 173 of 233. Keep them for Uganda only, or drop everything older than a set age?
5. **LHD stock.** Should we start sourcing left-hand-drive cars for South Sudan and DRC, and from where?
6. **Photos.** Fetch extra photos from the exporter pages (more bandwidth and storage, about 3 times what is stored now), or choose only from the 2,245 already stored?
7. **Your last message ended mid-sentence ("we se…").** If there was another requirement, please send it and I will add it here.

## Risks

- Tax and border rules change without notice and sources conflict; a wrong figure shown as fact is worse than no figure. Hence the verified-only rule.
- Exporter listings sell quickly; any price older than a few days may be dead. The recheck in step 4 should repeat on a schedule.
- Exporter photo terms: the repo already credits and links them. Fetching more photos should keep that provenance; confirm the exporter's terms allow it before the public launch.
- Showing a landed price makes the site a price promise in a customer's eyes. Keep the "estimate" wording, the date and the written-quote step.
