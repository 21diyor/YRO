-- =============================================================================
-- YRO Full Supabase Setup – run this ONCE in Supabase Dashboard → SQL Editor
-- =============================================================================
-- Copy the entire file, paste in SQL Editor, click Run.
-- If it times out, run the blocks in order (separated by -- --- blocks).
-- =============================================================================

-- --- 1) Table & schema permissions (required for RLS to work with authenticated)
grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on public.posts to authenticated;
grant select on public.posts to anon;
grant select, insert, update on public.newsletter_subscribers to authenticated;
grant select on public.user_roles to authenticated;

-- --- 2) is_admin() – SECURITY DEFINER so it can read user_roles without RLS loop
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = uid and ur.role = 'admin'
  );
$$;
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_admin(uuid) to anon;

-- --- 3) Ensure your user is admin (replace the UUID if your app shows a different "Logged in as")
insert into public.user_roles (user_id, role)
values ('f8cc8ba8-4313-4ede-a69e-03f1ac13c306', 'admin')
on conflict (user_id) do update set role = 'admin';

-- --- 4) user_roles: allow users to read their own row
alter table public.user_roles enable row level security;
drop policy if exists "roles_admin_select" on public.user_roles;
drop policy if exists "roles_select_own" on public.user_roles;
create policy "roles_select_own"
on public.user_roles for select to authenticated
using (user_id = auth.uid());

-- --- 5) posts: RLS and policies
alter table public.posts enable row level security;
-- Anyone can read published posts; admins and authors can read more
drop policy if exists "posts_select_published" on public.posts;
create policy "posts_select_published"
on public.posts for select to anon, authenticated
using (
  status = 'published'
  or (auth.uid() is not null and author_id = auth.uid())
  or public.is_admin(auth.uid())
);
-- Admin insert: author_id must be self and must be in user_roles as admin
drop policy if exists "posts_admin_insert" on public.posts;
create policy "posts_admin_insert"
on public.posts for insert to authenticated
with check (
  author_id = auth.uid()
  and exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);
drop policy if exists "posts_admin_update" on public.posts;
create policy "posts_admin_update"
on public.posts for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
drop policy if exists "posts_admin_delete" on public.posts;
create policy "posts_admin_delete"
on public.posts for delete to authenticated
using (public.is_admin(auth.uid()));

-- --- 6) newsletter_subscribers: RLS (if not already applied)
alter table public.newsletter_subscribers enable row level security;
drop policy if exists "subs_select_own" on public.newsletter_subscribers;
create policy "subs_select_own"
on public.newsletter_subscribers for select to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()));
drop policy if exists "subs_upsert_own" on public.newsletter_subscribers;
create policy "subs_upsert_own"
on public.newsletter_subscribers for insert to authenticated
with check (user_id = auth.uid());
drop policy if exists "subs_update_own" on public.newsletter_subscribers;
create policy "subs_update_own"
on public.newsletter_subscribers for update to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));
