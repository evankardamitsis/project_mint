"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { inviteAdmin, demoteAdmin } from "@/app/actions/roles";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/roles";

export type UserRoleLabels = {
  ownerNote: string;
  setAdminBtn: string;
  removeAdminBtn: string;
  processingBtn: string;
  successMsg: string;
  demoteNote: string;
  promoteNote: string;
};

export function UserRoleActions({
  userId,
  currentRole,
  userLabel,
  labels,
}: {
  userId: string;
  currentRole: UserRole;
  userLabel: string;
  labels: UserRoleLabels;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  function run(confirmMsg: string, fn: () => Promise<unknown>) {
    if (!window.confirm(confirmMsg)) return;
    setError(null);
    setDone(null);
    start(async () => {
      try {
        await fn();
        setDone(labels.successMsg);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error.");
      }
    });
  }

  if (currentRole === "super_admin") {
    return (
      <p className="text-sm text-[#6B6B6B]">{labels.ownerNote}</p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-xl bg-[#FFF5F5] px-4 py-3 text-sm text-[#DC2626]">{error}</p>
      ) : null}
      {done ? (
        <p className="rounded-xl bg-[#E8F7F1] px-4 py-3 text-sm text-[#1D9E75]">{done}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {currentRole !== "admin" ? (
          <Button
            type="button"
            disabled={pending}
            className="bg-[#111111] text-white hover:bg-[#111111]/90"
            onClick={() =>
              run(`${labels.setAdminBtn}: ${userLabel}?`, () => inviteAdmin(userId))
            }
          >
            {pending ? labels.processingBtn : labels.setAdminBtn}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            className="border-[#EEECE8] text-[#111111] hover:border-[#111111]"
            onClick={() =>
              run(`${labels.removeAdminBtn}: ${userLabel}?`, () => demoteAdmin(userId))
            }
          >
            {pending ? labels.processingBtn : labels.removeAdminBtn}
          </Button>
        )}
      </div>

      <p className="text-xs text-[#ABABAB]">
        {currentRole === "admin" ? labels.demoteNote : labels.promoteNote}
      </p>
    </div>
  );
}
