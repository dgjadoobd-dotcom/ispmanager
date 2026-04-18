# ISP Manager - Deployment Steps

## Step 1: Database Migration (Supabase)

**URL:** https://supabase.com/dashboard/project/ugfzypauzjgfhgqlvxei

1. Click **SQL Editor** in left sidebar
2. Click **New query**
3. Copy all content from `supabase/setup_all.sql`
4. Paste into editor
5. Click **Run**

**Expected:** "Success" with no errors

---

## Step 2: Deploy Backend to Railway

**URL:** https://railway.app

### Option A: CLI Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project (select your GitHub account)
railway init

# Deploy proxy folder
cd proxy
railway up
```

### Option B: GitHub Deployment (Recommended)
1. Go to https://railway.app
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Select `dgjadoobd-dotcom/ispmanager`
5. Select root directory: `proxy`
6. Add environment variables:
   - `PORT=3001`
   - `ALLOWED_ORIGINS=*`
7. Click **Deploy**

**Get your backend URL:** After deploy, Railway provides: `https://your-project-name.up.railway.app`

---

## Step 3: Deploy Frontend to Cloudflare Pages

**URL:** https://dash.cloudflare.com

### Option A: CLI Deployment
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Deploy
npm run build
npx wrangler pages deploy dist --project-name=ispmanager
```

### Option B: GitHub Deployment (Recommended)
1. Go to https://dash.cloudflare.com
2. Click **Pages** → **Create project**
3. Select **Connect to GitHub**
4. Select `dgjadoobd-dotcom/ispmanager`
5. Configure:
   - **Production branch:** main
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL=https://ugfzypauzjgfhgqlvxei.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_esTrcxRDNF2fRxuAfWTtIQ_Fd3vk7MB`
   - `VITE_BACKEND_API_URL=https://your-backend-url.up.railway.app`
7. Click **Save and Deploy**

---

## Step 4: Update Frontend with Backend URL

After Railway deploy, update Cloudflare environment:

1. Go to Cloudflare → Pages → Your project → Settings
2. Click **Environment Variables**
3. Update `VITE_BACKEND_API_URL` with your Railway URL
4. Redeploy

---

## Quick Reference

| Service | URL | Action |
|---------|-----|--------|
| Supabase | supabase.com/dashboard/project/ugfzypauzjgfhgqlvxei | Run SQL |
| Railway | railway.app | Deploy backend |
| Cloudflare | dash.cloudflare.com | Deploy frontend |

---

## Troubleshooting

### Build fails on Cloudflare
- Check Node version (use 18+)
- Clear build cache in Cloudflare dashboard

### API calls fail
- Verify `VITE_BACKEND_API_URL` is set correctly
- Check Railway logs for errors

### CORS errors
- Update `ALLOWED_ORIGINS` in Railway to include your Cloudflare domain

---

## Complete Deployment Checklist

- [ ] Database migrated (Supabase SQL Editor)
- [ ] Backend deployed (Railway)
- [ ] Backend URL captured
- [ ] Frontend deployed (Cloudflare)
- [ ] Environment variables set
- [ ] Test MikroTik API call
- [ ] Test Supabase queries