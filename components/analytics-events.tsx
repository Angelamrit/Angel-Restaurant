"use client";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
export function AnalyticsEvents() {
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const special = event.target.closest<HTMLElement>("[data-chef-special]");
      if (special) trackEvent("chef_special_click", { itemId: special.dataset.chefSpecial || "", itemName: special.dataset.itemName || "", category: special.dataset.category || "" });
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const url = anchor.href;
      if (url.startsWith("tel:")) trackEvent("call_click");
      else if (url.startsWith("mailto:")) trackEvent("contact_click");
      else if (/^https:\/\/(wa.me|api.whatsapp.com)\//.test(url)) trackEvent("whatsapp_click");
      else if (url.startsWith("https://resy.com/")) trackEvent("cta_click", { action: "reserve" });
      else if (url.startsWith("https://www.google.com/maps")) trackEvent("cta_click", { action: "directions" });
      else if (anchor.pathname === "/visit" || anchor.pathname === "/private-dining") trackEvent("contact_click", { destination: anchor.pathname });
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, []);
  return null;
}
