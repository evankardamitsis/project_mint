import { cn } from "@/lib/utils";

export function BauhausListingGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px border border-[#111111] bg-[#111111] lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
