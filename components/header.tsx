"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { restaurant } from "@/lib/restaurant";

// Same links, labels and copy as the previous build; only the presentation is new.
const links = [["/menu", "Menu"], ["/story", "Our story"], ["/gallery", "The experience"], ["/private-dining", "Private dining"], ["/visit", "Visit us"]];
const order = (index: number) => ({ "--i": index } as CSSProperties);

// Fixed header in the chef-site pattern: a utility strip that folds away once
// scrolled, then the monogram wordmark, a frosted pill nav and a gold Reserve
// pill. Hides while scrolling down, returns on the first scroll up.
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [open]);
  useEffect(() => {
    let last = window.scrollY;
    let travel = 0;
    let frame = 0;
    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const delta = y - last;
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
      if (y <= 160) setHidden(false);
      else if (travel > 24) setHidden(true);
      else if (travel < -12) setHidden(false);
      last = y;
      frame = 0;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);

  return (
    <>
      <header className="site-header tone-dark" data-scrolled={scrolled} data-hidden={hidden && !open}>
        <div className="header-backdrop" aria-hidden="true" />
        <div className="utility-strip">
          <div className="container-wide utility-inner">
            <p className="eyebrow utility-left"><span className="utility-star" aria-hidden="true">✦</span> MICHELIN · Bib Gourmand</p>
            <p className="eyebrow utility-mid">75-18 37th Avenue, Jackson Heights</p>
            <p className="utility-right"><span className="eyebrow">Tuesday–Sunday · 12 PM–10 PM</span><a className="eyebrow" href={restaurant.resy}>Reserve on Resy ↗</a></p>
          </div>
        </div>
        <div className="container-wide header-inner">
          <Link href="/" className="brand" aria-label="Angel Indian Restaurant home" onClick={() => setOpen(false)}>
            <span className="monogram" aria-hidden="true">A</span>
            <span className="brand-text">
              <span className="brand-name">angel</span>
              <span className="brand-sub">INDIAN RESTAURANT</span>
            </span>
          </Link>
          <nav className="pill-nav" aria-label="Main navigation">
            <ul>
              {links.map(([href, label]) => (
                <li key={href}><Link href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link></li>
              ))}
            </ul>
          </nav>
          <div className="header-actions">
            <a className="button button-primary header-cta" href={restaurant.resy}><span>Reserve a table</span><span className="button-icon" aria-hidden="true">↗</span></a>
            <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? "Close −" : "Menu +"}</button>
          </div>
        </div>
        <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation" data-open={open}>
          {links.map(([href, label], index) => (
            <Link key={href} href={href} style={order(index)} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>
              <span className="type-caption">0{index + 1}</span>{label}<span aria-hidden="true">↗</span>
            </Link>
          ))}
          <a href={restaurant.resy} style={order(links.length)} onClick={() => setOpen(false)}>Reserve a table ↗</a>
          <p style={order(links.length + 1)}>Jackson Heights, Queens<br />Tuesday–Sunday · 12 PM–10 PM</p>
        </nav>
      </header>
      <a className="mobile-reserve-bar" href={restaurant.resy} tabIndex={open ? -1 : undefined} aria-hidden={open || undefined}>
        Reserve a table <span aria-hidden="true">↗</span>
      </a>
    </>
  );
}
