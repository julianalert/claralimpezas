import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { FunnelFooter } from "@/components/funnel/FunnelFooter";
import { FunnelHeader } from "@/components/funnel/FunnelHeader";
import {
  AcceptQuote,
  Checklist,
  MessageForm,
  Photos,
  PreferenceForm,
  PrintButton,
} from "@/components/funnel/SpaceWidgets";
import { ArrowIcon, CalendarCheckIcon } from "@/components/icons";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { loadFunnelDictionary, type FunnelDictionary } from "@/i18n/funnel";
import { describeEvent, describeExtras, describeSpace, describeTiming, hasFrequencyChoice } from "@/lib/funnel/describe";
import {
  clientSpaceHref,
  fill,
  firstName,
  formatDateTime,
  formatDay,
  formatMoney,
  formatRange,
  formatShortDateTime,
  lisbonDay,
  quizHref,
} from "@/lib/funnel/format";
import { pipelineStages, type Lead, type LeadEvent, type LeadPhoto } from "@/lib/funnel/types";
import { getLeadByToken, listEvents, listPhotos, MAX_PHOTOS } from "@/lib/server/leads";

// A client's private space for one request, at /pedido/<token>, /en/request/<token> and
// /fr/demande/<token> (see src/proxy.ts). The unguessable token in the URL is the only key,
// so the page is kept out of search engines and never sends its address to other sites.

export async function generateMetadata(): Promise<Metadata> {
  const t = await loadFunnelDictionary(await getLocale());
  return {
    title: t.meta.spaceTitle,
    alternates: {},
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export default async function ClientSpacePage({ params }: PageProps<"/[lang]/pedido/[token]">) {
  const locale = await getLocale();
  const t = await loadFunnelDictionary(locale);
  return (
    <>
      <FunnelHeader locale={locale} t={t.shell} />
      {/* The request is read on every visit; the header above is static and shows at once. */}
      <Suspense fallback={<main className="funnel funnel-loading" aria-busy="true" />}>
        <ClientSpace params={params} locale={locale} t={t} />
      </Suspense>
    </>
  );
}

type Loaded = { lead: Lead; events: LeadEvent[]; photos: LeadPhoto[] } | "missing" | "unavailable";

async function load(token: string): Promise<Loaded> {
  try {
    const lead = await getLeadByToken(token);
    if (!lead) return "missing";
    const [events, photos] = await Promise.all([
      listEvents(lead.id, { clientOnly: true, limit: 30 }),
      listPhotos(lead.id),
    ]);
    return { lead, events, photos };
  } catch (error) {
    console.error("client space:", error);
    return "unavailable";
  }
}

async function ClientSpace({
  params,
  locale,
  t,
}: {
  params: PageProps<"/[lang]/pedido/[token]">["params"];
  locale: Locale;
  t: FunnelDictionary;
}) {
  // Private, always-fresh data: never prerendered or prefetched.
  await connection();
  const { token } = await params;
  const data = await load(token);
  const hrefs = Object.fromEntries(locales.map((l) => [l, clientSpaceHref(l, token)])) as Record<Locale, string>;
  const footer = <FunnelFooter locale={locale} t={t.shell} hrefs={hrefs} />;

  if (data === "missing" || data === "unavailable") {
    const copy = data === "missing" ? t.space.notFound : t.space.unavailable;
    return (
      <>
        <main className="funnel">
          <div className="wrap">
            <section className="card card-center">
              <h1 className="h2">{copy.title}</h1>
              <p className="lead">{copy.text}</p>
              {data === "missing" && (
                <Link className="btn btn-primary" href={quizHref(locale)}>
                  <span>{t.space.notFound.cta}</span>
                  <ArrowIcon />
                </Link>
              )}
            </section>
          </div>
        </main>
        {footer}
      </>
    );
  }

  const { lead, events, photos } = data;
  const s = t.space;
  const site = await getDictionary();
  const { answers } = lead;
  const stageIndex = pipelineStages.indexOf(lead.stage as (typeof pipelineStages)[number]);
  const extras = describeExtras(answers, t);
  const hasQuote = lead.quoteAmount !== null && lead.stage !== "new";
  const canChangePreference = ["new", "quoted", "accepted"].includes(lead.stage);

  const rows: [string, string][] = [
    [s.request.service, site.services.items[lead.service].name],
    [s.request.space, describeSpace(answers, t)],
    [s.request.frequency, hasFrequencyChoice(answers) ? t.options.frequency[answers.frequency].label : ""],
    [s.request.zone, lead.zone],
    [s.request.extras, extras],
    [s.request.details, answers.details],
  ];

  return (
    <>
      <main className="funnel">
        <div className="wrap">
          <div className="dash-head">
            <div>
              <p className="eyebrow">
                {s.eyebrow} / {lead.ref}
              </p>
              <h1 className="h2">
                {fill(s.greeting, { name: firstName(lead.name) })}
                <br />
                {s.headline[lead.stage]}
              </h1>
              <p className="lead">{s.sub}</p>
            </div>
            <PrintButton label={s.print} />
          </div>

          <div className="dash-grid">
            <div className="dash-col">
              <section className="card">
                <div className="card-head">
                  <h2>{s.request.title}</h2>
                  <span className={`tag tag-${lead.stage}`}>{t.stages[lead.stage]}</span>
                </div>
                <dl className="rows">
                  {rows
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                </dl>
                {stageIndex >= 0 && (
                  <ol className="timeline">
                    {pipelineStages.map((stage, i) => {
                      const state = i < stageIndex || lead.stage === "done" ? "done" : i === stageIndex ? "current" : "upcoming";
                      return (
                        <li key={stage} className={state}>
                          <strong>{t.stages[stage]}</strong>
                          <span>{s.timeline[state]}</span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>

              <section className="card">
                <div className="card-head">
                  <h2>{hasQuote ? s.price.quoteTitle : s.price.estimateTitle}</h2>
                </div>
                {hasQuote ? (
                  <>
                    <p className="price">{formatMoney(lead.quoteAmount as number, locale)}</p>
                    <p className="card-text">{s.price.quoteNote}</p>
                    {lead.quoteNote && <blockquote className="bubble">{lead.quoteNote}</blockquote>}
                    {lead.stage === "quoted" && <AcceptQuote token={token} t={s.price} />}
                    {lead.quoteAcceptedAt && (
                      <p className="status show">
                        {fill(s.price.acceptedOn, { date: formatDay(lisbonDay(lead.quoteAcceptedAt), locale) })}
                      </p>
                    )}
                  </>
                ) : lead.estimate ? (
                  <>
                    <p className="price">
                      {formatRange(lead.estimate.low, lead.estimate.high, locale)}
                      <small>{lead.estimate.per === "visit" ? s.price.perVisit : s.price.perJob}</small>
                    </p>
                    <p className="card-text">{s.price.estimateNote}</p>
                  </>
                ) : (
                  <p className="card-text">{s.price.noEstimate}</p>
                )}
              </section>

              <section className="card">
                <Checklist token={token} initial={lead.checklist} t={s.checklist} />
              </section>

              <section className="card">
                <Photos token={token} photos={photos} max={MAX_PHOTOS} t={s.photos} />
              </section>
            </div>

            <aside className="dash-col">
              <section className="card">
                <span className="tile">
                  <CalendarCheckIcon />
                </span>
                {lead.scheduledAt && (lead.stage === "scheduled" || lead.stage === "done") ? (
                  <>
                    <h2>{s.schedule.scheduledTitle}</h2>
                    <p className="card-strong">{formatDateTime(lead.scheduledAt, locale)}</p>
                    {lead.stage === "scheduled" && <p className="card-text">{s.schedule.scheduledNote}</p>}
                  </>
                ) : (
                  <>
                    <h2>{s.schedule.preferenceTitle}</h2>
                    <p className="card-strong">{describeTiming(answers, t, locale)}</p>
                    {canChangePreference && (
                      <>
                        <p className="card-text">{s.schedule.pendingNote}</p>
                        <PreferenceForm
                          token={token}
                          initial={{ date: answers.date, slot: answers.slot, flexible: answers.flexible }}
                          t={s.schedule}
                          labels={{ date: t.quiz.labels.date, slot: t.quiz.labels.slot, flexible: t.quiz.labels.flexible }}
                          slotLabels={t.options.slot}
                        />
                      </>
                    )}
                  </>
                )}
              </section>

              {lead.stage !== "lost" && (
                <section className="card">
                  <MessageForm token={token} t={s.message} />
                </section>
              )}

              <section className="card">
                <h2>{s.feed.title}</h2>
                <ul className="feed">
                  {events.map((event) => (
                    <li key={event.id} className={event.kind === "message" ? `feed-message from-${event.actor}` : undefined}>
                      {event.kind === "message" && <strong>{event.actor === "client" ? s.feed.you : s.feed.team}</strong>}
                      <p>{describeEvent(event, t, locale)}</p>
                      <time dateTime={event.createdAt}>{formatShortDateTime(event.createdAt, locale)}</time>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </main>
      {footer}
    </>
  );
}
