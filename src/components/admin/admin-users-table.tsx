"use client";

import { useMemo, useState, useTransition } from "react";

import { demoteAdmin, inviteAdmin } from "@/app/actions/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

export type AdminUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};

const ROLE_ORDER: Record<UserRole, number> = {
  super_admin: 4,
  admin: 3,
  seller: 2,
  user: 1,
};

function initialsFrom(name: string | null, email: string | null) {
  const base = (name ?? email ?? "?").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return base.slice(0, 2).toUpperCase() || "?";
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        role === "user" && "bg-[#e8e6e1] text-[#555555]",
        role === "seller" && "bg-mint-tint text-mint-dark",
        role === "admin" && "bg-[#111111] text-white",
        role === "super_admin" && "bg-mint text-white",
      )}
    >
      {role.replace("_", " ")}
    </span>
  );
}

export function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...users].sort((a, b) => {
      const rd = ROLE_ORDER[b.role] - ROLE_ORDER[a.role];
      if (rd !== 0) {
        return rd;
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    if (!q) {
      return list;
    }
    return list.filter((u) => {
      const name = (u.full_name ?? "").toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, query]);

  const runAction = (label: string, fn: () => Promise<unknown>) => {
    if (!window.confirm(label)) {
      return;
    }
    startTransition(() => {
      void fn();
    });
  };

  return (
    <div className="space-y-4">
      <Input
        type="search"
        placeholder="Search by name or email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint-tint text-xs font-bold text-mint-dark">
                      {initialsFrom(user.full_name, user.email)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {user.full_name?.trim() || "—"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email ?? "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3 text-right">
                  {user.role === "super_admin" ? (
                    <span className="text-xs font-medium text-muted-foreground">Owner</span>
                  ) : user.role === "admin" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() =>
                        runAction(`Remove admin access for ${user.email ?? user.id}?`, () =>
                          demoteAdmin(user.id),
                        )
                      }
                    >
                      Remove Admin
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        runAction(`Make ${user.email ?? user.id} an admin?`, () => inviteAdmin(user.id))
                      }
                    >
                      Make Admin
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No users match your search.</p>
        ) : null}
      </div>
    </div>
  );
}
