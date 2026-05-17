"use client";

import {
  IconAdjustments,
  IconDisc,
  IconGuitarPick,
  IconMetronome,
  IconMicrophone,
  IconPiano,
} from "@tabler/icons-react";
import { ArrowRight, Clock, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { ComponentType } from "react";

import { CONDITION_DISPLAY_LABEL } from "@/lib/listings/condition-display";
import { formatEuroPrefix } from "@/lib/utils";
import type { SearchResultItem } from "@/app/api/search/route";

// ─── Recent searches ──────────────────────────────────────────────────────────

const RECENT_KEY = "mint_recent_searches";
const MAX_RECENT = 5;

function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}
function pushRecent(term: string) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(
    [term, ...getRecent().filter((t) => t !== term)].slice(0, MAX_RECENT),
  ));
}
function dropRecent(term: string) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(getRecent().filter((t) => t !== term)));
}

// ─── Categories ───────────────────────────────────────────────────────────────

type CategoryEntry = {
  label: string;
  Icon: ComponentType<{ className?: string; stroke?: number }>;
  slug: string;
};

const CATEGORIES: CategoryEntry[] = [
  { label: "Κιθάρες",          Icon: IconGuitarPick,  slug: "guitars" },
  { label: "Synths & Πλήκτρα", Icon: IconPiano,        slug: "synths-keyboards" },
  { label: "Εφέ & Πετάλια",    Icon: IconAdjustments,  slug: "effects-pedals" },
  { label: "Επαγγελματικός Ήχος", Icon: IconMicrophone, slug: "pro-audio" },
  { label: "Drums",             Icon: IconMetronome,   slug: "drums" },
  { label: "DJ Gear",           Icon: IconDisc,        slug: "dj-gear" },
];

// ─── Spring easing (snappy, feels native) ────────────────────────────────────
const SPRING = "cubic-bezier(0.16, 1, 0.3, 1)";

// ─── Component ────────────────────────────────────────────────────────────────

export function HomeSearch() {
  const [query, setQuery]       = useState("");
  const [focused, setFocused]   = useState(false);
  const [animIn, setAnimIn]     = useState(false);
  const [results, setResults]   = useState<SearchResultItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [recent, setRecent]     = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [mounted, setMounted]   = useState(false);

  // Portal dropdown position (fixed coords)
  const [dropPos, setDropPos] = useState<{
    top: number; left: number; width: number;
  } | null>(null);

  const wrapperRef   = useRef<HTMLDivElement>(null);
  const blurTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef     = useRef<AbortController | null>(null);

  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setRecent(getRecent()); }, []);

  // ── Position helpers ────────────────────────────────────────────────────────

  const calcPos = useCallback(() => {
    if (!wrapperRef.current) return;
    const r = wrapperRef.current.getBoundingClientRect();
    setDropPos({ top: r.bottom + 8, left: r.left, width: r.width });
  }, []);

  // Recalculate on scroll / resize while open
  useEffect(() => {
    if (!focused) return;
    calcPos();
    window.addEventListener("scroll", calcPos, { passive: true });
    window.addEventListener("resize", calcPos, { passive: true });
    return () => {
      window.removeEventListener("scroll", calcPos);
      window.removeEventListener("resize", calcPos);
    };
  }, [focused, calcPos]);

  // ── Open animation ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!focused) { setAnimIn(false); return; }
    const raf = requestAnimationFrame(() => setAnimIn(true));
    return () => cancelAnimationFrame(raf);
  }, [focused]);

  // ── Search fetch ────────────────────────────────────────────────────────────

  const fetchResults = useCallback(async (q: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: abortRef.current.signal,
      });
      if (res.ok) setResults(await res.json());
    } catch {
      // aborted or network error — ignore
    } finally {
      setLoading(false);
    }
  }, []);

  function handleQueryChange(val: string) {
    setQuery(val);
    setSelectedIdx(-1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const trimmed = val.trim();
    if (trimmed.length < 2) {
      abortRef.current?.abort();
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceTimer.current = setTimeout(() => fetchResults(trimmed), 280);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  function navigate(q: string) {
    const trimmed = q.trim();
    if (trimmed) { pushRecent(trimmed); setRecent(getRecent()); }
    setFocused(false);
    router.push(trimmed ? `/browse?q=${encodeURIComponent(trimmed)}` : "/browse");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { setFocused(false); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (selectedIdx >= 0 && results[selectedIdx]) {
        const hit = results[selectedIdx];
        if (query.trim()) { pushRecent(query.trim()); setRecent(getRecent()); }
        setFocused(false);
        router.push(`/listing/${hit.slug}`);
      } else {
        navigate(query);
      }
    }
  }

  // ── Focus / blur ────────────────────────────────────────────────────────────

  function handleFocus() {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setFocused(true);
    setRecent(getRecent());
  }

  function handleBlur() {
    blurTimer.current = setTimeout(() => {
      setFocused(false);
      setSelectedIdx(-1);
    }, 160);
  }

  // ── Price label ─────────────────────────────────────────────────────────────

  function priceLabel(item: SearchResultItem) {
    return item.currency === "EUR"
      ? formatEuroPrefix(item.priceCents)
      : new Intl.NumberFormat("en-US", {
          style: "currency", currency: item.currency, minimumFractionDigits: 0,
        }).format(item.priceCents / 100);
  }

  const hasQuery = query.trim().length >= 2;

  // ── Dropdown content ─────────────────────────────────────────────────────────

  const dropdownContent = (
    <>
      {/* Empty state */}
      {!hasQuery && (
        <>
          {recent.length > 0 && (
            <>
              <div className="flex items-center justify-between px-4 pb-1 pt-4 sm:px-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#ABABAB]">
                  Πρόσφατες αναζητήσεις
                </p>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    localStorage.removeItem(RECENT_KEY);
                    setRecent([]);
                  }}
                  className="text-[10px] text-[#ABABAB] transition-colors hover:text-[#666666]"
                >
                  Διαγραφή όλων
                </button>
              </div>
              <ul className="pb-2">
                {recent.map((term) => (
                  <li key={term} className="group flex items-center">
                    <button
                      type="button"
                      onMouseDown={() => { setQuery(term); navigate(term); }}
                      className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2 hover:bg-[#F7F6F3] sm:px-5"
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0 text-[#CCCCCC]" />
                      <span className="min-w-0 flex-1 truncate text-left text-sm text-[#333333]">
                        {term}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Αφαίρεση "${term}"`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        dropRecent(term);
                        setRecent(getRecent());
                      }}
                      className="mr-4 shrink-0 text-[#CCCCCC] opacity-0 transition-opacity hover:text-[#666666] group-hover:opacity-100 sm:mr-5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-[#EEECE8]" />
            </>
          )}

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
      )}

      {/* Loading skeleton */}
      {hasQuery && loading && (
        <div className="space-y-px p-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl px-2 py-2.5">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-[#F0EEE9]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-[#F0EEE9]" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-[#F0EEE9]" />
              </div>
              <div className="h-3 w-12 animate-pulse rounded bg-[#F0EEE9]" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {hasQuery && !loading && results.length > 0 && (
        <>
          <ul>
            {results.map((item, i) => {
              const isSelected = i === selectedIdx;
              return (
                <li key={item.id}>
                  <Link
                    href={`/listing/${item.slug}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (query.trim()) { pushRecent(query.trim()); setRecent(getRecent()); }
                      setFocused(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors sm:px-5 ${
                      isSelected ? "bg-[#F7F6F3]" : "hover:bg-[#F7F6F3]"
                    }`}
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#F0EEE9]">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#111111]">{item.title}</p>
                      <p className="truncate text-xs text-[#888888]">
                        {CONDITION_DISPLAY_LABEL[item.condition]}
                        {item.categoryName ? ` · ${item.categoryName}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold tabular-nums text-[#111111]">
                      {priceLabel(item)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-[#EEECE8]">
            <button
              type="button"
              onMouseDown={() => navigate(query)}
              className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-[#1D9E75] transition-colors hover:bg-[#F7F6F3]"
            >
              Όλα τα αποτελέσματα για &ldquo;{query.trim()}&rdquo;
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}

      {/* No results */}
      {hasQuery && !loading && results.length === 0 && (
        <div className="px-5 py-6 text-center">
          <p className="mb-3 text-sm text-[#6B6B6B]">
            Δεν βρέθηκαν αγγελίες για &ldquo;
            <span className="font-semibold text-[#111111]">{query.trim()}</span>&rdquo;
          </p>
          <button type="button" className="text-sm font-bold text-[#1D9E75] hover:underline">
            Αποθήκευσε αναζήτηση — ειδοποιήσου όταν εμφανιστεί
          </button>
        </div>
      )}
    </>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div ref={wrapperRef} className="relative mx-auto max-w-[720px]">
      {/* ── Search bar ── */}
      <div className="flex items-center gap-2 rounded-full border border-[#EEECE8] bg-white px-4 py-2.5 shadow-[0_2px_20px_rgba(0,0,0,0.08)] transition-all focus-within:border-[#1D9E75] focus-within:shadow-[0_2px_24px_rgba(0,0,0,0.14)] sm:gap-3 sm:px-5 sm:py-3">
        <Search className="h-4 w-4 shrink-0 text-[#ABABAB] sm:h-5 sm:w-5" aria-hidden />
        <input
          data-home-search
          type="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#ABABAB] sm:text-base"
          placeholder="Αναζήτησε... π.χ. Fender Strat, Roland SH-101"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {query.length > 0 && (
          <button
            type="button"
            aria-label="Καθαρισμός"
            onMouseDown={(e) => {
              e.preventDefault();
              setQuery("");
              setResults([]);
              setSelectedIdx(-1);
              abortRef.current?.abort();
            }}
            className="shrink-0 text-[#CCCCCC] transition-colors hover:text-[#666666]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate(query)}
          className="shrink-0 rounded-full bg-[#1D9E75] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#188A65] sm:px-6 sm:py-2.5"
        >
          <span className="hidden sm:inline">Αναζήτηση</span>
          <Search className="h-4 w-4 sm:hidden" aria-label="Αναζήτηση" />
        </button>
      </div>

      {/* ── Dropdown — rendered via portal to escape overflow:hidden ── */}
      {mounted && focused && dropPos &&
        createPortal(
          <div
            role="listbox"
            aria-label="Αποτελέσματα αναζήτησης"
            style={{
              position: "fixed",
              top: dropPos.top,
              left: dropPos.left,
              width: dropPos.width,
              zIndex: 9999,
              maxHeight: "min(70vh, 520px)",
              overflowY: "auto",
              overflowX: "hidden",
              borderRadius: "1rem",
              border: "1px solid #EEECE8",
              background: "#fff",
              boxShadow: "0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)",
              opacity: animIn ? 1 : 0,
              transform: animIn ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.98)",
              transformOrigin: "top center",
              transition: `opacity 180ms ${SPRING}, transform 180ms ${SPRING}`,
            }}
          >
            {dropdownContent}
          </div>,
          document.body,
        )
      }
    </div>
  );
}
