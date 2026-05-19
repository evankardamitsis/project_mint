import type { UserRole } from "@/lib/roles-shared";
import { cn } from "@/lib/utils";

export function AccountRoleBadge({
  role,
  labels,
  className,
}: {
  role: UserRole;
  labels: { roleAdmin: string; roleSuperAdmin: string };
  className?: string;
}) {
  if (role === "super_admin") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white",
          className,
        )}
      >
        {labels.roleSuperAdmin}
      </span>
    );
  }

  if (role === "admin") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 rounded-full bg-[#111111] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white",
          className,
        )}
      >
        {labels.roleAdmin}
      </span>
    );
  }

  return null;
}
