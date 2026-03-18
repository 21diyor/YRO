-- Core tables for YRO app

-- 1) Posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  content text not null,
  category text,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  author_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx
  on public.posts(status, published_at desc nulls last);

-- 2) Newsletter subscribers (one row per user)
create table if not exists public.newsletter_subscribers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create index if not exists newsletter_subscribers_active_idx
  on public.newsletter_subscribers(unsubscribed_at) where unsubscribed_at is null;

-- 3) User roles (simple RBAC)
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin'))
);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

-- Grants so authenticated/anon can use tables (RLS policies then restrict access)
grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on public.posts to authenticated;
grant select on public.posts to anon;
grant select, insert, update on public.newsletter_subscribers to authenticated;
grant select on public.user_roles to authenticated;

