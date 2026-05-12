import type {
  ProtectedDeliveryAssetType,
  ProtectedDeliveryCheckStatus,
  ShipmentStatus,
} from "@/types/domain";

export interface ProtectedDeliveryAssetView {
  id: string;
  type: ProtectedDeliveryAssetType;
  /** Path inside `protected-delivery-assets` bucket (not a public URL). */
  storagePath: string;
  signedUrl: string | null;
  created_at: string;
}

export interface ProtectedDeliveryShipmentView {
  id: string;
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  status: ShipmentStatus;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface ProtectedDeliveryCheckView {
  id: string;
  order_id: string;
  condition_photos_uploaded: boolean;
  serial_number_uploaded: boolean;
  packaging_photos_uploaded: boolean;
  sealed_package_photo_uploaded: boolean;
  tracking_added: boolean;
  seller_notes: string | null;
  status: ProtectedDeliveryCheckStatus;
  created_at: string;
  updated_at: string;
}

export interface ProtectedDeliveryBundle {
  check: ProtectedDeliveryCheckView;
  assets: ProtectedDeliveryAssetView[];
  shipment: ProtectedDeliveryShipmentView | null;
}
