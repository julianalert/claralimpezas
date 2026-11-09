"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { logout, runDailyJobNow, setAutomation } from "@/actions/admin";
import { localePath, type Locale } from "@/i18n/config";
import type { CrmDictionary } from "@/i18n/crm";
import type { FunnelDictionary } from "@/i18n/funnel";
import { describeEvent, describeSpace, describeTiming } from "@/lib/funnel/describe";
import {
  fill,
  formatDateTime,
  formatMoney,
  formatRange,
  formatShortDateTime,
  initials,
  quizHref,
} from "@/lib/funnel/format";
import {
  automationIds,
  pipelineStages,
  type AutomationSettings,
  type Lead,
  type LeadEvent,
} from "@/lib/funnel/types";
import type { ServiceId } from "@/lib/services";
import {
  BoardIcon,
  BoltIcon,
  CalendarCheckIcon,
  ListIcon,
  LogoutIcon,
  PlusIcon,
  SearchIcon,
  type IconComponent,
} from "../icons";
import { LanguageSwitcher } from "../layout/LanguageSwitcher";
import { WordmarkText } from "../Wordmark";
import { LeadDialog } from "./LeadDialog";

const views = ["pipeline", "schedule", "automations", "journal"] as const;
type View = (typeof views)[number];
const viewIcons: Record<View, IconComponent> = {
  pipeline: BoardIcon,
  schedule: CalendarCheckIcon,
  automations: BoltIcon,
  journal: ListIcon,
};

export type CrmProps = {
  locale: Locale;
  c: CrmDictionary;
  /** Funnel copy in the CRM's language: option labels, timeline texts. */
  f: FunnelDictionary;
  services: Record<ServiceId, string>;
  leads: Lead[];
  events: LeadEvent[];
  automations: AutomationSettings | null;
  /** Why there is no data: Supabase keys missing, or the queries failed. */
  setupProblem: "not-configured" | "error" | null;
  emailConfigured: boolean;
  teamEmailSet: boolean;
  /** Request to open straight away (`/admin?lead=<id>`, from the team e-mails). */
  initialLeadId: string | null;
};

/** What a request is worth for the pipeline total: the quote, else the middle of the estimate. */
function leadValue(lead: Lead): number {
  if (lead.quoteAmount !== null) return lead.quoteAmount;
  return lead.estimate ? (lead.estimate.low + lead.estimate.high) / 2 : 0;
}

export function Crm(props: CrmProps) {
  const { locale, c, f, services, leads, events, automations, setupProblem } = props;
  const [view, setView] = useState<View>("pipeline");
  const [selectedId, setSelectedId] = useState<string | null>(props.initialLeadId);
  const selected = leads.find((lead) => lead.id === selectedId) ?? null;

  const active = leads.filter((lead) => !["done", "lost"].includes(lead.stage));
  const stats: [keyof CrmDictionary["stats"], string][] = [
    ["active", String(active.length)],
    ["awaiting", String(leads.filter((lead) => lead.stage === "quoted").length)],
    ["value", formatMoney(Math.round(active.reduce((sum, lead) => sum + leadValue(lead), 0)), locale)],
    ["booked", String(leads.filter((lead) => ["accepted", "scheduled"].includes(lead.stage)).length)],
  ];

  return (
    <div className="crm">
      <aside className="crm-side">
        <Link href={localePath(locale)} className="brand" aria-label={c.nav.site}>
          <WordmarkText variant="nav" />
        </Link>
        <nav aria-label={c.nav.label}>
          {views.map((id) => {
            const Icon = viewIcons[id];
            return (
              <button
                key={id}
                type="button"
                className={view === id ? "active" : undefined}
                aria-current={view === id ? "page" : undefined}
                onClick={() => setView(id)}
              >
                <Icon />
                <span>{c.nav[id]}</span>
              </button>
            );
          })}
        </nav>
        <div className="crm-side-foot">
          <LanguageSwitcher locale={locale} label={c.nav.language} scope="crm" />
          <form action={logout}>
            <button type="submit">
              <LogoutIcon />
              <span>{c.nav.signOut}</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="crm-main">
        <div className="dash-head">
          <div>
            <p className="eyebrow">{c.login.eyebrow}</p>
            <h1 className="h2">{c.views[view].title}</h1>
            <p className="lead">{c.views[view].text}</p>
          </div>
          <a className="btn btn-primary btn-sm" href={quizHref(locale)} target="_blank" rel="noopener">
            <PlusIcon />
            <span>{c.nav.newRequest}</span>
          </a>
        </div>

        {setupProblem ? (
          <section className="card">
            <h2>{c.setup.title}</h2>
            <p className="card-text">{setupProblem === "error" ? c.setup.error : c.setup.text}</p>
          </section>
        ) : (
          <>
            <div className="stats">
              {stats.map(([key, value]) => (
                <div className="stat" key={key}>
                  <span>{c.stats[key].label}</span>
                  <strong>{value}</strong>
                  <small>{c.stats[key].hint}</small>
                </div>
              ))}
            </div>

            {view === "pipeline" && <Pipeline {...props} onOpen={setSelectedId} />}
            {view === "schedule" && <Schedule {...props} onOpen={setSelectedId} />}
            {view === "automations" && automations && <Automations {...props} automations={automations} />}
            {view === "journal" && (
              <section className="card">
                <h2>{c.journal.title}</h2>
                {events.length === 0 ? (
                  <p className="empty">{c.journal.empty}</p>
                ) : (
                  <ul className="feed feed-wide">
                    {events.map((event) => {
                      const lead = leads.find((item) => item.id === event.leadId);
                      return (
                        <li key={event.id}>
                          <p>
                            <button type="button" className="feed-who" onClick={() => setSelectedId(event.leadId)}>
                              {lead ? lead.name : "—"}
                            </button>{" "}
                            <span className="feed-actor">{c.actors[event.actor]}</span>{" "}
                            {describeEvent(event, f, locale, c.stages)}
                          </p>
                          <time dateTime={event.createdAt}>{formatShortDateTime(event.createdAt, locale)}</time>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {selected && (
        <LeadDialog
          key={selected.id}
          lead={selected}
          locale={locale}
          c={c}
          f={f}
          serviceName={services[selected.service]}
          emails={{
            quote: props.emailConfigured && automations?.quote === true,
            scheduled: props.emailConfigured && automations?.scheduled === true,
          }}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

type ViewProps = CrmProps & { onOpen: (id: string) => void };

function Pipeline({ locale, c, f, services, leads, onOpen }: ViewProps) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = (lead: Lead) =>
    !needle ||
    [lead.name, lead.zone, lead.ref, lead.email, lead.phone, services[lead.service]]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  const visible = leads.filter(matches);
  const closed = visible.filter((lead) => lead.stage === "lost");

  const card = (lead: Lead) => (
    <button key={lead.id} type="button" className="lead-card" onClick={() => onOpen(lead.id)}>
      <span className="lead-card-top">
        <span className={`tag tag-${lead.stage}`}>{services[lead.service]}</span>
        <span className="avatar">{initials(lead.name)}</span>
      </span>
      <strong>{lead.name}</strong>
      <span className="lead-card-text">
        {[lead.zone, describeSpace(lead.answers, f)].filter(Boolean).join(" · ")}
      </span>
      <span className="lead-card-foot">
        <span>
          {lead.scheduledAt && lead.stage !== "new"
            ? formatShortDateTime(lead.scheduledAt, locale)
            : describeTiming(lead.answers, f, locale).split(" · ")[0]}
        </span>
        <b>
          {lead.quoteAmount !== null
            ? formatMoney(lead.quoteAmount, locale)
            : lead.estimate
              ? `${c.pipeline.estimate} ${formatRange(lead.estimate.low, lead.estimate.high, locale)}`
              : "—"}
        </b>
      </span>
    </button>
  );

  return (
    <>
      <div className="toolbar">
        <h2>
          {c.pipeline.title} <span className="tag">{visible.length}</span>
        </h2>
        <label className="search">
          <SearchIcon />
          <input
            type="search"
            value={query}
            placeholder={c.pipeline.search}
            aria-label={c.pipeline.searchLabel}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="board">
        {pipelineStages.map((stage) => {
          const column = visible.filter((lead) => lead.stage === stage);
          return (
            <section className="column" key={stage} aria-label={c.stages[stage]}>
              <h3>
                <span>{c.stages[stage]}</span>
                <span className="count">{column.length}</span>
              </h3>
              {column.length > 0 ? column.map(card) : <p className="empty">{c.pipeline.empty}</p>}
            </section>
          );
        })}
      </div>
      {closed.length > 0 && (
        <details className="closed">
          <summary>{fill(c.pipeline.closed, { n: closed.length })}</summary>
          <div className="closed-grid">{closed.map(card)}</div>
        </details>
      )}
      <p className="hint">{c.pipeline.hint}</p>
    </>
  );
}

function Schedule({ locale, c, f, services, leads, onOpen }: ViewProps) {
  const booked = leads
    .filter((lead) => lead.stage === "scheduled" && lead.scheduledAt)
    .sort((a, b) => (a.scheduledAt as string).localeCompare(b.scheduledAt as string));
  const waiting = leads.filter((lead) => lead.stage === "accepted");

  const row = (lead: Lead, when: string) => (
    <li key={lead.id}>
      <span className="tile">
        <CalendarCheckIcon />
      </span>
      <div>
        <strong>{lead.name}</strong>
        <p>{when}</p>
        <p>{[services[lead.service], lead.zone, describeSpace(lead.answers, f)].filter(Boolean).join(" · ")}</p>
      </div>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => onOpen(lead.id)}>
        {c.schedule.open}
      </button>
    </li>
  );

  return (
    <div className="crm-cols">
      <section className="card">
        <div className="card-head">
          <h2>{c.schedule.upcoming}</h2>
          <span className="tag">{booked.length}</span>
        </div>
        {booked.length === 0 ? (
          <p className="empty">{c.schedule.emptyUpcoming}</p>
        ) : (
          <ul className="list">{booked.map((lead) => row(lead, formatDateTime(lead.scheduledAt as string, locale)))}</ul>
        )}
      </section>
      <section className="card">
        <div className="card-head">
          <h2>{c.schedule.waiting}</h2>
          <span className="tag">{waiting.length}</span>
        </div>
        {waiting.length === 0 ? (
          <p className="empty">{c.schedule.emptyWaiting}</p>
        ) : (
          <ul className="list">
            {waiting.map((lead) =>
              row(lead, fill(c.schedule.prefers, { date: describeTiming(lead.answers, f, locale) })),
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

function Automations({
  c,
  automations,
  emailConfigured,
  teamEmailSet,
}: CrmProps & { automations: AutomationSettings }) {
  const a = c.automations;
  const [pending, startTransition] = useTransition();
  const [ran, setRan] = useState<number | null>(null);

  return (
    <section className="card">
      <div className="card-head">
        <h2>{a.title}</h2>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={pending || !emailConfigured}
          onClick={() =>
            startTransition(async () => {
              const result = await runDailyJobNow().catch(() => ({ ok: false, sent: 0 }));
              setRan(result.sent);
            })
          }
        >
          <BoltIcon />
          <span>{pending ? a.running : a.runNow}</span>
        </button>
      </div>
      {!emailConfigured && <p className="note note-warn">{a.emailOff}</p>}
      {emailConfigured && !teamEmailSet && <p className="note note-warn">{a.teamOff}</p>}
      <p className="card-text">{a.runHint}</p>
      <p className={`status${ran !== null ? " show" : ""}`} role="status">
        {ran !== null ? fill(a.ran, { n: ran }) : null}
      </p>
      <ul className="list">
        {automationIds.map((id, i) => (
          <li key={id}>
            <span className="tile mono">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <strong>{a.items[id].title}</strong>
              <p>{a.items[id].trigger}</p>
              <p>{a.items[id].text}</p>
            </div>
            <button
              type="button"
              className={automations[id] ? "toggle on" : "toggle"}
              aria-pressed={automations[id]}
              disabled={pending}
              onClick={() => startTransition(async () => void (await setAutomation(id, !automations[id]).catch(() => null)))}
            >
              {automations[id] ? a.on : a.off}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
