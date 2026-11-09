"use server";

import { refresh } from "next/cache";
import { after } from "next/server";
import { limits, todayInLisbon } from "@/lib/funnel/quiz";
import { checklistIds, slots, type ChecklistId, type Lead, type Slot } from "@/lib/funnel/types";
import { notifyTeamOfAcceptance, notifyTeamOfMessage } from "@/lib/server/automations";
import {
  addEvent,
  countPhotos,
  createPhotoUpload,
  getLeadByToken,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  PHOTO_TYPES,
  registerPhoto,
  removePhoto,
  updateLead,
} from "@/lib/server/leads";

// Everything a client can do in their space. The secret token in the URL is the only credential:
// each action looks the request up by token and never trusts an id sent by the browser.

type Result = { ok: true } | { ok: false };
const fail: Result = { ok: false };

/** Runs `action` on the request behind `token`; any failure becomes `{ ok: false }`. */
async function withLead(token: string, action: (lead: Lead) => Promise<Result>): Promise<Result> {
  try {
    const lead = typeof token === "string" ? await getLeadByToken(token) : null;
    if (!lead) return fail;
    return await action(lead);
  } catch (error) {
    console.error("client-space:", error);
    return fail;
  }
}

export async function acceptQuote(token: string): Promise<Result> {
  return withLead(token, async (lead) => {
    if (lead.stage !== "quoted") return fail;
    const updated = await updateLead(lead.id, {
      stage: "accepted",
      quote_accepted_at: new Date().toISOString(),
    });
    await addEvent(lead.id, { kind: "quote_accepted", actor: "client" });
    after(() => notifyTeamOfAcceptance(updated));
    refresh();
    return { ok: true };
  });
}

export async function sendClientMessage(token: string, message: string): Promise<Result> {
  return withLead(token, async (lead) => {
    const body = String(message ?? "").trim().slice(0, limits.details);
    if (!body) return fail;
    await addEvent(lead.id, { kind: "message", actor: "client", body });
    after(() => notifyTeamOfMessage(lead, body));
    refresh();
    return { ok: true };
  });
}

export async function setChecklistItem(token: string, id: ChecklistId, checked: boolean): Promise<Result> {
  return withLead(token, async (lead) => {
    if (!checklistIds.includes(id)) return fail;
    const checklist = checklistIds.filter((item) => (item === id ? checked : lead.checklist.includes(item)));
    await updateLead(lead.id, { checklist });
    return { ok: true };
  });
}

/** The client's preferred date; only while the cleaning isn't scheduled yet. */
export async function updatePreference(
  token: string,
  preference: { date: string; slot: Slot; flexible: boolean },
): Promise<Result> {
  return withLead(token, async (lead) => {
    if (!["new", "quoted", "accepted"].includes(lead.stage)) return fail;
    const date = String(preference.date ?? "");
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayInLisbon())) return fail;
    if (!slots.includes(preference.slot)) return fail;
    await updateLead(lead.id, {
      answers: { ...lead.answers, date, slot: preference.slot, flexible: preference.flexible === true },
    });
    await addEvent(lead.id, { kind: "preference_changed", actor: "client", meta: { date } });
    refresh();
    return { ok: true };
  });
}

export type PhotoUploadTicket =
  | { ok: true; url: string; path: string }
  | { ok: false; reason: "type" | "max" | "error" };

/** Step 1 of a photo upload: returns a one-off URL the browser sends the file to. */
export async function requestPhotoUpload(
  token: string,
  file: { type: string; size: number },
): Promise<PhotoUploadTicket> {
  try {
    const lead = typeof token === "string" ? await getLeadByToken(token) : null;
    if (!lead) return { ok: false, reason: "error" };
    if (!PHOTO_TYPES[file?.type] || !(file.size > 0 && file.size <= MAX_PHOTO_BYTES)) {
      return { ok: false, reason: "type" };
    }
    if ((await countPhotos(lead.id)) >= MAX_PHOTOS) return { ok: false, reason: "max" };
    return { ok: true, ...(await createPhotoUpload(lead.id, file.type)) };
  } catch (error) {
    console.error("requestPhotoUpload:", error);
    return { ok: false, reason: "error" };
  }
}

/** Step 2: the file is in the bucket; attach it to the request. */
export async function confirmPhotoUpload(token: string, path: string, name: string): Promise<Result> {
  return withLead(token, async (lead) => {
    if ((await countPhotos(lead.id)) >= MAX_PHOTOS) return fail;
    if (!(await registerPhoto(lead.id, String(path), String(name ?? "photo")))) return fail;
    await addEvent(lead.id, { kind: "photo_added", actor: "client" });
    refresh();
    return { ok: true };
  });
}

export async function deletePhoto(token: string, photoId: string): Promise<Result> {
  return withLead(token, async (lead) => {
    await removePhoto(lead.id, String(photoId));
    refresh();
    return { ok: true };
  });
}
