// Turns the hero clip into the WebP frame sequences the home hero scrubs on scroll.
//
//   node scripts/hero-frames/build.mjs <video.mp4> [--intro-at=1.75] [--cut=1.9-2.9]
//
// Writes public/frames/hero/{desktop,mobile}/NNNN.webp, the posters (first and last frame) and
// src/config/hero-frames.ts — including, for every frame, how far down the squeegee has wiped
// (found by looking for its black blade), which is what lets the hero copy be wiped off with it.
//   --intro-at  second of the clip up to which it plays by itself on load; scrolling drives the rest
//   --cut       seconds to leave out (a pause in the action that would feel like dead scroll)
// macOS only: frames are read with AVFoundation (extract.swift), not ffmpeg.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const args = process.argv.slice(2);
const video = args.find((a) => !a.startsWith("--"));
const option = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
if (!video) {
  console.error("usage: node scripts/hero-frames/build.mjs <video.mp4> [--intro-at=seconds] [--cut=from-to]");
  process.exit(2);
}
const introAt = Number(option("intro-at") ?? 1.5);
const cut = option("cut")?.split("-").map(Number) ?? [];

const FRAMES = 121; // desktop frames; mobile keeps every other one
const DESKTOP = { maxWidth: 1600, quality: 60 };
const MOBILE = { ratio: 3 / 4, maxHeight: 960, quality: 56 }; // centre crop for portrait screens

const raw = mkdtempSync(join(tmpdir(), "hero-frames-"));
const report = execFileSync("swift", [join(here, "extract.swift"), resolve(video), raw, String(FRAMES), ...cut.map(String)], {
  stdio: ["ignore", "pipe", "ignore"],
}).toString().trim();
console.log(report);
const keptSeconds = Number(report.match(/([\d.]+)s kept/)[1]);
const intro = Math.round((introAt / keptSeconds) * 1000) / 1000;
const sources = readdirSync(raw).filter((f) => f.endsWith(".png")).sort();

const out = join(root, "public/frames/hero");
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "desktop"), { recursive: true });
mkdirSync(join(out, "mobile"), { recursive: true });

const meta = await sharp(join(raw, sources[0])).metadata();
const desktop = { width: Math.min(meta.width, DESKTOP.maxWidth) };
desktop.height = Math.round((desktop.width * meta.height) / meta.width);
const mobile = { height: Math.min(meta.height, MOBILE.maxHeight) };
mobile.width = Math.round(mobile.height * MOBILE.ratio);

const name = (i) => String(i + 1).padStart(4, "0");
const forDesktop = (file) => sharp(file).resize(desktop.width, desktop.height);
const forMobile = (file) => sharp(file).resize(mobile.width, mobile.height, { fit: "cover", position: "centre" });

/** Bottom edge of the squeegee blade (0 = top of the frame, 1 = bottom), or null when it is not in shot. */
async function bladeEdge(file) {
  const W = 64;
  const H = 360;
  const { data } = await sharp(file).resize(W, H, { fit: "fill" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  let bottom = null;
  for (let y = 0; y < H; y++) {
    let dark = 0;
    for (let x = 4; x < W - 4; x++) if (data[y * W + x] < 70) dark++;
    if (dark > (W - 8) * 0.8) bottom = (y + 1) / H;
  }
  return bottom;
}

let mobileCount = 0;
const blade = [];
for (const [i, source] of sources.entries()) {
  const file = join(raw, source);
  blade.push(await bladeEdge(file));
  await forDesktop(file).webp({ quality: DESKTOP.quality }).toFile(join(out, "desktop", `${name(i)}.webp`));
  if (i % 2 === 0) {
    await forMobile(file).webp({ quality: MOBILE.quality }).toFile(join(out, "mobile", `${name(mobileCount++)}.webp`));
  }
}

// Posters: what the page shows before the canvas takes over (first frame) and what it shows
// instead of the animation with reduced motion or without JavaScript (last frame).
for (const [label, source] of [["first", sources[0]], ["last", sources.at(-1)]]) {
  const file = join(raw, source);
  await forDesktop(file).webp({ quality: 78 }).toFile(join(out, `poster-${label}.webp`));
  await forMobile(file).webp({ quality: 76 }).toFile(join(out, `poster-${label}-mobile.webp`));
}
rmSync(raw, { recursive: true, force: true });

// The squeegee first travels up over the foam without wiping, then wipes on the way down: nothing
// is clean until it has reached its highest point, and everything is once it has left the shot.
const seen = blade.map((y, i) => (y === null ? -1 : i)).filter((i) => i >= 0);
const highest = seen.reduce((best, i) => (blade[i] <= blade[best] ? i : best), seen[0] ?? 0);
let wiped = 0;
const wipe = blade.map((y, i) => {
  if (!seen.length || i < highest) return 0;
  wiped = y === null ? 1 : Math.max(wiped, y);
  return Math.round(wiped * 1000) / 1000;
});

writeFileSync(
  join(root, "src/config/hero-frames.ts"),
  `// Generated by scripts/hero-frames/build.mjs — do not edit by hand.
export const heroFrames = {
  /** Share of the clip that plays by itself on load; scrolling drives the rest. */
  intro: ${intro},
  desktop: { count: ${sources.length}, width: ${desktop.width}, height: ${desktop.height}, path: "/frames/hero/desktop/" },
  mobile: { count: ${mobileCount}, width: ${mobile.width}, height: ${mobile.height}, path: "/frames/hero/mobile/" },
  /** Per desktop frame (mobile uses every other one): how far down the glass is clean, 0 → 1. */
  wipe: [${wipe.join(", ")}],
} as const;
`,
);
console.log(`desktop ${sources.length} × ${desktop.width}×${desktop.height}, mobile ${mobileCount} × ${mobile.width}×${mobile.height}`);
