import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, X } from "lucide-react";

import { deleteSavedSearchAction } from "@/lib/saved-searches/actions";
import { buildBrowseUrlFromSavedSearch } from "@/lib/saved-searches/saved-search-from-browse";
import { fetchSavedSearchesForUser } from "@/lib/saved-searches/queries";
import { getSessionUser } from "@/lib/auth/guards";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("el-GR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

async function deleteSearch(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    await deleteSavedSearchAction(id);
  }
}

export default async function BuyerSavedSearchesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent("/buyer/saved-searches")}`);
  }

  const searches = await fetchSavedSearchesForUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-black uppercase tracking-[-0.04em] text-[#111111]">
          Αποθηκευμένες αναζητήσεις
        </h1>
        <p className="mt-2 text-sm text-[#6B6B6B]">
          Επανάλαβε αναζητήσεις με ένα κλικ — οι ειδοποιήσεις έρχονται σύντομα.
        </p>
      </header>

      {searches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#EEECE8] bg-white py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F6F3]">
            <Bell className="h-7 w-7 text-[#ABABAB]" aria-hidden />
          </div>
          <p className="text-sm text-[#6B6B6B]">Δεν έχεις αποθηκεύσει αναζητήσεις ακόμη.</p>
          <Link
            href="/browse"
            className="mt-4 text-sm font-bold text-[#1D9E75] hover:text-[#0A5C43]"
          >
            Πήγαινε στην αναζήτηση →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {searches.map((search) => (
            <li
              key={search.id}
              className="flex items-center gap-4 rounded-2xl border border-[#EEECE8] bg-white p-4 transition-all hover:border-[#DDDBD6]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F7F1]">
                <Bell className="h-5 w-5 text-[#1D9E75]" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#111111]">{search.name}</p>
                <p className="mt-0.5 text-xs text-[#ABABAB]">
                  Αποθηκεύτηκε {formatDate(search.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={buildBrowseUrlFromSavedSearch(search)}
                  className="text-xs font-semibold text-[#1D9E75] transition-colors hover:text-[#0A5C43]"
                >
                  Αναζήτηση →
                </Link>
                <form action={deleteSearch}>
                  <input type="hidden" name="id" value={search.id} />
                  <button
                    type="submit"
                    className="rounded-lg p-1.5 transition-colors hover:bg-[#FEEDED]"
                    aria-label="Διαγραφή"
                  >
                    <X className="h-3.5 w-3.5 text-[#ABABAB] hover:text-[#CC4444]" aria-hidden />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
