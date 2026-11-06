"use server";

import { findInvalidField, parseQuote, type QuoteResult } from "@/lib/quote";

export async function submitQuote(formData: FormData): Promise<QuoteResult> {
  const quote = parseQuote(formData);

  const invalid = findInvalidField(quote);
  if (invalid) return { status: "invalid", field: invalid };

  // TODO: deliver `quote` to the CRM / email provider, then return { status: "success" }.
  // Until delivery is wired up, the form answers with a demo notice (same as the original site).
  return { status: "demo" };
}
