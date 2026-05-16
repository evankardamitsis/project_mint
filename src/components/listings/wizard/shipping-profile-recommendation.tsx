import type { ProductShippingProfileRow } from "@/types/product-catalog";

import { cn } from "@/lib/utils";

export function ShippingProfileRecommendation({
  profile,
  className,
}: {
  profile: ProductShippingProfileRow | null;
  className?: string;
}) {
  if (!profile) {
    return (
      <p className={cn("text-[13px] text-[#777777]", className)}>
        Pack snugly with plenty of padding. Heavier gear often needs a double box — carriers are rough on corners.
      </p>
    );
  }

  const dims =
    profile.package_length_cm != null &&
    profile.package_width_cm != null &&
    profile.package_height_cm != null
      ? `${profile.package_length_cm} × ${profile.package_width_cm} × ${profile.package_height_cm} cm`
      : null;

  return (
    <div className={cn("space-y-3 rounded-2xl border border-[#ece8e2] bg-white p-4 shadow-sm", className)}>
      {profile.packaging_kit_label ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">Suggested kit</p>
      ) : null}
      {profile.packaging_kit_label ? (
        <p className="text-[16px] font-semibold text-[#111111]">{profile.packaging_kit_label}</p>
      ) : null}
      {dims ? <p className="text-[13px] text-[#555555]">Typical box size: {dims}</p> : null}
      {profile.package_weight_kg != null ? (
        <p className="text-[13px] text-[#555555]">Est. weight: {profile.package_weight_kg} kg</p>
      ) : null}
      {profile.packaging_notes ? (
        <p className="text-[12px] leading-relaxed text-[#666666]">{profile.packaging_notes}</p>
      ) : null}
    </div>
  );
}
