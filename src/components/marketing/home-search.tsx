"use client";

import {
  IconAdjustments,
  IconDisc,
  IconGuitarPick,
  IconMetronome,
  IconMicrophone,
  IconPiano,
} from "@tabler/icons-react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { ComponentType } from "react";

const POPULAR_SEARCHES = [
  "Fender Stratocaster",
  "Roland SH-101",
  "Gibson Les Paul",
  "Marshall Amplifier",
  "Pioneer DJM",
  "Neumann U87",
];

type CategoryEntry = {
  label: string;
  Icon: ComponentType<{ className?: string; stroke?: number }>;
  slug: string;
};

const CATEGORIES: CategoryEntry[] = [
  { label: "Κιθάρες", Icon: IconGuitarPick, slug: "guitars" },
  { label: "Synths & Πλήκτρα", Icon: IconPiano, slug: "synths-keyboards" },
  { label: "Εφέ & Πετάλια", Icon: IconAdjustments, slug: "effects-pedals" },
  { label: "Επαγγελματικός Ήχος", Icon: IconMicrophone, slug: "pro-audio" },
  { label: "Drums", Icon: IconMetronome, slug: "drums" },
  { label: "DJ Gear", Icon: IconDisc, slug: "dj-gear" },
];

export function HomeSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function submit(q: string) {
    const trimmed = q.trim();
    router.push(trimmed ? `/browse?q=${encodeURIComponent(trimmed)}` : "/browse");
  }

  function handleFocus() {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setFocused(true);
  }

  function handleBlur() {
    blurTimer.current = setTimeout(() => setFocused(false), 150);
  }

  function handlePopularClick(term: string) {
    setQuery(term);
    submit(term);
  }

  return (
    <div className="relative mx-auto max-w-[720px]">
      <div className="flex items-center gap-2 rounded-full border border-[#EEECE8] bg-white px-4 py-2.5 shadow-[0_2px_20px_rgba(0,0,0,0.08)] transition-all focus-within:border-[#1D9E75] focus-within:shadow-[0_2px_24px_rgba(0,0,0,0.14)] sm:gap-3 sm:px-5 sm:py-3">
        <Search className="h-4 w-4 shrink-0 text-[#ABABAB] sm:h-5 sm:w-5" />
        <input
          type="text"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#ABABAB] sm:text-base"
          placeholder="Αναζήτησε... π.χ. Fender Strat, Roland SH-101"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && submit(query)}
        />
        <button
          type="button"
          onClick={() => submit(query)}
          className="shrink-0 rounded-full bg-[#1D9E75] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#188A65] sm:px-6 sm:py-2.5"
        >
          <span className="hidden sm:inline">Αναζήτηση</span>
          <Search className="h-4 w-4 sm:hidden" aria-label="Αναζήτηση" />
        </button>
      </div>

      {focused && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-[#EEECE8] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
          {query.length === 0 ? (
            <>
              <p className="px-4 pb-2 pt-4 text-[10px] font-bold uppercase tracking-widest text-[#ABABAB] sm:px-5">
                Δημοφιλείς αναζητήσεις
              </p>
              <div className="flex flex-wrap gap-2 px-4 pb-4 sm:px-5">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onMouseDown={() => handlePopularClick(term)}
                    className="rounded-full bg-[#F7F6F3] px-3 py-1.5 text-sm font-medium text-[#111111] transition-colors hover:bg-[#EEECE8]"
                  >
                    {term}
                  </button>
                ))}
              </div>
              <div className="border-t border-[#EEECE8]" />
              <p className="px-4 pb-2 pt-3 text-[10px] font-bold uppercase tracking-widest text-[#ABABAB] sm:px-5">
                Κατηγορίες
              </p>
              <div className="grid grid-cols-2 gap-px bg-[#F0EEE9] sm:grid-cols-3">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/browse?category=${cat.slug}`}
                    onMouseDown={(e) => e.preventDefault()}
                    className="flex cursor-pointer items-center gap-2 bg-white px-3 py-3 text-sm font-medium text-[#111111] transition-colors hover:bg-[#F7F6F3] sm:gap-2.5 sm:px-4"
                  >
                    <cat.Icon className="h-4 w-4 shrink-0 text-[#1a7a4a]" stroke={1.75} />
                    <span className="truncate">{cat.label}</span>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="px-5 py-6 text-center">
              <p className="mb-3 text-sm text-[#6B6B6B]">
                Δεν βρέθηκαν αγγελίες για &ldquo;
                <span className="font-semibold text-[#111111]">{query}</span>
                &rdquo;
              </p>
              <button
                type="button"
                className="text-sm font-bold text-[#1D9E75] hover:underline"
              >
                Αποθήκευσε αναζήτηση — ειδοποιήσου όταν εμφανιστεί
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
