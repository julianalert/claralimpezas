"use client";

import { useEffect, useRef } from "react";

/**
 * Looping film behind the closing band. Nothing is downloaded until the band is about to come
 * on screen, it pauses when it leaves, and with reduced motion only the poster is shown.
 */
export function BandVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.src) video.src = "/video/band-loop.mp4";
          video.play().catch(() => {}); // autoplay refused (e.g. data saver): the poster stays
        } else {
          video.pause();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="band-video"
      poster="/video/band-poster.jpg"
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
