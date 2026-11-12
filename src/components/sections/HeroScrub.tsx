"use client";

import { useEffect, useRef } from "react";
import { heroFrames } from "@/config/hero-frames";
import { TWINKLE_EVENT } from "../layout/PageMotion";

const SMOOTHING = 0.16; // share of the remaining distance covered per animation frame
const INTRO_MS = 1900;
const INTRO_DELAY_MS = 350;

/**
 * The film behind the home hero: a frame sequence (public/frames/hero, built by
 * scripts/hero-frames) drawn on a canvas. The first part plays by itself on load, then the scroll
 * position drives the rest while the hero stays pinned (the pin itself is CSS: `.hero-stage` is
 * sticky inside the taller `.hero`).
 *
 * Two values are published on the section for the stylesheet: `--p`, the scroll progress (0 → 1),
 * and `--wipe`, how far down the stage the squeegee has cleaned the glass in the frame on screen.
 * The copy and its wash are clipped at that line, so the squeegee wipes them off with the foam;
 * `is-clear` is set once nothing is left and brings in the closing line.
 *
 * With reduced motion nothing runs: the CSS shows the last frame as a still and drops the pin.
 */
export function HeroScrub() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest<HTMLElement>(".hero");
    const stage = canvas?.closest<HTMLElement>(".hero-stage");
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !section || !stage || !context) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const set = matchMedia("(min-width: 768px)").matches ? heroFrames.desktop : heroFrames.mobile;
    const last = set.count - 1;
    const wipeStep = (heroFrames.wipe.length - 1) / last; // the wipe track is per desktop frame
    const introEnd = Math.round(last * heroFrames.intro);
    const images: (HTMLImageElement | undefined)[] = new Array(set.count);

    let disposed = false;
    let raf = 0;
    let drawn = -1;
    let current = 0; // frame on screen (fractional while easing)
    let introFrame = 0; // where the self-playing intro has got to
    let scrollFrame = 0; // where the scroll position says we should be

    /** Nearest frame that has finished loading, so scrolling ahead of the network never blanks. */
    const nearestLoaded = (index: number) => {
      for (let d = 0; d < set.count; d++) {
        if (images[index - d]) return index - d;
        if (images[index + d]) return index + d;
      }
      return -1;
    };

    const draw = (frame: number) => {
      const index = nearestLoaded(Math.round(frame));
      if (index < 0 || index === drawn || !canvas.width) return;
      const { width, height } = canvas;
      const scale = Math.max(width / set.width, height / set.height);
      const w = set.width * scale;
      const h = set.height * scale;
      context.drawImage(images[index]!, (width - w) / 2, (height - h) / 2, w, h);
      drawn = index;

      // Where the clean/soapy line of this frame falls on the stage, allowing for the cover crop.
      const inFrame = heroFrames.wipe[Math.round(index * wipeStep)] ?? 0;
      const onStage = inFrame >= 1 ? 1 : inFrame <= 0 ? 0 : Math.min(Math.max((inFrame * h - (h - height) / 2) / height, 0), 1);
      section.style.setProperty("--wipe", onStage.toFixed(4));
      // The glass has just come clean: the header logo twinkles (PageMotion).
      if (onStage >= 1 && !section.classList.contains("is-clear")) window.dispatchEvent(new Event(TWINKLE_EVENT));
      section.classList.toggle("is-clear", onStage >= 1);
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      drawn = -1;
      draw(current);
    };

    const readScroll = () => {
      const distance = section.offsetHeight - stage.offsetHeight;
      const top = parseFloat(getComputedStyle(stage).top) || 0;
      const progress = distance > 0 ? Math.min(Math.max((top - section.getBoundingClientRect().top) / distance, 0), 1) : 0;
      section.style.setProperty("--p", progress.toFixed(4));
      scrollFrame = progress > 0.002 ? introEnd + progress * (last - introEnd) : 0;
    };

    const tick = () => {
      const target = Math.max(introFrame, scrollFrame);
      current += (target - current) * SMOOTHING;
      if (Math.abs(target - current) < 0.01) current = target;
      draw(current);
      raf = requestAnimationFrame(tick);
    };

    const load = (index: number) =>
      new Promise<void>((done) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          images[index] = image;
          if (Math.abs(index - current) < 2) drawn = -1; // a better match for what is on screen
          done();
        };
        image.onerror = () => done();
        image.src = `${set.path}${String(index + 1).padStart(4, "0")}.webp`;
      });

    const loadAll = async (indexes: number[], lanes = 6) => {
      let next = 0;
      await Promise.all(
        Array.from({ length: lanes }, async () => {
          while (next < indexes.length && !disposed) await load(indexes[next++]);
        }),
      );
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll);
    readScroll();

    const range = (from: number, to: number) => Array.from({ length: Math.max(to - from + 1, 0) }, (_, i) => from + i);

    void load(0).then(() => {
      if (disposed) return;
      resize();
      section.classList.add("has-film");
      raf = requestAnimationFrame(tick);
    });

    // The intro frames first; then a coarse pass over the rest (every 8th frame) so a fast scroll
    // already has something close to show, then everything in order.
    const introLoaded = loadAll(range(1, introEnd));
    void Promise.race([introLoaded, new Promise((r) => setTimeout(r, 2500))]).then(() => {
      if (disposed) return;
      const started = performance.now() + INTRO_DELAY_MS;
      const play = (now: number) => {
        if (disposed) return;
        const t = Math.min(Math.max((now - started) / INTRO_MS, 0), 1);
        introFrame = introEnd * (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2); // ease in-out
        if (t < 1) requestAnimationFrame(play);
      };
      requestAnimationFrame(play);
    });
    void introLoaded.then(() => {
      const rest = range(introEnd + 1, last).sort((a, b) => Number(a % 8 !== 0) - Number(b % 8 !== 0) || a - b);
      return loadAll(rest);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
      section.classList.remove("has-film", "is-clear");
      section.style.removeProperty("--p");
      section.style.removeProperty("--wipe");
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-film" aria-hidden="true" />;
}
