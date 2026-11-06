"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type QuoteContextValue = {
  /** Service currently selected in the quote form ("" = none). */
  service: string;
  setService: (service: string) => void;
};

const QuoteContext = createContext<QuoteContextValue | null>(null);

/** Shares quote-form state across the page (e.g. service cards pre-select the form). */
export function QuoteProvider({ children }: { children: ReactNode }) {
  const [service, setService] = useState("");
  return (
    <QuoteContext.Provider value={{ service, setService }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used inside <QuoteProvider>");
  return ctx;
}
