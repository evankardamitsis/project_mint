"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { sellerProfileFormSchema } from "@/lib/sellers/schemas";

export type SaveSellerProfileState =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: Record<string, string> };

export async function saveSellerProfileAction(
  _prev: SaveSellerProfileState | undefined,
  formData: FormData,
): Promise<SaveSellerProfileState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You need to be signed in." };
    }

    const raw = {
      display_name: String(formData.get("display_name") ?? ""),
      bio: String(formData.get("bio") ?? ""),
      location: String(formData.get("location") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    };

    const parsed = sellerProfileFormSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
    }

    const { data: existing, error: exErr } = await supabase
      .from("seller_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (exErr) {
      console.error("[sellers] saveSellerProfileAction select", exErr.message);
      return { ok: false, error: "Could not load your seller profile." };
    }

    const payload = {
      display_name: parsed.data.display_name,
      bio: parsed.data.bio || null,
      location: parsed.data.location || null,
      phone: parsed.data.phone || null,
    };

    if (!existing) {
      const { error: insErr } = await supabase.from("seller_profiles").insert({
        user_id: user.id,
        ...payload,
        verification_status: "pending",
        payout_status: "not_started",
      });
      if (insErr) {
        console.error("[sellers] saveSellerProfileAction insert", insErr.message);
        return { ok: false, error: "Could not save your profile. Try again." };
      }
    } else {
      const { error: upErr } = await supabase
        .from("seller_profiles")
        .update(payload)
        .eq("id", existing.id);
      if (upErr) {
        console.error("[sellers] saveSellerProfileAction update", upErr.message);
        return { ok: false, error: "Could not save your profile. Try again." };
      }
    }

    revalidatePath("/seller");
    revalidatePath("/seller/profile");
    revalidatePath("/seller/listings");
    revalidatePath("/seller/listings/new");
    return { ok: true };
  } catch (e) {
    console.error("[sellers] saveSellerProfileAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}
