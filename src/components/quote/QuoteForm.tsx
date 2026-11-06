"use client";

import { useState, useTransition, type FormEvent } from "react";
import { submitQuote } from "@/actions/quote";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { findInvalidField, parseQuote, type QuoteResult } from "@/lib/quote";
import { serviceIds, type ServiceId } from "@/lib/services";
import { ArrowIcon, LockIcon } from "../icons";
import { useQuote } from "./QuoteProvider";

type Props = {
  t: Dictionary["form"];
  serviceNames: Record<ServiceId, string>;
};

export function QuoteForm({ t, serviceNames }: Props) {
  const { service, setService } = useQuote();
  const [result, setResult] = useState<QuoteResult["status"] | null>(null);
  const [pending, startTransition] = useTransition();

  function focusField(form: HTMLFormElement, name: string) {
    (form.elements.namedItem(name) as HTMLElement | null)?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    // Validate on the client first for instant feedback; the server action validates again.
    const invalid = findInvalidField(parseQuote(formData));
    if (invalid) {
      setResult("invalid");
      focusField(form, invalid);
      return;
    }

    startTransition(async () => {
      try {
        const res = await submitQuote(formData);
        setResult(res.status);
        if (res.status === "invalid") focusField(form, res.field);
        if (res.status === "success") {
          form.reset();
          setService("");
        }
      } catch {
        setResult("error");
      }
    });
  }

  return (
    <form className="form" noValidate onSubmit={handleSubmit}>
      <h3>{t.title}</h3>
      <p className="sub">{t.description}</p>

      <div className="fields">
        <div className="field wide">
          <label htmlFor="service">{t.labels.service}</label>
          <select
            id="service"
            name="service"
            required
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="">{t.placeholders.service}</option>
            {serviceIds.map((id) => (
              <option key={id} value={id}>
                {serviceNames[id]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="name">{t.labels.name}</label>
          <input id="name" name="name" required autoComplete="name" placeholder={t.placeholders.name} />
        </div>
        <div className="field">
          <label htmlFor="phone">{t.labels.phone}</label>
          <input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder={t.placeholders.phone} />
        </div>
        <div className="field">
          <label htmlFor="email">{t.labels.email}</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder={t.placeholders.email} />
        </div>
        <div className="field">
          <label htmlFor="area">{t.labels.area}</label>
          <input id="area" name="area" required placeholder={t.placeholders.area} />
        </div>
        <div className="field wide">
          <label htmlFor="message">{t.labels.message}</label>
          <textarea id="message" name="message" placeholder={t.placeholders.message} />
        </div>
      </div>

      <button type="submit" className="btn btn-solid" disabled={pending}>
        <span>{pending ? t.sending : t.submit}</span>
        <ArrowIcon />
      </button>
      <p className="form-note">
        <LockIcon />
        <span>{t.note}</span>
      </p>
      <p className={`status${result ? " show" : ""}`} role="status">
        {result ? t.status[result] : null}
      </p>
    </form>
  );
}
