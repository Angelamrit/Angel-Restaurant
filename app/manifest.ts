import type { MetadataRoute } from "next";
import { restaurant } from "@/lib/restaurant";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: restaurant.name,
    short_name: "Angel",
    description: "Indian cooking in Jackson Heights, Queens.",
    start_url: "/",
    display: "browser",
    background_color: "#25130D",
    theme_color: "#E5C88F",
    // Reuses the file-convention icons (app/icon.png, app/apple-icon.png), the gold
    // "Angel" logo built by scripts/optimize-public-images.mjs.
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
