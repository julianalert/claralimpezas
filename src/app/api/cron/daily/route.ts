import { timingSafeEqual } from "node:crypto";
import { runDailyJob } from "@/lib/server/automations";
import { isDatabaseConfigured } from "@/lib/server/supabase";

// Daily e-mails: quote follow-ups and day-before reminders (src/lib/server/automations.ts).
// Called by Vercel Cron (vercel.json), which sends "Authorization: Bearer <CRON_SECRET>".

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return new Response("Unauthorized", { status: 401 });
  if (!isDatabaseConfigured()) return Response.json({ error: "not configured" }, { status: 503 });
  try {
    return Response.json(await runDailyJob());
  } catch (error) {
    console.error("cron/daily:", error);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
