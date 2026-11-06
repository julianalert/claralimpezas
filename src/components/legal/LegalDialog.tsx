"use client";

import { Fragment, useEffect, useRef } from "react";
import type { LegalDoc } from "@/content/legal";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { CloseIcon } from "../icons";

/** `www.…` addresses and e-mail addresses, turned into links. */
const LINK_RE = /(www\.[a-z0-9.-]+\.[a-z]{2,}|[^\s@()]+@[^\s@()]+\.[a-z]{2,})/gi;

function RichText({ text }: { text: string }) {
  return text.split(LINK_RE).map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    const href = part.includes("@") ? `mailto:${part}` : `https://${part}`;
    const external = !part.includes("@");
    return (
      <a key={i} href={href} {...(external && { target: "_blank", rel: "noopener" })}>
        {part}
      </a>
    );
  });
}

type Props = {
  /** Also the URL hash that opens it: footer links point to `#<id>`, and so can shared links. */
  id: string;
  doc: LegalDoc;
  t: Dictionary["legal"];
  /** Shows the "provisional version" notice until the texts are reviewed (`siteConfig.legal`). */
  draft: boolean;
};

/** Privacy policy / terms modal, opened by its URL hash (`#privacidade`, `#termos`). */
export function LegalDialog({ id, doc, t, draft }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const openFromHash = () => {
      if (window.location.hash === `#${id}` && !dialog.open) dialog.showModal();
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [id]);

  // Drop the hash on close, so the same link opens the modal again. (The close event is async:
  // skip it if the modal was reopened in the meantime.)
  function handleClose() {
    if (!ref.current?.open && window.location.hash === `#${id}`) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  return (
    <dialog
      ref={ref}
      id={id}
      className="legal"
      aria-labelledby={`${id}-title`}
      onClose={handleClose}
      // A click on the backdrop lands on the <dialog> itself.
      onClick={(event) => event.target === event.currentTarget && ref.current?.close()}
    >
      <div className="legal-head">
        <h2 id={`${id}-title`}>{doc.title}</h2>
        <button
          type="button"
          className="legal-close"
          aria-label={t.close}
          onClick={() => ref.current?.close()}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="legal-body">
        {draft && <p className="legal-draft">{t.draft}</p>}
        <p className="legal-updated">{doc.updated}</p>
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h3>{section.heading}</h3>
            {section.blocks.map((block, i) =>
              Array.isArray(block) ? (
                <ul key={i}>
                  {block.map((item) => (
                    <li key={item}>
                      <RichText text={item} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p key={i}>
                  <RichText text={block} />
                </p>
              ),
            )}
          </section>
        ))}
      </div>
    </dialog>
  );
}
