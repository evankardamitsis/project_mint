import { IconCamera, IconCurrencyEuro, IconScale, IconTruck } from "@tabler/icons-react";

import { SITE_CONTAINER } from "@/config/site-layout";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";

export async function HomeTrustBand() {
  const locale = await getLocale();
  const t = MESSAGES[locale].trust;
  const items = [
    { Icon: IconCurrencyEuro, label: t.paymentHeld },
    { Icon: IconCamera, label: t.proofPhotos },
    { Icon: IconTruck, label: t.trackingVerified },
    { Icon: IconScale, label: t.disputeSupport },
  ] as const;

  return (
    <div className="w-full border-b border-[#EEECE8] bg-white">
      <div className={SITE_CONTAINER}>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {items.map(({ Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 border-r border-[#EEECE8] px-6 py-5 last:border-r-0 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F7F1]">
                <Icon className="h-[18px] w-[18px] text-[#1a7a4a]" stroke={2} aria-hidden />
              </span>
              <span className="text-sm font-semibold leading-snug text-[#222222]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
