-- =============================================================================
-- Storage bucket "post-images" for cover uploads (Free tier: 1 GB included)
-- =============================================================================
-- If the insert below fails (e.g. permission), create the bucket in Dashboard:
-- Storage → New bucket → id/name "post-images", enable "Public bucket", then run
-- the policies below (from "-- RLS: anyone can read" to the end).
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- RLS: anyone can read (public bucket)
drop policy if exists "post_images_public_read" on storage.objects;
create policy "post_images_public_read"
on storage.objects for select
to public
using (bucket_id = 'post-images');

-- RLS: only admins can upload
drop policy if exists "post_images_admin_upload" on storage.objects;
create policy "post_images_admin_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and public.is_admin(auth.uid())
);

-- RLS: only admins can update/delete
drop policy if exists "post_images_admin_update" on storage.objects;
create policy "post_images_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'post-images' and public.is_admin(auth.uid()));

drop policy if exists "post_images_admin_delete" on storage.objects;
create policy "post_images_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'post-images' and public.is_admin(auth.uid()));
