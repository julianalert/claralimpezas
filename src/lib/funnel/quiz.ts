// What the quiz asks for each service, and the validation shared by the browser and the server.
import { isServiceId, type ServiceId } from "@/lib/services";
import {
  extraIds,
  frequencies,
  propertyTypes,
  slots,
  type Contact,
  type ExtraId,
  type Frequency,
  type PropertyType,
  type QuizAnswers,
} from "./types";

export type SpaceField = "area" | "bedrooms" | "bathrooms" | "units";

type ServiceProfile = {
  /** Property types offered; empty = the question is skipped. */
  propertyTypes: readonly PropertyType[];
  /** Numbers asked about the space. */
  fields: readonly SpaceField[];
  /** Frequencies offered; a single one = the question is skipped. */
  frequencies: readonly Frequency[];
  extras: readonly ExtraId[];
};

export const serviceProfiles: Record<ServiceId, ServiceProfile> = {
  domestica: {
    propertyTypes: ["apartment", "house"],
    fields: ["area", "bedrooms", "bathrooms"],
    frequencies: ["once", "weekly", "biweekly", "monthly"],
    extras: ["oven", "fridge", "ironing", "windows", "balcony"],
  },
  escritorios: {
    propertyTypes: ["office", "shop"],
    fields: ["area", "bathrooms"],
    frequencies: ["once", "multi", "weekly", "biweekly", "monthly"],
    extras: ["windows", "fridge"],
  },
  posobra: {
    propertyTypes: ["apartment", "house", "office", "shop"],
    fields: ["area", "bathrooms"],
    frequencies: ["once"],
    extras: ["residue", "windows", "balcony"],
  },
  vidros: {
    propertyTypes: ["apartment", "house", "office", "shop"],
    fields: ["units"],
    frequencies: ["once", "monthly"],
    extras: ["frames", "height"],
  },
  estofos: {
    propertyTypes: [],
    fields: ["units"],
    frequencies: ["once"],
    extras: ["mattress", "carpet", "stains"],
  },
  alojamento: {
    propertyTypes: ["apartment", "house"],
    fields: ["area", "bedrooms", "bathrooms"],
    frequencies: ["once", "turnover"],
    extras: ["laundry", "oven", "fridge", "balcony"],
  },
};

export const quizSteps = ["service", "space", "timing", "extras", "contact"] as const;
export type QuizStep = (typeof quizSteps)[number];

export const limits = {
  area: { min: 10, max: 5000 },
  units: { min: 1, max: 200 },
  bedrooms: { min: 0, max: 5 },
  bathrooms: { min: 1, max: 4 },
  details: 1500,
  name: 100,
  email: 160,
  phone: 25,
  zone: 120,
} as const;

export const emptyAnswers: QuizAnswers = {
  service: "",
  propertyType: "",
  area: null,
  bedrooms: null,
  bathrooms: null,
  units: null,
  frequency: "once",
  date: "",
  slot: "flexible",
  flexible: true,
  extras: [],
  details: "",
};

export const emptyContact: Contact = { name: "", email: "", phone: "", zone: "" };

/** Answers for a newly picked service: keeps what still applies, resets the rest. */
export function withService(answers: QuizAnswers, service: ServiceId): QuizAnswers {
  if (answers.service === service) return answers;
  const profile = serviceProfiles[service];
  return {
    ...answers,
    service,
    propertyType: profile.propertyTypes.includes(answers.propertyType as PropertyType)
      ? answers.propertyType
      : "",
    area: profile.fields.includes("area") ? answers.area : null,
    bedrooms: profile.fields.includes("bedrooms") ? answers.bedrooms : null,
    bathrooms: profile.fields.includes("bathrooms") ? answers.bathrooms : null,
    units: profile.fields.includes("units") ? answers.units : null,
    frequency: profile.frequencies.includes(answers.frequency) ? answers.frequency : profile.frequencies[0],
    extras: answers.extras.filter((extra) => profile.extras.includes(extra)),
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function inRange(value: number | null, { min, max }: { min: number; max: number }) {
  return value !== null && Number.isFinite(value) && value >= min && value <= max;
}

/** Today's date in Lisbon, `yyyy-mm-dd`. */
export function todayInLisbon(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(now);
}

export type InvalidField = keyof QuizAnswers | keyof Contact | "consent";

/** Fields of one step that still need an answer (empty = the step is complete). */
export function invalidFields(
  step: QuizStep,
  answers: QuizAnswers,
  contact: Contact,
  consent: boolean,
): InvalidField[] {
  const invalid: InvalidField[] = [];
  if (!isServiceId(answers.service)) return step === "service" ? ["service"] : [];
  const profile = serviceProfiles[answers.service];

  if (step === "space") {
    if (profile.propertyTypes.length > 0 && !profile.propertyTypes.includes(answers.propertyType as PropertyType)) {
      invalid.push("propertyType");
    }
    for (const field of profile.fields) {
      if (!inRange(answers[field], limits[field])) invalid.push(field);
    }
  }
  if (step === "timing") {
    if (!profile.frequencies.includes(answers.frequency)) invalid.push("frequency");
    if (answers.date && (!DATE_RE.test(answers.date) || answers.date < todayInLisbon())) invalid.push("date");
  }
  if (step === "contact") {
    if (contact.name.trim().length < 2) invalid.push("name");
    if (!EMAIL_RE.test(contact.email.trim())) invalid.push("email");
    if (contact.phone.replace(/\D/g, "").length < 8) invalid.push("phone");
    if (contact.zone.trim().length < 2) invalid.push("zone");
    if (!consent) invalid.push("consent");
  }
  return invalid;
}

const clip = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
const toNumber = (value: unknown) => {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? Math.round(n) : null;
};

/**
 * Rebuilds answers from untrusted input (the server action's argument): unknown keys are dropped,
 * values are coerced, and anything the chosen service doesn't ask for is cleared.
 */
export function sanitizeAnswers(input: unknown): QuizAnswers {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const service = typeof raw.service === "string" && isServiceId(raw.service) ? raw.service : "";
  const base: QuizAnswers = {
    service: "",
    propertyType: (propertyTypes as readonly unknown[]).includes(raw.propertyType)
      ? (raw.propertyType as PropertyType)
      : "",
    area: toNumber(raw.area),
    bedrooms: toNumber(raw.bedrooms),
    bathrooms: toNumber(raw.bathrooms),
    units: toNumber(raw.units),
    frequency: (frequencies as readonly unknown[]).includes(raw.frequency)
      ? (raw.frequency as Frequency)
      : "once",
    date: typeof raw.date === "string" && DATE_RE.test(raw.date) ? raw.date : "",
    slot: (slots as readonly unknown[]).includes(raw.slot) ? (raw.slot as QuizAnswers["slot"]) : "flexible",
    flexible: raw.flexible === true,
    extras: Array.isArray(raw.extras)
      ? extraIds.filter((id) => (raw.extras as unknown[]).includes(id))
      : [],
    details: clip(raw.details, limits.details),
  };
  return service ? withService(base, service) : base;
}

export function sanitizeContact(input: unknown): Contact {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  return {
    name: clip(raw.name, limits.name),
    email: clip(raw.email, limits.email).toLowerCase(),
    phone: clip(raw.phone, limits.phone),
    zone: clip(raw.zone, limits.zone),
  };
}

/** First invalid field across the whole quiz, or `null` when the request can be saved. */
export function firstInvalid(answers: QuizAnswers, contact: Contact, consent: boolean) {
  for (const step of quizSteps) {
    const invalid = invalidFields(step, answers, contact, consent);
    if (invalid.length > 0) return { step, field: invalid[0] };
  }
  return null;
}
