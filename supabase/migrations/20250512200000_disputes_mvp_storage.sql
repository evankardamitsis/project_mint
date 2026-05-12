-- Disputes MVP: seller response / admin fields, one active dispute per order, dispute-assets storage.

-- ---------------------------------------------------------------------------
-- disputes: seller response + admin timeline fields
-- ---------------------------------------------------------------------------

alter table public.disputes
  add column if not exists seller_response text,
  add column if not exists seller_responded_at timestamptz,
  add column if not exists admin_notes text,
  add column if not exists resolved_at timestamptz;

comment on column public.disputes.seller_response is 'Seller reply to buyer claim (MVP, no threaded messages).';
comment on column public.disputes.admin_notes is 'Internal / admin-only notes; resolution summary may live in resolution_notes.';

-- ---------------------------------------------------------------------------
-- At most one "active" dispute per order (open pipeline)
-- ---------------------------------------------------------------------------

create unique index if not exists disputes_one_active_per_order_idx
  on public.disputes (order_id)
  where status in (
    'open'::public.dispute_status,
    'awaiting_seller'::public.dispute_status,
    'awaiting_buyer'::public.dispute_status,
    'under_review'::public.dispute_status
  );

-- ---------------------------------------------------------------------------
-- Storage: private dispute evidence bucket
-- Path: {dispute_id}/{timestamp}-{filename}
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dispute-assets',
  'dispute-assets',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "dispute_assets_storage_select_party_or_admin"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'dispute-assets'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.disputes d
      join public.orders o on o.id = d.order_id
      where d.id::text = split_part(name, '/', 1)
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

create policy "dispute_assets_storage_insert_party_or_admin"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'dispute-assets'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.disputes d
      join public.orders o on o.id = d.order_id
      where d.id::text = split_part(name, '/', 1)
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

create policy "dispute_assets_storage_delete_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'dispute-assets'
  and public.is_admin()
);
