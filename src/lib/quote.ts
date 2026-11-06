// Quote request shape + validation, shared by the client form and the server action.
import { isServiceId } from "./services";

export type QuoteRequest = {
  service: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  message: string;
};

export type QuoteField = keyof QuoteRequest;

/** Required fields, in the order they appear in the form (first invalid one gets focus). */
const requiredFields = ["service", "name", "phone", "email", "area"] as const;

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function parseQuote(formData: FormData): QuoteRequest {
  const get = (key: QuoteField) => String(formData.get(key) ?? "").trim();
  return {
    service: get("service"),
    name: get("name"),
    phone: get("phone"),
    email: get("email"),
    area: get("area"),
    message: get("message"),
  };
}

/** Returns the first invalid field, or `null` when the request is valid. */
export function findInvalidField(quote: QuoteRequest): QuoteField | null {
  for (const field of requiredFields) {
    if (!quote[field]) return field;
  }
  if (!isServiceId(quote.service)) return "service";
  if (!EMAIL_RE.test(quote.email)) return "email";
  return null;
}

export type QuoteResult =
  | { status: "invalid"; field: QuoteField }
  | { status: "demo" }
  | { status: "success" }
  | { status: "error" };
