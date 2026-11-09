"use server";

import { refresh } from "next/cache";
import { after } from "next/server";
import { fromLisbonInput } from "@/lib/funnel/format";
import { limits } from "@/lib/funnel/quiz";
import {
  automationIds,
  isStage,
  type AutomationId,
  type LeadEvent,
  type LeadPhoto,
  type Stage,
} from "@/lib/funnel/types";
import { runDailyJob, sendQuote, sendScheduled, sendTeamMessage } from "@/lib/server/automations";
import { isEmailConfigured } from "@/lib/server/email";
import {
  addEvent,
  deleteLead,
  getAutomations,
  getLeadById,
  listEvents,
  listPhotos,
  saveAutomations,
  updateLead,
  type LeadPatch,
} from "@/lib/server/leads";
import {
  endAdminSession,
  isAdminConfigured,
  isPasswordValid,
  requireAdmin,
  startAdminSession,
} from "@/lib/server/session";

// CRM actions. Each one starts with `requireAdmin()`: the login screen only hides the interface,
// these checks are what protects the data.

export type LoginState = { error: "password" | "config" } | null;

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAdminConfigured()) return { error: "config" };
  if (!isPasswordValid(String(formData.get("password") ?? ""))) {
    // Slows down password guessing.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: "password" };
  }
  await startAdminSession();
  refresh();
  return null;
}

export async function logout(): Promise<void> {
  await endAdminSession();
  refresh();
}

export type SaveLeadInput = {
  stage: Stage;
  /** "" = no quote yet. */
  quoteAmount: string;
  quoteNote: string;
  /** `datetime-local` value in Lisbon time; "" = not scheduled. */
  scheduledAt: string;
  notes: string;
};
export type SaveLeadResult = { ok: true; emailed: boolean } | { ok: false; error: "amount" | "date" | "generic" };

/**
 * Saves the CRM form of a request. Moving it to "quote sent" or "scheduled" (or changing the
 * amount / the date while it is there) is what sends the quote or the appointment to the client.
 */
export async function saveLead(id: string, input: SaveLeadInput): Promise<SaveLeadResult> {
  await requireAdmin();
  try {
    const lead = await getLeadById(id);
    if (!lead || !isStage(input.stage)) return { ok: false, error: "generic" };

    const amountText = String(input.quoteAmount ?? "").replace(",", ".").trim();
    const amount = amountText === "" ? null : Math.round(Number(amountText) * 100) / 100;
    if (amount !== null && !(amount > 0 && amount < 100000)) return { ok: false, error: "amount" };
    const scheduledAt = input.scheduledAt ? fromLisbonInput(String(input.scheduledAt)) : null;
    if (input.scheduledAt && !scheduledAt) return { ok: false, error: "date" };
    const quoteNote = String(input.quoteNote ?? "").trim().slice(0, limits.details) || null;
    const { stage } = input;

    if (stage === "quoted" && amount === null) return { ok: false, error: "amount" };
    if (stage === "scheduled" && !scheduledAt) return { ok: false, error: "date" };

    const now = new Date().toISOString();
    const patch: LeadPatch = {
      stage,
      quote_amount: amount,
      quote_note: quoteNote,
      scheduled_at: scheduledAt,
      notes: String(input.notes ?? "").slice(0, 4000),
    };
    const moved = stage !== lead.stage;
    const quoteChanged = amount !== lead.quoteAmount || quoteNote !== lead.quoteNote;
    const dateChanged =
      (scheduledAt ? new Date(scheduledAt).getTime() : null) !==
      (lead.scheduledAt ? new Date(lead.scheduledAt).getTime() : null);

    const sendsQuote = stage === "quoted" && (moved || quoteChanged);
    const sendsDate = stage === "scheduled" && (moved || dateChanged);
    if (sendsQuote) Object.assign(patch, { quote_sent_at: now, quote_followup_sent_at: null });
    if (sendsDate || dateChanged) patch.reminder_sent_at = null;
    if (moved && stage === "accepted" && !lead.quoteAcceptedAt) patch.quote_accepted_at = now;

    const updated = await updateLead(id, patch);

    if (sendsQuote) {
      await addEvent(id, { kind: "quote_sent", actor: "team", meta: { amount } });
    } else if (sendsDate) {
      await addEvent(id, { kind: "scheduled", actor: "team", meta: { at: scheduledAt } });
    } else if (moved) {
      if (stage === "accepted") await addEvent(id, { kind: "quote_accepted", actor: "team" });
      else if (stage === "done") await addEvent(id, { kind: "completed", actor: "team" });
      else if (stage === "lost") await addEvent(id, { kind: "closed", actor: "team" });
      else await addEvent(id, { kind: "stage_changed", actor: "team", meta: { to: stage }, clientVisible: false });
    }

    if (sendsQuote) after(() => sendQuote(updated));
    if (sendsDate) after(() => sendScheduled(updated));
    // Tell the team whether an e-mail really goes out (sending set up, automation switched on).
    const automations = (sendsQuote || sendsDate) && isEmailConfigured() ? await getAutomations() : null;
    const emailed = Boolean(automations && ((sendsQuote && automations.quote) || (sendsDate && automations.scheduled)));
    refresh();
    return { ok: true, emailed };
  } catch (error) {
    console.error("saveLead:", error);
    return { ok: false, error: "generic" };
  }
}

/** Posts a message in the client's space and e-mails it to them. */
export async function sendMessageToClient(id: string, message: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    const lead = await getLeadById(id);
    const body = String(message ?? "").trim().slice(0, limits.details);
    if (!lead || !body) return { ok: false };
    await addEvent(id, { kind: "message", actor: "team", body });
    after(() => sendTeamMessage(lead, body));
    refresh();
    return { ok: true };
  } catch (error) {
    console.error("sendMessageToClient:", error);
    return { ok: false };
  }
}

/** Timeline and photos of one request, loaded when its card is opened. */
export async function getLeadDetail(id: string): Promise<{ events: LeadEvent[]; photos: LeadPhoto[] } | null> {
  await requireAdmin();
  try {
    const lead = await getLeadById(id);
    if (!lead) return null;
    const [events, photos] = await Promise.all([listEvents(id, { limit: 60 }), listPhotos(id)]);
    return { events, photos };
  } catch (error) {
    console.error("getLeadDetail:", error);
    return null;
  }
}

export async function removeLead(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await deleteLead(id);
    refresh();
    return { ok: true };
  } catch (error) {
    console.error("removeLead:", error);
    return { ok: false };
  }
}

export async function setAutomation(id: AutomationId, on: boolean): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    if (!automationIds.includes(id)) return { ok: false };
    await saveAutomations({ ...(await getAutomations()), [id]: on === true });
    refresh();
    return { ok: true };
  } catch (error) {
    console.error("setAutomation:", error);
    return { ok: false };
  }
}

/** Runs the daily e-mails (quote follow-ups, day-before reminders) right now. */
export async function runDailyJobNow(): Promise<{ ok: boolean; sent: number }> {
  await requireAdmin();
  try {
    const { followups, reminders } = await runDailyJob();
    refresh();
    return { ok: true, sent: followups + reminders };
  } catch (error) {
    console.error("runDailyJobNow:", error);
    return { ok: false, sent: 0 };
  }
}
