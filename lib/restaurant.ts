export const restaurant = {
  name: "Angel Indian Restaurant",
  resy: "https://resy.com/cities/new-york-ny/venues/angel-indian-restaurant-ny",
  directions: "https://www.google.com/maps/dir/?api=1&destination=40.7498,-73.8846",
  phone: "347-848-0098",
  email: "info@angelindianrestaurant.com",
  address: "75-18 37th Avenue, Jackson Heights, NY 11372",
  instagram: "https://www.instagram.com/angel_indian_restaurant/",
  // TODO — Client Information Required: no production domain has been assigned yet.
  // NEXT_PUBLIC_SITE_URL lets deployment set the real domain; this placeholder only
  // keeps metadata/sitemap/JSON-LD builds valid until then.
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.angelindianrestaurant.com",
};

export type Dish = { name: string; price: string; description?: string; vegetarian?: boolean; vegan?: boolean; tag?: string };
export type MenuSection = { id: string; filter: string; title: string; kicker?: string; items: Dish[] };

export const categories = ["All dishes", "Appetizers", "Main course", "Chef’s special", "Bread & sides", "Drinks", "Dessert"];

export const menu: MenuSection[] = [
  {
    id: "appetizers-vegetarian",
    filter: "Appetizers",
    title: "Appetizers",
    kicker: "Vegetarian",
    items: [
      { name: "Aloo Tikki Chat", price: "$11.99", description: "Potatoes, tamarind, turmeric, ginger, cumin.", vegetarian: true },
      { name: "Samosa Chat", price: "$11.99", description: "Sweet and sour chutney, yogurt, chick peas.", vegetarian: true },
      { name: "Samosa", price: "$5.99", description: "Crispy pastry stuffed with chilli potatoes and peas.", vegetarian: true },
      { name: "Lassuni Gobi", price: "$9.99", description: "Crispy cauliflower tossed in a tomato and garlic sauce.", vegetarian: true, vegan: true },
      { name: "Onion Pakoda", price: "$10.99", description: "Onion, ground chick peas, chat masala, chutneys.", vegetarian: true, vegan: true },
      { name: "Paneer Pakoda", price: "$11.99", description: "Homemade Indian cheese, ground chick peas, chat masala, chutneys.", vegetarian: true },
      { name: "Pani Puri", price: "$8.99", description: "Potatoes, sweet and spiced chutneys.", vegetarian: true, vegan: true },
      { name: "Dahi Batata Puri", price: "$8.99", description: "Potatoes, tamarind mint chutney, yogurt.", vegetarian: true },
      { name: "Mumbai Bhel Puri", price: "$10.99", description: "Tomatoes, onion, green and tamarind chutney, sev papdi.", vegetarian: true },
      { name: "Paneer Tikka", price: "$14.99", description: "Homemade Indian cheese, yogurt, ginger and garlic.", vegetarian: true },
      { name: "Paneer P.B 35", price: "$14.99", description: "Homemade paneer, pepper, onion and chilli.", vegetarian: true },
    ],
  },
  {
    id: "appetizers-non-vegetarian",
    filter: "Appetizers",
    title: "Appetizers",
    kicker: "Non-vegetarian",
    items: [
      { name: "Chicken Tikka", price: "$16.99", description: "Boneless chicken marinated in aromatic spices, roasted in a clay oven." },
      { name: "Tandoori Chicken", price: "$20.99", description: "Chicken with bone, marinated in yogurt and chili." },
      { name: "Chicken P.B 35", price: "$15.99", description: "Boneless chicken, pepper, onion and chilli." },
      { name: "Chicken Seekh Kabab", price: "$20.99", description: "Minced chicken with fresh chilli, roasted in a clay oven." },
      { name: "Tawa Chicken", price: "$22.99", description: "Chicken with bone, pepper, onion and chilli." },
      { name: "Adraki Lamb Chop", price: "$20.99", description: "Juicy lamb marinated with ginger and garlic, cooked to your taste." },
      { name: "Tawa Kaleji Masala", price: "$15.99", description: "Goat liver, onion, pepper and spices, served with pav." },
      { name: "Tandoori Salmon", price: "$22.99", description: "Salmon, lemon, ginger, garlic, garam masala." },
      { name: "Fish Amritsari", price: "$15.99", description: "Crispy deep fried boneless fish, marinated with chilli and butter." },
      { name: "Egg Pav", price: "$12.99", description: "Scrambled egg, onion and spices, served with pav." },
    ],
  },
  {
    id: "mains-vegetarian",
    filter: "Main course",
    title: "Main course",
    kicker: "Vegetarian",
    items: [
      { name: "Lotus Root Kofta", price: "$18.99", description: "Paneer and lotus root in a fenugreek tomato curry.", vegetarian: true },
      { name: "Paneer Khurchan", price: "$18.99", description: "Homemade Indian cheese, pepper, tomatoes.", vegetarian: true },
      { name: "Paneer Tikka Masala", price: "$21.99", description: "Homemade cheese, cream, spices, tomato curry.", vegetarian: true },
      { name: "Paneer Makhani", price: "$18.99", description: "Homemade Indian cheese, tomatoes and chilli.", vegetarian: true },
      { name: "Paneer Bhurji Lajawab", price: "$21.99", description: "Homemade Indian cheese, onion, tomato, spices.", vegetarian: true },
      { name: "Matar Paneer", price: "$18.99", description: "Green peas, homemade Indian cheese, tomato and chillies.", vegetarian: true },
      { name: "Vegetable Korma", price: "$18.99", description: "Spinach, mixed vegetables, paneer, peppers.", vegetarian: true },
      { name: "Palak Paneer / Tofu", price: "$18.99", description: "Fresh spinach, ginger and garlic chilli. Vegan with tofu.", vegetarian: true, vegan: true },
      { name: "Bhindi Masala", price: "$17.99", description: "Fresh okra, ginger and garlic chilli.", vegetarian: true, vegan: true },
      { name: "Rajma Masala", price: "$17.99", description: "Kidney beans, turmeric, ginger.", vegetarian: true, vegan: true },
      { name: "Dal Makhni", price: "$18.99", description: "Black lentil cooked over a low flame with herbs and chilli.", vegetarian: true },
      { name: "Dal Tadka", price: "$17.99", description: "Whole yellow lentil, cumin, red onion, ginger, garlic.", vegetarian: true, vegan: true },
      { name: "Channa Masala", price: "$17.99", description: "Chickpeas, mango powder, cumin.", vegetarian: true, vegan: true },
      { name: "Aloo Gobi", price: "$17.99", description: "Potato, cauliflower, chilli, ginger and garlic.", vegetarian: true, vegan: true },
      { name: "Vegetable Moilee", price: "$17.99", description: "Mixed vegetables, mustard seed, coconut milk, onion, ginger.", vegetarian: true, vegan: true },
      { name: "Aloo Baingan", price: "$17.99", description: "Potatoes, eggplant, spices, onion, tomato.", vegetarian: true, vegan: true },
    ],
  },
  {
    id: "mains-non-vegetarian",
    filter: "Main course",
    title: "Main course",
    kicker: "Non-vegetarian",
    items: [
      { name: "Chicken Tikka Masala", price: "$20.99", description: "Marinated chicken, red chilli powder, garam masala." },
      { name: "Butter Chicken", price: "$19.99", description: "Clay oven cooked dark chicken meat, simmered in tomato sauce." },
      { name: "Chicken Vindaloo", price: "$19.99", description: "Goan style chicken cooked with potatoes in a chilli sauce with a touch of vinegar." },
      { name: "Chicken Kadai", price: "$19.99", description: "Boneless chicken, red onion, ginger, pepper, chilli." },
      { name: "Palak Chicken", price: "$19.99", description: "Chicken, local greens, garlic, chili." },
      { name: "Chicken Madras", price: "$19.99", description: "Chicken, onion, turmeric, tomatoes." },
      { name: "Chicken Korma", price: "$19.99", description: "Cashew, fried onion, ginger, garlic and spices." },
      { name: "Lamb Rogan Josh", price: "$21.99", description: "Cubes of lamb cooked in a tomato and onion sauce." },
      { name: "Lamb Bhuna", price: "$21.99", description: "Cubes of lamb, red onion, ginger, chilli." },
      { name: "Lamb Vindaloo", price: "$21.99", description: "Goan style lamb cooked with potatoes in a chilli sauce with a touch of vinegar." },
      { name: "Lamb Madras", price: "$21.99", description: "Lamb, onion, turmeric, tomatoes." },
      { name: "Lamb Korma", price: "$21.99", description: "Cashew, fried onion, ginger, garlic and spices." },
      { name: "Goat Bhuna", price: "$22.99", description: "Goat, red onion, ginger, chilli." },
      { name: "Goat Madras", price: "$22.99", description: "Goat, onion, turmeric, tomatoes." },
      { name: "Goat Korma", price: "$22.99", description: "Cashew, fried onion, ginger, garlic and spices." },
      { name: "Laal Maas", price: "$22.99", description: "Baby goat, onion, green chili." },
      { name: "Fish Moilee", price: "$21.99", description: "Fish, mustard seed, coconut milk, onion, ginger." },
    ],
  },
  {
    id: "chefs-special",
    filter: "Chef’s special",
    title: "Chef’s special",
    items: [
      { name: "Chole Bhatura", price: "$17.99", description: "Chickpeas, fried flat bread and spices.", vegetarian: true },
      { name: "Amritsari Paneer Kulcha", price: "$17.99", description: "Paneer stuffed bread, chickpeas, pickle, yogurt, spices.", vegetarian: true },
      { name: "Amritsari Aloo Kulcha", price: "$16.99", description: "Potato stuffed bread, chickpeas, pickle, yogurt, spices.", vegetarian: true },
      { name: "Mix Veg Kulcha", price: "$18.99", description: "Mixed vegetable stuffed bread, chickpeas, pickle, yogurt, spices.", vegetarian: true },
      { name: "Vegetable Dum Biryani", price: "$20.99", description: "Fresh vegetables, paneer, basmati rice and saffron. Served with raita.", vegetarian: true },
      { name: "Chicken Dum Biryani", price: "$22.99", description: "Chicken, basmati rice and saffron. Served with raita." },
      { name: "Goat Dum Biryani", price: "$25.99", description: "Goat, basmati rice and saffron. Served with raita." },
    ],
  },
  {
    id: "bread-sides",
    filter: "Bread & sides",
    title: "Bread & sides",
    items: [
      { name: "Butter Naan", price: "$4.00", vegetarian: true },
      { name: "Garlic Naan", price: "$5.00", vegetarian: true },
      { name: "Sesame Naan", price: "$5.00", vegetarian: true },
      { name: "Kalonji Naan", price: "$5.00", vegetarian: true },
      { name: "Tandoori Roti", price: "$4.00", vegetarian: true, vegan: true },
      { name: "Amul Cheese Naan", price: "$6.00", vegetarian: true },
      { name: "Peshwari Naan", price: "$6.00", vegetarian: true, tag: "Sweet" },
      { name: "Lacha Paratha", price: "$7.00", vegetarian: true },
      { name: "Basmati Rice", price: "$4.00", vegetarian: true, vegan: true },
      { name: "Raita", price: "$4.00", vegetarian: true },
    ],
  },
  {
    id: "drinks",
    filter: "Drinks",
    title: "Drinks",
    items: [
      { name: "Mango Lassi", price: "$5.00", vegetarian: true, tag: "Sweet" },
      { name: "Punjabi Lassi", price: "$5.00", vegetarian: true, tag: "Salty" },
      { name: "Fresh Lime Soda", price: "$5.00", vegetarian: true, vegan: true },
      { name: "Masala Chai", price: "$3.00", vegetarian: true },
      { name: "Limca", price: "$3.00", vegetarian: true, vegan: true },
      { name: "Thums Up", price: "$3.00", vegetarian: true, vegan: true },
      { name: "Coke / Diet Coke", price: "$2.00", vegetarian: true, vegan: true },
      { name: "Water Bottle", price: "$2.00", vegetarian: true, vegan: true },
      { name: "Seltzer Water", price: "$2.00", vegetarian: true, vegan: true },
    ],
  },
  {
    id: "dessert",
    filter: "Dessert",
    title: "Dessert",
    items: [
      { name: "Gulab Jamun", price: "$6.00", vegetarian: true },
      { name: "Kheer", price: "$6.00", vegetarian: true },
      { name: "Rasmalai", price: "$6.00", vegetarian: true },
      { name: "Ice Cream", price: "$6.00", vegetarian: true },
    ],
  },
];

export const dishCount = menu.reduce((total, section) => total + section.items.length, 0);

// The photographed plates. Images live in /public/angel; `stock` marks illustrative photography.
export const signatureDishes = [
  { name: "Chicken Dum Biryani", section: "Chef’s special", price: "$22.99", description: "Chicken, fragrant basmati rice and saffron. Served with raita.", image: "chicken-biryani-stock", vegetarian: false, stock: true },
  { name: "Goat Dum Biryani", section: "Chef’s special", price: "$25.99", description: "Goat, basmati rice and saffron. Served with raita.", image: "goat-biryani-stock", vegetarian: false, stock: true },
  { name: "Chole Bhatura", section: "Chef’s special", price: "$17.99", description: "Chickpeas, fried flat bread and spices.", image: "chole-bhature-stock", vegetarian: true, stock: true },
  { name: "Tandoori Chicken", section: "Appetizers", price: "$20.99", description: "Chicken with bone, marinated in yogurt and chili. Straight from the clay oven.", image: "tandoori-aceva", vegetarian: false, stock: false },
  { name: "Vegetable Dum Biryani", section: "Chef’s special", price: "$20.99", description: "Fresh vegetables, paneer, basmati rice and saffron. Served with raita.", image: "vegetable-biryani-stock", vegetarian: true, stock: true },
  { name: "Amritsari Paneer Kulcha", section: "Chef’s special", price: "$17.99", description: "Paneer stuffed bread, chickpeas, pickle, yogurt and spices.", image: "amritsari-kulcha-stock", vegetarian: true, stock: true },
  { name: "Lamb Rogan Josh", section: "Main course", price: "$21.99", description: "Cubes of lamb cooked in a rich tomato and onion sauce.", image: "lamb-curry-aceva", vegetarian: false, stock: false },
  { name: "Dal Makhni", section: "Main course", price: "$18.99", description: "Black lentil cooked over a low flame with herbs and chilli. Order it with garlic naan.", image: "dal-naan-aceva", vegetarian: true, stock: false },
];

export const faqs = [
  ["How do I reserve a table?", "Book through Angel’s Resy page using the Reserve a table link. For group enquiries, contact us directly."],
  ["When is Angel open?", "Tuesday through Sunday, 12 PM–10 PM. We are closed on Monday."],
  ["Is the food halal?", "Angel’s food is 100% halal. Please speak with our team about specific ingredients or dietary requirements."],
  ["Does Angel have a bar?", "Yes. Angel has a full bar."],
  ["Are vegetarian dishes available?", "Yes. Angel serves a full vegetarian appetizer and main course selection, and many dishes are vegan, among them Dal Tadka, Channa Masala, Aloo Gobi, Bhindi Masala and Vegetable Moilee. Please discuss allergies with our team before ordering."],
  ["Where can I find Angel?", "75-18 37th Avenue, Jackson Heights, NY 11372. The nearby 74 St–Broadway station is served by the 7, E, F, M and R trains."],
  ["Can I host a private event?", "We welcome enquiries for birthdays, company dinners and other occasions. Contact our team to discuss available spaces, group sizes and pricing."],
  ["Who can I ask about access or parking?", "Please call 347-848-0098 before your visit so our team can help with your specific access or parking questions."],
];
