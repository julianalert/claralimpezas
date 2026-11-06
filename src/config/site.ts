/** Google Maps listing (Google Business Profile). */
const mapUrl = "https://maps.google.com/?cid=16552928241076728217";

export const siteConfig = {
  /** Short brand used in the interface (logo, footer, title suffix). */
  name: "Clara",
  /**
   * The business name exactly as on the Google Business Profile. Used as the business and site
   * name in structured data and link previews — keep the two identical.
   */
  businessName: "Clara Limpezas",
  /** Shown to people (footer, share image). */
  domain: "claralimpezas.com",
  /**
   * Canonical origin for canonical/hreflang/OG/sitemap URLs. Must be the address the site is
   * actually served from: Vercel redirects http:// and the bare domain to https://www.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.claralimpezas.com",
  complaintsBookUrl: "https://www.livroreclamacoes.pt",

  /**
   * Quoted in the privacy policy and terms (src/content/legal, footer modals), with the address and
   * e-mail from `business` below. Use the legal name and NIF exactly as registered; an empty field
   * is left out of the texts. Set `reviewed` to true once the texts have been checked: it removes the
   * "provisional version" notice.
   */
  legal: {
    entityName: "Clara Limpezas",
    nif: "", // e.g. "123456789"
    reviewed: false,
  },

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
    /** Same as the Google Business Profile, shown in the contact section. */
    address: {
      streetAddress: "Rua Frei Manuel Cardoso 31",
      postalCode: "1700-023",
      addressLocality: "Lisboa",
      addressCountry: "PT",
    },
    /** Pin position of the Google Maps listing. */
    geo: { latitude: 38.750256, longitude: -9.1353831 },
    /** Keep in sync with the Google Business Profile and `contact.points.hours` in the dictionaries. */
    openingHours: [
      {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "21:00",
      },
    ],
    mapUrl,
    /** Public profiles: Google Business Profile, Instagram, Facebook, LinkedIn... */
    sameAs: [
      // Google Business Profile "Clara Limpezas" (Maps CID; Knowledge Graph id /g/11p2mm3p9t)
      mapUrl,
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
