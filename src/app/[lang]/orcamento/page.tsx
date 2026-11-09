import type { Metadata } from "next";
import { Suspense } from "react";
import { FunnelFooter } from "@/components/funnel/FunnelFooter";
import { FunnelHeader } from "@/components/funnel/FunnelHeader";
import { Quiz, QuizFromUrl, type QuizProps } from "@/components/funnel/Quiz";
import { siteConfig } from "@/config/site";
import { defaultLocale, htmlLang, localePath, locales, ogLocale, type Locale } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { loadFunnelDictionary } from "@/i18n/funnel";
import { quizHref } from "@/lib/funnel/format";
import { serviceIds, type ServiceId } from "@/lib/services";

// The quote quiz, at /orcamento, /en/quote and /fr/devis (see src/proxy.ts).
// Public and indexable: it is the page every "get a quote" button leads to.

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await loadFunnelDictionary(locale);
  const url = quizHref(locale);
  return {
    title: t.meta.quizTitle,
    description: t.meta.quizDescription,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map((l) => [htmlLang[l], quizHref(l)])),
        "x-default": quizHref(defaultLocale),
      },
    },
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.businessName,
      title: t.meta.quizTitle,
      description: t.meta.quizDescription,
      locale: ogLocale[locale],
    },
  };
}

export default async function QuizPage() {
  const locale = await getLocale();
  const [t, site] = await Promise.all([loadFunnelDictionary(locale), getDictionary()]);
  const services = Object.fromEntries(
    serviceIds.map((id) => [
      id,
      { name: site.services.items[id].name, description: site.services.items[id].description },
    ]),
  ) as Record<ServiceId, { name: string; description: string }>;
  const quizHrefs = Object.fromEntries(locales.map((l) => [l, quizHref(l)])) as Record<Locale, string>;
  const quiz: QuizProps = { locale, t, services, privacyHref: `${localePath(locale)}#privacidade` };

  return (
    <>
      <FunnelHeader locale={locale} t={t.shell} />
      <main className="funnel">
        <div className="wrap">
          {/* `?service=` is only known in the browser: the static page ships the quiz at step 1. */}
          <Suspense fallback={<Quiz {...quiz} />}>
            <QuizFromUrl {...quiz} />
          </Suspense>
        </div>
      </main>
      <FunnelFooter locale={locale} t={t.shell} hrefs={quizHrefs} />
    </>
  );
}
