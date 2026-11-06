import type { Dictionary } from "@/i18n/dictionaries/pt";
import { ChatIcon, DocumentIcon, SparklesIcon } from "../icons";
import { WordmarkText } from "../Wordmark";

export function Header({ t }: { t: Dictionary["nav"] }) {
  return (
    <header className="nav">
      <div className="wrap nav-row">
        <a href="#inicio" className="brand" aria-label={t.home}>
          <WordmarkText variant="nav" />
        </a>

        <nav className="navlinks" aria-label={t.label}>
          <a href="#servicos">{t.services}</a>
          <a href="#porque">{t.why}</a>
          <a href="#como-funciona">{t.how}</a>
          <a href="#contacto">{t.contact}</a>
        </nav>

        <a className="btn btn-mint btn-sm" href="#contacto">
          {t.quote}
        </a>
      </div>

      {/* Mobile / tablet: link strip under the header (replaces the desktop links) */}
      <nav className="navstrip" aria-label={t.label}>
        <a href="#servicos">
          <SparklesIcon />
          {t.services}
        </a>
        <a href="#como-funciona">
          <DocumentIcon />
          {t.how}
        </a>
        <a href="#contacto">
          <ChatIcon />
          {t.contact}
        </a>
      </nav>
    </header>
  );
}
