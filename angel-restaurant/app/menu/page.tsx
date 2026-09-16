import type { Metadata } from "next";
import { PageIntro, Reservation } from "@/components/editorial";
import { MenuExplorer } from "@/components/menu-explorer";
export const metadata: Metadata = { title: "The menu", description: "Explore Angel’s Indian dishes, from tandoori chicken to dum biryani and vegetarian favorites in Jackson Heights." };
export default function MenuPage() { return <main id="main-content" tabIndex={-1}><PageIntro eyebrow="The Angel menu · 100% halal food" title="A little spice." italic="A lot of soul." description="From the clay oven to the comfort of a slow-cooked curry. Find your favorite, or discover something new." /><section className="container-shell menu-section" aria-label="Our dishes"><MenuExplorer /></section><Reservation /></main>; }
