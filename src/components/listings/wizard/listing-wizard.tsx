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
import { CATEGORY_LABELS, categoryDisplayName } from "@/lib/listings/category-display";
import { createListingAction, type CreateListingState } from "@/lib/listings/actions";
import { ListingImageUploader } from "@/components/listings/listing-image-uploader";
import { FairPriceTool } from "@/components/listings/wizard/fair-price-tool";
import {
  type WizardCondition,
  wizardConditionLabel,
  WizardConditionPicker,
  wizardConditionToListingCondition,
} from "@/components/listings/wizard/wizard-condition-picker";
import {
  type PhotoSlotId,
  PhotoRequirementChecklist,
} from "@/components/listings/wizard/photo-requirement-checklist";
import { ProductSearchStep } from "@/components/listings/wizard/product-search-step";
import { ShippingProfileRecommendation } from "@/components/listings/wizard/shipping-profile-recommendation";
import { WizardStepNav } from "@/components/listings/wizard/wizard-step-nav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Info, ShieldCheck } from "lucide-react";
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

const STEP_CARD =
  "mx-auto max-w-2xl rounded-2xl border border-[#ece8e2] bg-white p-5 shadow-sm sm:p-8";
const STEP_TITLE = "mb-1 text-2xl font-bold tracking-tight text-[#111111]";
const SELECT_TRIGGER =
  "h-12 w-full rounded-xl border-[#EEECE8] text-sm focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]";

const PLATFORM_FEE_RATE = 0.05;
const TRANSACTION_FEE_RATE = 0.014;
const TRANSACTION_FEE_FIXED = 0.25;

function wizardConditionToFairPriceKey(condition: WizardCondition): string {
  switch (condition) {
    case "new":
      return "new";
    case "excellent":
      return "excellent";
    case "good":
      return "good";
    case "fair":
    case "parts":
      return "fair";
    default:
      return "good";
  }
}

function InfoTooltip({ content }: { content: string }) {
  return (
    <div className="group/tooltip relative">
      <button
        type="button"
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E8E6E1] transition-colors hover:bg-[#DDDBD6]"
        aria-label="Πληροφορίες"
      >
        <Info className="h-2.5 w-2.5 text-[#6B6B6B]" aria-hidden />
      </button>
      <div className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-60 -translate-x-1/2 rounded-xl bg-[#111111] px-3 py-2.5 text-xs leading-relaxed text-white opacity-0 shadow-lg transition-all duration-150 group-hover/tooltip:visible group-hover/tooltip:opacity-100">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#111111]" />
      </div>
    </div>
  );
}

function parsePriceEuros(value: string): number {
  const n = Number(value.replace(",", ".").trim());
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function formatReviewPrice(euros: string): string {
  const n = Number(euros.replace(",", ".").trim());
  if (!euros.trim() || Number.isNaN(n)) {
    return "—";
  }
  return `€${n.toLocaleString("el-GR", { maximumFractionDigits: n % 1 === 0 ? 0 : 2 })}`;
}

function buildWizardFormData(
  fields: {
    title: string;
    categoryId: string;
    brandId: string;
    description: string;
    condition: ListingCondition; // mapped from wizardCondition at submit
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
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const initial = useMemo<CreateListingState>(() => ({ ok: false }), []);

  const [step, setStep] = useState(1);
  const [productId, setProductId] = useState<string | null>(null);
  const [templateLabel, setTemplateLabel] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  /** When template `brand_id` is not in `brands` options, Radix would show the UUID — keep display name from search hit. */
  const [brandLabelFallback, setBrandLabelFallback] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [wizardCondition, setWizardCondition] = useState<WizardCondition>("excellent");
  const [priceEuros, setPriceEuros] = useState("");
  const [location, setLocation] = useState("");
  const [offersEnabled, setOffersEnabled] = useState(true);
  const [protectedDeliveryEnabled, setProtectedDeliveryEnabled] = useState(true);
  const [imageCount, setImageCount] = useState(0);
  const [filledPhotoSlots, setFilledPhotoSlots] = useState<Set<PhotoSlotId>>(() => new Set());
  const [activePhotoSlot, setActivePhotoSlot] = useState<PhotoSlotId | null>(null);

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
    const el = stepRefs.current[step - 1];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
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
    setBrandLabelFallback(hit.brand_name?.trim() || null);
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
    setBrandLabelFallback(null);
    setProtectedDeliveryEnabled(true);
    setWizardBundle(null);
    setStep(2);
  }

  function triggerImageUpload() {
    imageInputRef.current?.click();
  }

  function openUploadForSlot(slotId: PhotoSlotId) {
    setActivePhotoSlot(slotId);
    triggerImageUpload();
  }

  function handleImagesSelected(files: FileList) {
    if (files.length === 0) {
      return;
    }
    if (activePhotoSlot) {
      setFilledPhotoSlots((prev) => {
        const next = new Set(prev);
        next.add(activePhotoSlot);
        return next;
      });
    }
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
        condition: wizardConditionToListingCondition(wizardCondition),
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

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedBrand = brands.find((b) => b.id === brandId);
  const categoryName = selectedCategory
    ? (CATEGORY_LABELS[selectedCategory.name] ?? categoryDisplayName(selectedCategory.name))
    : "—";
  const brandName =
    brandId.trim() === ""
      ? "—"
      : (selectedBrand?.name ?? brandLabelFallback ?? "—");
  const brandIdInOptions = Boolean(brandId) && brands.some((b) => b.id === brandId);
  const price = parsePriceEuros(priceEuros);
  const platformFee = price > 0 ? price * PLATFORM_FEE_RATE : 0;
  const transactionFee = price > 0 ? price * TRANSACTION_FEE_RATE + TRANSACTION_FEE_FIXED : 0;
  const totalFees = platformFee + transactionFee;
  const youReceive = price > 0 ? price - totalFees : 0;

  return (
    <div className="space-y-8">
      <div className="sticky top-[49px] z-30 -mx-6 mb-6 border-b border-[#EEECE8] bg-[#F7F6F3] lg:-mx-10">
        <nav
          aria-label="Βήματα δημιουργίας αγγελίας"
          className="scrollbar-none flex items-center gap-0 overflow-x-auto px-4 py-3"
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
                <span>{stepItem.label}</span>
                {isActive ? (
                  <span className="ml-1 text-[10px] font-medium text-[#ABABAB] sm:hidden">
                    · βήμα {step} από 7
                  </span>
                ) : null}
              </>
            );

            return (
              <div
                key={stepItem.label}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className="flex shrink-0 items-center"
              >
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
      </div>

      {step === 1 ? (
        <section className={STEP_CARD}>
          <h2 className={STEP_TITLE}>Τι πουλάς;</h2>
          <p className="mb-2 text-sm text-[#6B6B6B]">
            Ψάξε για το μοντέλο σου ή ξεκίνα από το μηδέν.
          </p>
          <ProductSearchStep onSelectProduct={applyProductHit} onListFromScratch={handleListFromScratch} />
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
        <form onSubmit={handleSubmit} className="space-y-0 pb-24 lg:pb-0">
          {step === 2 ? (
            <section className={cn(STEP_CARD, "space-y-6")}>
              <div>
                <h2 className={STEP_TITLE}>{STEPS[1].label}</h2>
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
                  <Select value={categoryId || undefined} onValueChange={(value) => setCategoryId(value ?? "")}>
                    <SelectTrigger id="wiz-category" className={SELECT_TRIGGER}>
                      <SelectValue>
                        {categoryId
                          ? (() => {
                              const cat = categories.find((c) => c.id === categoryId);
                              return cat
                                ? (CATEGORY_LABELS[cat.name] ?? cat.name)
                                : "Επέλεξε κατηγορία";
                            })()
                          : "Επέλεξε κατηγορία"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {CATEGORY_LABELS[cat.name] ?? cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors?.category_id ? (
                    <p className="text-xs text-destructive">{fieldErrors.category_id}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wiz-brand">Μάρκα (προαιρετικό)</Label>
                  <Select
                    value={brandId ?? ""}
                    onValueChange={(v) => {
                      setBrandId(v || "");
                      setBrandLabelFallback(null);
                    }}
                  >
                    <SelectTrigger id="wiz-brand" className={SELECT_TRIGGER}>
                      <SelectValue placeholder="Χωρίς μάρκα">
                        {brandId
                          ? (selectedBrand?.name ?? brandLabelFallback ?? "Μάρκα")
                          : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Χωρίς μάρκα</SelectItem>
                      {brandId && !brandIdInOptions ? (
                        <SelectItem value={brandId}>{brandLabelFallback ?? "Μάρκα"}</SelectItem>
                      ) : null}
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wiz-desc">Περιγραφή</Label>
                <Textarea
                  id="wiz-desc"
                  rows={6}
                  maxLength={1000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl"
                  placeholder="Κατάσταση, τι περιλαμβάνεται, τροποποιήσεις ή επισκευές…"
                />
                <p className="mt-1.5 text-right text-xs text-[#ABABAB]">{description.length} / 1000</p>
                {fieldErrors?.description ? (
                  <p className="text-xs text-destructive">{fieldErrors.description}</p>
                ) : null}
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className={cn(STEP_CARD, "space-y-4")}>
              <div>
                <h2 className={STEP_TITLE}>{STEPS[2].label}</h2>
                <p className="text-sm text-[#6B6B6B]">Η πρώτη εικόνα είναι το εξώφυλλο της αγγελίας.</p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-[#F5E6B0] bg-[#FEF9EC] p-4">
                <span className="shrink-0 text-lg" aria-hidden>
                  💡
                </span>
                <p className="text-xs leading-relaxed text-[#8B6914]">
                  <strong>Συμβουλή:</strong> Πάτα κάθε εικονίδιο για να φωτογραφίσεις αυτό το σημείο. Φωτογράφισε σε
                  φωτεινό χώρο με φυσικό φως.
                </p>
              </div>
              <PhotoRequirementChecklist
                uploadedCount={imageCount}
                filledSlotIds={filledPhotoSlots}
                activeSlot={activePhotoSlot}
                onSlotClick={openUploadForSlot}
              />
              <ListingImageUploader
                ref={imageInputRef}
                hideLabel
                variant="wizard"
                className="[&>label>div]:mt-0"
                onFileCountChange={setImageCount}
                onFilesSelected={handleImagesSelected}
              />
            </section>
          ) : null}

          {step === 4 ? (
            <section className={cn(STEP_CARD, "space-y-5")}>
              <div>
                <h2 className={STEP_TITLE}>{STEPS[3].label}</h2>
                <p className="text-sm text-[#6B6B6B]">
                  Η ειλικρινής κατάσταση βοηθά στην Προστατευμένη παράδοση — οι αγοραστές ξέρουν τι να
                  περιμένουν.
                </p>
              </div>
              <WizardConditionPicker value={wizardCondition} onChange={setWizardCondition} />
              {fieldErrors?.condition ? (
                <p className="text-xs text-destructive">{fieldErrors.condition}</p>
              ) : null}
            </section>
          ) : null}

          {step === 5 ? (
            <section className={cn(STEP_CARD, "space-y-6")}>
              <h2 className={STEP_TITLE}>{STEPS[4].label}</h2>
              <div className="mb-6">
                <label htmlFor="wiz-price" className="mb-2 block text-sm font-semibold text-[#111111]">
                  Τιμή
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-2xl font-black text-[#111111]">
                    €
                  </span>
                  <input
                    id="wiz-price"
                    required
                    type="number"
                    inputMode="numeric"
                    value={priceEuros}
                    onChange={(e) => setPriceEuros(e.target.value)}
                    placeholder="π.χ. 450"
                    className="w-full rounded-2xl border-2 border-[#EEECE8] bg-white py-4 pr-4 pl-10 text-2xl font-black text-[#111111] transition-all placeholder:text-[#EEECE8] focus:border-[#1D9E75] focus:outline-none"
                  />
                </div>
                {price > 0 ? (
                  <div className="mt-3 space-y-3 rounded-2xl border border-[#EEECE8] bg-[#F7F6F3] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-[#555555]">Προμήθεια πλατφόρμας</span>
                        <InfoTooltip content="Η mint λαμβάνει αυτό το ποσό μόνο όταν η πώληση ολοκληρωθεί. Δεν χρεώνεσαι τίποτα αν η αγγελία δεν πουληθεί." />
                      </div>
                      <span className="text-sm text-[#555555]">−€{platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-[#555555]">Χρέωση συναλλαγής</span>
                        <InfoTooltip content="Κόστος επεξεργασίας ηλεκτρονικής πληρωμής (κάρτα ή τραπεβική μεταφορά). Περιλαμβάνει ασφάλεια και προστασία αγοραστή." />
                      </div>
                      <span className="text-sm text-[#555555]">−€{transactionFee.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-[#E4E2DC]" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#111111]">Εσύ λαμβάνεις</span>
                      <span className="text-xl font-black text-[#1D9E75]">€{youReceive.toFixed(2)}</span>
                    </div>
                  </div>
                ) : null}
                {fieldErrors?.price_euros ? (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.price_euros}</p>
                ) : null}
                {categoryId ? (
                  <FairPriceTool
                    categoryId={categoryId}
                    condition={wizardConditionToFairPriceKey(wizardCondition)}
                    price={price}
                  />
                ) : null}
              </div>
              <div>
                <label htmlFor="wiz-location" className="mb-2 block text-sm font-semibold text-[#111111]">
                  Τοποθεσία
                </label>
                <input
                  id="wiz-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="π.χ. Αθήνα, Θεσσαλονίκη..."
                  className="w-full rounded-2xl border border-[#EEECE8] bg-white px-4 py-3.5 text-sm transition-all focus:border-[#1D9E75] focus:outline-none"
                />
                {fieldErrors?.location ? (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.location}</p>
                ) : null}
              </div>
            </section>
          ) : null}

          {step === 6 ? (
            <section className={cn(STEP_CARD, "space-y-5")}>
              <div>
                <h2 className={STEP_TITLE}>{STEPS[5].label}</h2>
                <p className="text-sm leading-relaxed text-[#6B6B6B]">
                  Η Προστατευμένη παράδοση ενισχύει την εμπιστοσύνη για την κατάσταση και τη συσκευασία πριν την
                  αποστολή. Τεκμηριώνεις το προϊόν· η ροή μένει προβλέψιμη και για τις δύο πλευρές.
                </p>
              </div>
              {bundleLoading ? <p className="text-sm text-[#888888]">Φόρτωση οδηγιών συσκευασίας…</p> : null}
              <ShippingProfileRecommendation
                profile={wizardBundle?.shippingProfile ?? null}
                categoryName={categoryName}
              />
              <div>
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
                {protectedDeliveryEnabled ? (
                  <div className="mt-3 flex items-start gap-3 rounded-2xl bg-[#E8F7F1] p-4">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#1D9E75]" aria-hidden />
                    <p className="text-xs leading-relaxed text-[#0A5C43]">
                      Η προστατευμένη παράδοση αυξάνει σημαντικά την εμπιστοσύνη των αγοραστών και τις πιθανότητες
                      πώλησης.
                    </p>
                  </div>
                ) : null}
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
            <section className={cn(STEP_CARD, "space-y-6")}>
              <h2 className={STEP_TITLE}>{STEPS[6].label}</h2>
              <div className="divide-y divide-[#EEECE8] rounded-2xl border border-[#EEECE8] bg-white px-4">
                {[
                  { label: "Τίτλος", value: title },
                  { label: "Κατηγορία", value: categoryName },
                  ...(brandId ? [{ label: "Μάρκα", value: brandName }] : []),
                  { label: "Κατάσταση", value: wizardConditionLabel(wizardCondition) },
                  { label: "Τιμή", value: formatReviewPrice(priceEuros) },
                  { label: "Τοποθεσία", value: location.trim() || "—" },
                  {
                    label: "Προστατευμένη παράδοση",
                    value: protectedDeliveryEnabled ? "✓ Ναι" : "Όχι",
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3.5">
                    <span className="text-sm text-[#6B6B6B]">{row.label}</span>
                    <span
                      className={cn(
                        "text-sm font-semibold text-[#111111]",
                        row.label === "Τιμή" && "text-xl font-black",
                      )}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
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
              <button
                type="submit"
                disabled={pending}
                className="mt-6 w-full rounded-2xl bg-[#1D9E75] py-4 text-base font-bold text-white transition-all hover:bg-[#188A65] active:scale-[0.99] disabled:opacity-60"
              >
                {pending ? "Υποβολή…" : "Υποβολή για έγκριση →"}
              </button>
              <p className="mt-3 text-center text-xs text-[#ABABAB]">
                Η αγγελία θα εμφανιστεί μετά από έλεγχο από την ομάδα mint.
              </p>
              <div className="flex justify-center pt-2">
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
            <div className="mt-4 lg:mt-8">
              {stepError ? (
                <p className="mb-3 text-sm text-destructive" role="alert">
                  {stepError}
                </p>
              ) : null}
              <WizardStepNav onBack={goBack} onNext={goNext} />
            </div>
          ) : null}

          {step === 7 ? (
            <div className="mt-4 lg:mt-8">
              <WizardStepNav onBack={goBack} showNext={false} />
            </div>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
