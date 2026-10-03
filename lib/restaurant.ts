export const restaurant = {
  name: "Angel Indian Restaurant",
  resy: "https://resy.com/cities/new-york-ny/venues/angel-indian-restaurant-ny",
  directions: "https://www.google.com/maps/dir/?api=1&destination=75-18%2037th%20Avenue%2C%20Jackson%20Heights%2C%20NY%2011372",
  phone: "347-848-0098",
  // Digits-only, for tel: hrefs. Derived rather than duplicated so the display
  // and link forms of the phone number can never drift apart (see plan finding S6).
  get phoneHref() {
    return this.phone.replace(/[^0-9]/g, "");
  },
  // The address shown to visitors, and published in search data. The restaurant has no mailbox on its own domain,
  // so this is the real Gmail inbox (the domain only sends enquiry notifications through Resend).
  email: "angelrestaurant278@gmail.com",
  // Where mail actually arrives: mailto links and enquiry notifications go here.
  inbox: "angelrestaurant278@gmail.com",
  address: "75-18 37th Avenue, Jackson Heights, NY 11372",
  instagram: "https://www.instagram.com/angel_indian_restaurant/",
  // ACEVA Technology built and maintains this website. Shared with the
  // assistant through kb.confirmed_urls.aceva so the two can never drift.
  aceva: "https://acevatech.com/",
  acevaInstagram: "https://www.instagram.com/acevatechnology/",
  // The online ordering destinations the client approved, and the only three the
  // assistant may ever name. Held here rather than in an environment variable so
  // they cannot be swapped at runtime, and read by both the answer and the
  // buttons so the two can never drift apart. Adding a fourth platform is a
  // deliberate edit to this list, never something the model can do.
  ordering: [
    { name: "DoorDash", url: "https://www.doordash.com/store/748538/" },
    { name: "Grubhub", url: "https://www.grubhub.com/restaurant/angel-indian-restaurant-7518-37th-ave-jackson-heights/1429582" },
    { name: "Uber Eats", url: "https://www.ubereats.com/store/angel-restaurant/o47N21ZxVban0w5H1YSfww" },
  ] as const,
  // Production domain. NEXT_PUBLIC_SITE_URL overrides it per deployment; this fallback
  // keeps metadata/sitemap/JSON-LD correct when the variable is unset (fresh checkout, preview).
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://angelindianrestaurantnyc.com",
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
