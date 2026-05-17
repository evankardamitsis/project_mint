import Link from "next/link";

import { HomeSearch } from "@/components/marketing/home-search";

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
    <section className="w-full overflow-hidden border-b border-[#EEECE8] bg-[#FAFAF8] pb-10 pt-12 sm:pb-12 sm:pt-16">
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

        <HomeSearch />

        <div className="mt-4 flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden sm:mt-5">
          <Link
            href="/browse"
            className="shrink-0 whitespace-nowrap rounded-full border border-[#DDDBD5] bg-white px-3 py-1.5 text-sm font-medium text-[#444444] transition-all hover:border-[#1D9E75] hover:text-[#1D9E75] sm:px-4 sm:py-2"
          >
            Όλα
          </Link>
          {CATEGORY_LINKS.map((cat) => (
            <Link
              key={cat.slug}
              href={`/browse?category=${cat.slug}`}
              className="shrink-0 whitespace-nowrap rounded-full border border-[#DDDBD5] bg-white px-3 py-1.5 text-sm font-medium text-[#444444] transition-all hover:border-[#1D9E75] hover:text-[#1D9E75] sm:px-4 sm:py-2"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
