"use client";

import { useEffect, useRef } from "react";

/** Keep in sync with the "pinned" media query on `.svcs` in globals.css. */
const PINNED = "(min-width: 861px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)";
const SMOOTHING = 0.14; // share of the remaining distance covered per animation frame

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

/**
 * Drives the services rail and shows where it has got to ("03 / 06" and a bar).
 *
 * Pinned (large screens): `.svcs` is taller than the screen and `.svcs-stage` sticks inside it;
 * the vertical scroll through that extra height is turned into the rail's horizontal travel
 * (`--x` on `.svcs-track`). Otherwise the rail is a plain swipeable carousel and this only follows
 * its own scroll position. Either way each tile gets `--o`, its offset from the middle of the
 * screen (-1 → 1), which the stylesheet uses to pan the photo behind its frame.
 */
export function ServicesRail({ count }: { count: number }) {
  const rootRef = useRef<HTMLParagraphElement>(null);
  const total = String(count).padStart(2, "0");

  useEffect(() => {
    const root = rootRef.current;
    const section = root?.closest<HTMLElement>(".svcs");
    const stage = section?.querySelector<HTMLElement>(".svcs-stage");
    const track = section?.querySelector<HTMLElement>(".svcs-track");
    const current = root?.querySelector<HTMLElement>("b");
    const bar = root?.querySelector<HTMLElement>(".svcs-bar > i");
    if (!root || !section || !stage || !track || !current || !bar) return;
    const slides = Array.from(track.querySelectorAll<HTMLElement>(".svc-slide"));
    if (!slides.length) return;

    const query = matchMedia(PINNED);
    let pinned = query.matches;
    let raf = 0;
    let x = 0; // how far the rail has travelled (px), eased
    let target = 0;
    // Measured on resize, so that nothing is read from the layout while animating.
    let viewport = 0;
    let travel = 0;
    let centres: number[] = [];

    const paint = (offset: number) => {
      const middle = offset + viewport / 2;
      let active = 0;
      slides.forEach((slide, i) => {
        const o = (centres[i] - middle) / viewport;
        slide.style.setProperty("--o", clamp(o, -1, 1).toFixed(3));
        if (Math.abs(o) < Math.abs((centres[active] - middle) / viewport)) active = i;
      });
      current.textContent = String(active + 1).padStart(2, "0");
      bar.style.transform = `scaleX(${travel > 0 ? clamp(offset / travel) : 0})`;
    };

    /** Vertical scroll distance over which the rail travels, and where it starts. */
    const pin = () => {
      const stickAt = parseFloat(getComputedStyle(stage).top) || 0;
      return { distance: section.offsetHeight - stage.offsetHeight, stickAt };
    };

    const step = () => {
      x += (target - x) * SMOOTHING;
      if (Math.abs(target - x) < 0.4) x = target;
      track.style.setProperty("--x", `${(-x).toFixed(1)}px`);
      paint(x);
      raf = x === target ? 0 : requestAnimationFrame(step);
    };

    const onPageScroll = () => {
      if (!pinned) return;
      const { distance, stickAt } = pin();
      const progress = distance > 0 ? clamp((stickAt - section.getBoundingClientRect().top) / distance) : 0;
      target = progress * travel;
      if (!raf) raf = requestAnimationFrame(step);
    };

    const onRailScroll = () => {
      if (!pinned) paint(track.scrollLeft);
    };

    const measure = () => {
      pinned = query.matches;
      viewport = track.clientWidth;
      const last = slides[slides.length - 1];
      travel = Math.max(last.offsetLeft + last.offsetWidth + slides[0].offsetLeft - viewport, 0);
      centres = slides.map((slide) => slide.offsetLeft + slide.offsetWidth / 2);
      if (pinned) {
        track.scrollLeft = 0;
        onPageScroll();
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
        x = target = 0;
        track.style.removeProperty("--x");
        paint(track.scrollLeft);
      }
    };

    // Keyboard: a tile that takes focus while off screen is brought into view by scrolling the
    // page to the matching point of the pinned stretch.
    const onFocus = (event: FocusEvent) => {
      const element = event.target as HTMLElement;
      const index = slides.findIndex((slide) => slide.contains(element));
      if (!pinned || index < 0 || !element.matches(":focus-visible")) return;
      const { distance, stickAt } = pin();
      const wanted = clamp(centres[index] - viewport / 2, 0, travel);
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: sectionTop - stickAt + (travel > 0 ? wanted / travel : 0) * distance });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(track);
    query.addEventListener("change", measure);
    window.addEventListener("scroll", onPageScroll, { passive: true });
    track.addEventListener("scroll", onRailScroll, { passive: true });
    track.addEventListener("focusin", onFocus);
    measure();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      query.removeEventListener("change", measure);
      window.removeEventListener("scroll", onPageScroll);
      track.removeEventListener("scroll", onRailScroll);
      track.removeEventListener("focusin", onFocus);
      track.style.removeProperty("--x");
      slides.forEach((slide) => slide.style.removeProperty("--o"));
    };
  }, []);

  return (
    <p className="svcs-count mono" ref={rootRef} aria-hidden="true">
      <span>
        <b>01</b> / {total}
      </span>
      <span className="svcs-bar">
        <i />
      </span>
    </p>
  );
}
