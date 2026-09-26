export type PressItem = {
  outlet: string;
  title: string;
  url: string;
  /** YYYY-MM-DD. The old site gave only month/year for most items; those use the 1st. */
  date: string;
  kind: "award" | "review" | "feature" | "guide";
  note?: string;
};

// Captured from www.angelindianrestaurant.com's /press page on 18 September 2026
// (see CONTENT_REFERENCE.md). This is a preservation record, not independent
// verification of any claim, rating, or quote below — confirm before reuse.
// The old site's separate "Michelin Bib Gourmand (2021)" award line is not
// reproduced as a press item here; it belongs in the Restaurant JSON-LD's
// `award` field (app/layout.tsx) once the client confirms it, not as an article.
export const press: PressItem[] = [
  {
    outlet: "Resy",
    title: "NYC Restaurants Where We Want to Be Regulars",
    url: "https://blog.resy.com/2025/12/nyc-restaurants-where-we-want-to-be-regulars/",
    date: "2025-12-01",
    kind: "guide",
  },
  {
    outlet: "Yahoo Local",
    title: "Restaurant Relocation Announcement",
    url: "https://local.yahoo.com/info-239661510-angel-indian-restaurant-jackson-heights",
    date: "2025-10-01",
    kind: "feature",
  },
  {
    outlet: "Resy",
    title: "NYC Restaurants — September 2025",
    url: "https://blog.resy.com/2025/01/nyc-restaurants-sept-2025/",
    date: "2025-09-01",
    kind: "guide",
  },
  {
    outlet: "Indian Food Times",
    title: "Angel Indian Restaurant Opens New Branch in Jackson Heights",
    url: "https://indianfoodtimes.com/angel-indian-restaurant-opens-new-branch-in-jackson-heights-new-york-a-michelin-recognized-culinary-dream-by-chef-amrit",
    date: "2025-07-01",
    kind: "feature",
  },
  {
    outlet: "Resy",
    title: "Best New Restaurant Openings — New York",
    url: "https://blog.resy.com/2025/06/best-new-restaurant-openings-new-york/",
    date: "2025-06-01",
    kind: "guide",
  },
  {
    outlet: "Condé Nast Traveller India",
    title: "12 Indian Michelin Guide Restaurants in the US",
    url: "https://www.cntraveller.in/story/12-indian-michelin-guide-restaurants-in-the-us/",
    date: "2024-01-01",
    kind: "guide",
    note: "“Plate after plate will demonstrate the real magic of going meatless.”",
  },
  {
    outlet: "Hell Gate",
    title: "Angel Indian Restaurant Review",
    url: "https://hellgatenyc.com/angel-indian-jackson-heights-review/",
    date: "2024-01-01",
    kind: "review",
  },
  {
    outlet: "Medium",
    title: "Chef Amrit Pal Singh",
    url: "https://medium.com/@sameerkhan166/chef-amrit-pal-singh-f00befd85fa5",
    date: "2024-01-01",
    kind: "feature",
  },
  {
    outlet: "The Infatuation",
    title: "Angel Indian Restaurant Review",
    url: "https://www.theinfatuation.com/new-york/reviews/angel-indian-restaurant",
    date: "2024-01-01",
    kind: "review",
    note: "8.6 rating — standout goat dum biryani",
  },
  {
    outlet: "Eater NY",
    title: "Best Jackson Heights Restaurants",
    url: "https://ny.eater.com/maps/best-jackson-heights-restaurants-food-queens-nyc/",
    date: "2024-01-01",
    kind: "guide",
  },
  {
    outlet: "Eater NY",
    title: "NYC's Best Dishes — March 2023",
    url: "https://ny.eater.com/2023/3/6/23617224/nyc-best-dishes-eater-march-2023",
    date: "2023-03-06",
    kind: "guide",
  },
  {
    outlet: "Chowhound",
    title: "Best Indian Food Restaurants in NYC",
    url: "https://www.chowhound.com/1935451/best-indian-food-restaurants-in-nyc/",
    date: "2024-01-01",
    kind: "guide",
  },
  {
    outlet: "Uber Eats",
    title: "Customer Reviews & Ratings",
    url: "https://www.ubereats.com/store/angel-indian-restaurant/Rh_eT--MTNOUr5P0-T1LCg",
    date: "2025-01-01",
    kind: "review",
    note: "“Food is always so fresh and flavorful and always hits the spot.”",
  },
  {
    outlet: "Restaurantji",
    title: "Customer Reviews & Ratings",
    url: "https://www.restaurantji.com/ny/jackson-heights/angel-/",
    date: "2024-01-01",
    kind: "review",
  },
  {
    outlet: "Culinary Backstreets",
    title: "Angel Indian Restaurant, Queens",
    url: "https://culinarybackstreets.com/cities-category/queens/2022/angel-indian-restaurant/",
    date: "2022-01-01",
    kind: "feature",
  },
];
