import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// CRM access: one shared password (ADMIN_PASSWORD). A successful login sets an HTTP-only cookie
// holding an expiry date signed with a key derived from the password and the Supabase service key,
// so changing either one signs everybody out.

const COOKIE = "clara_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function signingKey(): Buffer {
  return createHash("sha256")
    .update(`clara-admin:${process.env.ADMIN_PASSWORD ?? ""}:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`)
    .digest();
}

function sign(expires: number): string {
  return createHmac("sha256", signingKey()).update(String(expires)).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function isPasswordValid(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(password, expected as string);
}

export async function isAdmin(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !safeEqual(signature, sign(Number(expires)))) return false;
  return Number(expires) > Date.now();
}

/** For server actions: throws unless the caller is signed in to the CRM. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

/** Only call from a server action, after checking the password. */
export async function startAdminSession(): Promise<void> {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
