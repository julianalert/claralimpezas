"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowIcon, CalendarCheckIcon } from "../icons";

/**
 * Floating button in the bottom-right corner that opens the quote quiz. It steps aside while an
 * element marked `data-hide-floating-cta` (the contact section, the dark CTA sections, the footer)
 * is on screen, so it never covers another call to action.
 */
export function FloatingCta({ label, href }: { label: string; href: string }) {
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
    <Link className={hidden ? "fab fab-hidden" : "fab"} href={href}>
      <CalendarCheckIcon />
      <span>{label}</span>
      <ArrowIcon />
    </Link>
  );
}
