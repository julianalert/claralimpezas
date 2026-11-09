# Clara — Limpezas Profissionais em Lisboa

Marketing site and quote funnel for Clara, built with Next.js 16 (App Router, TypeScript, Cache Components),
Supabase (requests, photos) and Resend (e-mails).

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
    [lang]/orcamento/    quote quiz (public, indexed) — served at /orcamento, /en/quote, /fr/devis
    [lang]/pedido/[token]/  a client's private space (never indexed) — /pedido, /en/request, /fr/demande
    [lang]/admin/        the team's CRM, behind a password (never indexed)
    [lang]/opengraph-image.tsx  per-language share image (JPEG, built at build time)
    api/cron/daily/      daily e-mails (quote follow-up, day-before reminder), called by Vercel Cron
    globals.css          all styles (design tokens at the top; the funnel has its own block at the end)
    icon.svg             favicon; apple-icon.png is the same drawing for iOS
    robots.ts, sitemap.ts
  proxy.ts               language routing: browser language / saved choice → `/`, `/en`, `/fr`;
                         translated page addresses; `/admin` → English
  i18n/
    config.ts            locales (pt = main site at `/`, en, fr)
    dictionaries/        marketing-site copy; pt.ts is the source of truth for the shape
    funnel/              quiz, client space and client e-mails; pt.ts is the source of truth
    crm/                 CRM copy; en.ts is the source of truth (the CRM opens in English)
  components/
    layout/              Header (mobile menu), LanguageSwitcher, Footer
    sections/            Hero, TrustBar, Services, WhyClara, HowItWorks, Contact (entry to the quiz), CtaBand
    funnel/              Quiz, client-space widgets, slim header and footer
    crm/                 Login, Crm (pipeline, schedule, automations, activity log), LeadDialog
    icons.tsx            inline SVG icons + Clara spark
  actions/               server actions: quiz.ts (public), client-space.ts (token), admin.ts (password)
  config/pricing.ts      rates behind the indicative estimate — replace with Clara's real prices
  lib/funnel/            shared logic: quiz questions per service, validation, estimate, formatting
  lib/server/            server-only: Supabase access, admin session, e-mails (Resend), automations
supabase/schema.sql      database tables and the photo bucket — run once in the Supabase SQL editor
public/images/           static images (hero: clara-limpezas.jpg, services/<id>.jpg)
```

## Languages

Portuguese is the main site at `/`; English is at `/en` and French at `/fr`.
On `/`, `src/proxy.ts` sends visitors to their browser language (fr → `/fr`, en and other
unsupported languages → `/en`, pt or no language header → stays on `/`). Picking a language in the
footer sets the `NEXT_LOCALE` cookie, which wins over the browser language.
All copy lives in `src/i18n/dictionaries/`. Server components read it with
`getDictionary()`; client components receive the slice they need as props.

## Quote funnel

Every "get a quote" button opens the quiz at `/orcamento` (`/en/quote`, `/fr/devis`); the service
cards add `?service=<id>` so it starts at the second step. The translated addresses are declared in
`funnelSlugs` (`src/lib/funnel/format.ts`) and mapped onto the Portuguese route folders by `src/proxy.ts`.

1. **Quiz** — five steps (service, space, timing, extras, contact). What is asked depends on the service
   (`serviceProfiles` in `src/lib/funnel/quiz.ts`). On submit the request is saved, the client sees an
   indicative price range and gets the link to their space by e-mail; the team is notified.
2. **Client space** — `/pedido/<token>` (`/en/request/<token>`, `/fr/demande/<token>`), no password: the unguessable link is the key. Status, estimate or
   quote (with an "accept" button), preferred date, preparation checklist, photos, messages, history.
3. **CRM** — `/admin`, behind `ADMIN_PASSWORD`. Opens in English; the language switch is in the sidebar.
   Pipeline by status, schedule, automatic e-mails (on/off), activity log. Opening a request lets the team
   set the quote, the cleaning date and the status, write to the client, and see their photos.
   Moving a request to "Quote sent" e-mails the quote; moving it to "Scheduled" e-mails the date.

**The estimate.** `src/config/pricing.ts` holds the rates. They are starting values typical for Lisbon, not
Clara's price list: replace them before going live. The range is only indicative; the price that counts is
the quote entered in the CRM.

**Setting it up.**

1. Create a Supabase project, open *SQL Editor*, paste `supabase/schema.sql` and run it. It creates the
   tables (row level security on, no policies: only the server can read them) and the private photo bucket.
2. Create a Resend API key and verify the sending domain.
3. Copy `.env.example` to `.env.local` and fill it in (same variables on Vercel).
4. `vercel.json` schedules `/api/cron/daily` every morning; it needs `CRON_SECRET` on Vercel.

Without the Supabase keys the quiz answers "temporarily unavailable" and the CRM shows a setup notice;
without the Resend key everything works but no e-mail is sent.

**Privacy.** Client spaces and the CRM carry `noindex`, are disallowed in `robots.txt`, stay out of the
sitemap and send no referrer. Photos live in a private bucket and are shown through one-hour signed links.
Deleting a request in the CRM removes its history and photos.

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

All variables are documented in `.env.example`.

- `NEXT_PUBLIC_SITE_URL` — public URL used for canonical/OG/sitemap links and for the links in e-mails
  (defaults to `https://www.claralimpezas.com`, the address Vercel serves; `http://` and `claralimpezas.com`
  redirect there). If you make the bare domain primary in Vercel, change this too, so canonical links never
  point at a redirect. Use `http://localhost:3000` locally if you want e-mail links to open your local site.
- `GOOGLE_SITE_VERIFICATION` — optional Search Console verification code (adds the `google-site-verification` meta tag).
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — database and photo storage. Server only.
- `RESEND_API_KEY`, `EMAIL_FROM`, `TEAM_EMAIL` — e-mail sending, sender and the team inbox.
- `ADMIN_PASSWORD` — CRM password. Changing it signs everybody out.
- `CRON_SECRET` — protects `/api/cron/daily`.
