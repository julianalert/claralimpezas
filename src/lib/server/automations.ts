import "server-only";
import { siteConfig } from "@/config/site";
import { loadDictionary } from "@/i18n/dictionaries";
import { loadFunnelDictionary } from "@/i18n/funnel";
import { describeSpace, describeTiming } from "@/lib/funnel/describe";
import {
  absoluteUrl,
  adminHref,
  clientSpaceHref,
  fill,
  firstName,
  formatDateTime,
  formatMoney,
  formatRange,
  lisbonDay,
} from "@/lib/funnel/format";
import type { AutomationId, Lead } from "@/lib/funnel/types";
import { isEmailConfigured, renderEmail, sendEmail, teamEmail, type EmailContent } from "./email";
import { addEvent, getAutomations, listLeadsForDailyJob, updateLead } from "./leads";

// Every e-mail the funnel sends: to the client (in the language they used on the site) and to the
// team (in English, like the CRM). The first six can be switched off in the CRM ("Automations").

/** Quotes get one follow-up, between these many days after they were sent. */
const FOLLOWUP_AFTER_DAYS = 3;
const FOLLOWUP_UNTIL_DAYS = 14;

type Template =
  | "confirmation"
  | "quote"
  | "quoteFollowup"
  | "scheduled"
  | "reminder"
  | "message"
  | "teamNew"
  | "teamMessage"
  | "teamAccepted";

const spaceUrl = (lead: Lead) => absoluteUrl(clientSpaceHref(lead.locale, lead.token));
const crmUrl = (lead: Lead) => absoluteUrl(`${adminHref("en")}?lead=${lead.id}`);

async function isOn(id: AutomationId): Promise<boolean> {
  return (await getAutomations())[id];
}

/** Sends one e-mail and logs the outcome in the request's timeline (team-only entries). */
async function deliver(
  lead: Lead,
  template: Template,
  to: string,
  subject: string,
  content: EmailContent,
  replyTo?: string | null,
): Promise<boolean> {
  const result = await sendEmail({ to, subject, ...renderEmail(content), replyTo });
  if (result.status === "skipped") return false;
  if (result.status === "failed") console.error(`E-mail "${template}" for ${lead.ref}: ${result.error}`);
  await addEvent(lead.id, {
    kind: result.status === "sent" ? "email_sent" : "email_failed",
    actor: "system",
    meta: { template },
    clientVisible: false,
  });
  return result.status === "sent";
}

/** Content shared by the client e-mails. */
async function clientContext(lead: Lead) {
  const [t, site] = await Promise.all([loadFunnelDictionary(lead.locale), loadDictionary(lead.locale)]);
  const e = t.emails;
  return {
    t,
    e,
    service: site.services.items[lead.service].name,
    greeting: fill(e.greeting, { name: firstName(lead.name) }),
    footer: fill(e.footer, { domain: siteConfig.domain }),
    refRow: { label: e.ref, value: lead.ref },
  };
}

async function sendToClient(
  lead: Lead,
  template: Exclude<Template, `team${string}`>,
  build: (ctx: Awaited<ReturnType<typeof clientContext>>) => { subject: string; content: Omit<EmailContent, "locale" | "footer"> },
): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  const ctx = await clientContext(lead);
  const { subject, content } = build(ctx);
  return deliver(
    lead,
    template,
    lead.email,
    subject,
    { ...content, locale: lead.locale, footer: ctx.footer, closing: [...(content.closing ?? []), ctx.e.signature] },
    teamEmail(),
  );
}

// ---------- to the client ----------

export async function sendConfirmation(lead: Lead): Promise<boolean> {
  if (!(await isOn("confirmation"))) return false;
  return sendToClient(lead, "confirmation", ({ e, service, greeting, refRow }) => ({
    subject: fill(e.confirmation.subject, { ref: lead.ref }),
    content: {
      heading: e.confirmation.heading,
      paragraphs: [greeting, e.confirmation.intro],
      rows: [
        refRow,
        { label: e.service, value: service },
        ...(lead.estimate
          ? [{ label: e.confirmation.estimate, value: formatRange(lead.estimate.low, lead.estimate.high, lead.locale) }]
          : []),
      ],
      cta: { label: e.confirmation.cta, url: spaceUrl(lead) },
      closing: [...(lead.estimate ? [e.confirmation.estimateNote] : []), e.confirmation.outro],
    },
  }));
}

export async function sendQuote(lead: Lead): Promise<boolean> {
  if (lead.quoteAmount === null || !(await isOn("quote"))) return false;
  const amount = formatMoney(lead.quoteAmount, lead.locale);
  return sendToClient(lead, "quote", ({ e, service, greeting, refRow }) => ({
    subject: fill(e.quote.subject, { ref: lead.ref }),
    content: {
      heading: e.quote.heading,
      paragraphs: [greeting, e.quote.intro],
      rows: [refRow, { label: e.service, value: service }, { label: e.quote.amount, value: amount }],
      quote: lead.quoteNote || undefined,
      cta: { label: e.quote.cta, url: spaceUrl(lead) },
      closing: [e.quote.outro],
    },
  }));
}

async function sendQuoteFollowup(lead: Lead): Promise<boolean> {
  if (lead.quoteAmount === null) return false;
  const amount = formatMoney(lead.quoteAmount, lead.locale);
  return sendToClient(lead, "quoteFollowup", ({ e, greeting, refRow }) => ({
    subject: fill(e.quoteFollowup.subject, { ref: lead.ref }),
    content: {
      heading: e.quoteFollowup.heading,
      paragraphs: [greeting, e.quoteFollowup.intro],
      rows: [refRow, { label: e.quoteFollowup.amount, value: amount }],
      cta: { label: e.quoteFollowup.cta, url: spaceUrl(lead) },
    },
  }));
}

export async function sendScheduled(lead: Lead): Promise<boolean> {
  if (!lead.scheduledAt || !(await isOn("scheduled"))) return false;
  const date = formatDateTime(lead.scheduledAt, lead.locale);
  return sendToClient(lead, "scheduled", ({ e, service, greeting, refRow }) => ({
    subject: fill(e.scheduled.subject, { date }),
    content: {
      heading: e.scheduled.heading,
      paragraphs: [greeting, fill(e.scheduled.intro, { date })],
      rows: [refRow, { label: e.service, value: service }],
      cta: { label: e.scheduled.cta, url: spaceUrl(lead) },
      closing: [e.scheduled.outro],
    },
  }));
}

async function sendReminder(lead: Lead): Promise<boolean> {
  if (!lead.scheduledAt) return false;
  const date = formatDateTime(lead.scheduledAt, lead.locale);
  return sendToClient(lead, "reminder", ({ e, greeting, refRow }) => ({
    subject: e.reminder.subject,
    content: {
      heading: e.reminder.heading,
      paragraphs: [greeting, fill(e.reminder.intro, { date })],
      rows: [refRow],
      cta: { label: e.reminder.cta, url: spaceUrl(lead) },
      closing: [e.reminder.outro],
    },
  }));
}

/** A message written by the team in the CRM. Always sent: it is an explicit action. */
export async function sendTeamMessage(lead: Lead, body: string): Promise<boolean> {
  return sendToClient(lead, "message", ({ e, greeting }) => ({
    subject: fill(e.message.subject, { ref: lead.ref }),
    content: {
      heading: e.message.heading,
      paragraphs: [greeting, e.message.intro],
      quote: body,
      cta: { label: e.message.cta, url: spaceUrl(lead) },
    },
  }));
}

// ---------- to the team ----------

async function sendToTeam(
  lead: Lead,
  template: Extract<Template, `team${string}`>,
  subject: string,
  content: Pick<EmailContent, "heading" | "paragraphs" | "rows" | "quote">,
): Promise<boolean> {
  const to = teamEmail();
  if (!to || !isEmailConfigured() || !(await isOn("team"))) return false;
  return deliver(
    lead,
    template,
    to,
    subject,
    {
      ...content,
      locale: "en",
      cta: { label: "Open in the CRM", url: crmUrl(lead) },
      footer: `Team notification from ${siteConfig.domain}. Switch these off in the CRM, under Automations.`,
    },
    lead.email,
  );
}

async function teamRows(lead: Lead) {
  const [t, site] = await Promise.all([loadFunnelDictionary("en"), loadDictionary("en")]);
  return [
    { label: "Reference", value: lead.ref },
    { label: "Client", value: lead.name },
    { label: "Contact", value: `${lead.phone} · ${lead.email}` },
    { label: "Service", value: site.services.items[lead.service].name },
    { label: "Space", value: describeSpace(lead.answers, t) || "—" },
    { label: "Area", value: lead.zone },
    { label: "When", value: describeTiming(lead.answers, t, "en") },
    ...(lead.estimate
      ? [{ label: "Estimate", value: formatRange(lead.estimate.low, lead.estimate.high, "en") }]
      : []),
  ];
}

export async function notifyTeamOfRequest(lead: Lead): Promise<boolean> {
  return sendToTeam(lead, "teamNew", `New request ${lead.ref} — ${lead.name}`, {
    heading: "New quote request",
    paragraphs: [`${lead.name} just completed the quiz.`],
    rows: await teamRows(lead),
    quote: lead.answers.details || undefined,
  });
}

export async function notifyTeamOfMessage(lead: Lead, body: string): Promise<boolean> {
  return sendToTeam(lead, "teamMessage", `Message from ${lead.name} (${lead.ref})`, {
    heading: "New message from a client",
    paragraphs: [`${lead.name} wrote in their client space:`],
    quote: body,
  });
}

export async function notifyTeamOfAcceptance(lead: Lead): Promise<boolean> {
  return sendToTeam(lead, "teamAccepted", `Quote accepted ${lead.ref} — ${lead.name}`, {
    heading: "Quote accepted",
    paragraphs: [`${lead.name} accepted the quote. Next step: agree on the date and schedule the cleaning.`],
    rows: [
      { label: "Reference", value: lead.ref },
      { label: "Contact", value: `${lead.phone} · ${lead.email}` },
      ...(lead.quoteAmount !== null ? [{ label: "Quote", value: formatMoney(lead.quoteAmount, "en") }] : []),
    ],
  });
}

// ---------- daily job ----------

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Time-based e-mails, run once a day (src/app/api/cron/daily/route.ts) or from the CRM:
 * one follow-up for quotes left unanswered, and a reminder the day before each cleaning.
 */
export async function runDailyJob(now: Date = new Date()): Promise<{ followups: number; reminders: number }> {
  const settings = await getAutomations();
  const result = { followups: 0, reminders: 0 };
  if (!isEmailConfigured() || (!settings.quoteFollowup && !settings.reminder)) return result;

  const tomorrow = lisbonDay(new Date(now.getTime() + DAY_MS));
  for (const lead of await listLeadsForDailyJob()) {
    if (settings.quoteFollowup && lead.stage === "quoted" && lead.quoteSentAt && !lead.quoteFollowupSentAt) {
      const age = now.getTime() - new Date(lead.quoteSentAt).getTime();
      if (age >= FOLLOWUP_AFTER_DAYS * DAY_MS && age <= FOLLOWUP_UNTIL_DAYS * DAY_MS && (await sendQuoteFollowup(lead))) {
        await updateLead(lead.id, { quote_followup_sent_at: now.toISOString() });
        result.followups++;
      }
    }
    if (
      settings.reminder &&
      lead.stage === "scheduled" &&
      lead.scheduledAt &&
      !lead.reminderSentAt &&
      lisbonDay(lead.scheduledAt) === tomorrow &&
      (await sendReminder(lead))
    ) {
      await updateLead(lead.id, { reminder_sent_at: now.toISOString() });
      result.reminders++;
    }
  }
  return result;
}
