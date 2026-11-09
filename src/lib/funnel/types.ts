// Shapes shared by the quiz, the client space, the CRM and the server code.
import type { Locale } from "@/i18n/config";
import type { ServiceId } from "@/lib/services";

/** Where a request stands. `lost` = closed without a cleaning. */
export const stages = ["new", "quoted", "accepted", "scheduled", "done", "lost"] as const;
export type Stage = (typeof stages)[number];

/** The steps a request normally goes through, in order (CRM columns, client timeline). */
export const pipelineStages = ["new", "quoted", "accepted", "scheduled", "done"] as const;

export function isStage(value: unknown): value is Stage {
  return (stages as readonly unknown[]).includes(value);
}

export const propertyTypes = ["apartment", "house", "office", "shop"] as const;
export type PropertyType = (typeof propertyTypes)[number];

export const frequencies = ["once", "multi", "weekly", "biweekly", "monthly", "turnover"] as const;
export type Frequency = (typeof frequencies)[number];

export const slots = ["morning", "afternoon", "flexible"] as const;
export type Slot = (typeof slots)[number];

export const extraIds = [
  "oven",
  "fridge",
  "ironing",
  "windows",
  "balcony",
  "laundry",
  "residue",
  "frames",
  "height",
  "mattress",
  "carpet",
  "stains",
] as const;
export type ExtraId = (typeof extraIds)[number];

/** Answers to the quiz. Fields a service doesn't ask for stay `null` / empty. */
export type QuizAnswers = {
  service: ServiceId | "";
  propertyType: PropertyType | "";
  /** Surface in m². */
  area: number | null;
  /** 0 = studio … 5 = five or more. */
  bedrooms: number | null;
  /** 1 … 4 (four or more). */
  bathrooms: number | null;
  /** Windows (glass cleaning) or pieces (upholstery). */
  units: number | null;
  frequency: Frequency;
  /** Preferred date, `yyyy-mm-dd`; "" = no preference yet. */
  date: string;
  slot: Slot;
  /** "My dates are flexible". */
  flexible: boolean;
  extras: ExtraId[];
  details: string;
};

export type Contact = {
  name: string;
  email: string;
  phone: string;
  zone: string;
};

/** Indicative price range in euros. `per` says whether it is for each visit or for the whole job. */
export type Estimate = { low: number; high: number; per: "visit" | "job" };

export const checklistIds = ["access", "valuables", "priorities", "pets", "products"] as const;
export type ChecklistId = (typeof checklistIds)[number];

export const eventKinds = [
  "created",
  "quote_sent",
  "quote_accepted",
  "scheduled",
  "completed",
  "closed",
  "stage_changed",
  "message",
  "preference_changed",
  "photo_added",
  "email_sent",
  "email_failed",
] as const;
export type EventKind = (typeof eventKinds)[number];

export type Actor = "client" | "team" | "system";

export type LeadEvent = {
  id: string;
  leadId: string;
  createdAt: string;
  kind: EventKind;
  actor: Actor;
  body: string | null;
  meta: Record<string, string | number | null>;
  clientVisible: boolean;
};

export type LeadPhoto = {
  id: string;
  name: string;
  /** Short-lived signed URL. */
  url: string;
};

/** A request as the server code and the CRM see it. */
export type Lead = {
  id: string;
  ref: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  locale: Locale;
  stage: Stage;
  name: string;
  email: string;
  phone: string;
  zone: string;
  service: ServiceId;
  answers: QuizAnswers;
  estimate: Estimate | null;
  quoteAmount: number | null;
  quoteNote: string | null;
  quoteSentAt: string | null;
  quoteAcceptedAt: string | null;
  scheduledAt: string | null;
  notes: string;
  checklist: ChecklistId[];
};

/** The automatic e-mails that can be switched on and off in the CRM. */
export const automationIds = [
  "confirmation",
  "quote",
  "quoteFollowup",
  "scheduled",
  "reminder",
  "team",
] as const;
export type AutomationId = (typeof automationIds)[number];
export type AutomationSettings = Record<AutomationId, boolean>;

export const defaultAutomations: AutomationSettings = {
  confirmation: true,
  quote: true,
  quoteFollowup: true,
  scheduled: true,
  reminder: true,
  team: true,
};
