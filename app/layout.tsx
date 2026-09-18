import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./site.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/editorial";
import { Motion } from "@/components/motion";
import { restaurant } from "@/lib/restaurant";

const editorial = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const functional = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Authentic Punjabi-rooted Indian cooking by Chef Amrit Pal Singh in Jackson Heights, Queens. Michelin Bib Gourmand recognition, 100% halal food, full bar. Tuesday–Sunday, 12 PM–10 PM.";

const isProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(restaurant.siteUrl),
  title: {
    default: "Angel Indian Restaurant | Jackson Heights, Queens",
    template: "%s | Angel Indian Restaurant",
  },
  description,
  keywords: [
    "Angel Indian Restaurant",
    "Indian restaurant Jackson Heights",
    "Indian restaurant Queens",
    "Punjabi restaurant NYC",
    "halal Indian food Queens",
    "tandoori chicken Queens",
    "biryani Jackson Heights",
  ],
  applicationName: restaurant.name,
  authors: [{ name: restaurant.name }],
  category: "restaurant",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: restaurant.name,
    title: "Angel Indian Restaurant | Jackson Heights, Queens",
    description,
  },
  // Deliberately just the card type here: leaving title/description off lets
  // Next's metadata resolver auto-fill twitter:title/description/image from
  // each page's own openGraph fields (see resolve-metadata.js `postProcessMetadata`).
  // Setting them here would be inherited by every route and block that auto-fill.
  twitter: {
    card: "summary_large_image",
  },
  // Only rendered when the env var is set (Search Console verification via a
  // meta tag). Verifying the domain via a DNS TXT record instead needs no code.
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  robots: isProduction ? { index: true, follow: true } : { index: false, follow: false },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E5C88F",
  colorScheme: "light",
};

// Restaurant schema, sourced only from CONTENT_REFERENCE.md's verified facts.
// Do not add ratings, price range, payment methods, or menu items here without
// client confirmation — see CONTENT_REFERENCE.md "Client Information Required"
// for the specific old-site values (priceRange "$$", paymentAccepted, geo pin)
// awaiting sign-off.
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: restaurant.name,
  url: restaurant.siteUrl,
  telephone: restaurant.phone,
  email: restaurant.email,
  image: new URL("/angel/interior-aceva.webp", restaurant.siteUrl).toString(),
  hasMenu: new URL("/menu", restaurant.siteUrl).toString(),
  servesCuisine: ["Indian", "Punjabi"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "75-18 37th Avenue",
    addressLocality: "Jackson Heights",
    addressRegion: "NY",
    postalCode: "11372",
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: 40.7498, longitude: -73.8846 },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "12:00",
      closes: "22:00",
    },
  ],
  acceptsReservations: true,
  reservations: restaurant.resy,
  sameAs: [restaurant.instagram, restaurant.resy],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${editorial.variable} ${functional.variable}`}
      // The inline script below sets data-motion-ready on the live DOM before hydration,
      // so it never matches the server-rendered markup by design — expected, not a bug.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint so reveal targets never render visible and then blink. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.setAttribute('data-motion-ready','')",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\u003c") }}
        />
      </head>
      <body>
        <a className="skip-link button button-primary" href="#main-content">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        <Motion />
        {isProduction && <Analytics />}
        {isProduction && gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
