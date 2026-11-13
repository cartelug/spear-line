# Import vehicle price guide

The vehicles page renders the researched examples in `content/vehicle-prices.mjs`. They are external exporter listings, not Spear Line inventory, a supplier partnership or a delivered quote.

The initial research was captured on 13 November 2026 from BE FORWARD's public stock-list pages. It includes right-hand-drive vehicles listed in Japan and Thailand. Listing reference, registration year, mileage, engine, transmission, fuel and the displayed USD vehicle price were extracted from the same listing row. The selection includes budget examples from 2014 onward and a further set from 2020 onward. It excludes listings marked sold, reserved or salvage when those labels are present; this is not an inspection or a guarantee of condition or import eligibility.

Each example links to its specific exporter listing, where visitors can review the original details and photos. The site uses its existing illustrative hero image and does not copy exporter photographs. The reference travels into the vehicle enquiry so the model can be discussed without implying an order or reservation.

BE FORWARD defines its FOB price as the vehicle price itself. Freight, insurance, taxes, clearing and destination delivery must be quoted separately. The guide uses the row's vehicle price, not the source site's destination-dependent total-price calculator. See the [exporter's price definitions](https://www.beforward.jp/support/faq/faq-terms) and [FAQ](https://sp.beforward.jp/support/faq).

To refresh the guide:

1. Open the exact source link for every retained example. Update its price and specifications together, and remove examples that no longer have a usable priced listing.
2. Preserve `sourceRef` and `sourceUrl`; a replacement listing needs its own reference and ID. Keep `sourcePriceText` as the displayed source price, with `priceUsd` as the same amount in whole USD.
3. Set the guide's `checkedOn` and every retained entry's `checkedOn` to the actual research date. Recheck all examples before advancing that date.
4. Run `npm run build`, `npm run check`, `npm test` and the browser checks before publishing.

Search, make, maximum vehicle price, minimum year, sorting and progressive display run locally. The initial HTML includes every example so the guide remains readable without JavaScript. Prices are a dated snapshot and are not refreshed automatically while the site is closed.

The retail presentation adds an owner-delegated 8% sourcing margin to the researched vehicle price and rounds to whole USD. The original `priceUsd` and `sourcePriceText` remain unchanged for auditability. These are indicative Spear Line vehicle estimates, before freight, insurance, tax, clearing and delivery. They are not a claim about competitors' actual margins or a confirmed sale price.
