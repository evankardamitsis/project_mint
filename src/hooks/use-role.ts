"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/roles-shared";

const HIERARCHY: Record<UserRole, number> = {
  user: 0,
  seller: 1,
  admin: 2,
  super_admin: 3,
};

export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          setRole((data?.role as UserRole) ?? "user");
          setLoading(false);
        });
    });
  }, []);

  const canActAs = (r: UserRole) => role !== null && HIERARCHY[role] >= HIERARCHY[r];

  return {
    role,
    userId,
    loading,
    isUser: role !== null,
    isSeller: canActAs("seller"),
    isAdmin: canActAs("admin"),
    isSuperAdmin: role === "super_admin",
    canActAs,
  };
}
