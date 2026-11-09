"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import {
  getLeadDetail,
  removeLead,
  saveLead,
  sendMessageToClient,
  type SaveLeadResult,
} from "@/actions/admin";
import type { Locale } from "@/i18n/config";
import type { CrmDictionary } from "@/i18n/crm";
import type { FunnelDictionary } from "@/i18n/funnel";
import {
  describeEvent,
  describeExtras,
  describeSpace,
  describeTiming,
  hasFrequencyChoice,
} from "@/lib/funnel/describe";
import {
  clientSpaceHref,
  fill,
  formatDateTime,
  formatRange,
  formatShortDateTime,
  toLisbonInput,
} from "@/lib/funnel/format";
import { limits } from "@/lib/funnel/quiz";
import { stages, type Lead, type LeadEvent, type LeadPhoto, type Stage } from "@/lib/funnel/types";
import { CloseIcon, ExternalIcon, MailIcon, PhoneIcon, SendIcon, TrashIcon } from "../icons";

type Props = {
  lead: Lead;
  locale: Locale;
  c: CrmDictionary;
  f: FunnelDictionary;
  serviceName: string;
  /** Whether saving a quote / a date really e-mails the client (sending set up, automation on). */
  emails: { quote: boolean; scheduled: boolean };
  onClose: () => void;
};

/** Digits for a wa.me link; Portuguese mobiles written without the country code get +351. */
function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^00/, "");
  return digits.length === 9 && digits.startsWith("9") ? `351${digits}` : digits;
}

/** One request: who, what, the follow-up form, a message box, the history and the photos. */
export function LeadDialog({ lead, locale, c, f, serviceName, emails, onClose }: Props) {
  const t = c.lead;
  const dialog = useRef<HTMLDialogElement>(null);

  const [stage, setStage] = useState<Stage>(lead.stage);
  const [quoteAmount, setQuoteAmount] = useState(lead.quoteAmount === null ? "" : String(lead.quoteAmount));
  const [quoteNote, setQuoteNote] = useState(lead.quoteNote ?? "");
  const [scheduledAt, setScheduledAt] = useState(lead.scheduledAt ? toLisbonInput(lead.scheduledAt) : "");
  const [notes, setNotes] = useState(lead.notes);
  const [saveResult, setSaveResult] = useState<SaveLeadResult | null>(null);
  const [messageState, setMessageState] = useState<"idle" | "sent" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [detail, setDetail] = useState<{ events: LeadEvent[]; photos: LeadPhoto[] } | null>(null);
  /** Bumped after each action so the history is loaded again. */
  const [version, setVersion] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  useEffect(() => {
    let stale = false;
    getLeadDetail(lead.id)
      .then((data) => {
        if (!stale && data) setDetail(data);
      })
      .catch(() => null);
    return () => {
      stale = true;
    };
  }, [lead.id, version]);

  const { answers } = lead;
  const spaceHref = clientSpaceHref(lead.locale, lead.token);
  const rows: [string, string][] = [
    [t.service, serviceName],
    [t.space, describeSpace(answers, f)],
    [t.frequency, hasFrequencyChoice(answers) ? f.options.frequency[answers.frequency].label : ""],
    [t.preference, describeTiming(answers, f, locale)],
    [t.extras, describeExtras(answers, f)],
    [t.details, answers.details],
    [t.estimate, lead.estimate ? formatRange(lead.estimate.low, lead.estimate.high, locale) : ""],
  ];

  // Mirrors the server (src/actions/admin.ts): what saving this form will send to the client.
  const moved = stage !== lead.stage;
  const quoteChanged =
    quoteAmount.trim() !== (lead.quoteAmount === null ? "" : String(lead.quoteAmount)) ||
    quoteNote.trim() !== (lead.quoteNote ?? "");
  const dateChanged = scheduledAt !== (lead.scheduledAt ? toLisbonInput(lead.scheduledAt) : "");
  const hint =
    emails.quote && stage === "quoted" && (moved || quoteChanged)
      ? t.hints.quoted
      : emails.scheduled && stage === "scheduled" && (moved || dateChanged)
        ? t.hints.scheduled
        : null;

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveLead(lead.id, { stage, quoteAmount, quoteNote, scheduledAt, notes }).catch(
        (): SaveLeadResult => ({ ok: false, error: "generic" }),
      );
      setSaveResult(result);
      if (result.ok) setVersion((v) => v + 1);
    });
  }

  function handleMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = String(new FormData(form).get("message") ?? "").trim();
    if (!message) return;
    startTransition(async () => {
      const result = await sendMessageToClient(lead.id, message).catch(() => ({ ok: false }));
      setMessageState(result.ok ? "sent" : "error");
      if (result.ok) {
        form.reset();
        setVersion((v) => v + 1);
      }
    });
  }

  function handleDelete() {
    if (!window.confirm(t.deleteConfirm)) return;
    startTransition(async () => {
      const result = await removeLead(lead.id).catch(() => ({ ok: false }));
      if (result.ok) dialog.current?.close();
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(new URL(spaceHref, window.location.origin).toString());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby="lead-title"
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && dialog.current?.close()}
    >
      <div className="modal-head">
        <div>
          <p className="eyebrow">
            {fill(t.title, { ref: lead.ref })} · {fill(t.received, { date: formatShortDateTime(lead.createdAt, locale) })}
          </p>
          <h2 id="lead-title">{lead.name}</h2>
        </div>
        <button type="button" className="legal-close" aria-label={t.close} onClick={() => dialog.current?.close()}>
          <CloseIcon />
        </button>
      </div>

      <div className="modal-body">
        <div className="lead-actions">
          <a className="btn btn-outline btn-sm" href={`mailto:${lead.email}`}>
            <MailIcon />
            <span>{lead.email}</span>
          </a>
          <a className="btn btn-outline btn-sm" href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}>
            <PhoneIcon />
            <span>{lead.phone}</span>
          </a>
          <a
            className="btn btn-outline btn-sm"
            href={`https://wa.me/${whatsappNumber(lead.phone)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.whatsapp}
          </a>
        </div>

        <div className="lead-cols">
          <section>
            <h3>{t.request}</h3>
            <dl className="rows">
              {rows
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              <div>
                <dt>{t.zone}</dt>
                <dd>{lead.zone}</dd>
              </div>
              <div>
                <dt>{t.language}</dt>
                <dd>{lead.locale.toUpperCase()}</dd>
              </div>
            </dl>
            <div className="lead-links">
              <a className="link" href={spaceHref} target="_blank" rel="noopener">
                <span>{t.openSpace}</span>
                <ExternalIcon />
              </a>
              <button type="button" className="link" onClick={copyLink}>
                {copied ? t.copied : t.copyLink}
              </button>
            </div>
          </section>

          <form onSubmit={handleSave}>
            <h3>{t.manage}</h3>
            <div className="fields">
              <div className="field">
                <label htmlFor="lead-stage">{t.status}</label>
                <select id="lead-stage" value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
                  {stages.map((id) => (
                    <option key={id} value={id}>
                      {c.stages[id]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="lead-amount">{t.quoteAmount}</label>
                <input
                  id="lead-amount"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  max="99999"
                  step="0.01"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                />
              </div>
              <div className="field wide">
                <label htmlFor="lead-quote-note">{t.quoteNote}</label>
                <textarea
                  id="lead-quote-note"
                  rows={2}
                  maxLength={limits.details}
                  value={quoteNote}
                  onChange={(e) => setQuoteNote(e.target.value)}
                />
              </div>
              <div className="field wide">
                <label htmlFor="lead-date">{t.scheduledAt}</label>
                <input
                  id="lead-date"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
              <div className="field wide">
                <label htmlFor="lead-notes">{t.notes}</label>
                <textarea id="lead-notes" rows={2} maxLength={4000} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            {hint && <p className="note">{hint}</p>}
            <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
              {pending ? t.saving : t.save}
            </button>
            <p className={`status${saveResult && !saveResult.ok ? " status-error" : ""}${saveResult ? " show" : ""}`} role="status">
              {saveResult ? (saveResult.ok ? (saveResult.emailed ? t.savedEmailed : t.saved) : t.errors[saveResult.error]) : null}
            </p>
          </form>
        </div>

        <form onSubmit={handleMessage} className="lead-message">
          <h3>{t.message.title}</h3>
          <div className="field">
            <textarea
              name="message"
              rows={2}
              required
              maxLength={limits.details}
              placeholder={t.message.placeholder}
              aria-label={t.message.title}
            />
          </div>
          <button type="submit" className="btn btn-outline btn-sm" disabled={pending}>
            <SendIcon />
            <span>{pending ? t.message.sending : t.message.send}</span>
          </button>
          <p className={`status${messageState === "error" ? " status-error" : ""}${messageState !== "idle" ? " show" : ""}`} role="status">
            {messageState === "sent" ? t.message.sent : messageState === "error" ? t.message.error : null}
          </p>
        </form>

        <section>
          <h3>{t.history}</h3>
          {detail ? (
            <ul className="feed feed-wide">
              {detail.events.map((event) => (
                <li key={event.id} className={event.kind === "message" ? `feed-message from-${event.actor}` : undefined}>
                  <p>
                    <span className="feed-actor">{c.actors[event.actor]}</span> {describeEvent(event, f, locale, c.stages)}
                  </p>
                  <time dateTime={event.createdAt}>{formatDateTime(event.createdAt, locale)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">{t.loading}</p>
          )}
        </section>

        {detail && detail.photos.length > 0 && (
          <section>
            <h3>{t.photos}</h3>
            <ul className="photos">
              {detail.photos.map((photo) => (
                <li key={photo.id}>
                  <a href={photo.url} target="_blank" rel="noopener noreferrer">
                    {/* Signed, short-lived URL from a private bucket: not something next/image can optimise. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt={photo.name} loading="lazy" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <button type="button" className="link link-danger" disabled={pending} onClick={handleDelete}>
          <TrashIcon />
          <span>{t.delete}</span>
        </button>
      </div>
    </dialog>
  );
}
