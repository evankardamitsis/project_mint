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
        {/* Mobile: single scrollable row */}
        <div className="flex items-stretch overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-4 sm:overflow-visible">
          {items.map(({ Icon, label }) => (
            <div
              key={label}
              className="flex shrink-0 items-center gap-2.5 border-r border-[#EEECE8] px-4 py-3.5 last:border-r-0 sm:shrink sm:px-6 sm:py-5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#E8F7F1] sm:h-9 sm:w-9 sm:rounded-lg">
                <Icon className="h-3.5 w-3.5 text-[#1a7a4a] sm:h-[18px] sm:w-[18px]" stroke={2} aria-hidden />
              </span>
              <span className="whitespace-nowrap text-xs font-semibold text-[#222222] sm:whitespace-normal sm:text-sm sm:leading-snug">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
