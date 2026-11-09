// Indicative price range shown after the quiz. Rates live in src/config/pricing.ts.
import { pricing } from "@/config/pricing";
import type { Estimate, QuizAnswers } from "./types";

const flat: Partial<Record<string, number>> = pricing.extrasFlat;
const percent: Partial<Record<string, number>> = pricing.extrasPercent;

function basePrice(answers: QuizAnswers): number | null {
  const { service, area, bedrooms, bathrooms, units } = answers;
  switch (service) {
    case "domestica":
    case "alojamento":
    case "escritorios": {
      if (area === null) return null;
      const p = pricing.hourly[service];
      const hours =
        p.base + area * p.perM2 + (bedrooms ?? 0) * p.perBedroom + (bathrooms ?? 0) * p.perBathroom;
      return Math.max(hours, p.minHours) * p.rate;
    }
    case "posobra":
      return area === null ? null : Math.max(area * pricing.posobra.perM2, pricing.posobra.min);
    case "vidros":
    case "estofos":
      return units === null ? null : Math.max(units * pricing[service].perUnit, pricing[service].min);
    default:
      return null;
  }
}

/** `null` when the answers don't allow an estimate yet. */
export function estimate(answers: QuizAnswers): Estimate | null {
  const base = basePrice(answers);
  if (base === null) return null;

  let price = base;
  for (const extra of answers.extras) {
    price += flat[extra] ?? 0;
    price += base * (percent[extra] ?? 0);
  }
  price *= 1 - pricing.frequencyDiscount[answers.frequency];

  const { low, high, roundTo } = pricing.range;
  const round = (value: number) => Math.max(roundTo, Math.round(value / roundTo) * roundTo);
  return {
    low: round(price * low),
    high: round(price * high),
    per: answers.frequency === "once" ? "job" : "visit",
  };
}
