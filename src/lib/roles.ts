import { hasRole } from "@/lib/roles-shared";
import type { UserRole } from "@/lib/roles-shared";

export type { UserRole } from "@/lib/roles-shared";
export { hasRole } from "@/lib/roles-shared";

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return (data?.role as UserRole) ?? "user";
}

export async function getCurrentUserId(): Promise<string | null> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function requireRole(required: UserRole): Promise<UserRole> {
  const { redirect } = await import("next/navigation");
  const role = await getCurrentUserRole();
  if (!role || !hasRole(role, required)) {
    if (required === "seller") {
      redirect("/sell");
    }
    redirect("/");
  }
  return role as UserRole;
}

export const isAdmin = async () => hasRole((await getCurrentUserRole()) ?? "user", "admin");
export const isSuperAdmin = async () => (await getCurrentUserRole()) === "super_admin";
export const isSeller = async () => hasRole((await getCurrentUserRole()) ?? "user", "seller");
