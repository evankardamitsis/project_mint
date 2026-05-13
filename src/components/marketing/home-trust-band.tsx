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
    <div className="w-full border-b border-[#111111] bg-[#ffffff]">
      <div className={SITE_CONTAINER}>
        <div className="flex flex-row overflow-x-auto [-ms-overflow-style:none] scrollbar-none sm:grid sm:grid-cols-4 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {items.map(({ Icon, label }) => (
            <div
              key={label}
              className="flex shrink-0 items-center gap-2 border-r-[0.5px] border-[#e8e5e0] py-[11px] pl-[14px] pr-[14px] last:border-r-0"
            >
              <span className="flex size-[18px] shrink-0 items-center justify-center bg-[#1a7a4a] text-[9px] font-black text-[#ffffff]">
                <Icon className="size-[11px]" stroke={2} aria-hidden />
              </span>
              <span className="text-[9px] font-bold uppercase leading-snug tracking-[0.07em] text-[#333333]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
