import "server-only";
import { siteConfig } from "@/config/site";
import { htmlLang, type Locale } from "@/i18n/config";

// E-mail delivery through Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email),
// plus the one HTML layout every message uses.

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function teamEmail(): string | null {
  return process.env.TEAM_EMAIL?.trim() || null;
}

const sender = () => process.env.EMAIL_FROM?.trim() || "Clara <onboarding@resend.dev>";

export type SendResult = { status: "sent" } | { status: "skipped" } | { status: "failed"; error: string };

export async function sendEmail(message: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { status: "skipped" };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: sender(),
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.replyTo && { reply_to: message.replyTo }),
      }),
    });
    if (response.ok) return { status: "sent" };
    const detail = await response.text().catch(() => "");
    return { status: "failed", error: `Resend ${response.status}: ${detail.slice(0, 300)}` };
  } catch (error) {
    return { status: "failed", error: error instanceof Error ? error.message : String(error) };
  }
}

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string,
  );
}

export type EmailContent = {
  locale: Locale;
  heading: string;
  /** Paragraphs of plain text. */
  paragraphs: string[];
  /** Label / value pairs shown in a box (reference, amount...). */
  rows?: { label: string; value: string }[];
  /** A quoted block (a message from the team or from the client). */
  quote?: string;
  cta?: { label: string; url: string };
  /** Paragraphs after the button. */
  closing?: string[];
  footer: string;
};

// Clara's palette (src/app/globals.css).
const c = { pine: "#0e4d43", deep: "#052f29", mint: "#7bc4b1", ivory: "#f8f7f3", ink: "#16362f", muted: "#5c746d", line: "#e3e8e5", soft: "#e6f5f1" };
const font = "Archivo, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function renderEmail(content: EmailContent): { html: string; text: string } {
  const { heading, paragraphs, rows = [], quote, cta, closing = [], footer } = content;
  const p = (text: string) =>
    `<p style="margin:0 0 16px;font:400 15px/1.6 ${font};color:${c.ink}">${escapeHtml(text).replace(/\n/g, "<br>")}</p>`;

  const rowsHtml = rows.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border:1px solid ${c.line};border-radius:12px;background:${c.ivory}">${rows
        .map(
          (row, i) =>
            `<tr><td style="padding:12px 16px;font:400 13px/1.4 ${font};color:${c.muted};${i ? `border-top:1px solid ${c.line}` : ""}">${escapeHtml(row.label)}</td><td align="right" style="padding:12px 16px;font:600 14px/1.4 ${font};color:${c.ink};${i ? `border-top:1px solid ${c.line}` : ""}">${escapeHtml(row.value)}</td></tr>`,
        )
        .join("")}</table>`
    : "";
  const quoteHtml = quote
    ? `<div style="margin:0 0 24px;padding:14px 16px;border-left:3px solid ${c.mint};border-radius:0 12px 12px 0;background:${c.soft};font:400 15px/1.6 ${font};color:${c.ink}">${escapeHtml(quote).replace(/\n/g, "<br>")}</div>`
    : "";
  const ctaHtml = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="border-radius:12px;background:${c.pine}"><a href="${escapeHtml(cta.url)}" style="display:inline-block;padding:14px 24px;font:600 14px/1.3 ${font};color:#ffffff;text-decoration:none">${escapeHtml(cta.label)} →</a></td></tr></table>`
    : "";

  const html = `<!doctype html>
<html lang="${htmlLang[content.locale]}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:${c.ivory}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.ivory}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:20px 28px;border-radius:12px 12px 0 0;background:${c.deep};font:800 26px/1 Inter, ${font};letter-spacing:-0.07em;color:#ffffff">clara<span style="color:${c.mint}">.</span></td></tr>
<tr><td style="padding:32px 28px 16px;border:1px solid ${c.line};border-top:0;border-radius:0 0 12px 12px;background:#ffffff">
<h1 style="margin:0 0 20px;font:600 24px/1.25 ${font};color:${c.ink}">${escapeHtml(heading)}</h1>
${paragraphs.map(p).join("\n")}
${rowsHtml}${quoteHtml}${ctaHtml}
${closing.map(p).join("\n")}
</td></tr>
<tr><td style="padding:20px 28px;font:400 12px/1.5 ${font};color:${c.muted}">${escapeHtml(footer)}<br>${escapeHtml(siteConfig.businessName)} · ${escapeHtml(siteConfig.business.address.streetAddress)}, ${escapeHtml(siteConfig.business.address.postalCode)} ${escapeHtml(siteConfig.business.address.addressLocality)}</td></tr>
</table>
</td></tr></table>
</body>
</html>`;

  const text = [
    heading,
    "",
    ...paragraphs,
    ...(rows.length ? ["", ...rows.map((row) => `${row.label}: ${row.value}`)] : []),
    ...(quote ? ["", quote.replace(/^/gm, "> ")] : []),
    ...(cta ? ["", `${cta.label}: ${cta.url}`] : []),
    ...(closing.length ? ["", ...closing] : []),
    "",
    "--",
    footer,
  ].join("\n");

  return { html, text };
}
