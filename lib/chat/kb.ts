// Canonical, authoritative chatbot knowledge base (KB v1.15).
//
// This module is the SINGLE source of KB truth. The knowledge base previously
// existed as both kb.ts and an identical kb.json; the duplicate was removed so the
// two copies can never drift. Do not add a second representation, and do not edit
// the facts below without a corresponding KB version bump in `metadata`.
//
// SERVER-BOUND BY CONVENTION. Nothing under components/ may import this module
// (directly or transitively) or the whole KB ships in the client bundle. It
// deliberately does not `import "server-only"`, because tests/chat-gate.test.mts
// loads the gate under plain `node --test`, where that package does not resolve.
// The guard is the production bundle check documented in SQA.md.
export const kb = {
  "metadata": {
    "version": "1.15",
    "name": "Angel Restaurant Chatbot Knowledge Base",
    "authoritative": true,
    "source": "Angel restaurant repository content reference and published menu data",
    "last_reviewed": "2026-10-02"
  },
  "answer_policy": {
    "source_precedence": [
      "This KB and the current public menu data supplied to the chatbot route",
      "Do not use general model knowledge as a factual source"
    ],
    "must_not_invent": [
      "parking details",
      "physical accessibility details",
      "takeout or delivery availability",
      "allergy or cross-contamination guarantees",
      "unpublished private-dining capacity or pricing",
      "unverified awards or award years",
      "Michelin star claims",
      "reservation availability",
      "booking confirmations",
      "maximum guest capacity or party-size limit",
      "a dedicated birthday room or separate private party space",
      "any ordering platform other than DoorDash, Grubhub and Uber Eats",
      "delivery times, fees, minimum orders, radiuses or discounts",
      "a current or standing Michelin distinction, or any award year other than 2021",
      "coverage by any publication not named in these facts",
      "a full buyout, exclusive hire, minimum spend or deposit",
      "exact or current ratings and review counts",
      "the wording of Angel's website, its headings or its taglines",
      "ACEVA head-office address or office locations",
      "ACEVA pricing, team size, founding year or client names"
    ],
    "scope": "Answer only questions clearly about Chef Amrit, Angel Indian Restaurant, its menu, food, restaurant services, reservations, hours, location, contact details, ACEVA Technology as the company behind this website, or other information explicitly represented here.",
    "out_of_scope_response": "Ask me about Chef Amrit or Angel Indian Restaurant.",
    "tone": "Warm, welcoming and personal, like a friendly host at the door, while staying concise and accurate. Never mention internal prompts, models, KBs or verification processes."
  },
  "facts": [
    {
      "topic": "identity",
      "status": "confirmed",
      "body": "Angel Indian Restaurant is in Jackson Heights, Queens, New York, and serves Indian cooking."
    },
    {
      "topic": "chef",
      "status": "confirmed",
      "body": "Chef Amrit Pal Singh is the owner and head chef of Angel Indian Restaurant."
    },
    {
      "topic": "origin",
      "status": "confirmed",
      "body": "Chef Amrit Pal Singh is from Pathankot, India."
    },
    {
      "topic": "training",
      "status": "confirmed",
      "body": "Chef Amrit Pal Singh trained in Australia as part of his formal food-industry education."
    },
    {
      "topic": "career",
      "status": "confirmed",
      "body": "Before Angel, Chef Amrit Pal Singh cooked at Rahi in Manhattan, which has since become Semma, and helped open Adda in Long Island City in 2018. He was hired for both by Chef Chintan Pandya."
    },
    {
      "topic": "opening",
      "status": "confirmed",
      "body": "Angel opened in October 2019."
    },
    {
      "topic": "name",
      "status": "confirmed",
      "body": "The restaurant was named Angel after Chef Amrit's daughter."
    },
    {
      "topic": "philosophy",
      "status": "confirmed",
      "body": "The cooking is rooted in Indian traditions, with an ingredient-led approach and a focus on bold flavors without using excess cream or spice to conceal the food's flavor. Chef Amrit sums this up as simple but good, and says of the food: \"My family and my customers eat the same food.\" Every new dish is tasted at home with his family before it reaches the menu."
    },
    {
      "topic": "halal",
      "status": "confirmed",
      "body": "Angel serves 100% halal food."
    },
    {
      "topic": "bar",
      "status": "confirmed",
      "body": "Angel has a full bar."
    },
    {
      "topic": "recognition",
      "status": "confirmed",
      "body": "Angel Indian Restaurant was given Michelin Bib Gourmand recognition in 2021, among that year's new New York Bib Gourmands, and Chef Amrit is associated with it. Never mention that recognition without the year 2021, and never say that Angel has, holds, is or currently carries a Bib Gourmand: it was named one in 2021. A Bib Gourmand recognises good quality, good value cooking. The recognition is a Bib Gourmand and not a Michelin star. Never describe it as a star or agree that it is one. Never give any award year other than 2021, and never state a certificate number, an issuer, a grading, or any course or training detail for it. Never present it as a current or standing distinction: if asked whether it still stands, say 2021 is what can be confirmed and the restaurant team can confirm anything more recent."
    },
    {
      "topic": "address",
      "status": "confirmed",
      "body": "75-18 37th Avenue, Jackson Heights, NY 11372."
    },
    {
      "topic": "hours",
      "status": "confirmed",
      "body": "Angel is open Tuesday through Sunday, 12 PM–10 PM, and is closed Monday."
    },
    {
      "topic": "phone",
      "status": "confirmed",
      "body": "347-848-0098."
    },
    {
      "topic": "email",
      "status": "confirmed",
      "body": "angelrestaurant278@gmail.com."
    },
    {
      "topic": "transit",
      "status": "confirmed",
      "body": "The nearby 74 St–Broadway station is served by the 7, E, F, M and R trains."
    },
    {
      "topic": "reservations",
      "status": "confirmed",
      "body": "Table reservations are handled through Angel's Resy listing."
    },
    {
      "topic": "private-dining",
      "status": "confirmed",
      "body": "Private dining enquiries are handled through the restaurant team. Space options, capacity and pricing are not published in the source material and must not be invented."
    },
    {
      "topic": "dietary",
      "status": "confirmed",
      "body": "The printed menu marks specific dishes as vegan. The menu also asks guests to tell the restaurant about a food allergy or special dietary requirement before ordering. Do not provide allergy or cross-contamination guarantees."
    },
    {
      "topic": "michelin-description",
      "status": "confirmed",
      "body": "The MICHELIN Guide's own description of Angel praised the vegetarian cooking, saying that plate after plate would demonstrate the real magic of going meatless, and called dum biryani the signature order, capped in a dome of golden-brown pastry and filled with fragrant basmati rice, ginger, caramelised onions and peas. It also singled out the house-made paneer khurchan in a dark, zesty curry of tomatoes and peppers. Attribute these words to the MICHELIN Guide and to no one else."
    },
    {
      "topic": "press-eater",
      "status": "confirmed",
      "body": "Eater New York's critic Robert Sietsema chose Angel's vegetable dum biryani as one of the best New York restaurant dishes of 2019. He wrote that the biryani is baked under a sealed lid, that the lid is made of pastry, making for a very picturesque pie, and that excavating the pie is a deliriously pleasurable experience. He also noted Angel's connection to Adda."
    },
    {
      "topic": "press-infatuation",
      "status": "confirmed",
      "body": "The Infatuation has reviewed Angel twice. Its 2024 review of the original location scored Angel 8.6 out of 10 and described a server cutting open the bread balloon on top of the goat dum biryani to reveal layers of onions, herbs, rice and goat. Its 2026 review of the 37th Avenue location calls the goat dum biryani as showstopping as ever, with a crisp pastry lid that is sliced open at the table, recommends the lassuni gobi, the fish moilee and the house-made paneer, and describes the newer room as larger, though still not huge, and a little more upscale, with a full bar. The 8.6 score belongs to the 2024 review of the original location only."
    },
    {
      "topic": "press-timeout",
      "status": "confirmed",
      "body": "Time Out New York includes Angel in its best Indian restaurants in New York, calling it a no-frills-yet-beloved restaurant in Jackson Heights and recommending any of the biryanis or the chole bhature."
    },
    {
      "topic": "press-culinary-backstreets",
      "status": "confirmed",
      "body": "Culinary Backstreets profiled Angel in 2022 under Chef Amrit's guiding principle, simple but good, reported that he was born in Pathankot in the mid-1980s, and described the original dining room as small and almost bare of decoration, screened from an open kitchen."
    },
    {
      "topic": "press-hellgate",
      "status": "confirmed",
      "body": "Hell Gate reviewed Angel in February 2025 under the headline that Angel Indian Restaurant still brings the heat in Jackson Heights, and reported that Chef Amrit cooked at Rahi, now Semma, and helped open Adda."
    },
    {
      "topic": "press-limits",
      "status": "confirmed",
      "body": "A review is the publication's own opinion and never a fact about Angel; say which publication said it. Never claim that The New Yorker, Condé Nast Traveller, Resy, the New York Times or any publication not named in these facts has written about Angel, because that cannot be confirmed. Never invent or guess a headline, a date, a score, a star rating, a ranking, a list position or a quotation for any publication, and never attribute one publication's words to another."
    },
    {
      "topic": "ratings",
      "status": "confirmed",
      "body": "When Angel's ratings were last checked, on 2 October 2026, the Google rating for the 37th Avenue address was 4.7 from roughly 3,900 reviews, and the Yelp rating was 4.5. Offer these as the figures from when they were last checked rather than as today's, because ratings move. Never state a rating or a review count as exact or current, never add up or compare counts, and never quote a rating for a platform not named here."
    },
    {
      "topic": "location-history",
      "status": "confirmed",
      "body": "Angel opened in 2019 at 74-14 37th Road in Jackson Heights and now trades a few blocks away at 75-18 37th Avenue, a larger space that was previously the restaurant Samudra. The 37th Avenue location opened in July 2025 and the original 37th Road location has since closed, so there is one Angel today. Never describe Angel as having two locations, a second branch or an additional site, and never give an exact closing date for the original room."
    },
    {
      "topic": "experience",
      "status": "confirmed",
      "body": "The 37th Avenue room is a fine-dining space with a full bar, and Angel describes it as suited to special occasions, business dinners and romantic evenings. Chef Amrit cooks in an open kitchen, which Angel presents as a Chef's Table experience, and reservations are recommended with walk-ins welcome subject to availability. The original 37th Road room was much smaller and plainer, so describe the current room rather than the old one unless the visitor asks about the move."
    },
    {
      "topic": "biryani",
      "status": "confirmed",
      "body": "Angel's dum biryanis are slow-cooked under a sealed baked lid that is cut open at the table, and they come with raita. The menu lists vegetable, chicken and goat dum biryani. Published accounts describe the lid variously as pastry, as naan and as a bread balloon, so call it a baked bread-and-pastry lid rather than naming one material, and never promise the same presentation for any other dish."
    },
    {
      "topic": "dal-makhni-pairing",
      "status": "confirmed",
      "body": "Dal makhni is black lentils cooked slowly with herbs and chilli, and Angel serves it with garlic naan and basmati rice in copper serving ware. That pairing is the restaurant's own suggestion rather than a reviewer's recommendation."
    },
    {
      "topic": "buyout",
      "status": "confirmed",
      "body": "Whether Angel offers a full buyout or exclusive hire of the restaurant is not published, and neither is any minimum spend. Never confirm, deny, price or describe a buyout, an exclusive hire, a minimum spend or a deposit; the restaurant team settles all of that directly."
    },
    {
      "topic": "chef-family",
      "status": "confirmed",
      "body": "Chef Amrit grew up cooking in his family's kitchen in Pathankot, where his father, a former army officer, cooked at home. His younger brother runs restaurants in Sydney. Never name, describe or discuss any other family member, and never say what any relative taught him or cooked."
    },
    {
      "topic": "positioning",
      "status": "confirmed",
      "body": "Angel presents itself as a fine-dining Indian restaurant in Jackson Heights, Queens, serving 100% halal food with a full bar at lunch and dinner. Never quote or paraphrase the wording of Angel's website, never describe what any page or heading says, and never repeat a tagline as though it were a fact."
    },
    {
      "topic": "website-credit",
      "status": "confirmed",
      "body": "This website was designed and built by Aceva Tech, whose website is https://acevatech.com. Give that link when asked who made the website or how to contact the studio; the interface also shows a Visit Aceva Tech button. Nothing else about the studio is known, so do not describe its services, prices or team."
    },
    {
      "topic": "dining-style",
      "status": "confirmed",
      "body": "Angel Indian Restaurant is a fine-dining Indian restaurant with a full bar, serving lunch and dinner, and suited to special occasions, business dinners and romantic evenings."
    },
    {
      "topic": "chefs-table",
      "status": "confirmed",
      "body": "Angel offers a Chef's Table open-kitchen experience."
    },
    {
      "topic": "walk-ins",
      "status": "confirmed",
      "body": "Reservations are recommended at Angel, and walk-ins are welcome subject to availability."
    },
    {
      "topic": "capacity",
      "status": "confirmed",
      "body": "A maximum guest capacity for Angel is not published. The restaurant team confirms the largest party they can take. Never state a maximum number of guests, a party-size limit, a seat count or a room capacity, and never say a group cannot be accommodated."
    },
    {
      "topic": "private-space",
      "status": "confirmed",
      "body": "Angel welcomes special occasions and celebrations. Whether a separate or dedicated space is used for them is not published, and the restaurant team confirms those details directly. Never claim that a dedicated birthday room or a separate private party space exists."
    },
    {
      "topic": "ordering",
      "status": "confirmed",
      "body": "Angel takes online orders for pickup and delivery through DoorDash, Grubhub and Uber Eats, and the restaurant can also be reached on 347-848-0098. Those three platforms are the only ordering services that may be named. Never name, suggest or accept any other delivery service, ordering platform or app, and never state a delivery time, fee, minimum order, radius or discount for any of them."
    },
    {
      "topic": "service-timing",
      "status": "confirmed",
      "body": "For guests dining in, food typically arrives in about 20–25 minutes. Never give that timing as a delivery, pickup or takeout estimate."
    }
  ],
  "menu_snapshot": {
    "source": "db/original-menu.json; client-supplied printed menu artwork transcribed by this repository",
    "effective_context": "Current public menu records are preferred at request time; this snapshot is a fallback only.",
    "categories": [
      {
        "id": "appetizers-vegetarian",
        "filter": "Appetizers",
        "title": "Appetizers",
        "kicker": "Vegetarian",
        "items": [
          {
            "name": "Aloo Tikki Chat",
            "price": "$11.99",
            "description": "Potatoes, tamarind, turmeric, ginger, cumin.",
            "vegetarian": true
          },
          {
            "name": "Samosa Chat",
            "price": "$11.99",
            "description": "Sweet and sour chutney, yogurt, chick peas.",
            "vegetarian": true
          },
          {
            "name": "Samosa",
            "price": "$5.99",
            "description": "Crispy pastry stuffed with chilli potatoes and peas.",
            "vegetarian": true
          },
          {
            "name": "Lassuni Gobi",
            "price": "$9.99",
            "description": "Crispy cauliflower tossed in a tomato and garlic sauce.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Onion Pakoda",
            "price": "$10.99",
            "description": "Onion, ground chick peas, chat masala, chutneys.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Paneer Pakoda",
            "price": "$11.99",
            "description": "Homemade Indian cheese, ground chick peas, chat masala, chutneys.",
            "vegetarian": true
          },
          {
            "name": "Pani Puri",
            "price": "$8.99",
            "description": "Potatoes, sweet and spiced chutneys.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Dahi Batata Puri",
            "price": "$8.99",
            "description": "Potatoes, tamarind mint chutney, yogurt.",
            "vegetarian": true
          },
          {
            "name": "Mumbai Bhel Puri",
            "price": "$10.99",
            "description": "Tomatoes, onion, green and tamarind chutney, sev papdi.",
            "vegetarian": true
          },
          {
            "name": "Paneer Tikka",
            "price": "$14.99",
            "description": "Homemade Indian cheese, yogurt, ginger and garlic.",
            "vegetarian": true
          },
          {
            "name": "Paneer P.B 35",
            "price": "$14.99",
            "description": "Homemade paneer, pepper, onion and chilli.",
            "vegetarian": true
          }
        ]
      },
      {
        "id": "appetizers-non-vegetarian",
        "filter": "Appetizers",
        "title": "Appetizers",
        "kicker": "Non-vegetarian",
        "items": [
          {
            "name": "Chicken Tikka",
            "price": "$16.99",
            "description": "Boneless chicken marinated in aromatic spices, roasted in a clay oven."
          },
          {
            "name": "Tandoori Chicken",
            "price": "$20.99",
            "description": "Chicken with bone, marinated in yogurt and chili."
          },
          {
            "name": "Chicken P.B 35",
            "price": "$15.99",
            "description": "Boneless chicken, pepper, onion and chilli."
          },
          {
            "name": "Chicken Seekh Kabab",
            "price": "$20.99",
            "description": "Minced chicken with fresh chilli, roasted in a clay oven."
          },
          {
            "name": "Tawa Chicken",
            "price": "$22.99",
            "description": "Chicken with bone, pepper, onion and chilli."
          },
          {
            "name": "Adraki Lamb Chop",
            "price": "$20.99",
            "description": "Juicy lamb marinated with ginger and garlic, cooked to your taste."
          },
          {
            "name": "Tawa Kaleji Masala",
            "price": "$15.99",
            "description": "Goat liver, onion, pepper and spices, served with pav."
          },
          {
            "name": "Tandoori Salmon",
            "price": "$22.99",
            "description": "Salmon, lemon, ginger, garlic, garam masala."
          },
          {
            "name": "Fish Amritsari",
            "price": "$15.99",
            "description": "Crispy deep fried boneless fish, marinated with chilli and butter."
          },
          {
            "name": "Egg Pav",
            "price": "$12.99",
            "description": "Scrambled egg, onion and spices, served with pav."
          }
        ]
      },
      {
        "id": "mains-vegetarian",
        "filter": "Main course",
        "title": "Main course",
        "kicker": "Vegetarian",
        "items": [
          {
            "name": "Lotus Root Kofta",
            "price": "$18.99",
            "description": "Paneer and lotus root in a fenugreek tomato curry.",
            "vegetarian": true
          },
          {
            "name": "Paneer Khurchan",
            "price": "$18.99",
            "description": "Homemade Indian cheese, pepper, tomatoes.",
            "vegetarian": true
          },
          {
            "name": "Paneer Tikka Masala",
            "price": "$21.99",
            "description": "Homemade cheese, cream, spices, tomato curry.",
            "vegetarian": true
          },
          {
            "name": "Paneer Makhani",
            "price": "$18.99",
            "description": "Homemade Indian cheese, tomatoes and chilli.",
            "vegetarian": true
          },
          {
            "name": "Paneer Bhurji Lajawab",
            "price": "$21.99",
            "description": "Homemade Indian cheese, onion, tomato, spices.",
            "vegetarian": true
          },
          {
            "name": "Matar Paneer",
            "price": "$18.99",
            "description": "Green peas, homemade Indian cheese, tomato and chillies.",
            "vegetarian": true
          },
          {
            "name": "Vegetable Korma",
            "price": "$18.99",
            "description": "Spinach, mixed vegetables, paneer, peppers.",
            "vegetarian": true
          },
          {
            "name": "Palak Paneer / Tofu",
            "price": "$18.99",
            "description": "Fresh spinach, ginger and garlic chilli. Vegan with tofu.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Bhindi Masala",
            "price": "$17.99",
            "description": "Fresh okra, ginger and garlic chilli.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Rajma Masala",
            "price": "$17.99",
            "description": "Kidney beans, turmeric, ginger.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Dal Makhni",
            "price": "$18.99",
            "description": "Black lentil cooked over a low flame with herbs and chilli.",
            "vegetarian": true
          },
          {
            "name": "Dal Tadka",
            "price": "$17.99",
            "description": "Whole yellow lentil, cumin, red onion, ginger, garlic.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Channa Masala",
            "price": "$17.99",
            "description": "Chickpeas, mango powder, cumin.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Aloo Gobi",
            "price": "$17.99",
            "description": "Potato, cauliflower, chilli, ginger and garlic.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Vegetable Moilee",
            "price": "$17.99",
            "description": "Mixed vegetables, mustard seed, coconut milk, onion, ginger.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Aloo Baingan",
            "price": "$17.99",
            "description": "Potatoes, eggplant, spices, onion, tomato.",
            "vegetarian": true,
            "vegan": true
          }
        ]
      },
      {
        "id": "mains-non-vegetarian",
        "filter": "Main course",
        "title": "Main course",
        "kicker": "Non-vegetarian",
        "items": [
          {
            "name": "Chicken Tikka Masala",
            "price": "$20.99",
            "description": "Marinated chicken, red chilli powder, garam masala."
          },
          {
            "name": "Butter Chicken",
            "price": "$19.99",
            "description": "Clay oven cooked dark chicken meat, simmered in tomato sauce."
          },
          {
            "name": "Chicken Vindaloo",
            "price": "$19.99",
            "description": "Goan style chicken cooked with potatoes in a chilli sauce with a touch of vinegar."
          },
          {
            "name": "Chicken Kadai",
            "price": "$19.99",
            "description": "Boneless chicken, red onion, ginger, pepper, chilli."
          },
          {
            "name": "Palak Chicken",
            "price": "$19.99",
            "description": "Chicken, local greens, garlic, chili."
          },
          {
            "name": "Chicken Madras",
            "price": "$19.99",
            "description": "Chicken, onion, turmeric, tomatoes."
          },
          {
            "name": "Chicken Korma",
            "price": "$19.99",
            "description": "Cashew, fried onion, ginger, garlic and spices."
          },
          {
            "name": "Lamb Rogan Josh",
            "price": "$21.99",
            "description": "Cubes of lamb cooked in a tomato and onion sauce."
          },
          {
            "name": "Lamb Bhuna",
            "price": "$21.99",
            "description": "Cubes of lamb, red onion, ginger, chilli."
          },
          {
            "name": "Lamb Vindaloo",
            "price": "$21.99",
            "description": "Goan style lamb cooked with potatoes in a chilli sauce with a touch of vinegar."
          },
          {
            "name": "Lamb Madras",
            "price": "$21.99",
            "description": "Lamb, onion, turmeric, tomatoes."
          },
          {
            "name": "Lamb Korma",
            "price": "$21.99",
            "description": "Cashew, fried onion, ginger, garlic and spices."
          },
          {
            "name": "Goat Bhuna",
            "price": "$22.99",
            "description": "Goat, red onion, ginger, chilli."
          },
          {
            "name": "Goat Madras",
            "price": "$22.99",
            "description": "Goat, onion, turmeric, tomatoes."
          },
          {
            "name": "Goat Korma",
            "price": "$22.99",
            "description": "Cashew, fried onion, ginger, garlic and spices."
          },
          {
            "name": "Laal Maas",
            "price": "$22.99",
            "description": "Baby goat, onion, green chili."
          },
          {
            "name": "Fish Moilee",
            "price": "$21.99",
            "description": "Fish, mustard seed, coconut milk, onion, ginger."
          }
        ]
      },
      {
        "id": "chefs-special",
        "filter": "Chef’s special",
        "title": "Chef’s special",
        "items": [
          {
            "name": "Chole Bhatura",
            "price": "$17.99",
            "description": "Chickpeas, fried flat bread and spices.",
            "vegetarian": true
          },
          {
            "name": "Amritsari Paneer Kulcha",
            "price": "$17.99",
            "description": "Paneer stuffed bread, chickpeas, pickle, yogurt, spices.",
            "vegetarian": true
          },
          {
            "name": "Amritsari Aloo Kulcha",
            "price": "$16.99",
            "description": "Potato stuffed bread, chickpeas, pickle, yogurt, spices.",
            "vegetarian": true
          },
          {
            "name": "Mix Veg Kulcha",
            "price": "$18.99",
            "description": "Mixed vegetable stuffed bread, chickpeas, pickle, yogurt, spices.",
            "vegetarian": true
          },
          {
            "name": "Vegetable Dum Biryani",
            "price": "$20.99",
            "description": "Fresh vegetables, paneer, basmati rice and saffron. Served with raita.",
            "vegetarian": true
          },
          {
            "name": "Chicken Dum Biryani",
            "price": "$22.99",
            "description": "Chicken, basmati rice and saffron. Served with raita."
          },
          {
            "name": "Goat Dum Biryani",
            "price": "$25.99",
            "description": "Goat, basmati rice and saffron. Served with raita."
          }
        ]
      },
      {
        "id": "bread-sides",
        "filter": "Bread & sides",
        "title": "Bread & sides",
        "items": [
          {
            "name": "Butter Naan",
            "price": "$4.00",
            "vegetarian": true
          },
          {
            "name": "Garlic Naan",
            "price": "$5.00",
            "vegetarian": true
          },
          {
            "name": "Sesame Naan",
            "price": "$5.00",
            "vegetarian": true
          },
          {
            "name": "Kalonji Naan",
            "price": "$5.00",
            "vegetarian": true
          },
          {
            "name": "Tandoori Roti",
            "price": "$4.00",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Amul Cheese Naan",
            "price": "$6.00",
            "vegetarian": true
          },
          {
            "name": "Peshwari Naan",
            "price": "$6.00",
            "vegetarian": true,
            "tag": "Sweet"
          },
          {
            "name": "Lacha Paratha",
            "price": "$7.00",
            "vegetarian": true
          },
          {
            "name": "Basmati Rice",
            "price": "$4.00",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Raita",
            "price": "$4.00",
            "vegetarian": true
          }
        ]
      },
      {
        "id": "drinks",
        "filter": "Drinks",
        "title": "Drinks",
        "items": [
          {
            "name": "Mango Lassi",
            "price": "$5.00",
            "vegetarian": true,
            "tag": "Sweet"
          },
          {
            "name": "Punjabi Lassi",
            "price": "$5.00",
            "vegetarian": true,
            "tag": "Salty"
          },
          {
            "name": "Fresh Lime Soda",
            "price": "$5.00",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Masala Chai",
            "price": "$3.00",
            "vegetarian": true
          },
          {
            "name": "Limca",
            "price": "$3.00",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Thums Up",
            "price": "$3.00",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Coke / Diet Coke",
            "price": "$2.00",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Water Bottle",
            "price": "$2.00",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Seltzer Water",
            "price": "$2.00",
            "vegetarian": true,
            "vegan": true
          }
        ]
      },
      {
        "id": "dessert",
        "filter": "Dessert",
        "title": "Dessert",
        "items": [
          {
            "name": "Gulab Jamun",
            "price": "$6.00",
            "vegetarian": true
          },
          {
            "name": "Kheer",
            "price": "$6.00",
            "vegetarian": true
          },
          {
            "name": "Rasmalai",
            "price": "$6.00",
            "vegetarian": true
          },
          {
            "name": "Ice Cream",
            "price": "$6.00",
            "vegetarian": true
          }
        ]
      }
    ]
  },
  "confirmed_urls": {
    "resy": "https://resy.com/cities/new-york-ny/venues/angel-indian-restaurant-ny",
    "aceva": "https://acevatech.com/"
  }
} as const;
