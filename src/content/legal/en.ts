import { byEmail, type LegalFacts, type LegalTexts } from ".";

export const legal = (f: LegalFacts): LegalTexts => ({
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: 9 November 2026",
    sections: [
      {
        heading: "Data controller",
        blocks: [
          `${f.identity}, is the controller of the personal data collected through ${f.domain}.`,
        ],
      },
      {
        heading: "What we collect",
        blocks: [
          [
            "What you send us in the quote request: name, mobile number, email, area, type of cleaning, details about the space, preferred dates and anything else you choose to share.",
            "What you add in the personal space of your request: messages, photos of the space and your answer to the quote. That space opens with the personal link we email you; keep it to yourself.",
            "The technical data the site needs to work (for example your IP address and browser type), processed by our hosting provider.",
          ],
          "We do not ask for sensitive data (health, beliefs, etc.). Please do not include any in the details field.",
        ],
      },
      {
        heading: "Why we use it, and on what basis",
        blocks: [
          [
            "To answer your request and prepare a quote: steps taken at your request before a contract (Article 6(1)(b) GDPR).",
            "To provide and invoice the service you book, and meet our legal obligations, including tax (Article 6(1)(b) and (c) GDPR).",
            "To keep the site secure and working: legitimate interest (Article 6(1)(f) GDPR).",
          ],
          "We never sell your data or use it for advertising.",
        ],
      },
      {
        heading: "How long we keep it",
        blocks: [
          "Quote requests that do not lead to a booking are deleted within 12 months at most. Customer data is kept for as long as we work together, then for the period the law requires for invoicing and accounting records.",
        ],
      },
      {
        heading: "Who we share it with",
        blocks: [
          "Only the providers that help us run the site and the service (hosting, email, customer management), acting on our behalf under a contract, and the authorities where the law requires it.",
          "If one of these providers processes data outside the European Economic Area, the transfer relies on the safeguards set by the GDPR, such as the European Commission's standard contractual clauses.",
        ],
      },
      {
        heading: "Cookies",
        blocks: [
          "The site uses a single technical cookie, NEXT_LOCALE, which remembers the language you picked for 12 months. We use no analytics or advertising cookies.",
          "The “Open in Google Maps” link takes you to Google, which applies its own privacy policy.",
        ],
      },
      {
        heading: "Your rights",
        blocks: [
          "You can ask at any time to access, correct, erase, restrict or port your data, and object to its processing.",
          byEmail(
            f,
            (email) => `Just write to us at ${email}.`,
            "Just write to us at the address above.",
          ),
          "If you believe your data is not handled properly, you can complain to the Portuguese data protection authority (CNPD) at www.cnpd.pt.",
        ],
      },
      {
        heading: "Changes",
        blocks: [
          "We may update this policy. The version in force is always the one published on this site, with its last-updated date.",
        ],
      },
    ],
  },

  terms: {
    title: "Terms and Conditions",
    updated: "Last updated: 6 November 2026",
    sections: [
      {
        heading: "Who we are",
        blocks: [
          `${f.domain} and the Clara services are run by ${f.identity}. By using the site or requesting a quote, you accept these terms.`,
        ],
      },
      {
        heading: "Services",
        blocks: [
          "Clara provides cleaning services to individuals and businesses in Lisbon and nearby: home, office, post-renovation, window, upholstery and holiday-rental cleaning, one-off or regular. Descriptions on the site are for guidance.",
        ],
      },
      {
        heading: "Quotes",
        blocks: [
          "Quote requests are free and carry no obligation. The estimate shown on the site at the end of the questionnaire is indicative and is not a quote. Each quote sets out the service, price, date and applicable conditions, and binds both parties only once you accept it and Clara confirms it.",
          "Where the accepted quote differs from these terms, the quote prevails.",
        ],
      },
      {
        heading: "Booking and access",
        blocks: [
          "We agree with you on the date, time and how we access the space. Let us know about anything specific before we come: delicate materials, pets, areas to avoid.",
        ],
      },
      {
        heading: "Changes and cancellations",
        blocks: [
          "You can change or cancel a booking by contacting us as early as possible. Any cancellation deadlines or fees are those stated in the quote.",
        ],
      },
      {
        heading: "Prices and payment",
        blocks: [
          "Prices are those of the accepted quote and include VAT at the applicable rate unless stated otherwise. The payment method and due date appear on the quote and the invoice.",
        ],
      },
      {
        heading: "Quality and liability",
        blocks: [
          "We carry out every job with care. If you notice a problem, tell us as soon as possible after the visit so we can put it right.",
          "Clara is not liable for damage caused by incorrect or missing information from the customer, or for existing wear of materials, without prejudice to consumers' statutory rights.",
        ],
      },
      {
        heading: "Use of the site",
        blocks: [
          "The texts, images and Clara brand are protected and may not be reused without permission. We try to keep the site up to date, but it may contain inaccuracies.",
        ],
      },
      {
        heading: "Complaints and disputes",
        blocks: [
          "You can file a complaint in the electronic Complaints Book at www.livroreclamacoes.pt.",
          "For a consumer dispute, you can turn to an alternative dispute resolution body such as the Lisbon Consumer Arbitration Centre (www.centroarbitragemlisboa.pt). More information on the Consumer Portal at www.consumidor.gov.pt.",
        ],
      },
      {
        heading: "Governing law",
        blocks: ["These terms are governed by Portuguese law."],
      },
    ],
  },
});
