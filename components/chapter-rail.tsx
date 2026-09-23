"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Chapter = { id: string; label: string };

// The right-hand chapter rail: one dot per `[data-chapter]` section on the page,
// the active one lit and elongated, with the chapter number above. Appears once
// the visitor has scrolled past the opening screen; large viewports only (CSS).
export function ChapterRail() {
  const pathname = usePathname();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main [data-chapter]"));
    // Deferred a frame so the chapter list is committed outside the effect body
    // (the page's sections are static, so nothing is observed in between).
    const frame = requestAnimationFrame(() => {
      setChapters(sections.map((section) => ({ id: section.id, label: section.dataset.chapter ?? section.id })));
      setActive(0);
    });
    if (sections.length === 0) return () => cancelAnimationFrame(frame);

    const ratios = new Map<Element, number>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0));
      let best = -1;
      let bestRatio = 0;
      sections.forEach((section, index) => {
        const ratio = ratios.get(section) ?? 0;
        if (ratio > bestRatio) { bestRatio = ratio; best = index; }
      });
      if (best >= 0) setActive(best);
    }, { threshold: [0.1, 0.25, 0.5, 0.75], rootMargin: "-20% 0px -20% 0px" });
    sections.forEach((section) => observer.observe(section));

    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  if (chapters.length < 2) return null;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <nav className="chapter-rail" aria-label="Chapters" data-visible={visible}>
      <p className="chapter-rail-count"><strong>{pad(active + 1)}</strong><small>/{pad(chapters.length)}</small></p>
      <ol>
        {chapters.map((chapter, index) => (
          <li key={chapter.id} data-active={index === active}>
            <a href={`#${chapter.id}`} aria-label={chapter.label} aria-current={index === active ? "true" : undefined}><i /></a>
            <span aria-hidden="true">{chapter.label}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
