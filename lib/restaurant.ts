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

export const categories = ["All dishes", "Chef’s special", "Vegetarian starters", "From the tandoor", "Vegetarian mains", "Curries"];
export const dishes = [
  { name: "Chicken Dum Biryani", category: "Chef’s special", price: "$22.99", description: "Chicken, fragrant basmati rice and saffron. Served with raita.", image: "chicken-biryani-stock", vegetarian: false, stock: true },
  { name: "Goat Dum Biryani", category: "Chef’s special", price: "$25.99", description: "Goat, basmati rice and saffron. Served with raita.", image: "goat-biryani-stock", vegetarian: false, stock: true },
  { name: "Chole Bhatura", category: "Vegetarian starters", price: "$17.99", description: "Spiced chickpeas with golden, freshly fried flatbread.", image: "chole-bhature-stock", vegetarian: true, stock: true },
  { name: "Tandoori Chicken", category: "From the tandoor", price: "Ask your server", description: "Traditional clay-oven cooking. Fire, spice, and the unmistakable taste of the tandoor.", image: "tandoori-aceva", vegetarian: false, stock: false },
  { name: "Vegetable Dum Biryani", category: "Vegetarian mains", price: "$20.99", description: "Vegetables, paneer, basmati rice and saffron. Served with raita.", image: "vegetable-biryani-stock", vegetarian: true, stock: true },
  { name: "Amritsari Paneer Kulcha", category: "Vegetarian mains", price: "$17.99", description: "Paneer-stuffed bread with chickpeas, pickle, yogurt and spices.", image: "amritsari-kulcha-stock", vegetarian: true, stock: true },
  { name: "Lamb Curry", category: "Curries", price: "Ask your server", description: "A rich, aromatic lamb curry, finished with fresh herbs.", image: "lamb-curry-aceva", vegetarian: false, stock: false },
  { name: "Dal Makhni & Garlic Naan", category: "Curries", price: "Ask your server", description: "Dal makhni, garlic naan and basmati rice. Comfort, generously served.", image: "dal-naan-aceva", vegetarian: true, stock: false },
];

export const faqs = [
  ["How do I reserve a table?", "Book through Angel’s Resy page using the Reserve a table link. For group enquiries, contact us directly."],
  ["When is Angel open?", "Tuesday through Sunday, 12 PM–10 PM. We are closed on Monday."],
  ["Is the food halal?", "Angel’s food is 100% halal. Please speak with our team about specific ingredients or dietary requirements."],
  ["Does Angel have a bar?", "Yes. Angel has a full bar."],
  ["Are vegetarian dishes available?", "Yes. Our menu includes vegetarian dishes such as Chole Bhatura, Vegetable Dum Biryani, Amritsari Paneer Kulcha, and Dal Makhni & Garlic Naan. Please discuss allergies with our team before ordering."],
  ["Where can I find Angel?", "75-18 37th Avenue, Jackson Heights, NY 11372. The nearby 74 St–Broadway station is served by the 7, E, F, M and R trains."],
  ["Can I host a private event?", "We welcome enquiries for birthdays, company dinners and other occasions. Contact our team to discuss available spaces, group sizes and pricing."],
  ["Who can I ask about access or parking?", "Please call 347-848-0098 before your visit so our team can help with your specific access or parking questions."],
];
