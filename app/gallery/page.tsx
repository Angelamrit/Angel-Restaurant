import type { Metadata } from "next";
import { PageIntro, Reservation } from "@/components/editorial";
import { GalleryRail } from "@/components/gallery-rail";
import { GalleryLightbox } from "@/components/gallery-lightbox";
export const metadata: Metadata = { title: "The experience", description: "A glimpse of the dining room, the tandoor, and the table at Angel Indian Restaurant in Jackson Heights, Queens.", alternates: { canonical: "/gallery" } };
const photos = [{ name: "interior-aceva", label: "A room to settle into" }, { name: "tandoori-aceva", label: "Straight from the tandoor" }, { name: "dal-naan-aceva", label: "The comfort of familiar flavors" }, { name: "lamb-curry-aceva", label: "A little spice, a little soul" }, { name: "feast-aceva", label: "Better when shared" }, { name: "thali-aceva", label: "An invitation to linger" }];
export default function GalleryPage() { return <main id="main-content" tabIndex={-1}><PageIntro eyebrow="The Angel experience" title="Come for the food." italic="Stay for the feeling." description="A glimpse of the room, the table, and the flavors that bring us together." /><GalleryRail /><GalleryLightbox photos={photos}><p className="type-caption gallery-disclosure">From Angel’s existing editorial collection, including relit imagery. Select a photograph to view it larger.</p></GalleryLightbox><Reservation /></main>; }
