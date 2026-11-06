import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { WordmarkText } from "../Wordmark";
import { LanguageSwitcher } from "./LanguageSwitcher";

async function CurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

type Props = { locale: Locale; t: Dictionary["footer"]; nav: Dictionary["nav"] };

export function Footer({ locale, t, nav }: Props) {
  return (
    <footer data-hide-floating-cta>
      <div className="wrap foot-row">
        <div className="foot-brand">
          <a href="#inicio" aria-label={siteConfig.name}>
            <WordmarkText variant="foot" />
          </a>
        </div>
        <nav className="foot-links" aria-label={t.label}>
          <a href="#servicos">{nav.services}</a>
          <a href="#como-funciona">{nav.how}</a>
          <a href="#contacto">{nav.contact}</a>
          {/* TODO: point to real privacy / terms pages once they exist */}
          <a href="#privacidade">{t.privacy}</a>
          <a href="#termos">{t.terms}</a>
          <a href={siteConfig.complaintsBookUrl} target="_blank" rel="noopener">
            {t.complaints}
          </a>
        </nav>
      </div>
      <div className="wrap foot-base">
        <span>
          © <CurrentYear /> {siteConfig.name} — {siteConfig.domain} · {t.made}
        </span>
        <LanguageSwitcher locale={locale} label={nav.language} />
      </div>
    </footer>
  );
}
