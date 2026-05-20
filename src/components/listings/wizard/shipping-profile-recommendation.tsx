import type { ProductShippingProfileRow } from "@/types/product-catalog";

import { cn } from "@/lib/utils";

const PACKAGING_NOTES_EL: Record<string, string> = {
  "Use stiff cardboard or hardshell case; pad headstock and bridge; loosen strings slightly for long trips.":
    "Χρησιμοποίησε σκληρό χαρτόκουτο ή σκληρή θήκη. Πρόσεξε κεφαλή και bridge. Χαλάρωσε ελαφρά τις χορδές.",
};

function translatePackagingNotes(notes: string): string {
  return PACKAGING_NOTES_EL[notes] ?? notes;
}

function translateKitLabel(label: string, categoryName?: string) {
  const cat = categoryName?.toLowerCase() ?? "";
  if (label.toLowerCase().includes("guitar") || cat.includes("κιθάρ") || cat.includes("guitar")) {
    return "Κιτ κιθάρας";
  }
  return label;
}

export function ShippingProfileRecommendation({
  profile,
  categoryName,
  className,
}: {
  profile: ProductShippingProfileRow | null;
  categoryName?: string;
  className?: string;
}) {
  if (!profile) {
    return (
      <p className={cn("text-sm leading-relaxed text-[#6B6B6B]", className)}>
        Συσκεύασε σφιχτά με αρκετή αντικραδασμική προστασία. Τα βαρύτερα είδη συχνά χρειάζονται
        διπλό κιβώτιο — οι μεταφορείς είναι σκληροί στις γωνίες.
      </p>
    );
  }

  const dims =
    profile.package_length_cm != null &&
    profile.package_width_cm != null &&
    profile.package_height_cm != null
      ? `${profile.package_length_cm} × ${profile.package_width_cm} × ${profile.package_height_cm} cm`
      : null;

  const kitLabel = profile.packaging_kit_label
    ? translateKitLabel(profile.packaging_kit_label, categoryName)
    : null;

  return (
    <div className={cn("space-y-3 rounded-2xl border border-[#ece8e2] bg-white p-4 shadow-sm", className)}>
      {kitLabel ? (
        <p className="text-[10px] font-bold tracking-widest text-[#888888] uppercase">Προτεινόμενη συσκευασία</p>
      ) : null}
      {kitLabel ? <p className="text-base font-semibold text-[#111111]">{kitLabel}</p> : null}
      {dims ? <p className="text-sm text-[#555555]">Τυπικό μέγεθος κιβωτίου: {dims}</p> : null}
      {profile.package_weight_kg != null ? (
        <p className="text-sm text-[#555555]">Εκτιμώμενο βάρος: {profile.package_weight_kg} kg</p>
      ) : null}
      {profile.packaging_notes ? (
        <p className="text-xs leading-relaxed text-[#666666]">
          {translatePackagingNotes(profile.packaging_notes)}
        </p>
      ) : null}
    </div>
  );
}
