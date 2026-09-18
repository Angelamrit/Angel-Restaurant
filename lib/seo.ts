import type { Metadata } from "next";
import { restaurant } from "@/lib/restaurant";

type PageMetadataInput = {
  /** Plain title uses the layout's "%s | Angel Indian Restaurant" template.
   *  Pass { absolute: "..." } to bypass the template (used once, for the home page). */
  title: string | { absolute: string };
  description: string;
  path: `/${string}`;
};

// Next 16 overwrites nested metadata objects rather than deep-merging them
// (node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md,
// "Merging → Overwriting fields"), so every page-level `openGraph` must restate
// type/locale/siteName/url or it silently loses whatever the root layout set.
// Composing this once here is what keeps every app/**/page.tsx a one-liner.
export function pageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const ogTitle = typeof title === "string" ? `${title} | ${restaurant.name}` : title.absolute;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: restaurant.name,
      url: path,
      title: ogTitle,
      description,
    },
  };
}

export type BreadcrumbItem = { name: string; path: `/${string}` };

export function breadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: restaurant.siteUrl },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.name,
        item: new URL(item.path, restaurant.siteUrl).toString(),
      })),
    ],
  };
}
