"use client";

import type { ServiceId } from "@/lib/services";
import { ArrowIcon } from "../icons";
import { useQuote } from "./QuoteProvider";

/** "Get a quote" link on a service card: jumps to the form with that service pre-selected. */
export function ServiceQuoteLink({ service, label }: { service: ServiceId; label: string }) {
  const { setService } = useQuote();
  return (
    <a className="link" href="#contacto" onClick={() => setService(service)}>
      <span>{label}</span>
      <ArrowIcon />
    </a>
  );
}
