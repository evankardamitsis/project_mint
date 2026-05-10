import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/domain";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Profile;
}

export async function requireUser(nextAfterLogin = "/") {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(nextAfterLogin)}`);
  }
  return user;
}

export async function requireRole(
  allowed: UserRole[],
  options?: { nextAfterLogin?: string; forbiddenRedirect?: string },
) {
  const nextAfterLogin = options?.nextAfterLogin ?? "/";
  const forbiddenRedirect = options?.forbiddenRedirect ?? "/";

  await requireUser(nextAfterLogin);
  const profile = await getProfile();

  if (!profile || !allowed.includes(profile.role)) {
    redirect(forbiddenRedirect);
  }

  return profile;
}
