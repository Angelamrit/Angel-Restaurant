import Link from "next/link";
import { Photo, Reservation } from "@/components/editorial";
import { HoverPreviewGallery } from "@/components/hover-gallery";
import { VisitSection } from "@/components/neighborhood-map";
import { restaurant } from "@/lib/restaurant";
import { CinematicSlideshow } from "@/components/cinematic-slideshow";
import { HeroVideo } from "@/components/hero-video";

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="hero">
        <HeroVideo src="/videos/hero-loop.mp4" poster="/angel/feast-aceva.webp" posterAlt="A generous spread of Indian curries and biryani from Angel’s editorial collection" />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-stamp"><span>MICHELIN</span><strong>Bib<br />Gourmand</strong><span>JACKSON HEIGHTS · NY</span></div>
        <div className="hero-content container-shell">
          <div className="hero-topline"><p className="type-eyebrow">Punjab at heart. New York in spirit.</p><span className="type-caption">EST. 2019 / JACKSON HEIGHTS</span></div>
          <div className="hero-copy">
            <h1>
              <span className="hero-line"><span className="hero-line-inner">Some places<br />feed you.</span></span>
              <span className="hero-line"><span className="hero-line-inner"><em>Others stay<br />with you.</em></span></span>
            </h1>
            <div className="hero-bottom"><p>Indian cooking with soul.<br />A warm welcome in Queens.</p><a className="button button-primary" href={restaurant.resy}>Reserve a table <span aria-hidden="true">↗</span></a></div>
          </div>
          <div className="hero-foot"><span>100% HALAL FOOD</span><span>FULL BAR</span><a href="#welcome">A little taste of Angel <span aria-hidden="true">↓</span></a></div>
        </div>
      </section>
      <section id="welcome" className="welcome-section container-shell section-space"><div data-reveal><p className="type-eyebrow">Good food. Full hearts.</p></div><h2 className="mask-reveal" data-reveal="mask"><span className="mask-reveal-inner">From a family kitchen in Punjab<br />to a table in <em>Jackson Heights.</em></span></h2><div className="welcome-bottom" data-reveal data-stagger-children><span className="editorial-star" aria-hidden="true">✳</span><div><p>At Angel, it begins with the food. Honest ingredients, the warmth of the tandoor, and the kind of cooking that brings people together. Chef Amrit Pal Singh’s story is ours to share.</p></div><div><Link href="/story" className="text-link">Meet Angel <span aria-hidden="true">↗</span></Link></div></div></section>
      <section className="signature-section"><div className="container-shell section-space"><div className="section-heading light-heading" data-reveal><div><p className="type-eyebrow">From our kitchen</p><h2>Deeply rooted.<br /><em>Distinctly Angel.</em></h2></div><Link className="text-link" href="/menu">Explore the menu ↗</Link></div><div className="signature-grid"><Link href="/menu" className="signature-card" data-reveal><Photo name="tandoori-aceva" alt="Tandoori chicken and kebabs from the clay oven" /><div><span className="type-caption">01 / FIRE & SPICE</span><h3>From the tandoor</h3><span className="signature-arrow" aria-hidden="true">↗</span></div></Link><Link href="/menu" className="signature-card signature-offset" data-reveal><Photo name="lamb-curry-aceva" alt="Lamb rogan josh, cooked in a tomato and onion sauce" /><div><span className="type-caption">02 / SLOW & SOULFUL</span><h3>A little comfort</h3><span className="signature-arrow" aria-hidden="true">↗</span></div></Link><Link href="/menu" className="signature-card" data-reveal><Photo name="dal-naan-aceva" alt="Dal makhni, garlic naan and basmati rice" /><div><span className="type-caption">03 / MADE TO SHARE</span><h3>The familiar favorites</h3><span className="signature-arrow" aria-hidden="true">↗</span></div></Link></div></div></section>
      <section className="story-home container-shell section-space"><div className="story-image" data-reveal><CinematicSlideshow label="The food and place behind Chef Amrit Pal Singh’s story" slides={[{ name: "thali-aceva", alt: "An Indian meal served in traditional dishes, Angel editorial collection" }, { name: "interior-aceva", alt: "Angel’s dining room on 37th Avenue" }, { name: "feast-aceva", alt: "A generous table of Indian dishes at Angel" }]} /><span className="photo-note">A generous spirit, in every detail.</span><Photo name="tandoori-aceva" alt="Tandoori chicken from the clay oven, a closer look" className="story-image-accent" /></div><div className="story-copy" data-reveal><p className="type-eyebrow">The heart behind Angel</p><h2>“Simple<br /><em>but good.”</em></h2><p className="type-body-lg">A philosophy. A family story.<br />A restaurant named for a daughter.</p><p>From Pathankot to Australia, and then New York. After cooking at Rahi and Adda, Chef Amrit Pal Singh opened Angel in 2019. His belief is simple: let the true taste of each ingredient shine.</p><Link href="/story" className="text-link">Our story ↗</Link></div></section>
      <section className="recognition container-shell"><p className="type-eyebrow" data-reveal>A neighborhood favorite. A citywide conversation.</p><div data-reveal data-stagger-children><span>MICHELIN <em>Bib Gourmand</em></span><span>The New Yorker</span><span>Eater <small>NEW YORK</small></span><span>Condé Nast<br /><em>Traveller</em></span></div></section>
      <section className="room-section"><Photo name="interior-aceva" alt="Angel’s dining room on 37th Avenue, editorially relit" /><div className="room-copy" data-reveal><p className="type-eyebrow">Stay a little longer</p><h2>The food brings you in.<br /><em>The feeling brings you back.</em></h2><p>A full bar. A warm room. Good company.</p><Link href="/gallery" className="button button-primary">Step inside ↗</Link></div></section>
      <section className="gallery-home section-space"><div className="container-shell section-heading" data-reveal><div><p className="type-eyebrow">Little moments, lasting memories</p><h2>Life around <em>the table.</em></h2></div><Link href="/gallery" className="text-link">View gallery ↗</Link></div><HoverPreviewGallery /></section>
      <VisitSection />
      <Reservation />
    </main>
  );
}
