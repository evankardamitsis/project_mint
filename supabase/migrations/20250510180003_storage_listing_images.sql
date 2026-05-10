-- Public bucket for listing photos. App stores full public URLs in listing_images.url.
-- Path convention inside bucket: {listing_id}/{timestamp}-{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read (bucket is public; policies still apply on storage.objects)
create policy "listing_images_select_public"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'listing-images');

-- Sellers may write only under folders named with a listing id they own
create policy "listing_images_insert_seller_owner"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and exists (
    select 1
    from public.listings l
    join public.seller_profiles sp on sp.id = l.seller_id
    where split_part(name, '/', 1) = l.id::text
      and sp.user_id = auth.uid()
  )
);

create policy "listing_images_update_seller_owner"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listing-images'
  and exists (
    select 1
    from public.listings l
    join public.seller_profiles sp on sp.id = l.seller_id
    where split_part(name, '/', 1) = l.id::text
      and sp.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'listing-images'
  and exists (
    select 1
    from public.listings l
    join public.seller_profiles sp on sp.id = l.seller_id
    where split_part(name, '/', 1) = l.id::text
      and sp.user_id = auth.uid()
  )
);

create policy "listing_images_delete_seller_owner"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and exists (
    select 1
    from public.listings l
    join public.seller_profiles sp on sp.id = l.seller_id
    where split_part(name, '/', 1) = l.id::text
      and sp.user_id = auth.uid()
  )
);

create policy "listing_images_admin_all"
on storage.objects
for all
to authenticated
using (public.is_admin ())
with check (public.is_admin ());
