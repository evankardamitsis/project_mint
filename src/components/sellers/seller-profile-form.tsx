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
  variant = "default",
}: {
  initial: SellerProfileFull | null;
  mode: "create" | "edit";
  variant?: "default" | "hub";
}) {
  const router = useRouter();
  const initialState = useMemo<SaveSellerProfileState>(() => ({ ok: false }), []);

  const [state, formAction, pending] = useActionState(saveSellerProfileAction, initialState);

  useEffect(() => {
    if (state.ok) {
      router.push(variant === "hub" ? "/seller/profile" : "/seller");
      router.refresh();
    }
  }, [router, state, variant]);

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

  if (variant === "hub") {
    return (
      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#EEECE8] bg-white p-6">
        <h2 className="mb-1 text-base font-bold text-[#111111]">Προφίλ πωλητή</h2>
        <p className="mb-6 text-sm text-[#6B6B6B]">Ενημέρωσε πώς εμφανίζεσαι στους αγοραστές.</p>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-sm font-medium text-[#111111]">
              Εμφανιζόμενο όνομα
            </Label>
            <Input
              id="display_name"
              name="display_name"
              required
              minLength={2}
              maxLength={120}
              defaultValue={initial?.display_name ?? ""}
              placeholder="Το όνομα του καταστήματός σου"
              className="rounded-xl"
            />
            {fieldErrors?.display_name ? (
              <p className="text-xs text-destructive">{fieldErrors.display_name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-[#111111]">
              Περιγραφή
            </Label>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              maxLength={2000}
              defaultValue={initial?.bio ?? ""}
              placeholder="Εξοπλισμός, αποστολές, χρόνοι απάντησης…"
              className="rounded-xl"
            />
            {fieldErrors?.bio ? <p className="text-xs text-destructive">{fieldErrors.bio}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-[#111111]">
              Τοποθεσία
            </Label>
            <Input
              id="location"
              name="location"
              maxLength={200}
              defaultValue={initial?.location ?? ""}
              placeholder="Πόλη ή περιοχή"
              className="rounded-xl"
            />
            {fieldErrors?.location ? (
              <p className="text-xs text-destructive">{fieldErrors.location}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-[#111111]">
              Τηλέφωνο
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              maxLength={40}
              defaultValue={initial?.phone ?? ""}
              placeholder="Προαιρετικό"
              className="rounded-xl"
            />
            {fieldErrors?.phone ? (
              <p className="text-xs text-destructive">{fieldErrors.phone}</p>
            ) : null}
            <p className="text-xs text-[#6B6B6B]">
              Χρησιμοποιείται μόνο από τη mint για επιβεβαίωση παραγγελιών. Δεν κοινοποιείται ποτέ σε
              αγοραστές.
            </p>
          </div>
        </div>

        {!state.ok && state.error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="mt-6 flex items-center gap-3 border-t border-[#EEECE8] pt-6">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-[#1D9E75] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#188A65] disabled:opacity-60"
          >
            {pending ? "Αποθήκευση…" : "Αποθήκευση"}
          </button>
          <button
            type="button"
            className="text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#111111]"
            onClick={() => router.refresh()}
          >
            Ακύρωση
          </button>
        </div>
      </form>
    );
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
