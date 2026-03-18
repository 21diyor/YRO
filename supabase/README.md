## Supabase setup (required)

This project uses **Supabase Auth + Postgres** for:
- Email login (magic link)
- Subscriber storage
- Posts storage
- Admin authorization
- Newsletter email sending (edge functions)

### 1) Create a Supabase project
Create a new project in Supabase and keep the project URL + anon key handy.

### 2) Apply DB schema + RLS + grants (one-shot)
In Supabase Dashboard → **SQL Editor**, run **one** of these:

- **Option A (recommended):** Run [`apply-full-setup.sql`](./apply-full-setup.sql) once. It applies grants, `is_admin`, your admin user, and all RLS policies. If the connection times out, run the file in chunks (each section between `-- ---` comments).
- **Option B:** Run in order: [`schema.sql`](./schema.sql), then [`rls.sql`](./rls.sql). Then add your admin user (see below).

**Create an admin user** (if you didn’t use `apply-full-setup.sql`): after signing in once in the app, run in SQL Editor:

```sql
insert into public.user_roles (user_id, role)
values ('YOUR_USER_UUID', 'admin')
on conflict (user_id) do update set role = 'admin';
```

Replace `YOUR_USER_UUID` with the ID shown on the app’s Admin page under “Logged in as:”.

### 3) Post engagement (likes, comments, share count)
Run the migration [`migrations/20240318160000_post_engagement.sql`](./migrations/20240318160000_post_engagement.sql) in the SQL Editor (or use `supabase db push`). This adds `post_likes`, `comments`, `posts.share_count`, and the `increment_post_share_count` RPC.

### 4) Cover image uploads (optional)
Admins can upload cover images for posts (uses Supabase Storage; Free tier includes 1 GB). In SQL Editor, run [`storage.sql`](./storage.sql). If the bucket insert fails, create bucket **post-images** in Dashboard → Storage (public), then run only the RLS policy statements from `storage.sql`.

### 5) Set app env vars
Create `youth-research-office/.env.local`:

```bash
VITE_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
VITE_APP_URL="http://localhost:3000"
```

### 6) Resend + Edge Functions
Edge Functions live under `supabase/functions/` (added by this repo). You’ll deploy them with the Supabase CLI.

Required secrets:
- `RESEND_API_KEY`
- `PUBLIC_APP_URL` (same as `VITE_APP_URL` but for server-side links)

Deploy steps (from `youth-research-office/`):
1. Install Supabase CLI and login
2. `supabase link --project-ref <your_project_ref>`
3. Set secrets:
   - `supabase secrets set RESEND_API_KEY=... PUBLIC_APP_URL=http://localhost:3000`
4. Deploy:
   - `supabase functions deploy send-post-notification`
   - `supabase functions deploy unsubscribe`

