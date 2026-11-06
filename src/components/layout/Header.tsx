"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { ArrowIcon, MenuIcon } from "../icons";
import { WordmarkText } from "../Wordmark";
import { LanguageSwitcher } from "./LanguageSwitcher";

type Props = { locale: Locale; t: Dictionary["nav"] };

export function Header({ locale, t }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="nav">
      <div className="wrap nav-row">
        <a href="#inicio" className="brand" aria-label={t.home}>
          <WordmarkText variant="nav" />
          <span className="city">{t.city}</span>
        </a>

        <nav
          id="navlinks"
          className={`navlinks${menuOpen ? " open" : ""}`}
          aria-label={t.label}
        >
          <a href="#servicos" onClick={closeMenu}>{t.services}</a>
          <a href="#porque" onClick={closeMenu}>{t.why}</a>
          <a href="#como-funciona" onClick={closeMenu}>{t.how}</a>
          <a href="#contacto" onClick={closeMenu}>{t.contact}</a>
        </nav>

        <div className="nav-actions">
          <LanguageSwitcher locale={locale} label={t.language} />
          <a className="btn btn-mint" href="#contacto">
            <span>{t.quote}</span>
            <ArrowIcon />
          </a>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={menuOpen}
            aria-controls="navlinks"
            aria-label={t.menu}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
