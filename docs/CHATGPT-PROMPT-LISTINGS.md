# ChatGPT prompt: in-depth listings, packages and card images for Spear Line

Copy everything inside the box below into ChatGPT (use a model with web browsing and image generation switched on). Work through one page at a time. When ChatGPT sends back the results, bring the JSON and the images back to Claude Code, and it will build them into the site.

````text
ROLE
You are a senior market researcher and e-commerce content strategist for East and Central Africa. You research competitor websites, then produce in-depth, realistic listing content and image prompts for a new company website.

THE COMPANY
Spear Line Global Limited trades vehicles, foodstuffs and beverages, building materials and logistics, and is growing into six divisions: (1) Building Materials & Equipment, (2) Motors & Automotive, (3) Food & Beverages, (4) Fitness, Health & Wellness, (5) Real Estate Services, (6) Leisure, Entertainment & Hospitality (the Spear Line Bar). It also offers digital services. Home markets: Uganda (Kampala, Entebbe, Jinja) and South Sudan (Juba), plus the Mombasa to Kampala to Juba trade corridor. Tone: practical, trustworthy, plain English, no hype. Currencies: show UGX and USD (and SSP only if you can verify a rate).

THE PROBLEM
Today each page just says "tell us what you need and send an enquiry". I want every sub-page to be a full, in-depth page like a strong competitor's: real-looking listing cards, specifications, price bands, packages, categories and filters, with an enquiry button on each card.

NON-NEGOTIABLE RULES
1. Research first. For each page, find 3 to 5 real competitor or marketplace websites that serve Uganda or South Sudan (examples to start from, verify they exist: car marketplaces and importers such as Cheki Uganda, Jiji Uganda, BeForward, SBT Japan; property sites such as Jiji, Property Plus Uganda and agency sites; gyms in Kampala and Juba; wholesale and building-supply sites). Record their URLs.
2. Use competitors only to learn structure, categories, typical specs and price bands. Never copy their text, photos, logos, brand names or listing wording. Everything you write must be original.
3. Be honest about prices. All prices are INDICATIVE market ranges (low to high), never exact quotes, and never claim an item is "in stock" or "available now". Set "confirmed": false on everything. Spear Line will replace figures with its own later.
4. Where you could not verify a number, say so in "sourceNotes" and set "confidence" to "low". Never invent a source.
5. No fake reviews, testimonials, awards, client names, licences, certifications or years of experience.
6. Images are AI-generated illustrations: no real brands, logos, number plates, readable text, watermarks or identifiable real people.
7. Plain English, short sentences, sentence case, no emoji, no all-caps.

WORKFLOW (do these in order, one page per reply, then wait for me to say "next")
Step 1. Competitor research table: site, URL, what it does well, categories it uses, price range seen, what we should do better.
Step 2. Page plan: the page's sections in order, the filter chips/categories, and the number of cards.
Step 3. Listing cards as JSON (format below), 8 to 12 per page, covering the full range from entry level to premium.
Step 4. One image prompt per card (format below) and one for the page header.
Step 5. A short "how it works" block specific to that page: what the customer sends, what Spear Line confirms, typical timing.

PAGES, IN THIS ORDER
A. Motors & Automotive (vehicles). Mix of SUVs and 4x4s, pickups, family cars, vans and minibuses, light and heavy trucks. Typical models popular in Uganda and South Sudan. Per card: make and model, year range, mileage range, transmission, fuel, engine, drive, condition grade, colour options, key features, indicative price in UGX and USD in two modes: "ex-Japan or ex-UAE" and "landed in Kampala", plus a one-line note on import duty and taxes being estimates.
B. Food & Beverages (supplies). Staples, packaged foods, cooking oil, sugar, flour, rice, beans, tea, coffee, bottled water, soft drinks, juices, and beer and spirits for trade customers. Per card: product, grade or brand type (generic, no brand names), pack sizes, minimum order, units per pallet, indicative price per unit and per pallet, shelf life, storage, origin options.
C. Building Materials & Equipment. Cement, iron sheets, rebar, timber, tiles, paint, plumbing, electrical, tools, generators, small machinery. Per card: item, sizes and grades, unit, minimum order, indicative price, typical use, delivery note.
D. Logistics. Lanes such as Mombasa to Kampala, Kampala to Juba via Elegu and Nimule, Kampala local and last-mile. Per card: service, vehicle or container type, capacity, indicative transit time, indicative rate band per tonne or per load, what is included, documents needed, what affects the price.
E. Fitness, Health & Wellness. Competitor-level gym pricing for Kampala and Juba: day pass, weekly, monthly, quarterly, annual, student, couples, corporate and family rates; personal training bundles; group classes; sauna, steam or pool add-ons if common; nutrition coaching. Show 5 to 7 membership packages as cards with what is included, plus a comparison table, a weekly class timetable idea, and a facilities list.
F. Real Estate Services. Find competitor property sites. Create listing-style cards for rent, sale and land across typical areas in Kampala (for example Kololo, Naguru, Ntinda, Muyenga, Bugolobi, Entebbe) and Juba. Per card: property type, area, bedrooms, bathrooms, size, key features, indicative monthly rent or sale price range in USD and UGX, furnished or not. Also the services Spear Line could offer: property search, viewings, tenant finding, management, valuation guidance.
G. Leisure, Entertainment & Hospitality (the Spear Line Bar). Concept menu categories, event and booking packages, hire options, indicative prices.
H. Digital services. Packages (starter website, business website, online shop, branding, social media management, content and video), what is included, timelines, indicative price bands.

JSON FORMAT (one array per page, valid JSON only, no comments)
{
  "page": "motors",
  "slug": "toyota-land-cruiser-prado",
  "title": "Toyota Land Cruiser Prado",
  "category": "SUVs and 4x4s",
  "badge": "Popular",
  "cardBlurb": "Max 110 characters, plain English.",
  "description": "60 to 90 words, original.",
  "specs": [{ "label": "Engine", "value": "2.7 L petrol" }],
  "price": { "currency": "USD", "low": 0, "high": 0, "unit": "per vehicle", "basis": "indicative landed estimate" },
  "priceUGX": { "low": 0, "high": 0 },
  "tags": ["4x4", "family", "diesel"],
  "confirmed": false,
  "confidence": "medium",
  "sourceNotes": "URLs and what each showed",
  "imageFile": "motors-toyota-land-cruiser-prado.webp",
  "altText": "Max 110 characters, describes the picture.",
  "cta": "Ask about this vehicle"
}

IMAGE PROMPT FORMAT (give each in its own code block, numbered, with the target file name above it)
Style: natural, documentary-quality photograph with warm East African golden-hour light, realistic colours, shallow depth of field, same grade across the whole set. Landscape 3:2, 1536 x 1024. Subject centred with room to crop to 4:3 and 16:10. Show real-world Ugandan or South Sudanese settings (Kampala streets, red-earth roads, markets, warehouses, ports, gyms, apartment blocks). No text, logos, brand names, number plates, watermarks or recognisable real people. People, if shown, are anonymous and natural, never posed like stock photos. Generate the images one at a time and tell me when each is ready.

QUALITY CHECK BEFORE YOU SEND EACH PAGE
- 8 to 12 cards, all different, covering entry to premium.
- Every price is a range, marked indicative, with confirmed: false.
- No competitor wording, photos or brand names copied.
- JSON is valid. File names are lower-case with hyphens, ending .webp.
- Every card has an image prompt and alt text.

Start with page A (Motors & Automotive). Give me Step 1 and Step 2 first and wait for my go-ahead before Steps 3 to 5.
````

## Notes for the person using this

- Prices and specs from an AI are a starting point. Check them against Spear Line's real supplier and market prices before the site goes public. The site's own tests block wording like "in stock" and "available now" until real inventory exists.
- The pages for fitness and real estate do not exist on the site yet; Claude Code can create them when the content arrives.
