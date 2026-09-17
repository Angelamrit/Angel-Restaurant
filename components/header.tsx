"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { restaurant } from "@/lib/restaurant";

const links = [["/menu", "Menu"], ["/story", "Our story"], ["/gallery", "The experience"], ["/private-dining", "Private dining"], ["/visit", "Visit us"]];
const order = (index: number) => ({ "--i": index } as CSSProperties);

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  useEffect(() => {
    // The mobile menu is a full-screen overlay; without this the page keeps
    // scrolling behind it, which fights the overlay's own scroll on touch.
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [open]);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <>
      <header className="site-header" data-scrolled={scrolled}>
        <div className="header-inner">
          <Link href="/" className="wordmark" aria-label="Angel Indian Restaurant home" onClick={() => setOpen(false)}>angel<span>INDIAN RESTAURANT</span></Link>
          <nav className="desktop-nav" aria-label="Main navigation">{links.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}</nav>
          <div className="header-actions"><a className="button button-primary" href={restaurant.resy}>Reserve a table <span aria-hidden="true">↗</span></a><button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? "Close −" : "Menu +"}</button></div>
        </div>
        <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation" data-open={open}>{links.map(([href, label], index) => <Link key={href} href={href} style={order(index)} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}><span className="type-caption">0{index + 1}</span>{label}<span aria-hidden="true">↗</span></Link>)}<a href={restaurant.resy} style={order(links.length)} onClick={() => setOpen(false)}>Reserve a table ↗</a><p style={order(links.length + 1)}>Jackson Heights, Queens<br />Tuesday–Sunday · 12 PM–10 PM</p></nav>
      </header>
      {/* Reserve is the site's single most important action; on mobile the header's own
          button is hidden behind the menu toggle, so this keeps it one tap away everywhere.
          Sits beneath the mobile-navigation overlay in z-index, so it's covered while open. */}
      <a className="mobile-reserve-bar" href={restaurant.resy} tabIndex={open ? -1 : undefined} aria-hidden={open || undefined}>
        Reserve a table <span aria-hidden="true">↗</span>
      </a>
    </>
  );
}
