# Angel — content reference

Captured 16 September 2026 from the client-designated [existing Angel website](https://angel-indian-restaurant-qucc.vercel.app/). This is a preservation record, not independent verification or permission to expand claims. Confirm time-sensitive prices, hours, and policies before launch. Do not import another restaurant's policies.

## Positioning and story

Sources: [home](https://angel-indian-restaurant-qucc.vercel.app/) and [story](https://angel-indian-restaurant-qucc.vercel.app/story).

- Angel Indian Restaurant, Jackson Heights, Queens, New York; Indian cooking rooted in Punjab.
- Chef Amrit Pal Singh grew up around his family's kitchen in Pathankot, Punjab, trained in Australia, and worked at Rahi and Adda in New York.
- Opened in October 2019 using his savings; named for his young daughter.
- Ingredient-led philosophy, avoiding excess cream or spice that conceals flavors.
- Source messaging includes Michelin Bib Gourmand recognition, halal food, and a full bar. Do not upgrade Bib Gourmand to a Michelin star or infer halal certification details or alcohol-free service.
- Source cites coverage by The New Yorker, Eater New York, Condé Nast Traveller, and Resy; original article links and logo usage permissions need review before reuse.

## Signature dishes and menu

> **Superseded for site content, 17 September 2026.** The client supplied printed menu artwork carrying the full card; `lib/restaurant.ts` is now transcribed from that artwork, not from the table below. See "Client menu" beneath the table. The capture below is retained as the record of what the old site showed.

Source: [menu](https://angel-indian-restaurant-qucc.vercel.app/menu), displaying an update date of 4 September 2026. The page lists eight dishes, not evidence of a complete restaurant menu. The vegan filter is not evidence that a specific dish is vegan.

| Category | Dish | Listed price | Source description / dietary label |
| --- | --- | --- | --- |
| Chef's Special | Chicken Dum Biryani | $22.99 | Chicken, basmati rice, saffron, raita |
| Chef's Special | Goat Dum Biryani | $25.99 | Goat, basmati rice, saffron, raita |
| Vegetarian Starters | Chole Bhatura | $17.99 | Chickpeas, fried flatbread, spices; vegetarian |
| From the Tandoor | Tandoori Chicken | Ask your server | Traditional clay-oven preparation; chef's pick |
| Vegetarian Mains | Vegetable Dum Biryani | $20.99 | Vegetables, paneer, basmati rice, saffron, raita; vegetarian |
| Vegetarian Mains | Amritsari Paneer Kulcha | $17.99 | Paneer-stuffed bread, chickpeas, pickle, yogurt, spices; vegetarian |
| Curries | Lamb Curry | Ask your server | Aromatic curry with fresh herbs; chef's pick |
| Curries | Dal Makhni & Garlic Naan | Ask your server | Served with basmati rice; vegetarian, chef's pick |

Homepage signatures: Tandoori Chicken, Lamb Curry, Dal Makhni & Garlic Naan. The homepage's goat-biryani image alt text mentions mirchi ka salan, while its dish description says raita: confirm before writing expanded copy. All prices and availability remain subject to change. No allergen or cross-contamination guarantees are provided.

### Client menu

Source: printed menu artwork supplied by the client on 17 September 2026 (two trifold panels). Transcribed in full into `lib/restaurant.ts`, which is the machine-readable copy of record; this section documents provenance and shape, and is deliberately not a second copy of the 84 rows.

| Section | Items | Price range |
| --- | --- | --- |
| Appetizers — vegetarian | 11 | $5.99–$14.99 |
| Appetizers — non-vegetarian | 10 | $12.99–$22.99 |
| Main course — vegetarian | 16 | $17.99–$21.99 |
| Main course — non-vegetarian | 17 | $19.99–$22.99 |
| Chef's special | 7 | $16.99–$25.99 |
| Bread & sides | 10 | $4.00–$7.00 |
| Drinks | 9 | $2.00–$5.00 |
| Dessert | 4 | $6.00 |

Notes on the transcription:

- Dietary marks are the client's own. The artwork labels specific dishes `VEGAN`; those became `vegan: true`. Vegetarian status is taken from the section a dish is printed under, so the vegan mark is evidence and the vegetarian flag is inference from placement — neither is a certification, and neither covers preparation or cross-contamination.
- Palak Paneer / Tofu is printed with the vegan mark; it is the tofu preparation that carries it, and the description says so.
- The non-vegetarian appetizer list skips printed number 10; ten dishes are printed and ten are transcribed. Numbers are not shown on the site.
- Every dish now carries a listed price. "Ask your server" no longer appears anywhere in the menu data.
- The artwork's closing notice is reproduced on the menu page: tell us about a food allergy or special dietary requirement before ordering.
- Dishes that changed name against the old capture: "Lamb Curry" is not on the card — the nearest listed lamb dishes are Rogan Josh, Bhuna, Vindaloo, Madras and Korma; "Dal Makhni & Garlic Naan" is now Dal Makhni (main course) and Garlic Naan (bread & sides) as separate items. Chole Bhatura and Amritsari Paneer Kulcha moved into Chef's Special.
- Only eight dishes have photography, so the menu page shows those as signature plates and renders the remaining card as a typographic price list. Do not commission or imply photography for the rest.

## Visit and reservations

Sources: [visit](https://angel-indian-restaurant-qucc.vercel.app/visit), [FAQ](https://angel-indian-restaurant-qucc.vercel.app/faq), and footer.

- Address: 75-18 37th Avenue, Jackson Heights, NY 11372.
- Hours: Tuesday–Sunday, noon–10 PM; Monday closed. Use America/New_York for any future live hours logic. Do not preserve the source's cached “Friday / Open now” output as current status.
- Phone: [347-848-0098](tel:3478480098).
- Email: [info@angelindianrestaurant.com](mailto:info@angelindianrestaurant.com).
- Reservations: [Angel's Resy destination](https://resy.com/cities/new-york-ny/venues/angel-indian-restaurant-ny).
- Instagram: [angel_indian_restaurant](https://www.instagram.com/angel_indian_restaurant/).
- Transit as listed: 74 St–Broadway, 7/E/F/M/R trains.
- Directions destination from source: [40.7498, -73.8846](https://www.google.com/maps/dir/?api=1&destination=40.7498,-73.8846). Source map is illustrative and explicitly not to scale.
- Parking and physical accessibility are owner-input placeholders on the source. Do not publish the placeholders or invent answers.

## Private dining

Source: [private dining](https://angel-indian-restaurant-qucc.vercel.app/private-dining). Groups and occasions are handled through enquiries and follow-up. Space options, capacity, and pricing are explicitly unpublished. Form responsibilities: name, email, phone, party size, date, occasion, message, consent, and honeypot. Submission infrastructure must be verified independently before implementing; presence of a source form does not prove delivery.

## Existing hierarchy to preserve later

Header: identity, Menu, Story, Gallery, Private dining, Visit, Reserve; mobile menu and booking/directions access. Homepage: atmospheric hero, highlights, recognition, signature dishes, menu-category preview, reservation block, chef story, room/bar imagery, location and transit, closing CTA, contact footer. Additional routes: /menu, /story, /gallery, /private-dining, /visit, /faq. Gallery route is linked in navigation; it was not separately content-audited in this pass.

Useful responsibilities include menu filtering, mobile navigation, clear external booking, current hours, enquiries, and directions. They are not present in this local starter and are not reimplemented in the foundation task.

## Media provenance

Delivered home markup references /angel/interior-aceva.png, tandoori-aceva.png, lamb-curry-aceva.png, dal-naan-aceva.png, feast-aceva.png, and biryani filenames marked as stock. Captions identify some restaurant images as editorial relights. Preserve that distinction; do not represent stock or generated material as documentary Angel photography. No third-party imagery was copied into this repository.
