"use client";

import { useEffect } from "react";

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

/** Asks the header logo to twinkle (see PageMotion). */
export const TWINKLE_EVENT = "clara:twinkle";

/**
 * Scroll-linked motion for the home page, in one place and with one scroll listener:
 *
 * - `[data-progress="from,to"]` gets `--sp` (0 → 1) as its top edge travels from `from` to `to`
 *   of the screen height (tall elements also count their own height, so the value follows the
 *   point where they cross the screen). Used by the "how it works" line and the van.
 * - `[data-inview]` gets the class `in-view` the first time it is on screen (the map lighting up).
 * - `[data-twinkle]`, on entering the screen, and the `clara:twinkle` event make the spark of the
 *   header logo twinkle once.
 * - `--page` (0 → 1 down the page) on <html> moves the sunlight (`.sun`, rendered here).
 *
 * All of it is switched on by the class `motion` on <html>; without it (reduced motion, no
 * JavaScript) the stylesheet shows everything in its final state.
 */
export function PageMotion() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("motion");

    const tracked = Array.from(document.querySelectorAll<HTMLElement>("[data-progress]")).map((element) => {
      const [from = 0.85, to = 0.4] = (element.dataset.progress ?? "").split(",").map(Number).filter(Number.isFinite);
      return { element, from, to };
    });

    const update = () => {
      const screen = window.innerHeight;
      for (const { element, from, to } of tracked) {
        const box = element.getBoundingClientRect();
        if (box.bottom < -screen || box.top > 2 * screen) continue; // far away: leave as is
        const progress = clamp((from * screen - box.top) / ((from - to) * screen + box.height));
        element.style.setProperty("--sp", progress.toFixed(3));
      }
      const length = root.scrollHeight - screen;
      root.style.setProperty("--page", length > 0 ? clamp(window.scrollY / length).toFixed(4) : "0");
    };

    const spark = document.querySelector<SVGElement>(".wm-nav .spark");
    const twinkle = () => {
      if (!spark) return;
      spark.classList.remove("twinkle");
      void spark.getBoundingClientRect(); // restart the animation if it was already running
      spark.classList.add("twinkle");
    };

    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          if (target.hasAttribute("data-inview")) target.classList.add("in-view");
          if (target.hasAttribute("data-twinkle")) twinkle();
          seen.unobserve(target);
        }
      },
      { threshold: 0.35 },
    );
    document.querySelectorAll("[data-inview], [data-twinkle]").forEach((element) => seen.observe(element));

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener(TWINKLE_EVENT, twinkle);
    update();

    return () => {
      seen.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener(TWINKLE_EVENT, twinkle);
      root.classList.remove("motion");
      root.style.removeProperty("--page");
      tracked.forEach(({ element }) => element.style.removeProperty("--sp"));
    };
  }, []);

  return <div className="sun" aria-hidden="true" />;
}
