"use client";

import { useEffect, useState } from "react";
import { ArrowIcon, CalendarCheckIcon } from "../icons";

/**
 * Floating button in the bottom-right corner that jumps to the quote form. It steps aside while an
 * element marked `data-hide-floating-cta` (the form section, the CTA band, the footer) is on screen,
 * so it never covers the form or another call to action.
 */
export function FloatingCta({ label }: { label: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScreen = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      setHidden(onScreen.size > 0);
    });
    document.querySelectorAll("[data-hide-floating-cta]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <a className={hidden ? "fab fab-hidden" : "fab"} href="#contacto">
      <CalendarCheckIcon />
      <span>{label}</span>
      <ArrowIcon />
    </a>
  );
}
