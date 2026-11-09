import "server-only";
import { randomBytes, randomInt } from "node:crypto";
import { hasLocale, type Locale } from "@/i18n/config";
import { sanitizeAnswers } from "@/lib/funnel/quiz";
import {
  checklistIds,
  defaultAutomations,
  isStage,
  automationIds,
  type Actor,
  type AutomationSettings,
  type ChecklistId,
  type Contact,
  type Estimate,
  type EventKind,
  type Lead,
  type LeadEvent,
  type LeadPhoto,
  type QuizAnswers,
  type Stage,
} from "@/lib/funnel/types";
import { isServiceId, type ServiceId } from "@/lib/services";
import { db, PHOTO_BUCKET } from "./supabase";

// Data access for requests ("leads"), their timeline and their photos. Callers are responsible for
// authorisation: the client-space functions take the secret token, the CRM ones run after
// `requireAdmin()` (src/lib/server/session.ts).

type LeadRow = {
  id: string;
  ref: string;
  token: string;
  created_at: string;
  updated_at: string;
  locale: string;
  stage: string;
  name: string;
  email: string;
  phone: string;
  zone: string;
  service: string;
  answers: unknown;
  estimate_low: number | null;
  estimate_high: number | null;
  quote_amount: number | string | null;
  quote_note: string | null;
  quote_sent_at: string | null;
  quote_accepted_at: string | null;
  scheduled_at: string | null;
  notes: string;
  checklist: unknown;
};

type EventRow = {
  id: string;
  lead_id: string;
  created_at: string;
  kind: string;
  actor: string;
  body: string | null;
  meta: Record<string, string | number | null> | null;
  client_visible: boolean;
};

const LEAD_COLUMNS =
  "id, ref, token, created_at, updated_at, locale, stage, name, email, phone, zone, service, answers, " +
  "estimate_low, estimate_high, quote_amount, quote_note, quote_sent_at, quote_accepted_at, scheduled_at, " +
  "notes, checklist";

function toLead(row: LeadRow): Lead {
  const answers = sanitizeAnswers(row.answers);
  const estimate: Estimate | null =
    row.estimate_low !== null && row.estimate_high !== null
      ? { low: row.estimate_low, high: row.estimate_high, per: answers.frequency === "once" ? "job" : "visit" }
      : null;
  return {
    id: row.id,
    ref: row.ref,
    token: row.token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    locale: hasLocale(row.locale) ? row.locale : "pt",
    stage: isStage(row.stage) ? row.stage : "new",
    name: row.name,
    email: row.email,
    phone: row.phone,
    zone: row.zone,
    service: (isServiceId(row.service) ? row.service : "domestica") as ServiceId,
    answers,
    estimate,
    quoteAmount: row.quote_amount === null ? null : Number(row.quote_amount),
    quoteNote: row.quote_note,
    quoteSentAt: row.quote_sent_at,
    quoteAcceptedAt: row.quote_accepted_at,
    scheduledAt: row.scheduled_at,
    notes: row.notes ?? "",
    checklist: Array.isArray(row.checklist)
      ? checklistIds.filter((id) => (row.checklist as unknown[]).includes(id))
      : [],
  };
}

function toEvent(row: EventRow): LeadEvent {
  return {
    id: row.id,
    leadId: row.lead_id,
    createdAt: row.created_at,
    kind: row.kind as EventKind,
    actor: row.actor as Actor,
    body: row.body,
    meta: row.meta ?? {},
    clientVisible: row.client_visible,
  };
}

/** Reference shown to people: CL-7K2M9P (no 0/O, 1/I/L to avoid mix-ups on the phone). */
function newRef(): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let ref = "CL-";
  for (let i = 0; i < 6; i++) ref += alphabet[randomInt(alphabet.length)];
  return ref;
}

export async function createLead(input: {
  locale: Locale;
  contact: Contact;
  answers: QuizAnswers;
  estimate: Estimate | null;
}): Promise<Lead> {
  const { locale, contact, answers, estimate } = input;
  const row = {
    token: randomBytes(18).toString("base64url"),
    locale,
    ...contact,
    service: answers.service,
    answers,
    estimate_low: estimate?.low ?? null,
    estimate_high: estimate?.high ?? null,
  };
  // The reference is random: on the (very unlikely) collision, draw another one.
  for (let attempt = 0; ; attempt++) {
    const { data, error } = await db()
      .from("leads")
      .insert({ ...row, ref: newRef() })
      .select(LEAD_COLUMNS)
      .single<LeadRow>();
    if (data) return toLead(data);
    if (error?.code !== "23505" || attempt >= 3) throw new Error(`createLead: ${error?.message}`);
  }
}

export async function getLeadByToken(token: string): Promise<Lead | null> {
  if (!/^[\w-]{16,64}$/.test(token)) return null;
  const { data, error } = await db()
    .from("leads")
    .select(LEAD_COLUMNS)
    .eq("token", token)
    .maybeSingle<LeadRow>();
  if (error) throw new Error(`getLeadByToken: ${error.message}`);
  return data ? toLead(data) : null;
}

export async function getLeadById(id: string): Promise<Lead | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db().from("leads").select(LEAD_COLUMNS).eq("id", id).maybeSingle<LeadRow>();
  if (error) throw new Error(`getLeadById: ${error.message}`);
  return data ? toLead(data) : null;
}

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await db()
    .from("leads")
    .select(LEAD_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(500)
    .overrideTypes<LeadRow[], { merge: false }>();
  if (error) throw new Error(`listLeads: ${error.message}`);
  return (data ?? []).map(toLead);
}

export type LeadPatch = Partial<{
  stage: Stage;
  answers: QuizAnswers;
  quote_amount: number | null;
  quote_note: string | null;
  quote_sent_at: string | null;
  quote_accepted_at: string | null;
  scheduled_at: string | null;
  notes: string;
  checklist: ChecklistId[];
  quote_followup_sent_at: string | null;
  reminder_sent_at: string | null;
}>;

export async function updateLead(id: string, patch: LeadPatch): Promise<Lead> {
  const { data, error } = await db()
    .from("leads")
    .update(patch)
    .eq("id", id)
    .select(LEAD_COLUMNS)
    .single<LeadRow>();
  if (error || !data) throw new Error(`updateLead: ${error?.message}`);
  return toLead(data);
}

export async function deleteLead(id: string): Promise<void> {
  const { data: photos } = await db().from("lead_photos").select("path").eq("lead_id", id);
  const paths = (photos ?? []).map((p) => p.path as string);
  if (paths.length > 0) await db().storage.from(PHOTO_BUCKET).remove(paths);
  const { error } = await db().from("leads").delete().eq("id", id);
  if (error) throw new Error(`deleteLead: ${error.message}`);
}

// ---------- timeline ----------

export async function addEvent(
  leadId: string,
  event: {
    kind: EventKind;
    actor: Actor;
    body?: string | null;
    meta?: Record<string, string | number | null>;
    clientVisible?: boolean;
  },
): Promise<void> {
  const { error } = await db()
    .from("lead_events")
    .insert({
      lead_id: leadId,
      kind: event.kind,
      actor: event.actor,
      body: event.body ?? null,
      meta: event.meta ?? {},
      client_visible: event.clientVisible ?? true,
    });
  // The timeline is a log: a failed insert must not undo the action it describes.
  if (error) console.error(`addEvent(${event.kind}): ${error.message}`);
}

export async function listEvents(
  leadId: string,
  options: { clientOnly?: boolean; limit?: number } = {},
): Promise<LeadEvent[]> {
  let query = db()
    .from("lead_events")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 50);
  if (options.clientOnly) query = query.eq("client_visible", true);
  const { data, error } = await query.overrideTypes<EventRow[], { merge: false }>();
  if (error) throw new Error(`listEvents: ${error.message}`);
  return (data ?? []).map(toEvent);
}

/** Latest events across every request, for the CRM activity log. */
export async function listRecentEvents(limit = 80): Promise<LeadEvent[]> {
  const { data, error } = await db()
    .from("lead_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
    .overrideTypes<EventRow[], { merge: false }>();
  if (error) throw new Error(`listRecentEvents: ${error.message}`);
  return (data ?? []).map(toEvent);
}

// ---------- photos ----------

export const MAX_PHOTOS = 8;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function countPhotos(leadId: string): Promise<number> {
  const { count, error } = await db()
    .from("lead_photos")
    .select("id", { count: "exact", head: true })
    .eq("lead_id", leadId);
  if (error) throw new Error(`countPhotos: ${error.message}`);
  return count ?? 0;
}

export async function listPhotos(leadId: string): Promise<LeadPhoto[]> {
  const { data, error } = await db()
    .from("lead_photos")
    .select("id, name, path")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`listPhotos: ${error.message}`);
  if (!data || data.length === 0) return [];

  const { data: signed, error: signError } = await db()
    .storage.from(PHOTO_BUCKET)
    .createSignedUrls(
      data.map((photo) => photo.path as string),
      60 * 60,
    );
  if (signError) throw new Error(`listPhotos: ${signError.message}`);
  return data.flatMap((photo, i) => {
    const url = signed?.[i]?.signedUrl;
    return url ? [{ id: photo.id as string, name: photo.name as string, url }] : [];
  });
}

/** A one-off URL the browser can PUT one file to (the file never goes through our server). */
export async function createPhotoUpload(leadId: string, mimeType: string) {
  const extension = PHOTO_TYPES[mimeType];
  if (!extension) throw new Error("createPhotoUpload: unsupported type");
  const path = `${leadId}/${randomBytes(12).toString("hex")}.${extension}`;
  const { data, error } = await db().storage.from(PHOTO_BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error(`createPhotoUpload: ${error?.message}`);
  return { path, url: data.signedUrl };
}

/** Records an uploaded file, after checking that it really is in the bucket under this request. */
export async function registerPhoto(leadId: string, path: string, name: string): Promise<boolean> {
  if (!path.startsWith(`${leadId}/`) || path.includes("..")) return false;
  const { data: info, error: infoError } = await db().storage.from(PHOTO_BUCKET).info(path);
  if (infoError || !info) return false;
  const { error } = await db()
    .from("lead_photos")
    .insert({ lead_id: leadId, path, name: name.slice(0, 120), size: info.size ?? 0 });
  if (error) {
    // Already registered (double submit): fine. Anything else: don't keep an orphan file.
    if (error.code === "23505") return true;
    await db().storage.from(PHOTO_BUCKET).remove([path]);
    return false;
  }
  return true;
}

export async function removePhoto(leadId: string, photoId: string): Promise<void> {
  const { data } = await db()
    .from("lead_photos")
    .delete()
    .eq("lead_id", leadId)
    .eq("id", photoId)
    .select("path")
    .maybeSingle();
  if (data?.path) await db().storage.from(PHOTO_BUCKET).remove([data.path as string]);
}

// ---------- CRM settings ----------

export async function getAutomations(): Promise<AutomationSettings> {
  const { data, error } = await db()
    .from("crm_settings")
    .select("value")
    .eq("key", "automations")
    .maybeSingle();
  if (error) throw new Error(`getAutomations: ${error.message}`);
  const saved = (data?.value ?? {}) as Record<string, unknown>;
  return Object.fromEntries(
    automationIds.map((id) => [id, typeof saved[id] === "boolean" ? saved[id] : defaultAutomations[id]]),
  ) as AutomationSettings;
}

export async function saveAutomations(settings: AutomationSettings): Promise<void> {
  const { error } = await db()
    .from("crm_settings")
    .upsert({ key: "automations", value: settings, updated_at: new Date().toISOString() });
  if (error) throw new Error(`saveAutomations: ${error.message}`);
}

/** Requests the daily job may need to write to (src/lib/server/automations.ts). */
export async function listLeadsForDailyJob(): Promise<
  (Lead & { quoteFollowupSentAt: string | null; reminderSentAt: string | null })[]
> {
  const { data, error } = await db()
    .from("leads")
    .select(`${LEAD_COLUMNS}, quote_followup_sent_at, reminder_sent_at`)
    .in("stage", ["quoted", "scheduled"])
    .limit(1000)
    .overrideTypes<
      (LeadRow & { quote_followup_sent_at: string | null; reminder_sent_at: string | null })[],
      { merge: false }
    >();
  if (error) throw new Error(`listLeadsForDailyJob: ${error.message}`);
  return (data ?? []).map((row) => ({
    ...toLead(row),
    quoteFollowupSentAt: row.quote_followup_sent_at,
    reminderSentAt: row.reminder_sent_at,
  }));
}
