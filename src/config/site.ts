export const siteConfig = {
  name: "Clara",
  /** Longer brand name, used as `alternateName` in structured data so Google can tell "Clara" apart. */
  alternateName: "Clara Limpezas",
  /** Shown to people (footer, share image). */
  domain: "claralimpezas.com",
  /**
   * Canonical origin for canonical/hreflang/OG/sitemap URLs. Must be the address the site is
   * actually served from: Vercel redirects http:// and the bare domain to https://www.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.claralimpezas.com",
  complaintsBookUrl: "https://www.livroreclamacoes.pt",

  /** Browser UI colour on mobile — matches the sticky header (`--pine-deep`). */
  themeColor: "#052f29",

  /** Google Search Console HTML-tag verification code (optional; DNS verification works too). */
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION,

  /**
   * Business details for the LocalBusiness structured data (src/lib/structured-data.ts).
   * Leave a field empty until it is real — empty fields are simply left out.
   * A phone number and a Google Business Profile link (in `sameAs`) matter most for local search.
   */
  business: {
    telephone: "", // e.g. "+351 912 345 678"
    email: "", // e.g. "ola@claralimpezas.com"
    /** Public profiles: Google Business Profile, Instagram, Facebook, LinkedIn... */
    sameAs: [
      // Google Business Profile "Clara Limpezas" (Maps CID; Knowledge Graph id /g/11p2mm3p9t)
      "https://maps.google.com/?cid=16552928241076728217",
    ],
    /** Spoken with customers (BCP 47). Matches the "Portuguese & English" promise on the site. */
    languages: ["pt-PT", "en"],
    /** "Lisboa e arredores". */
    areaServed: [
      { "@type": "City", name: "Lisboa" },
      { "@type": "AdministrativeArea", name: "Área Metropolitana de Lisboa" },
    ],
  },
};
