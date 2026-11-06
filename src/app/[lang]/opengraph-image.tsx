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
// locale and saved as JPEG so it stays well under WhatsApp's ~300 KB preview limit.
// URLs look like /en/opengraph-image/share — src/proxy.ts leaves them alone.

const size = { width: 1200, height: 630 };
const contentType = "image/jpeg";

export async function generateImageMetadata({ params }: { params: { lang: string } }) {
  if (!hasLocale(params.lang)) return [];
  const t = await loadDictionary(params.lang);
  return [{ id: "share", alt: t.meta.ogImageAlt, size, contentType }];
}

/** Hero photo cropped to 1200×630, as a data URL. */
async function heroPhoto() {
  const file = await readFile(join(process.cwd(), "public/images/clara-limpezas.jpg"));
  const jpeg = await sharp(file)
    .resize(size.width, size.height, { fit: "cover" })
    .jpeg({ quality: 90 })
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
            width: 700,
            height: "100%",
            padding: "64px 0 64px 72px",
          }}
        >
          {/* "clara." wordmark */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              fontFamily: "Inter",
              fontWeight: 800,
              fontSize: 54,
              letterSpacing: -4,
              lineHeight: 1,
              color: brand.pine,
            }}
          >
            clara.
            <svg width={27} height={27} viewBox="0 0 40 40" style={{ marginTop: -11, marginLeft: -3 }}>
              <path d={SPARK_PATH} fill={brand.mint} />
            </svg>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 20,
                letterSpacing: 2.8,
                textTransform: "uppercase",
                color: brand.accent,
              }}
            >
              <div style={{ width: 40, height: 2, marginRight: 14, background: brand.accent }} />
              {eyebrow}
            </div>
            <div
              style={{
                marginTop: 24,
                maxWidth: 600,
                fontSize: 66,
                lineHeight: 1.1,
                letterSpacing: -1,
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
                padding: "16px 26px",
                borderRadius: 12,
                background: brand.pine,
                color: "#fff",
                fontSize: 24,
              }}
            >
              {cta}
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginLeft: 12 }}
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </div>
            <div style={{ marginLeft: 24, fontSize: 22, color: brand.muted }}>{siteConfig.domain}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: availableFonts([archivo, inter]) },
  );

  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return new Uint8Array(jpeg);
}
