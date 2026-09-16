import Image from "next/image";
import Link from "next/link";
import { restaurant } from "@/lib/restaurant";

export function Photo({ name, alt, className = "", priority = false }: { name: string; alt: string; className?: string; priority?: boolean }) {
  return <div className={`editorial-photo ${className}`}><Image src={`/angel/${name}.webp`} alt={alt} fill sizes="(max-width: 767px) 100vw, 60vw" preload={priority} /></div>;
}

export function PageIntro({ eyebrow, title, italic, description }: { eyebrow: string; title: string; italic: string; description?: string }) {
  return <section className="page-intro container-shell" data-reveal><p className="type-eyebrow">{eyebrow}</p><h1>{title} <em>{italic}</em></h1>{description && <p className="type-body-lg">{description}</p>}</section>;
}

export function Reservation() {
  return <section className="reservation-band" data-theme="apricot"><div className="container-shell" data-reveal><p className="type-eyebrow">There’s a place for you here</p><h2>Come hungry.<br /><em>Leave happy.</em></h2><a className="button button-primary" href={restaurant.resy}>Reserve a table <span aria-hidden="true">↗</span></a><p className="type-caption">Tuesday–Sunday · 12 PM–10 PM</p></div><span className="reservation-flower" aria-hidden="true">✳</span></section>;
}

export function Footer() {
  return <footer className="site-footer"><div className="container-shell"><div className="footer-top"><Link href="/" className="wordmark">angel<span>INDIAN RESTAURANT</span></Link><p>Rooted in Punjab.<br /><em>At home in Queens.</em></p></div><div className="footer-grid"><div><p className="type-eyebrow">Find us</p><address>75-18 37th Avenue<br />Jackson Heights, NY 11372</address><a href={restaurant.directions}>Get directions ↗</a></div><div><p className="type-eyebrow">Join us</p><p>Tuesday–Sunday · 12 PM–10 PM<br />Monday · Closed</p><a href={restaurant.resy}>Reserve on Resy ↗</a></div><div><p className="type-eyebrow">Say hello</p><a href="tel:3478480098">{restaurant.phone}</a><a href={`mailto:${restaurant.email}`}>{restaurant.email}</a><a href={restaurant.instagram}>Instagram ↗</a></div><nav aria-label="Footer"><Link href="/menu">Menu</Link><Link href="/private-dining">Private dining</Link><Link href="/faq">Questions & answers</Link><Link href="/visit">Visit Angel</Link></nav></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Angel Indian Restaurant</span><span>100% halal food · Full bar · Queens, New York</span></div></div></footer>;
}
