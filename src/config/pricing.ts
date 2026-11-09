// Rates behind the indicative price range shown at the end of the quiz (src/lib/funnel/pricing.ts).
//
// ⚠️ STARTING VALUES — typical for Lisbon, not Clara's actual price list. Replace them with the real
// rates before going live. Everything is in euros, VAT included. The range is only a first
// indication for the client: the real price is the quote sent from the CRM.

export const pricing = {
  /**
   * Services billed by time. Estimated hours =
   * base + area × perM2 + bedrooms × perBedroom + bathrooms × perBathroom (never below minHours),
   * then × rate (€ per hour).
   */
  hourly: {
    domestica: { rate: 14, base: 1, perM2: 0.02, perBedroom: 0.35, perBathroom: 0.5, minHours: 2.5 },
    alojamento: { rate: 16, base: 1, perM2: 0.02, perBedroom: 0.5, perBathroom: 0.5, minHours: 2.5 },
    escritorios: { rate: 15, base: 1, perM2: 0.012, perBedroom: 0, perBathroom: 0.4, minHours: 2 },
  },

  /** After-works cleaning: € per m², with a minimum. */
  posobra: { perM2: 4.5, min: 180 },
  /** Glass cleaning: € per window, with a minimum. */
  vidros: { perUnit: 7, min: 60 },
  /** Upholstery: € per piece (sofa, armchair...), with a minimum. */
  estofos: { perUnit: 30, min: 60 },

  /** Extras that add a fixed amount (€). */
  extrasFlat: {
    oven: 15,
    fridge: 12,
    ironing: 20,
    windows: 25,
    balcony: 12,
    laundry: 20,
    mattress: 35,
    carpet: 30,
  },
  /** Extras that add a share of the base price (0.25 = +25 %). */
  extrasPercent: {
    residue: 0.25,
    frames: 0.3,
    height: 0.2,
    stains: 0.15,
  },

  /** Discount per visit for recurring cleanings (0.1 = −10 %). */
  frequencyDiscount: {
    once: 0,
    multi: 0.12,
    weekly: 0.1,
    biweekly: 0.05,
    monthly: 0,
    turnover: 0.05,
  },

  /** The range shown is [price × low, price × high], rounded to `roundTo` euros. */
  range: { low: 0.9, high: 1.2, roundTo: 5 },
} as const;
