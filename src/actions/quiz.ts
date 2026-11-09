"use server";

import { after } from "next/server";
import { hasLocale } from "@/i18n/config";
import { estimate } from "@/lib/funnel/pricing";
import { firstInvalid, sanitizeAnswers, sanitizeContact, type InvalidField, type QuizStep } from "@/lib/funnel/quiz";
import type { Estimate } from "@/lib/funnel/types";
import { notifyTeamOfRequest, sendConfirmation } from "@/lib/server/automations";
import { addEvent, createLead } from "@/lib/server/leads";
import { isDatabaseConfigured } from "@/lib/server/supabase";

export type SubmitQuizResult =
  | { status: "success"; ref: string; token: string; estimate: Estimate | null }
  | { status: "invalid"; step: QuizStep; field: InvalidField }
  | { status: "unavailable" }
  | { status: "error" };

/** Saves a completed quiz as a new request and e-mails the client and the team. */
export async function submitQuiz(input: {
  locale: string;
  answers: unknown;
  contact: unknown;
  consent: boolean;
  /** Honeypot: hidden from people, so only bots fill it in. */
  website?: string;
}): Promise<SubmitQuizResult> {
  if (input.website) return { status: "error" };
  if (!isDatabaseConfigured()) return { status: "unavailable" };

  const locale = hasLocale(input.locale) ? input.locale : "pt";
  const answers = sanitizeAnswers(input.answers);
  const contact = sanitizeContact(input.contact);
  const invalid = firstInvalid(answers, contact, input.consent === true);
  if (invalid) return { status: "invalid", ...invalid };

  try {
    const price = estimate(answers);
    const lead = await createLead({ locale, contact, answers, estimate: price });
    await addEvent(lead.id, { kind: "created", actor: "client" });
    // E-mails go out after the response, so the client sees the result straight away.
    after(async () => {
      await sendConfirmation(lead);
      await notifyTeamOfRequest(lead);
    });
    return { status: "success", ref: lead.ref, token: lead.token, estimate: price };
  } catch (error) {
    console.error("submitQuiz:", error);
    return { status: "error" };
  }
}
