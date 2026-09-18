import type { MetadataRoute } from "next";
import { restaurant } from "@/lib/restaurant";

// Fixed dates rather than `new Date()` at build time: stamping every route as
// "modified today" on every deploy tells Google every page changed every time,
// which dilutes the signal for pages that actually did (see plan finding S8).
// Bump a route's date by hand when its content meaningfully changes.
const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; lastModified: string }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly", lastModified: "2026-09-18" },
  { path: "/menu", priority: 0.9, changeFrequency: "weekly", lastModified: "2026-09-17" },
  { path: "/story", priority: 0.6, changeFrequency: "monthly", lastModified: "2026-09-18" },
  { path: "/gallery", priority: 0.6, changeFrequency: "monthly", lastModified: "2026-09-18" },
  { path: "/private-dining", priority: 0.7, changeFrequency: "monthly", lastModified: "2026-09-18" },
  { path: "/visit", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-09-18" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly", lastModified: "2026-09-18" },
  { path: "/press", priority: 0.5, changeFrequency: "monthly", lastModified: "2026-09-18" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly", lastModified: "2026-09-18" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority, changeFrequency, lastModified }) => ({
    url: new URL(path, restaurant.siteUrl).toString(),
    lastModified,
    changeFrequency,
    priority,
  }));
}
