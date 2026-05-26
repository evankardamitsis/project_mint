"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUserId, isSuperAdmin } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

export async function activateSellerAccount() {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/auth/login?next=/sell");
  }

  await supabase
    .from("profiles")
    .update({ role: "seller" })
    .eq("id", userId)
    .eq("role", "user");

  revalidatePath("/", "layout");
  redirect("/seller/listings");
}

export async function inviteAdmin(targetUserId: string) {
  if (!(await isSuperAdmin())) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();
  const currentUserId = await getCurrentUserId();

  const { error } = await supabase
    .from("profiles")
    .update({
      role: "admin",
      invited_by: currentUserId,
      invited_at: new Date().toISOString(),
    })
    .eq("id", targetUserId)
    .in("role", ["user", "seller"]);

  if (error) {
    throw error;
  }
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);
  return { success: true };
}

export async function demoteAdmin(targetUserId: string) {
  if (!(await isSuperAdmin())) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role: "seller", invited_by: null, invited_at: null })
    .eq("id", targetUserId)
    .eq("role", "admin");

  if (error) {
    throw error;
  }
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);
  return { success: true };
}
