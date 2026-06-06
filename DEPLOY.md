# Everbook — Deploy to Vercel

## 1. Supabase setup (one-time)

1. Go to [supabase.com](https://supabase.com) → New project
2. SQL Editor → run these files **in order**:
   - `supabase/schema.sql`
   - `supabase/orders.sql`
   - `supabase/admin-columns.sql`
3. Copy from **Project Settings → API**:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
4. Storage → create bucket named **`projects`** (public)

## 2. Omise setup

1. [omise.co](https://omise.co) → Dashboard → Keys
2. Switch from Test to **Live** keys when ready to accept real payments
3. Copy Public Key → `NEXT_PUBLIC_OMISE_PUBLIC_KEY`
4. Copy Secret Key → `OMISE_SECRET_KEY`

## 3. Deploy to Vercel

```bash
# Install Vercel CLI (once)
npm i -g vercel

# From the project folder:
vercel

# Follow the prompts:
#   Link to existing project? No → create new
#   Project name: everbook
#   Root directory: ./  (default)
#   Override build? No
```

## 4. Environment variables on Vercel

Go to **Vercel Dashboard → Project → Settings → Environment Variables**
and add **all** of the following (Production + Preview + Development):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret!) |
| `NEXT_PUBLIC_OMISE_PUBLIC_KEY` | Omise public key |
| `OMISE_SECRET_KEY` | Omise secret key (secret!) |
| `ADMIN_PASSWORD` | your chosen admin password |

⚠️ `SUPABASE_SERVICE_ROLE_KEY` and `OMISE_SECRET_KEY` must **never** have `NEXT_PUBLIC_` prefix.

## 5. Custom domain (optional)

Vercel Dashboard → Project → Settings → Domains → Add your domain.
If using Cloudflare, set SSL to **Full (strict)**.

## 6. Go live checklist

- [ ] Supabase SQL scripts all ran without error
- [ ] Supabase `projects` storage bucket created (public)
- [ ] All env vars set on Vercel
- [ ] Omise Live keys added (replace test keys)
- [ ] `ADMIN_PASSWORD` changed from default
- [ ] Test order flow end-to-end on production
- [ ] Test PromptPay QR on real phone
- [ ] Admin panel accessible at `/admin`

## Local development

```bash
npm run dev     # http://localhost:3000
npm run build   # production build check
```
