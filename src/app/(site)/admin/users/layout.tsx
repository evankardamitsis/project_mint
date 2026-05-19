import { redirect } from "next/navigation";

import { getCurrentUserRole } from "@/lib/roles";

export default async function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  const role = await getCurrentUserRole();
  if (role !== "super_admin") {
    redirect("/admin");
  }
  return <>{children}</>;
}
