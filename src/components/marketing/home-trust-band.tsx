import { Check, ShieldCheck } from "lucide-react";

const steps = [
  "Payment held",
  "Seller uploads proof",
  "Tracking verified",
  "Dispute support",
] as const;

export function HomeTrustBand() {
  return (
    <div className="w-full bg-[#E8F7F1] py-4 px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-[#1D9E75]" aria-hidden strokeWidth={2.25} />
          <span className="text-sm font-bold text-[#0A5C43]">Protected delivery on every transaction</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          {steps.map((label) => (
            <div key={label} className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-[#1D9E75]" aria-hidden strokeWidth={2.5} />
              <span className="text-sm text-[#0A5C43]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
