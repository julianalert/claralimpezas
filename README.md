# Clara — Limpezas Profissionais em Lisboa

Marketing site for Clara, built with Next.js 16 (App Router, TypeScript, Cache Components).

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## How it's organised

```
src/
  app/
    [lang]/layout.tsx    root layout: <html lang>, fonts, SEO metadata (title, hreflang, OG, robots)
    [lang]/page.tsx      home page — composes the sections below, plus JSON-LD
    [lang]/opengraph-image.tsx  per-language share image (JPEG, built at build time)
    globals.css          all styles (design tokens at the top)
    icon.svg             favicon; apple-icon.png is the same drawing for iOS
    robots.ts, sitemap.ts
  proxy.ts               language routing: browser language / saved choice → `/`, `/en`, `/fr`
  i18n/
    config.ts            locales (pt = main site at `/`, en, fr)
    dictionaries/pt.ts   Portuguese copy — the source of truth for the shape
    dictionaries/en.ts   English copy (TypeScript errors if a key is missing)
    dictionaries/fr.ts   French copy
  components/
    layout/              Header (mobile menu), LanguageSwitcher, Footer
    sections/            Hero, TrustBar, Services, WhyClara, HowItWorks, Contact, CtaBand
    quote/               QuoteProvider (shared form state), QuoteForm, ServiceQuoteLink
    icons.tsx            inline SVG icons + Clara spark
  actions/quote.ts       server action that receives quote requests
  lib/                   services list, quote validation, structured data, OG image helpers
public/images/           static images (hero: clara-limpezas.jpg, services/<id>.jpg)
```

## Languages

Portuguese is the main site at `/`; English is at `/en` and French at `/fr`.
On `/`, `src/proxy.ts` sends visitors to their browser language (fr → `/fr`, en and other
unsupported languages → `/en`, pt or no language header → stays on `/`). Picking a language in the
footer sets the `NEXT_LOCALE` cookie, which wins over the browser language.
All copy lives in `src/i18n/dictionaries/`. Server components read it with
`getDictionary()`; client components receive the slice they need as props.

## Quote form

`QuoteForm` validates on the client, then calls the `submitQuote` server action, which validates again.
Delivery isn't wired up yet: the action returns `demo` and the form shows a demo notice.
To go live, send the request to your email/CRM in `src/actions/quote.ts` and return `{ status: "success" }`.

## SEO

- Titles, descriptions and the share-image alt text are in each dictionary's `meta` block; image alt texts sit
  next to the copy they illustrate (`hero.imageAlt`, `services.items.<id>.imageAlt`).
- Every language page has its own canonical, `hreflang` links to the others (+ `x-default` → `/`), localized
  Open Graph / Twitter tags and its own share image (`/<lang>/opengraph-image/share`, the hero photo with the
  translated headline). The sitemap lists the same hreflang set and the page photos.
- `src/lib/structured-data.ts` outputs a LocalBusiness + WebSite + WebPage graph with the six services.
  Fill in `siteConfig.business` (phone, email, Google Business Profile / social links) as soon as they exist —
  they are left out while empty.
- After changing the copy or photos, check a page with the [Rich Results Test](https://search.google.com/test/rich-results)
  and a share preview (e.g. [opengraph.xyz](https://www.opengraph.xyz)).

## Environment

- `NEXT_PUBLIC_SITE_URL` — public URL used for canonical/OG/sitemap links (defaults to `https://claralimpezas.pt`).
- `GOOGLE_SITE_VERIFICATION` — optional Search Console verification code (adds the `google-site-verification` meta tag).
