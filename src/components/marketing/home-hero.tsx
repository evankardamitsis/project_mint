import Link from "next/link";

import { SmartSearch } from "@/components/smart-search";

const CATEGORY_LINKS = [
  { label: "Κιθάρες", slug: "guitars" },
  { label: "Synths & Πλήκτρα", slug: "synths-keyboards" },
  { label: "Εφέ & Πετάλια", slug: "effects-pedals" },
  { label: "Επαγγελματικός Ήχος", slug: "pro-audio" },
  { label: "Drums", slug: "drums" },
  { label: "DJ Gear", slug: "dj-gear" },
];

export function HomeHero() {
  return (
    <section className="w-full border-b border-[#EEECE8] bg-[#FAFAF8] pb-4 pt-12 sm:pb-6 sm:pt-16">
      <div className="mx-auto max-w-[860px] px-4 text-center sm:px-6">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[#1D9E75]">
          Η ελληνική αγορά μουσικού εξοπλισμού
        </p>

        <h1
          className="mb-5 font-black leading-none tracking-[-0.03em] text-[#111111] sm:mb-6"
          style={{ fontSize: "clamp(32px, 9vw, 80px)" }}
        >
          ΑΓΟΡΑΣΕ.
          <br />
          ΠΟΥΛΗΣΕ.
          <br />
          <span className="text-[#1D9E75]">ΠΡΟΣΤΑΤΕΥΜΕΝΑ.</span>
        </h1>

        <p className="mx-auto mb-8 max-w-lg text-base text-[#6B6B6B] sm:mb-10 sm:text-lg">
          Το μόνο ελληνικό marketplace με προστατευμένη παράδοση — ασφαλής πληρωμή σε
          αναμονή και παρακολούθηση αποστολής με αποδεικτικές φωτογραφίες.
        </p>

        <SmartSearch variant="hero" />

        <div className="mt-4 flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden sm:mt-5 lg:flex-wrap lg:justify-center lg:overflow-visible">
          <Link
            href="/browse"
            className="shrink-0 whitespace-nowrap rounded-full border border-transparent bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all"
          >
            Όλα
          </Link>
          {CATEGORY_LINKS.map((cat) => (
            <Link
              key={cat.slug}
              href={`/browse?category=${cat.slug}`}
              className="shrink-0 whitespace-nowrap rounded-full border border-[#DDDBD6] bg-white px-5 py-2.5 text-sm font-semibold text-[#444444] transition-all hover:border-[#111111] hover:text-[#111111]"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
