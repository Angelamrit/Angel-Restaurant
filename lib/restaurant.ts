export const restaurant = {
  name: "Angel Indian Restaurant",
  resy: "https://resy.com/cities/new-york-ny/venues/angel-indian-restaurant-ny",
  directions: "https://www.google.com/maps/dir/?api=1&destination=40.7498,-73.8846",
  phone: "347-848-0098",
  // Digits-only, for tel: hrefs. Derived rather than duplicated so the display
  // and link forms of the phone number can never drift apart (see plan finding S6).
  get phoneHref() {
    return this.phone.replace(/[^0-9]/g, "");
  },
  email: "info@angelindianrestaurant.com",
  address: "75-18 37th Avenue, Jackson Heights, NY 11372",
  instagram: "https://www.instagram.com/angel_indian_restaurant/",
  // TODO — Client Information Required: no production domain has been assigned yet.
  // NEXT_PUBLIC_SITE_URL lets deployment set the real domain; this placeholder only
  // keeps metadata/sitemap/JSON-LD builds valid until then.
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.angelindianrestaurant.com",
};

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
