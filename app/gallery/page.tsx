import { PageIntro, Reservation } from "@/components/editorial";
import { GalleryRail } from "@/components/gallery-rail";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, breadcrumbList } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Gallery: The Dining Room & Dishes", description: "A glimpse of the dining room, the tandoor, and the table at Angel Indian Restaurant in Jackson Heights, Queens.", path: "/gallery" });
const breadcrumbs = breadcrumbList([{ name: "The experience", path: "/gallery" }]);
// The first six keep their approved captions; the bar and storefront reuse wording already on the site,
// and the dishes are captioned with their own menu names.
const photos = [
  { name: "dining-room-portrait-v3", label: "A room to settle into" },
  { name: "tandoori-chicken", label: "Straight from the tandoor" },
  { name: "dinner-spread", label: "The comfort of familiar flavors" },
  { name: "lamb-karahi", label: "A little spice, a little soul" },
  { name: "table-spread", label: "Better when shared" },
  { name: "angels-special", label: "An invitation to linger" },
  { name: "bar-counter-v2", label: "Full bar" },
  { name: "storefront-street", label: "Make your way to Angel" },
  { name: "chole-bhatura-v2", label: "Chole Bhatura" },
  { name: "butter-chicken", label: "Butter Chicken" },
  { name: "chicken-dum-biryani-v2", label: "Chicken Dum Biryani" },
  { name: "dal-makhni", label: "Dal Makhni" },
  { name: "garlic-naan", label: "Garlic Naan" },
  { name: "gulab-jamun", label: "Gulab Jamun" },
];

export default function GalleryPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd data={breadcrumbs} />
      <PageIntro eyebrow="The Angel experience" title="Come for the food." italic="Stay for the feeling." description="A glimpse of the room, the table, and the flavors that bring us together." image={{ name: "experience-dining-room", alt: "Angel’s dining room on 37th Avenue" }} mark="Angel" />
      <section className="surface-gold tone-gold section" aria-label="A glimpse of Angel"><GalleryRail /></section>
      <section className="surface-dark tone-dark section" aria-label="Angel photo collection">
        <GalleryLightbox photos={photos}>
          <p className="type-caption gallery-disclosure">From Angel’s existing editorial collection, including relit imagery. Select a photograph to view it larger.</p>
        </GalleryLightbox>
      </section>
      <Reservation />
    </main>
  );
}
