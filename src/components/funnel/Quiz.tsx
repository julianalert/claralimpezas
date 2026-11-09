"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { submitQuiz, type SubmitQuizResult } from "@/actions/quiz";
import type { Locale } from "@/i18n/config";
import type { FunnelDictionary } from "@/i18n/funnel";
import { describeSpace, describeTiming } from "@/lib/funnel/describe";
import { clientSpaceHref, fill, formatRange } from "@/lib/funnel/format";
import {
  emptyAnswers,
  emptyContact,
  invalidFields,
  limits,
  quizSteps,
  serviceProfiles,
  todayInLisbon,
  withService,
  type InvalidField,
} from "@/lib/funnel/quiz";
import type { Contact, ExtraId, QuizAnswers } from "@/lib/funnel/types";
import { isServiceId, serviceIds, type ServiceId } from "@/lib/services";
import { ArrowIcon, ArrowLeftIcon, CheckIcon, LockIcon, Spark } from "../icons";
import { serviceIcons } from "./serviceIcons";

type Success = Extract<SubmitQuizResult, { status: "success" }>;

export type QuizProps = {
  locale: Locale;
  t: FunnelDictionary;
  services: Record<ServiceId, { name: string; description: string }>;
  /** Opens the privacy policy (a modal on the home page). */
  privacyHref: string;
  initialService?: ServiceId;
};

/** The quiz with the service taken from `?service=…` (links on the home page's service cards). */
export function QuizFromUrl(props: Omit<QuizProps, "initialService">) {
  const service = useSearchParams().get("service") ?? "";
  return <Quiz {...props} initialService={isServiceId(service) ? service : undefined} />;
}

export function Quiz({ locale, t, services, privacyHref, initialService }: QuizProps) {
  const q = t.quiz;
  const [answers, setAnswers] = useState<QuizAnswers>(() =>
    initialService ? withService(emptyAnswers, initialService) : emptyAnswers,
  );
  const [contact, setContact] = useState<Contact>(emptyContact);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [stepIndex, setStepIndex] = useState(initialService ? 1 : 0);
  const [invalid, setInvalid] = useState<InvalidField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Success | null>(null);
  const [pending, startTransition] = useTransition();
  const cardRef = useRef<HTMLElement>(null);

  const step = quizSteps[stepIndex];
  const profile = answers.service ? serviceProfiles[answers.service] : null;
  const isLast = stepIndex === quizSteps.length - 1;

  /** A field was just edited: drop its error mark, and the message once nothing is marked. */
  function clearInvalid(key: InvalidField) {
    const rest = invalid.filter((field) => field !== key);
    setInvalid(rest);
    if (rest.length === 0) setError(null);
  }
  function set<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) {
    setAnswers((current) => ({ ...current, [key]: value }));
    clearInvalid(key);
  }
  function setContactField(key: keyof Contact, value: string) {
    setContact((current) => ({ ...current, [key]: value }));
    clearInvalid(key);
  }
  function goTo(index: number) {
    setStepIndex(index);
    setInvalid([]);
    setError(null);
    // Each step has a different height: bring its top back into view.
    const top = cardRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) cardRef.current?.scrollIntoView({ block: "start" });
  }
  function pickService(service: ServiceId) {
    setAnswers((current) => withService(current, service));
    goTo(1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = invalidFields(step, answers, contact, consent);
    if (missing.length > 0) {
      setInvalid(missing);
      setError(
        missing.includes("date") ? q.errors.date : missing[0] === "email" && contact.email ? q.errors.email : q.errors.required,
      );
      const form = event.currentTarget;
      (form.querySelector(`[data-field="${missing[0]}"]`) as HTMLElement | null)?.focus();
      return;
    }
    if (!isLast) {
      goTo(stepIndex + 1);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const response = await submitQuiz({ locale, answers, contact, consent, website });
        if (response.status === "success") {
          setResult(response);
          cardRef.current?.scrollIntoView({ block: "start" });
        } else if (response.status === "invalid") {
          setStepIndex(quizSteps.indexOf(response.step));
          setInvalid([response.field]);
          setError(q.errors.required);
        } else {
          setError(response.status === "unavailable" ? q.errors.unavailable : q.errors.generic);
        }
      } catch {
        setError(q.errors.generic);
      }
    });
  }

  const has = (field: InvalidField) => invalid.includes(field);
  const numberValue = (value: number | null) => (value === null ? "" : String(value));
  const toNumber = (value: string) => (value === "" ? null : Math.max(0, Math.round(Number(value))) || 0);

  if (result) {
    return (
      <div className="quiz-layout">
        <section className="quiz" ref={cardRef} aria-live="polite">
          <div className="result-hero">
            <Spark className="spark-big" />
            <Spark className="spark-small" />
            <p className="eyebrow">{q.result.eyebrow}</p>
            <h1>{result.estimate ? q.result.title : q.result.titleNoEstimate}</h1>
            {result.estimate && (
              <>
                <p className="result-price">{formatRange(result.estimate.low, result.estimate.high, locale)}</p>
                <p className="result-per">{result.estimate.per === "visit" ? q.result.perVisit : q.result.perJob}</p>
              </>
            )}
            <p className="result-ref mono">
              {q.result.ref} {result.ref}
            </p>
          </div>
          <div className="quiz-body">
            {result.estimate && <p className="note">{q.result.note}</p>}
            <h2 className="quiz-h">{q.result.nextTitle}</h2>
            <p className="lead">{q.result.nextText}</p>
            <div className="quiz-actions quiz-actions-start">
              <Link className="btn btn-primary" href={clientSpaceHref(locale, result.token)}>
                <span>{q.result.openSpace}</span>
                <ArrowIcon />
              </Link>
            </div>
            <p className="form-note form-note-start">
              <LockIcon />
              <span>{fill(q.result.emailNote, { email: contact.email })}</span>
            </p>
          </div>
        </section>
        <QuizAside t={t} locale={locale} answers={answers} services={services} />
      </div>
    );
  }

  return (
    <div className="quiz-layout">
      <section className="quiz" ref={cardRef}>
        <div className="quiz-body">
          <div className="quiz-top">
            <h1 className="mono">{t.meta.quizTitle}</h1>
            <span className="mono">{fill(q.progress, { n: stepIndex + 1, total: quizSteps.length })}</span>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={quizSteps.length}
            aria-valuenow={stepIndex + 1}
            aria-label={fill(q.progress, { n: stepIndex + 1, total: quizSteps.length })}
          >
            {quizSteps.map((id, i) => (
              <span key={id} className={i <= stepIndex ? "on" : undefined} />
            ))}
          </div>
          <h2 className="quiz-h">{q.steps[step].title}</h2>
          <p className="lead">{q.steps[step].text}</p>

          <form noValidate onSubmit={handleSubmit}>
            {step === "service" && (
              <div className="choices choices-3" role="radiogroup" aria-label={q.steps.service.title}>
                {serviceIds.map((id, i) => {
                  const Icon = serviceIcons[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={answers.service === id}
                      className={answers.service === id ? "choice selected" : "choice"}
                      data-field={i === 0 ? "service" : undefined}
                      onClick={() => pickService(id)}
                    >
                      <span className="tile">
                        <Icon />
                      </span>
                      <strong>{services[id].name}</strong>
                      <small>{services[id].description}</small>
                    </button>
                  );
                })}
              </div>
            )}

            {step === "space" && profile && (
              <div className="fields">
                {profile.propertyTypes.length > 0 && (
                  <fieldset className={has("propertyType") ? "field wide invalid" : "field wide"}>
                    <legend>{q.labels.propertyType}</legend>
                    <div className="pills">
                      {profile.propertyTypes.map((type, i) => (
                        <button
                          key={type}
                          type="button"
                          aria-pressed={answers.propertyType === type}
                          className={answers.propertyType === type ? "pill selected" : "pill"}
                          data-field={i === 0 ? "propertyType" : undefined}
                          onClick={() => set("propertyType", type)}
                        >
                          {t.options.propertyType[type]}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}
                {profile.fields.includes("bedrooms") && (
                  <fieldset className={has("bedrooms") ? "field wide invalid" : "field wide"}>
                    <legend>{q.labels.bedrooms}</legend>
                    <div className="pills">
                      {t.options.bedrooms.map((label, i) => (
                        <button
                          key={label}
                          type="button"
                          aria-pressed={answers.bedrooms === i}
                          className={answers.bedrooms === i ? "pill selected" : "pill"}
                          data-field={i === 0 ? "bedrooms" : undefined}
                          onClick={() => set("bedrooms", i)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}
                {profile.fields.includes("bathrooms") && (
                  <fieldset className={has("bathrooms") ? "field wide invalid" : "field wide"}>
                    <legend>{q.labels.bathrooms}</legend>
                    <div className="pills">
                      {t.options.bathrooms.map((label, i) => (
                        <button
                          key={label}
                          type="button"
                          aria-pressed={answers.bathrooms === i + 1}
                          className={answers.bathrooms === i + 1 ? "pill selected" : "pill"}
                          data-field={i === 0 ? "bathrooms" : undefined}
                          onClick={() => set("bathrooms", i + 1)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}
                {profile.fields.includes("area") && (
                  <div className={has("area") ? "field wide invalid" : "field wide"}>
                    <label htmlFor="q-area">{q.labels.area}</label>
                    <input
                      id="q-area"
                      data-field="area"
                      type="number"
                      inputMode="numeric"
                      min={limits.area.min}
                      max={limits.area.max}
                      placeholder={q.placeholders.area}
                      value={numberValue(answers.area)}
                      aria-invalid={has("area")}
                      onChange={(e) => set("area", toNumber(e.target.value))}
                    />
                    <p className="hint">{q.hints.area}</p>
                  </div>
                )}
                {profile.fields.includes("units") && (
                  <div className={has("units") ? "field wide invalid" : "field wide"}>
                    <label htmlFor="q-units">
                      {answers.service === "vidros" ? q.labels.windows : q.labels.pieces}
                    </label>
                    <input
                      id="q-units"
                      data-field="units"
                      type="number"
                      inputMode="numeric"
                      min={limits.units.min}
                      max={limits.units.max}
                      placeholder={answers.service === "vidros" ? q.placeholders.windows : q.placeholders.pieces}
                      value={numberValue(answers.units)}
                      aria-invalid={has("units")}
                      onChange={(e) => set("units", toNumber(e.target.value))}
                    />
                  </div>
                )}
              </div>
            )}

            {step === "timing" && profile && (
              <div className="fields">
                {profile.frequencies.length > 1 && (
                  <fieldset className="field wide">
                    <legend>{q.labels.frequency}</legend>
                    <div className="choices choices-2" role="radiogroup" aria-label={q.labels.frequency}>
                      {profile.frequencies.map((frequency) => (
                        <button
                          key={frequency}
                          type="button"
                          role="radio"
                          aria-checked={answers.frequency === frequency}
                          className={answers.frequency === frequency ? "choice compact selected" : "choice compact"}
                          onClick={() => set("frequency", frequency)}
                        >
                          <strong>{t.options.frequency[frequency].label}</strong>
                          <small>{t.options.frequency[frequency].hint}</small>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}
                <div className={has("date") ? "field invalid" : "field"}>
                  <label htmlFor="q-date">{q.labels.date}</label>
                  <input
                    id="q-date"
                    data-field="date"
                    type="date"
                    min={todayInLisbon()}
                    value={answers.date}
                    aria-invalid={has("date")}
                    onChange={(e) => set("date", e.target.value)}
                  />
                </div>
                <fieldset className="field">
                  <legend>{q.labels.slot}</legend>
                  <div className="pills">
                    {(["morning", "afternoon", "flexible"] as const).map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        aria-pressed={answers.slot === slot}
                        className={answers.slot === slot ? "pill selected" : "pill"}
                        onClick={() => set("slot", slot)}
                      >
                        {t.options.slot[slot]}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="check wide">
                  <input
                    type="checkbox"
                    checked={answers.flexible}
                    onChange={(e) => set("flexible", e.target.checked)}
                  />
                  <span>{q.labels.flexible}</span>
                </label>
              </div>
            )}

            {step === "extras" && profile && (
              <div className="fields">
                <fieldset className="field wide">
                  <legend>{q.labels.extras}</legend>
                  <div className="checks">
                    {profile.extras.map((extra: ExtraId) => (
                      <label key={extra} className="check boxed">
                        <input
                          type="checkbox"
                          checked={answers.extras.includes(extra)}
                          onChange={(e) =>
                            set(
                              "extras",
                              e.target.checked
                                ? [...answers.extras, extra]
                                : answers.extras.filter((id) => id !== extra),
                            )
                          }
                        />
                        <span>{t.options.extras[extra]}</span>
                      </label>
                    ))}
                  </div>
                  <p className="hint">{q.hints.extras}</p>
                </fieldset>
                <div className="field wide">
                  <label htmlFor="q-details">{q.labels.details}</label>
                  <textarea
                    id="q-details"
                    maxLength={limits.details}
                    placeholder={q.placeholders.details}
                    value={answers.details}
                    onChange={(e) => set("details", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === "contact" && (
              <div className="fields">
                <div className={has("name") ? "field wide invalid" : "field wide"}>
                  <label htmlFor="q-name">{q.labels.name}</label>
                  <input
                    id="q-name"
                    data-field="name"
                    autoComplete="name"
                    maxLength={limits.name}
                    placeholder={q.placeholders.name}
                    value={contact.name}
                    aria-invalid={has("name")}
                    onChange={(e) => setContactField("name", e.target.value)}
                  />
                </div>
                <div className={has("email") ? "field invalid" : "field"}>
                  <label htmlFor="q-email">{q.labels.email}</label>
                  <input
                    id="q-email"
                    data-field="email"
                    type="email"
                    autoComplete="email"
                    maxLength={limits.email}
                    placeholder={q.placeholders.email}
                    value={contact.email}
                    aria-invalid={has("email")}
                    onChange={(e) => setContactField("email", e.target.value)}
                  />
                </div>
                <div className={has("phone") ? "field invalid" : "field"}>
                  <label htmlFor="q-phone">{q.labels.phone}</label>
                  <input
                    id="q-phone"
                    data-field="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={limits.phone}
                    placeholder={q.placeholders.phone}
                    value={contact.phone}
                    aria-invalid={has("phone")}
                    onChange={(e) => setContactField("phone", e.target.value)}
                  />
                </div>
                <div className={has("zone") ? "field wide invalid" : "field wide"}>
                  <label htmlFor="q-zone">{q.labels.zone}</label>
                  <input
                    id="q-zone"
                    data-field="zone"
                    autoComplete="postal-code"
                    maxLength={limits.zone}
                    placeholder={q.placeholders.zone}
                    value={contact.zone}
                    aria-invalid={has("zone")}
                    onChange={(e) => setContactField("zone", e.target.value)}
                  />
                </div>
                {/* Honeypot: off-screen and skipped by keyboard and screen readers. */}
                <div className="hp" aria-hidden="true">
                  <label htmlFor="q-website">Website</label>
                  <input
                    id="q-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                <label className={has("consent") ? "check wide invalid" : "check wide"}>
                  <input
                    type="checkbox"
                    data-field="consent"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      clearInvalid("consent");
                    }}
                  />
                  <span>
                    {q.consent}{" "}
                    <a href={privacyHref} target="_blank" rel="noopener">
                      {q.privacy}
                    </a>
                  </span>
                </label>
              </div>
            )}

            <p className={`status status-error${error ? " show" : ""}`} role="alert">
              {error}
            </p>

            {(step !== "service" || answers.service) && (
              <div className="quiz-actions">
                {stepIndex > 0 ? (
                  <button type="button" className="link" onClick={() => goTo(stepIndex - 1)}>
                    <ArrowLeftIcon />
                    <span>{q.back}</span>
                  </button>
                ) : (
                  <span />
                )}
                <button type="submit" className="btn btn-primary" disabled={pending}>
                  <span>{pending ? q.sending : isLast ? q.submit : q.next}</span>
                  <ArrowIcon />
                </button>
              </div>
            )}
          </form>
        </div>
      </section>
      <QuizAside t={t} locale={locale} answers={answers} services={services} />
    </div>
  );
}

function QuizAside({
  t,
  locale,
  answers,
  services,
}: Pick<QuizProps, "t" | "locale" | "services"> & { answers: QuizAnswers }) {
  const a = t.quiz.aside;
  const profile = answers.service ? serviceProfiles[answers.service] : null;
  const rows: [string, string][] = [
    [a.rows.service, answers.service ? services[answers.service].name : ""],
    [a.rows.space, describeSpace(answers, t)],
    [a.rows.frequency, profile ? t.options.frequency[answers.frequency].label : ""],
    [a.rows.date, answers.service ? describeTiming(answers, t, locale) : ""],
  ];
  return (
    <aside className="quiz-aside">
      <p className="eyebrow">{t.quiz.eyebrow}</p>
      <h2>{a.title}</h2>
      <p className="lead">{a.text}</p>
      <dl className="rows">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className={value ? undefined : "unset"}>{value || a.empty}</dd>
          </div>
        ))}
      </dl>
      <ul className="ticks">
        {a.bullets.map((bullet) => (
          <li key={bullet}>
            <CheckIcon />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
