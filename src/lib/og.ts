// Helpers for images drawn with `next/og` (share image, apple-touch icon).

import { cacheLife } from "next/cache";

/** Clara palette (same values as the tokens in globals.css). */
export const brand = {
  pine: "#0e4d43",
  pineDeep: "#052f29",
  mint: "#7bc4b1",
  ivory: "#f8f7f3",
  ink: "#16362f",
  muted: "#5c746d",
  accent: "#2f8b76",
};

type FontWeight = 400 | 500 | 600 | 700 | 800;

export type OgFont = { name: string; data: ArrayBuffer; weight: FontWeight; style: "normal" };

/**
 * Downloads a Google Font as TTF, subset to `text` (the same source next/font uses).
 * Returns null when offline, so the image still renders with the built-in fallback font.
 * Cached, so the images that use it are prerendered at build time instead of per request.
 */
export async function loadGoogleFont(
  family: string,
  weight: FontWeight,
  text: string,
): Promise<OgFont | null> {
  "use cache";
  cacheLife("max");
  try {
    const query = `family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await fetch(`https://fonts.googleapis.com/css2?${query}`).then((r) => r.text());
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src);
    if (!res.ok) return null;
    return { name: family, data: await res.arrayBuffer(), weight, style: "normal" };
  } catch {
    return null;
  }
}

/** Drops the fonts that failed to load. */
export function availableFonts(fonts: (OgFont | null)[]): OgFont[] {
  return fonts.filter((font): font is OgFont => font !== null);
}
