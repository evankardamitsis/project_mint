"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
} from "react";

import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type SaveSellerProfileState,
  saveSellerProfileAction,
} from "@/lib/sellers/actions";
import type { SellerProfileFull } from "@/types/listings";

export function SellerProfileForm({
  initial,
  mode,
}: {
  initial: SellerProfileFull | null;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const initialState = useMemo<SaveSellerProfileState>(() => ({ ok: false }), []);

  const [state, formAction, pending] = useActionState(saveSellerProfileAction, initialState);

  useEffect(() => {
    if (state.ok) {
      router.push("/seller");
      router.refresh();
    }
  }, [router, state]);

  const fieldErrors =
    state.ok === false && "fieldErrors" in state ? state.fieldErrors : undefined;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) {
      return;
    }
    startTransition(() => {
      formAction(new FormData(form));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
      <FormSection
        title={mode === "create" ? "Set up your seller profile" : "Seller profile"}
        description={
          mode === "create"
            ? "Tell buyers who you are. You can edit these details anytime."
            : "Update how you appear to buyers."
        }
      >
        <div className="space-y-2">
          <Label htmlFor="display_name">Display name</Label>
          <Input
            id="display_name"
            name="display_name"
            required
            minLength={2}
            maxLength={120}
            defaultValue={initial?.display_name ?? ""}
            placeholder="Your shop or artist name"
          />
          {fieldErrors?.display_name ? (
            <p className="text-xs text-destructive">{fieldErrors.display_name}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={2000}
            defaultValue={initial?.bio ?? ""}
            placeholder="Gear you focus on, shipping notes, response times…"
          />
          {fieldErrors?.bio ? <p className="text-xs text-destructive">{fieldErrors.bio}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            maxLength={200}
            defaultValue={initial?.location ?? ""}
            placeholder="City or region"
          />
          {fieldErrors?.location ? (
            <p className="text-xs text-destructive">{fieldErrors.location}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            maxLength={40}
            defaultValue={initial?.phone ?? ""}
            placeholder="Optional — for buyer coordination"
          />
          {fieldErrors?.phone ? (
            <p className="text-xs text-destructive">{fieldErrors.phone}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Your phone number is only shared with buyers after a sale is confirmed.
          </p>
        </div>
      </FormSection>

      {!state.ok && state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Save and continue" : "Save changes"}
        </Button>
        <Button variant="outline" type="button" render={<Link href="/seller" />}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
