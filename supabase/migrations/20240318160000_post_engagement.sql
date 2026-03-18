-- Post engagement: likes, comments, share_count

-- Add share_count to posts (for share button)
alter table public.posts add column if not exists share_count int not null default 0;

-- Post likes (one row per user per post)
create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index if not exists post_likes_post_id_idx on public.post_likes(post_id);

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_post_id_idx on public.comments(post_id);

-- RLS post_likes: anyone read; authenticated insert/delete own
alter table public.post_likes enable row level security;
drop policy if exists "post_likes_select" on public.post_likes;
create policy "post_likes_select" on public.post_likes for select to anon, authenticated using (true);
drop policy if exists "post_likes_insert_own" on public.post_likes;
create policy "post_likes_insert_own" on public.post_likes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "post_likes_delete_own" on public.post_likes;
create policy "post_likes_delete_own" on public.post_likes for delete to authenticated using (user_id = auth.uid());

-- RLS comments: anyone read; authenticated insert own
alter table public.comments enable row level security;
drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments for select to anon, authenticated using (true);
drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments for insert to authenticated with check (user_id = auth.uid());

-- Grant
grant select, insert, delete on public.post_likes to authenticated;
grant select on public.post_likes to anon;
grant select, insert on public.comments to authenticated;
grant select on public.comments to anon;

-- RPC: increment share count for published post (callable by anon for simplicity)
create or replace function public.increment_post_share_count(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set share_count = coalesce(share_count, 0) + 1
  where id = p_post_id and status = 'published';
end;
$$;
grant execute on function public.increment_post_share_count(uuid) to anon, authenticated;
