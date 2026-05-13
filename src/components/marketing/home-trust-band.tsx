import {
  IconCamera,
  IconCurrencyEuro,
  IconMessageReport,
  IconShieldCheck,
  IconTruck,
} from "@tabler/icons-react";

const items = [
  { Icon: IconShieldCheck, label: "Protected payments" },
  { Icon: IconCurrencyEuro, label: "Payment held" },
  { Icon: IconCamera, label: "Seller uploads proof" },
  { Icon: IconTruck, label: "Tracking verified" },
  { Icon: IconMessageReport, label: "Dispute support" },
] as const;

export function HomeTrustBand() {
  return (
    <div className="w-full bg-[#E8F7F1] px-6 py-4 lg:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between lg:flex-nowrap lg:items-center lg:gap-6">
        {items.map(({ Icon, label }) => (
          <div
            key={label}
            className="flex flex-1 flex-col items-center gap-2 text-center sm:min-w-[7.5rem] lg:flex-1"
          >
            <Icon className="size-6 shrink-0 text-[#1D9E75]" stroke={1.75} aria-hidden />
            <span className="max-w-[11rem] text-xs font-semibold leading-snug text-[#0A5C43] sm:text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
