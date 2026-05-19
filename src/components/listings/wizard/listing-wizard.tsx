"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { fetchListingWizardContextAction } from "@/lib/products/actions";
import { conditionDisplayLabel } from "@/lib/listings/condition-display";
import { createListingAction, type CreateListingState } from "@/lib/listings/actions";
import { ListingImageUploader } from "@/components/listings/listing-image-uploader";
import { ConditionSelector } from "@/components/listings/wizard/condition-selector";
import { FairPriceCard } from "@/components/listings/wizard/fair-price-card";
import { PhotoRequirementChecklist } from "@/components/listings/wizard/photo-requirement-checklist";
import { ProductSearchStep } from "@/components/listings/wizard/product-search-step";
import { ShippingProfileRecommendation } from "@/components/listings/wizard/shipping-profile-recommendation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BrandOption, CategoryOption } from "@/types/listings";
import type { ListingCondition } from "@/types/domain";
import type { ProductSearchHit, ProductWizardBundle } from "@/types/product-catalog";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Τι πουλάς" },
  { label: "Λεπτομέρειες" },
  { label: "Φωτογραφίες" },
  { label: "Κατάσταση" },
  { label: "Τιμή" },
  { label: "Προστατευμένη" },
  { label: "Έλεγχος" },
] as const;

function buildWizardFormData(
  fields: {
    title: string;
    categoryId: string;
    brandId: string;
    description: string;
    condition: ListingCondition;
    priceEuros: string;
    location: string;
    offersEnabled: boolean;
    protectedDeliveryEnabled: boolean;
    productId: string | null;
  },
  imageInput: HTMLInputElement | null,
): FormData {
  const fd = new FormData();
  fd.set("title", fields.title);
  fd.set("category_id", fields.categoryId);
  fd.set("brand_id", fields.brandId);
  fd.set("description", fields.description);
  fd.set("condition", fields.condition);
  fd.set("price_euros", fields.priceEuros);
  fd.set("location", fields.location);
  if (fields.productId) {
    fd.set("product_id", fields.productId);
  }
  if (fields.offersEnabled) {
    fd.set("offers_enabled", "on");
  }
  if (fields.protectedDeliveryEnabled) {
    fd.set("protected_delivery_enabled", "on");
  }
  const list = imageInput?.files;
  if (list?.length) {
    for (let i = 0; i < list.length; i += 1) {
      const file = list.item(i);
      if (file && file.size > 0) {
        fd.append("images", file);
      }
    }
  }
  return fd;
}

export function ListingWizard({
  categories,
  brands,
}: {
  categories: CategoryOption[];
  brands: BrandOption[];
}) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const initial = useMemo<CreateListingState>(() => ({ ok: false }), []);

  const [step, setStep] = useState(1);
  const [productId, setProductId] = useState<string | null>(null);
  const [templateLabel, setTemplateLabel] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<ListingCondition>("excellent");
  const [priceEuros, setPriceEuros] = useState("");
  const [location, setLocation] = useState("");
  const [offersEnabled, setOffersEnabled] = useState(true);
  const [protectedDeliveryEnabled, setProtectedDeliveryEnabled] = useState(false);

  const [wizardBundle, setWizardBundle] = useState<ProductWizardBundle | null>(null);
  const [bundleLoading, setBundleLoading] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(createListingAction, initial);

  useEffect(() => {
    if (state.ok) {
      router.push(`/listing/${state.slug}`);
    }
  }, [router, state]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (step < 3 || !categoryId) {
      return;
    }
    let cancelled = false;
    const loadId = window.setTimeout(() => {
      if (!cancelled) {
        setBundleLoading(true);
      }
    }, 0);
    void fetchListingWizardContextAction({ categoryId, productId }).then((b) => {
      if (!cancelled && b) {
        setWizardBundle(b);
      }
      if (!cancelled) {
        setBundleLoading(false);
      }
    });
    return () => {
      cancelled = true;
      window.clearTimeout(loadId);
    };
  }, [step, categoryId, productId]);

  const fieldErrors =
    state.ok === false && "fieldErrors" in state ? state.fieldErrors : undefined;

  function applyProductHit(hit: ProductSearchHit) {
    setProductId(hit.id);
    setCategoryId(hit.category_id);
    setBrandId(hit.brand_id);
    setTitle(hit.default_title_template?.trim() || `${hit.brand_name} ${hit.name}`.trim());
    setDescription(hit.description_prompt?.trim() || "");
    setProtectedDeliveryEnabled(hit.protected_delivery_recommended);
    setTemplateLabel(`${hit.brand_name} ${hit.name}`);
    setStep(2);
  }

  function handleListFromScratch() {
    setProductId(null);
    setTemplateLabel(null);
    setTitle("");
    setDescription("");
    setCategoryId("");
    setBrandId("");
    setProtectedDeliveryEnabled(false);
    setWizardBundle(null);
    setStep(2);
  }

  function canGoNext(from: number): boolean {
    if (from === 2) {
      return title.trim().length >= 3 && Boolean(categoryId);
    }
    if (from === 5) {
      return priceEuros.trim().length > 0;
    }
    return true;
  }

  function goNext() {
    if (!canGoNext(step)) {
      if (step === 2) {
        setStepError("Πρόσθεσε τίτλο (τουλάχιστον 3 χαρακτήρες) και επέλεξε κατηγορία.");
      } else if (step === 5) {
        setStepError("Βάλε την τιμή που ζητάς.");
      } else {
        setStepError("Ολοκλήρωσε αυτό το βήμα πριν συνεχίσεις.");
      }
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(7, s + 1));
  }

  function goBack() {
    setStepError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  function goToStep(target: number) {
    setStepError(null);
    setStep(target);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) {
      return;
    }
    const fd = buildWizardFormData(
      {
        title,
        categoryId,
        brandId,
        description,
        condition,
        priceEuros,
        location,
        offersEnabled,
        protectedDeliveryEnabled,
        productId,
      },
      imageInputRef.current,
    );
    startTransition(() => {
      formAction(fd);
    });
  }

  const estimates = wizardBundle?.priceEstimates ?? [];
  const hasEstimateForCondition = estimates.some((r) => r.condition === condition);

  return (
    <div className="space-y-8">
      <nav
        aria-label="Βήματα δημιουργίας αγγελίας"
        className="sticky top-[49px] z-30 -mx-6 mb-6 flex items-center gap-0 overflow-x-auto border-b border-[#EEECE8] bg-[#F7F6F3] px-6 py-3 [-ms-overflow-style:none] scrollbar-none lg:-mx-10 lg:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {STEPS.map((stepItem, i) => {
          const n = i + 1;
          const isCompleted = step > n;
          const isActive = step === n;
          const isUpcoming = step < n;

          const stepIndicator = (
            <>
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  isActive && "bg-[#111111] text-white",
                  isCompleted && "bg-[#1D9E75] text-white",
                  isUpcoming && "bg-[#EEECE8] text-[#ABABAB]",
                )}
              >
                {isCompleted ? "✓" : n}
              </div>
              {stepItem.label}
            </>
          );

          return (
            <div key={stepItem.label} className="flex items-center">
              {isCompleted ? (
                <button
                  type="button"
                  onClick={() => goToStep(n)}
                  className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap text-[#1D9E75] transition-opacity hover:opacity-80"
                >
                  {stepIndicator}
                </button>
              ) : (
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-xs whitespace-nowrap",
                    isActive && "font-semibold text-[#111111]",
                    isUpcoming && "cursor-default font-medium text-[#ABABAB] opacity-50",
                  )}
                >
                  {stepIndicator}
                </div>
              )}
              {i < STEPS.length - 1 ? (
                <div className={cn("h-px w-8 shrink-0", isCompleted ? "bg-[#1D9E75]" : "bg-[#EEECE8]")} />
              ) : null}
            </div>
          );
        })}
      </nav>

      {step === 1 ? (
        <section className="rounded-3xl border border-[#ece8e2] bg-white p-5 shadow-sm sm:p-8">
          <h2 className="mb-1 text-xl font-bold text-[#111111]">Τι πουλάς;</h2>
          <p className="mb-6 text-sm text-[#6B6B6B]">
            Ψάξε για το μοντέλο σου ή ξεκίνα από το μηδέν.
          </p>
          <div className="mt-8">
            <ProductSearchStep onSelectProduct={applyProductHit} onListFromScratch={handleListFromScratch} />
          </div>
          <div className="mt-8 flex justify-end border-t border-[#f0ebe5] pt-6">
            <Link
              href="/seller/listings"
              className="text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#111111]"
            >
              Ακύρωση
            </Link>
          </div>
        </section>
      ) : null}

      {step > 1 ? (
        <form onSubmit={handleSubmit} className="space-y-0">
          {step === 2 ? (
            <section className="space-y-6 rounded-3xl border border-[#ece8e2] bg-white p-5 shadow-sm sm:p-8">
              <div>
                <h2 className="text-[clamp(20px,4vw,26px)] font-black uppercase tracking-tight text-[#111111]">
                  {STEPS[1].label}
                </h2>
                {templateLabel ? (
                  <p className="mt-2 text-[13px] text-[#1a7a4a]">
                    Πρότυπο: <span className="font-semibold">{templateLabel}</span>
                  </p>
                ) : (
                  <p className="mt-2 text-[13px] text-[#777777]">
                    Αγγελία από το μηδέν — συμπλήρωσε ό,τι χρειάζονται οι αγοραστές.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="wiz-title">Τίτλος</Label>
                <Input
                  id="wiz-title"
                  required
                  minLength={3}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl"
                />
                {fieldErrors?.title ? <p className="text-xs text-destructive">{fieldErrors.title}</p> : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wiz-category">Κατηγορία</Label>
                  <select
                    id="wiz-category"
                    required
                    className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="" disabled>
                      Επέλεξε κατηγορία
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors?.category_id ? (
                    <p className="text-xs text-destructive">{fieldErrors.category_id}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wiz-brand">Μάρκα (προαιρετικό)</Label>
                  <select
                    id="wiz-brand"
                    className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                  >
                    <option value="">Χωρίς μάρκα</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wiz-desc">Περιγραφή</Label>
                <Textarea
                  id="wiz-desc"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl"
                  placeholder="Κατάσταση, τι περιλαμβάνεται, τροποποιήσεις ή επισκευές…"
                />
                {fieldErrors?.description ? (
                  <p className="text-xs text-destructive">{fieldErrors.description}</p>
                ) : null}
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="space-y-6 rounded-3xl border border-[#ece8e2] bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-[clamp(20px,4vw,26px)] font-black uppercase tracking-tight text-[#111111]">
                {STEPS[2].label}
              </h2>
              {bundleLoading ? <p className="text-[13px] text-[#888888]">Φόρτωση λίστας φωτογραφιών…</p> : null}
              <PhotoRequirementChecklist items={wizardBundle?.photoRequirements ?? []} />
              <div className="space-y-2 border-t border-[#f0ebe5] pt-6">
                <Label htmlFor="wiz-images">Οι φωτογραφίες σου — έως 10</Label>
                <p className="text-[12px] text-[#777777]">Η πρώτη εικόνα είναι το εξώφυλλο.</p>
                <ListingImageUploader ref={imageInputRef} hideLabel />
              </div>
            </section>
          ) : null}

          {step === 4 ? (
            <section className="space-y-6 rounded-3xl border border-[#ece8e2] bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-[clamp(20px,4vw,26px)] font-black uppercase tracking-tight text-[#111111]">
                {STEPS[3].label}
              </h2>
              <p className="text-[13px] text-text-secondary">
                Η ειλικρινής κατάσταση βοηθά στην Προστατευμένη παράδοση — οι αγοραστές ξέρουν τι να περιμένουν.
              </p>
              <ConditionSelector value={condition} onChange={setCondition} />
              {productId && estimates.length > 0 ? (
                <p className="text-[12px] text-[#777777]">
                  Οι ενδείξεις τιμής στο επόμενο βήμα εξαρτώνται από την κατάσταση που επιλέγεις εδώ.
                </p>
              ) : null}
              {fieldErrors?.condition ? (
                <p className="text-xs text-destructive">{fieldErrors.condition}</p>
              ) : null}
            </section>
          ) : null}

          {step === 5 ? (
            <section className="space-y-6 rounded-3xl border border-[#ece8e2] bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-[clamp(20px,4vw,26px)] font-black uppercase tracking-tight text-[#111111]">
                {STEPS[4].label}
              </h2>
              {productId && hasEstimateForCondition ? (
                <FairPriceCard condition={condition} estimates={estimates} />
              ) : productId ? (
                <p className="text-[13px] text-[#777777]">
                  Δεν υπάρχει εύρος για αυτή την κατάσταση — βάλε την τιμή που σε ικανοποιεί.
                </p>
              ) : (
                <p className="text-[13px] text-[#777777]">
                  Οι ενδείξεις τιμής ισχύουν όταν ξεκινάς από πρότυπο καταλόγου. Μπορείς να βάλεις ελεύθερα τιμή.
                </p>
              )}
              <p className="text-[12px] text-[#999999]">Οι εκτιμήσεις είναι ενδεικτικές, όχι ζωντανές τιμές αγοράς.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wiz-price">Τιμή (EUR)</Label>
                  <Input
                    id="wiz-price"
                    required
                    inputMode="decimal"
                    value={priceEuros}
                    onChange={(e) => setPriceEuros(e.target.value)}
                    className="rounded-xl"
                    placeholder="π.χ. 850"
                  />
                  {fieldErrors?.price_euros ? (
                    <p className="text-xs text-destructive">{fieldErrors.price_euros}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wiz-location">Τοποθεσία</Label>
                  <Input
                    id="wiz-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="rounded-xl"
                    placeholder="Πόλη ή περιοχή"
                  />
                  {fieldErrors?.location ? (
                    <p className="text-xs text-destructive">{fieldErrors.location}</p>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {step === 6 ? (
            <section className="space-y-6 rounded-3xl border border-[#ece8e2] bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-[clamp(20px,4vw,26px)] font-black uppercase tracking-tight text-[#111111]">
                {STEPS[5].label}
              </h2>
              <p className="text-[14px] leading-relaxed text-[#555555]">
                Η Προστατευμένη παράδοση ενισχύει την εμπιστοσύνη για την κατάσταση και τη συσκευασία πριν την αποστολή.
                Τεκμηριώνεις το προϊόν· η ροή μένει προβλέψιμη και για τις δύο πλευρές.
              </p>
              {bundleLoading ? <p className="text-[13px] text-[#888888]">Φόρτωση οδηγιών συσκευασίας…</p> : null}
              <ShippingProfileRecommendation profile={wizardBundle?.shippingProfile ?? null} />
              <div className="flex items-center gap-2 rounded-xl border border-[#f0ebe5] bg-[#faf9f6] px-3 py-3">
                <input
                  id="wiz-pd"
                  type="checkbox"
                  checked={protectedDeliveryEnabled}
                  onChange={(e) => setProtectedDeliveryEnabled(e.target.checked)}
                  className="size-4 rounded border border-input accent-[#1a7a4a]"
                />
                <Label htmlFor="wiz-pd" className="font-normal text-[13px] text-[#333333]">
                  Προσφορά προστατευμένης παράδοσης σε αυτή την αγγελία
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="wiz-offers"
                  type="checkbox"
                  checked={offersEnabled}
                  onChange={(e) => setOffersEnabled(e.target.checked)}
                  className="size-4 rounded border border-input accent-primary"
                />
                <Label htmlFor="wiz-offers" className="font-normal text-[13px]">
                  Δέχομαι προσφορές
                </Label>
              </div>
            </section>
          ) : null}

          {step === 7 ? (
            <section className="space-y-6 rounded-3xl border border-[#ece8e2] bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-[clamp(20px,4vw,26px)] font-black uppercase tracking-tight text-[#111111]">
                {STEPS[6].label}
              </h2>
              <div className="space-y-3 rounded-2xl border border-[#f0ebe5] bg-[#faf9f6] p-4 text-[13px] text-[#444444]">
                <p>
                  <span className="font-bold text-[#111111]">Τίτλος:</span> {title}
                </p>
                <p>
                  <span className="font-bold text-[#111111]">Κατηγορία:</span>{" "}
                  {categories.find((c) => c.id === categoryId)?.name ?? "—"}
                </p>
                <p>
                  <span className="font-bold text-[#111111]">Μάρκα:</span>{" "}
                  {brands.find((b) => b.id === brandId)?.name ?? "—"}
                </p>
                <p>
                  <span className="font-bold text-[#111111]">Κατάσταση:</span> {conditionDisplayLabel(condition)}
                </p>
                <p>
                  <span className="font-bold text-[#111111]">Τιμή:</span> {priceEuros} EUR
                </p>
                <p>
                  <span className="font-bold text-[#111111]">Προστατευμένη παράδοση:</span>{" "}
                  {protectedDeliveryEnabled ? "Ναι" : "Όχι"}
                </p>
                {productId ? (
                  <p>
                    <span className="font-bold text-[#111111]">Αντιστοίχιση καταλόγου:</span> {templateLabel ?? "Ναι"}
                  </p>
                ) : null}
              </div>
              {!state.ok && state.error ? (
                <p className="text-sm text-destructive" role="alert">
                  {state.error}
                </p>
              ) : null}
              {state.ok && "warning" in state && state.warning ? (
                <p className="text-sm text-amber-600" role="status">
                  {state.warning}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={pending} className="rounded-xl bg-[#111111] text-white">
                  {pending ? "Υποβολή…" : "Υποβολή για έγκριση"}
                </Button>
                <Link
                  href="/seller/listings"
                  className="text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#111111]"
                >
                  Ακύρωση
                </Link>
              </div>
            </section>
          ) : null}

          {step > 1 && step < 7 ? (
            <div className="mt-8 space-y-3 border-t border-[#ece8e2] pt-6">
              {stepError ? (
                <p className="text-sm text-destructive" role="alert">
                  {stepError}
                </p>
              ) : null}
              <div className="flex flex-wrap justify-between gap-3">
                <Button type="button" variant="outline" className="rounded-xl" onClick={goBack}>
                  Πίσω
                </Button>
                <Button type="button" className="rounded-xl bg-[#111111] text-white" onClick={goNext}>
                  Συνέχεια
                </Button>
              </div>
            </div>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
