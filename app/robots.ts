import type { MetadataRoute } from "next";
import { restaurant } from "@/lib/restaurant";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", restaurant.siteUrl).toString(),
  };
}
