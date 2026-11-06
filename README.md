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
    [lang]/layout.tsx    root layout: <html lang>, fonts, SEO metadata
    [lang]/page.tsx      home page — composes the sections below
    globals.css          all styles (design tokens at the top)
    icon.svg             favicon
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
  lib/                   services list, quote validation (shared client/server)
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

## Environment

- `NEXT_PUBLIC_SITE_URL` — public URL used for canonical/OG/sitemap links (defaults to `https://claralimpezas.pt`).
