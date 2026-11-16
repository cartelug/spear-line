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

### B0. What sells here: demand evidence (added 16 November 2026)

The catalogue was researched for spread, not demand: 99 models at 1 to 5 cars each (mostly 3). Real demand is concentrated in a few models. Evidence found, all from dealer, exporter or newspaper sources; I found **no registration or sales data for used cars** (URA does not publish it in anything I could reach), so treat this as a starting view to test against your own enquiries:

| Market | Models named as popular | Source type |
| --- | --- | --- |
| Uganda, used | RAV4, Premio, Harrier (2020 report: top three at 7%, 6%, 5%); Allion, Vitz, Noah, Probox, Corolla Fielder (high resale), Mark X, Hiace, Prado, Hilux | [Carkibanda 2020 report](https://www.carkibanda.com/en/blog/uganda-2020-used-car-market-report), [Monitor, cars under Shs15m](https://monitor.co.ug/uganda/business/auto/cars-you-can-get-at-shs15m-and-below-1559964), [BE FORWARD](https://blog.beforward.jp/regional-topics/top-10-most-popular-cars-in-uganda-for-2021.html) |
| Uganda, new (full year 2025) | Hilux 29%, Land Cruiser 70 20.7%, Prado 11.6% of 2,466 new light vehicles | [Best Selling Cars Blog](https://bestsellingcarsblog.com/2026/03/uganda-full-year-2025-toyota-hilux-and-land-cruiser-70-hold-49-7-combined/) |
| Juba | Land Cruiser Prado, Land Cruiser VX, Suzuki Escudo, Nissan Patrol or Safari, RAV4, Pajero; Land Cruisers and Hilux dominate NGO fleets (aid-agency demand is a large driver) | [A Juba import dealer's blog](https://japanese-used-car-in-south-sudan.blogspot.com), an old [Mail & Guardian piece](https://mg.co.za/?p=121763) |

Gaps in our catalogue against this: **no Land Cruiser VX or 70 Series and no Patrol or Safari**, the models Juba names first. The only Land Cruiser family model is Prado (3 cars). Lexus LX (3 cars, USD 34,220 to 47,730 before tax) is a Land Cruiser 200 sibling and may suit Juba, but is expensive.

**Proposed shortlist, by evidence (a proposal for you to approve, not applied):**

| Tier | Rule | Cars | Models |
| --- | --- | --- | --- |
| A. Core, named in demand evidence | Keep and promote | 37 | Toyota RAV4, Harrier, Premio, Allion, Vitz, Noah, Probox, Succeed, Corolla Fielder, Mark X, Hiace Van, Land Cruiser Prado, Hilux; Suzuki Escudo; Mitsubishi Pajero |
| B. Mainstream Japanese, no direct evidence found | Keep for now; judge on landed price against local market (B1) | 124 | Other Toyota, Honda, Nissan, Mazda, Subaru, Mitsubishi, Suzuki, Daihatsu, Isuzu, Ford |
| C. Review for removal | Archive unless enquiries or benchmarks show demand | 72 | European marques (49: Audi 9, BMW 10, Mercedes-Benz 14, Volkswagen 8, Land Rover 8); Lexus (14); kei cars of 660 cc or less (Mira, Alto, Wagon R, Jimny: 9) |

Why tier C: European and luxury cars carry the highest duty and valuation, and parts and servicing cost more, so landed prices tend to sit well above local asking prices. This is reasoning, not data; Part B1's market benchmark test decides each one. Suzuki Jimny (3) is a kei-size 4x4 and may sell despite the engine size, so review it separately. Sorting by the shortlist alone would cut the catalogue from 233 to about 161 (tiers A and B); adding the landed-price test will cut further.

**Better than removing:** replace tier C with more of tier A. The best use of the freed space is more Prado, Land Cruiser (Series 200 and Lexus LX for Juba), Hilux, RAV4, Harrier and Noah examples across years and price points, so a buyer sees a real choice in the cars most asked for.

### B0b. Local price benchmarks (Juba and Kampala)

What I could and could not find on 16 November 2026:

- **No Juba classifieds site found.** I searched for a Juba marketplace, a Jiji South Sudan site and named Juba dealers. Juba used-car trade appears to run through showrooms, Facebook groups and WhatsApp, which cannot be read without logging in. I could not confirm that a Jiji site for South Sudan exists (Jiji results were Tanzania only).
- **Juba-linked sellers found:** Light Heart General Trading Co. Ltd. (Juba; imports and exports used and new vehicles, motorbikes and spares; listed on Japanese Car Trade), and LTA-Juba (a Toyota vehicle and parts supplier). Exporters serving Juba: SBI Motor Japan, EVERY Co Ltd and SAT Japan. These are import channels, not price lists for Juba buyers.
- **I could not read any of those sites' listings.** The automated page reader failed on every site because they are outside this environment's allowed network hosts, so no listings or prices from them are in this plan. Search snippets gave only these Uganda figures, which are old or secondary and must not be published: RAV4 2024 at UGX 180 to 200 million and 2025 at UGX 147 to 223 million (usedcars.co.ug, duty not paid); a 2022 dealer quote of about Shs65 million for a Harrier from 2004 to 2006 and Shs55 to 60 million for a 2008 RAV4; Afrotools planning estimates for a Prado (2016: UGX 93 to 160 million, 2020: UGX 141 to 231 million), which that site labels as estimates.

**How to get prices we can stand behind:**

1. **Juba (primary): written price lists from dealers.** Ask 6 to 10 Juba dealers (Light Heart, LTA-Juba and showrooms you know) by WhatsApp for the delivered-in-Juba price, with duty paid, of 15 named models in set years. Record in `content/market-benchmarks.mjs`: dealer, date, model, year, mileage, price, currency, duty paid or not, a screenshot kept privately. Re-ask every month; Juba prices move with the exchange rate and supply.
2. **Juba (cross-check): customs and agent quotes** for three sample cars, which also verify the tax rules in C3.
3. **Kampala:** record asking prices from the Ugandan marketplaces (Cheki, Autochek Uganda, usedcars.co.ug, Jiji Uganda, dealer pages) for the tier A models, split into duty paid and duty not paid. Check each site's terms before collecting at scale; a person copying 50 prices by hand is fine, a bulk scraper may not be.
4. **Exporter and importer calculators as a sanity check only:** for example carimports.co.ke shows CIF Mombasa and an estimated landed price for the same exporter cars. Useful to spot an outlier; not a source for our rates.
5. **Compute our price band per model:** landed estimate (Part C) against the median of at least 3 local asking prices. If our landed price is more than your allowed premium over local market (suggest 0 to 5%), the car is archived or its margin is cut. This is the "price it perfectly" test.

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
8. **Tier C.** Archive the 72 European, Lexus and kei listings now, or wait until Juba and Kampala benchmarks show whether any of them sell? (Recommended: archive the kei cars and European cars now, keep Lexus LX for Juba until benchmarked.)
9. **Juba price sources.** Can you or a Juba contact collect dealer price lists (step 1 in B0b)? That is the only route I found to real Juba prices. Or allow this session's network to reach the dealer and marketplace sites so I can read their public listings (Light Heart, LTA-Juba, usedcars.co.ug, Autochek Uganda); that is a network-settings change only you can approve.
10. **Premium over local market.** How far above the local asking price may our landed price be before a car is archived or its margin cut (suggested 0 to 5%)?

## Risks

- Tax and border rules change without notice and sources conflict; a wrong figure shown as fact is worse than no figure. Hence the verified-only rule.
- Exporter listings sell quickly; any price older than a few days may be dead. The recheck in step 4 should repeat on a schedule.
- Exporter photo terms: the repo already credits and links them. Fetching more photos should keep that provenance; confirm the exporter's terms allow it before the public launch.
- Showing a landed price makes the site a price promise in a customer's eyes. Keep the "estimate" wording, the date and the written-quote step.
