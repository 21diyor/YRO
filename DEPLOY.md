# Deploy Youth Research Office

Your app is a Vite + React SPA. Use either **Vercel** or **Netlify** (both have free tiers).

---

## Option A: Vercel (recommended)

1. **Push your code to GitHub** (if you haven’t already).
   ```bash
   git add .
   git commit -m "Ready for deploy"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in (e.g. with GitHub).

3. **Import the project**
   - Click **Add New…** → **Project**.
   - Select your GitHub repo (e.g. `YRO` or `youth-research-office`).
   - **Root Directory:** if the app is in a subfolder (e.g. `youth-research-office`), set it to that folder. Otherwise leave as repo root.
   - **Framework Preset:** Vite (should be detected).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment variables**
   - Open **Settings** → **Environment Variables**.
   - Add:
     - `VITE_SUPABASE_URL` = your Supabase project URL (e.g. `https://xxxxx.supabase.co`)
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - Save.

5. **Deploy**
   - Click **Deploy**. Vercel will build and give you a URL (e.g. `your-project.vercel.app`).

6. **Optional: custom domain**  
   In the project → **Settings** → **Domains** you can add your own domain.

---

## Option B: Netlify

1. **Push your code to GitHub** (see step 1 above).

2. **Go to [netlify.com](https://netlify.com)** and sign in (e.g. with GitHub).

3. **Add a new site**
   - **Add new site** → **Import an existing project**.
   - Connect GitHub and choose your repo.
   - **Base directory:** set to `youth-research-office` if the app lives in that subfolder, else leave empty.
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

4. **Environment variables**
   - **Site settings** → **Environment variables** → **Add variable** (or **Edit settings** → **Environment**).
   - Add:
     - `VITE_SUPABASE_URL` = your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

5. **Deploy**
   - Click **Deploy site**. Netlify will build and give you a URL (e.g. `random-name.netlify.app`).

6. **Optional: custom domain**  
   **Domain management** → **Add custom domain**.

---

## After deploy

- **Supabase:** In Authentication → URL Configuration, add your production URL to **Redirect URLs** (e.g. `https://your-site.vercel.app/**`) so magic links work.
- **Covers:** Ensure the 4 cover images are in Supabase Storage under `post-images/covers/` (1.png, 2.png, 3.png, 4.png) so they load on the live site.
