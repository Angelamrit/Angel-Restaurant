"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "./header";
import { ChapterRail } from "./chapter-rail";
import { Motion } from "./motion";
import { AnalyticsEvents } from "./analytics-events";
export function SiteChrome({ children, footer, analytics }: { children: ReactNode; footer: ReactNode; analytics: ReactNode }) {
  const path = usePathname();
  if (path === "/admin" || path.startsWith("/admin/")) return <>{children}</>;
  return <><div className="scroll-progress" aria-hidden="true" /><Header />{children}{footer}<ChapterRail /><Motion /><AnalyticsEvents />{analytics}</>;
}
