"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { restaurant } from "@/lib/restaurant";

const links = [["/menu", "Menu"], ["/story", "Our story"], ["/gallery", "The experience"], ["/private-dining", "Private dining"], ["/visit", "Visit us"]];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="wordmark" aria-label="Angel Indian Restaurant home" onClick={() => setOpen(false)}>angel<span>INDIAN RESTAURANT</span></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{links.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}</nav>
        <div className="header-actions"><a className="button button-primary" href={restaurant.resy}>Reserve a table <span aria-hidden="true">↗</span></a><button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? "Close −" : "Menu +"}</button></div>
      </div>
      <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation" hidden={!open}>{links.map(([href, label], index) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}><span className="type-caption">0{index + 1}</span>{label}<span aria-hidden="true">↗</span></Link>)}<a href={restaurant.resy} onClick={() => setOpen(false)}>Reserve a table ↗</a><p>Jackson Heights, Queens<br />Tuesday–Sunday · 12 PM–10 PM</p></nav>
    </header>
  );
}
