import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { SPARK_PATH } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { hasLocale, type Locale } from "@/i18n/config";
import { loadDictionary } from "@/i18n/dictionaries";
import { availableFonts, brand, loadGoogleFont } from "@/lib/og";

// Share image (og:image / twitter:image), one per language: the hero photo with the
// translated headline, like the top of the home page. Rendered at build time for each
// locale. URLs look like /en/opengraph-image/share — src/proxy.ts leaves them alone.
//
// Laid out on the standard 1200×630 grid but drawn at 2× (2400×1260): Facebook and others
// re-compress and resize what they fetch, and on high-density screens a 1200px image gets
// upscaled. Saved as a baseline JPEG under ~300 KB, the limit for WhatsApp link previews.

/** Render scale: every layout value below is in 1200×630 units and multiplied by this. */
const k = 2;
const x = (n: number) => n * k;
const size = { width: x(1200), height: x(630) };
const contentType = "image/jpeg";

export async function generateImageMetadata({ params }: { params: { lang: string } }) {
  if (!hasLocale(params.lang)) return [];
  const t = await loadDictionary(params.lang);
  return [{ id: "share", alt: t.meta.ogImageAlt, size, contentType }];
}

/** Hero photo cropped to the image size, as a data URL (near-lossless: it gets encoded again). */
async function heroPhoto() {
  const file = await readFile(join(process.cwd(), "public/images/clara-limpezas.jpg"));
  const jpeg = await sharp(file)
    .resize(size.width, size.height, { fit: "cover", kernel: "lanczos3" })
    .jpeg({ quality: 95, chromaSubsampling: "4:4:4" })
    .toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
  id: Promise<string | number>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) return new Response("Not found", { status: 404 });
  return new Response(await renderShareImage(lang), {
    headers: { "Content-Type": contentType },
  });
}

/** Draws the card and returns it as JPEG bytes. Cached: file reads and font downloads run once. */
async function renderShareImage(locale: Locale): Promise<Uint8Array<ArrayBuffer>> {
  "use cache";
  cacheLife("max");

  const t = await loadDictionary(locale);
  const { eyebrow, title, cta } = t.hero;
  const text = `${eyebrow.toUpperCase()}${title}${cta}${siteConfig.domain}`;

  const [photo, archivo, inter] = await Promise.all([
    heroPhoto(),
    loadGoogleFont("Archivo", 600, text),
    loadGoogleFont("Inter", 800, "clara."),
  ]);

  const png = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          background: brand.ivory,
          fontFamily: "Archivo",
          fontWeight: 600,
        }}
      >
        <img
          src={photo}
          alt=""
          width={size.width}
          height={size.height}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        {/* Same ivory wash as the site's hero, so the text stays readable over the photo */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            backgroundImage:
              "linear-gradient(90deg, rgba(248,247,243,0.97) 0%, rgba(248,247,243,0.92) 38%, rgba(248,247,243,0.35) 60%, rgba(248,247,243,0) 76%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: x(700),
            height: "100%",
            padding: `${x(64)}px 0 ${x(64)}px ${x(72)}px`,
          }}
        >
          {/* "clara." wordmark */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              fontFamily: "Inter",
              fontWeight: 800,
              fontSize: x(54),
              letterSpacing: x(-4),
              lineHeight: 1,
              color: brand.pine,
            }}
          >
            clara.
            <svg width={x(27)} height={x(27)} viewBox="0 0 40 40" style={{ marginTop: x(-11), marginLeft: x(-3) }}>
              <path d={SPARK_PATH} fill={brand.mint} />
            </svg>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: x(20),
                letterSpacing: x(2.8),
                textTransform: "uppercase",
                color: brand.accent,
              }}
            >
              <div style={{ width: x(40), height: x(2), marginRight: x(14), background: brand.accent }} />
              {eyebrow}
            </div>
            <div
              style={{
                marginTop: x(24),
                maxWidth: x(600),
                fontSize: x(66),
                lineHeight: 1.1,
                letterSpacing: x(-1),
                color: brand.ink,
              }}
            >
              {title}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: `${x(16)}px ${x(26)}px`,
                borderRadius: x(12),
                background: brand.pine,
                color: "#fff",
                fontSize: x(24),
              }}
            >
              {cta}
              <svg
                width={x(24)}
                height={x(24)}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginLeft: x(12) }}
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </div>
            <div style={{ marginLeft: x(24), fontSize: x(22), color: brand.muted }}>{siteConfig.domain}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: availableFonts([archivo, inter]) },
  );

  // Baseline, not progressive: a partly decoded progressive JPEG looks blocky. mozjpeg's
  // trellis/deringing tricks are kept, but its `mozjpeg: true` preset would force progressive.
  // 4:2:0 at 2× still keeps colour at 1200×630, so quality goes to detail instead (~250 KB).
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({
      quality: 85,
      progressive: false,
      chromaSubsampling: "4:2:0",
      trellisQuantisation: true,
      overshootDeringing: true,
      quantisationTable: 3,
    })
    .toBuffer();
  return new Uint8Array(jpeg);
}
