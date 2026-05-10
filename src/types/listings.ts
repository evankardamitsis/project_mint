import type {
  ListingCondition,
  ListingStatus,
  SellerPayoutStatus,
  SellerVerificationStatus,
} from "@/types/domain";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface BrandOption {
  id: string;
  name: string;
  slug: string;
}

export interface ListingImageRow {
  id: string;
  listing_id: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface ListingCardData {
  id: string;
  title: string;
  slug: string;
  price_cents: number;
  currency: string;
  condition: ListingCondition;
  location: string | null;
  status: ListingStatus;
  created_at: string;
  primary_image_url: string | null;
  protected_delivery_enabled?: boolean;
}

export interface ListingDetailData {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string | null;
  condition: ListingCondition;
  price_cents: number;
  currency: string;
  location: string | null;
  status: ListingStatus;
  offers_enabled: boolean;
  protected_delivery_enabled: boolean;
  created_at: string;
  published_at: string | null;
  rejection_reason: string | null;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string } | null;
  seller_display_name: string;
  images: ListingImageRow[];
}

export interface SellerProfileRow {
  id: string;
  user_id: string;
  display_name: string;
}

export interface SellerProfileFull extends SellerProfileRow {
  bio: string | null;
  location: string | null;
  phone: string | null;
  verification_status: SellerVerificationStatus;
  payout_status: SellerPayoutStatus;
  created_at: string;
  updated_at: string;
}

export interface SellerListingEditData {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string | null;
  condition: ListingCondition;
  price_cents: number;
  currency: string;
  location: string | null;
  status: ListingStatus;
  category_id: string;
  brand_id: string | null;
  offers_enabled: boolean;
  protected_delivery_enabled: boolean;
  images: ListingImageRow[];
}

export interface AdminListingRow {
  id: string;
  title: string;
  slug: string;
  price_cents: number;
  currency: string;
  condition: ListingCondition;
  status: ListingStatus;
  created_at: string;
  seller_display_name: string;
  category_name: string | null;
  primary_image_url: string | null;
}
