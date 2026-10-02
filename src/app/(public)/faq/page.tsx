import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/shared/section-heading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqGroups } from "@/lib/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about renting rooms, viewings, leases, Stripe rent payments, roommate matching and listing a property on NestMate.",
  openGraph: { title: "NestMate FAQ", description: "Answers about rooms, payments, roommates and listing a property." },
};

export default function FaqPage() {
  // FAQPage structured data for rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((g) => g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } }))),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero eyebrow="Help centre" title="Frequently asked questions" description="Everything you need to know about renting, paying and sharing with NestMate." />
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[220px_1fr]">
        <nav aria-label="FAQ sections" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1">
            {faqGroups.map((g) => (
              <li key={g.title}>
                <a href={`#${g.title.toLowerCase().replace(/\s+/g, "-")}`} className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-12">
          {faqGroups.map((group) => (
            <section key={group.title} id={group.title.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-24 space-y-4">
              <h2 className="font-heading text-2xl font-bold">{group.title}</h2>
              <Accordion type="single" collapsible className="rounded-2xl border bg-card px-5">
                {group.items.map((item) => (
                  <AccordionItem key={item.q} value={item.q}>
                    <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
          <div className="rounded-2xl border bg-muted/40 p-6 text-center">
            <p className="mb-3 font-semibold">Still have a question?</p>
            <Button asChild>
              <Link href="/contact">Contact support</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
