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
        "grid grid-cols-2 gap-px border border-[#111111] bg-[var(--color-background-page)] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
