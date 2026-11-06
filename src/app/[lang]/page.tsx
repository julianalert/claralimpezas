import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { QuoteProvider } from "@/components/quote/QuoteProvider";
import { Contact } from "@/components/sections/Contact";
import { CtaBand } from "@/components/sections/CtaBand";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Services } from "@/components/sections/Services";
import { TrustBar } from "@/components/sections/TrustBar";
import { WhyClara } from "@/components/sections/WhyClara";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getDictionary();

  return (
    <>
      <Header t={t.nav} />
      <QuoteProvider>
        <main>
          <Hero t={t.hero} />
          <TrustBar t={t.trust} />
          <Services t={t.services} />
          <WhyClara t={t.why} />
          <HowItWorks t={t.how} />
          <Contact t={t.contact} form={t.form} services={t.services.items} />
          <CtaBand t={t.band} />
        </main>
      </QuoteProvider>
      <Footer locale={locale} t={t.footer} nav={t.nav} />
    </>
  );
}
