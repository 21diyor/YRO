-- Fix is_admin to avoid RLS recursion (stops "stack depth limit exceeded")
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

-- Ensure admin user exists (run for user f8cc8ba8-4313-4ede-a69e-03f1ac13c306)
insert into public.user_roles (user_id, role)
values ('f8cc8ba8-4313-4ede-a69e-03f1ac13c306', 'admin')
on conflict (user_id) do update set role = 'admin';

-- Policy so app can read own role
drop policy if exists "roles_admin_select" on public.user_roles;
drop policy if exists "roles_select_own" on public.user_roles;
create policy "roles_select_own"
on public.user_roles for select to authenticated
using (user_id = auth.uid());
