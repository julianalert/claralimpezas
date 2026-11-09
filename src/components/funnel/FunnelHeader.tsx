import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import { ArrowLeftIcon } from "../icons";
import { WordmarkText } from "../Wordmark";

/** Header of the quiz and the client space: the logo and a way back to the site. */
export function FunnelHeader({ locale, t }: { locale: Locale; t: { home: string; back: string } }) {
  return (
    <header className="nav">
      <div className="wrap nav-row">
        <Link href={localePath(locale)} className="brand" aria-label={t.home}>
          <WordmarkText variant="nav" />
        </Link>
        <Link href={localePath(locale)} className="nav-back">
          <ArrowLeftIcon />
          <span>{t.back}</span>
        </Link>
      </div>
    </header>
  );
}
