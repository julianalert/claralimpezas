import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Crm } from "@/components/crm/Crm";
import { Login } from "@/components/crm/Login";
import type { Locale } from "@/i18n/config";
import { loadCrmDictionary } from "@/i18n/crm";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { loadFunnelDictionary } from "@/i18n/funnel";
import { serviceIds, type ServiceId } from "@/lib/services";
import { isEmailConfigured, teamEmail } from "@/lib/server/email";
import { getAutomations, listLeads, listRecentEvents } from "@/lib/server/leads";
import { isAdmin, isAdminConfigured } from "@/lib/server/session";
import { isDatabaseConfigured } from "@/lib/server/supabase";

// The team's CRM, behind the shared password. Opens in English at /admin (see src/proxy.ts);
// the language can be changed from the sidebar. Never indexed.

export async function generateMetadata(): Promise<Metadata> {
  const c = await loadCrmDictionary(await getLocale());
  return {
    title: c.meta.title,
    alternates: {},
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export default async function AdminPage({ searchParams }: PageProps<"/[lang]/admin">) {
  const locale = await getLocale();
  return (
    // The session cookie and the requests are read on every visit: nothing here is prerendered.
    <Suspense fallback={<div className="crm-loading" aria-busy="true" />}>
      <AdminGate locale={locale} searchParams={searchParams} />
    </Suspense>
  );
}

async function loadCrmData() {
  if (!isDatabaseConfigured()) return "not-configured" as const;
  try {
    const [leads, events, automations] = await Promise.all([listLeads(), listRecentEvents(), getAutomations()]);
    return { leads, events, automations };
  } catch (error) {
    console.error("CRM:", error);
    return "error" as const;
  }
}

async function AdminGate({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: PageProps<"/[lang]/admin">["searchParams"];
}) {
  // Request time only: the session check compares the cookie's expiry with the current time.
  await connection();
  const c = await loadCrmDictionary(locale);
  if (!(await isAdmin())) {
    return <Login locale={locale} c={c} configured={isAdminConfigured()} />;
  }

  const [f, site, data, query] = await Promise.all([
    loadFunnelDictionary(locale),
    getDictionary(),
    loadCrmData(),
    searchParams,
  ]);
  const services = Object.fromEntries(
    serviceIds.map((id) => [id, site.services.items[id].name]),
  ) as Record<ServiceId, string>;
  const setupProblem = typeof data === "string" ? data : null;

  return (
    <Crm
      locale={locale}
      c={c}
      f={f}
      services={services}
      leads={typeof data === "string" ? [] : data.leads}
      events={typeof data === "string" ? [] : data.events}
      automations={typeof data === "string" ? null : data.automations}
      setupProblem={setupProblem}
      emailConfigured={isEmailConfigured()}
      teamEmailSet={teamEmail() !== null}
      initialLeadId={typeof query.lead === "string" ? query.lead : null}
    />
  );
}
