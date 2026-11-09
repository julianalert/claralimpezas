"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/actions/admin";
import type { Locale } from "@/i18n/config";
import type { CrmDictionary } from "@/i18n/crm";
import { ArrowIcon, LockIcon } from "../icons";
import { LanguageSwitcher } from "../layout/LanguageSwitcher";
import { WordmarkText } from "../Wordmark";

/** Password screen in front of the CRM. */
export function Login({ locale, c, configured }: { locale: Locale; c: CrmDictionary; configured: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, null);
  const t = c.login;
  const problem = !configured || state?.error === "config" ? t.notConfigured : state?.error ? t.wrong : null;

  return (
    <main className="crm-login">
      <form className="form" action={action}>
        <WordmarkText variant="foot" />
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p className="sub">{t.text}</p>
        <div className="field">
          <label htmlFor="password">{t.password}</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            disabled={!configured}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending || !configured}>
          <LockIcon />
          <span>{pending ? t.checking : t.submit}</span>
          <ArrowIcon />
        </button>
        <p className={`status status-error${problem ? " show" : ""}`} role="alert">
          {problem}
        </p>
      </form>
      <LanguageSwitcher locale={locale} label={c.nav.language} scope="crm" />
    </main>
  );
}
