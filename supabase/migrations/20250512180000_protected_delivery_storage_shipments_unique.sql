-- Protected Delivery MVP: one shipment per order, private proof bucket, storage RLS.
-- protected_delivery_checks already has unique(order_id) in initial schema.

-- ---------------------------------------------------------------------------
-- Shipments: enforce single row per order (upsert from app)
-- ---------------------------------------------------------------------------

create unique index if not exists shipments_order_id_unique
  on public.shipments (order_id);

-- ---------------------------------------------------------------------------
-- Storage: private bucket for seller proof assets
-- Path convention: {order_id}/{asset_type}/{timestamp}-{filename}
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'protected-delivery-assets',
  'protected-delivery-assets',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Order parties (buyer/seller) and admins may read signed objects (RLS + app-signed URLs).
create policy "protected_delivery_assets_storage_select_party_or_admin"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'protected-delivery-assets'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.orders o
      where o.id::text = split_part(name, '/', 1)
        and (
          o.buyer_id = auth.uid()
          or exists (
            select 1
            from public.seller_profiles sp
            where sp.id = o.seller_id
              and sp.user_id = auth.uid()
          )
        )
    )
  )
);

-- Seller on the order (or admin) may upload under that order_id prefix.
create policy "protected_delivery_assets_storage_insert_seller_or_admin"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'protected-delivery-assets'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.orders o
      where o.id::text = split_part(name, '/', 1)
        and exists (
          select 1
          from public.seller_profiles sp
          where sp.id = o.seller_id
            and sp.user_id = auth.uid()
        )
    )
  )
);

-- MVP: deletes via admin tooling / server actions only.
create policy "protected_delivery_assets_storage_delete_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'protected-delivery-assets'
  and public.is_admin()
);
