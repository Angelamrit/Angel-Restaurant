import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import "./site.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/editorial";
import { Motion } from "@/components/motion";

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

export const metadata: Metadata = {
  title: {
    default: "Angel Indian Restaurant | Jackson Heights, Queens",
    template: "%s | Angel Indian Restaurant",
  },
  description:
    "Authentic Indian cooking by Chef Amrit Pal Singh in Jackson Heights, Queens.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${editorial.variable} ${functional.variable}`}
    >
      <body>
        <a className="skip-link button button-primary" href="#main-content">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        <Motion />
      </body>
    </html>
  );
}
