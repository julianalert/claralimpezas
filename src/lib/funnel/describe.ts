// Turns quiz answers and timeline events into readable text, in a given language.
import type { Locale } from "@/i18n/config";
import type { FunnelDictionary } from "@/i18n/funnel";
import { fill, formatDateTime, formatDay, formatMoney } from "./format";
import { serviceProfiles } from "./quiz";
import type { LeadEvent, QuizAnswers, Stage } from "./types";

/** "Apartamento · T2 · 80 m² · 1 casa de banho", or "" while nothing is filled in. */
export function describeSpace(answers: QuizAnswers, t: FunnelDictionary): string {
  const parts: string[] = [];
  if (answers.propertyType) parts.push(t.options.propertyType[answers.propertyType]);
  if (answers.bedrooms !== null && t.options.bedrooms[answers.bedrooms]) {
    parts.push(t.options.bedrooms[answers.bedrooms]);
  }
  if (answers.area !== null) parts.push(fill(t.summary.area, { n: answers.area }));
  if (answers.bathrooms !== null) {
    parts.push(
      answers.bathrooms === 1
        ? t.summary.bathroomsOne
        : fill(t.summary.bathroomsOther, { n: answers.bathrooms >= 4 ? "4+" : answers.bathrooms }),
    );
  }
  if (answers.units !== null) {
    parts.push(fill(answers.service === "vidros" ? t.summary.windows : t.summary.pieces, { n: answers.units }));
  }
  return parts.join(" · ");
}

/** "20 de novembro de 2026 · Manhã · datas flexíveis", or "Data a combinar". */
export function describeTiming(answers: QuizAnswers, t: FunnelDictionary, locale: Locale): string {
  const parts = [answers.date ? formatDay(answers.date, locale) : t.summary.noDate];
  if (answers.slot !== "flexible") parts.push(t.options.slot[answers.slot]);
  if (answers.date && answers.flexible) parts.push(t.summary.flexible);
  return parts.join(" · ");
}

export function describeExtras(answers: QuizAnswers, t: FunnelDictionary): string {
  return answers.extras.map((id) => t.options.extras[id]).join(", ");
}

/** Whether the frequency question applies to the chosen service. */
export function hasFrequencyChoice(answers: QuizAnswers): boolean {
  return answers.service !== "" && serviceProfiles[answers.service].frequencies.length > 1;
}

/**
 * One line of the timeline. `stageLabels` lets the CRM use its own wording for the statuses;
 * messages return their text as-is.
 */
export function describeEvent(
  event: LeadEvent,
  t: FunnelDictionary,
  locale: Locale,
  stageLabels: Record<Stage, string> = t.stages,
): string {
  const { meta } = event;
  switch (event.kind) {
    case "message":
      return event.body ?? "";
    case "quote_sent":
      return fill(t.events.quote_sent, {
        amount: typeof meta.amount === "number" ? formatMoney(meta.amount, locale) : "",
      });
    case "scheduled":
      return fill(t.events.scheduled, {
        date: typeof meta.at === "string" ? formatDateTime(meta.at, locale) : "",
      });
    case "preference_changed":
      return fill(t.events.preference_changed, {
        date: typeof meta.date === "string" && meta.date ? formatDay(meta.date, locale) : t.summary.noDate,
      });
    case "stage_changed":
      return fill(t.events.stage_changed, {
        stage: stageLabels[meta.to as Stage] ?? String(meta.to ?? ""),
      });
    case "email_sent":
    case "email_failed": {
      const names: Record<string, string> = t.emailNames;
      const template = String(meta.template ?? "");
      return fill(t.events[event.kind], { template: names[template] ?? template });
    }
    default:
      return t.events[event.kind] ?? event.kind;
  }
}
