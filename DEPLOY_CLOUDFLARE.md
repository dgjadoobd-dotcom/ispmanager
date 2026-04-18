# Cloudflare Pages Deployment Guide

## Architecture
- **Frontend**: Cloudflare Pages (global CDN)
- **Backend**: Docker container on VPS/Railway/Render
- **Database**: Supabase (PostgreSQL)

## Prerequisites
1. ✅ Supabase database migrated (run `supabase/setup_all.sql`)
2. ✅ Backend API deployed and accessible via HTTPS
3. ✅ GitHub repository pushed

## Step 1: Update Environment Variables

### Frontend (.env for Cloudflare Pages)
Add these in Cloudflare Pages dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://ugfzypauzjgfhgqlvxei.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_esTrcxRDNF2fRxuAfWTtIQ_Fd3vk7MB
VITE_BACKEND_API_URL=https://api.yourdomain.com
```

### Backend (proxy/.env)
```
PORT=3001
ALLOWED_ORIGINS=https://yourdomain.pages.dev
```

## Step 2: Build & Deploy Frontend

### Local Build Test
```bash
npm run build
npm run preview
```

### Cloudflare Pages Deployment
1. Go to https://dash.cloudflare.com → Pages
2. Click "Create a project"
3. Connect GitHub repository
4. Select `ispmanager` repo
5. Configure build:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
6. Add environment variables (see above)
7. Click "Save and Deploy"

## Step 3: Deploy Backend

### Option A: Railway (Recommended)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select `ispmanager/proxy` folder
4. Add environment variables:
   ```
   PORT=3001
   ALLOWED_ORIGINS=*
   ```
5. Deploy - Railway provides HTTPS automatically

### Option B: Render
1. Go to https://render.com
2. New Web Service
3. Connect repo, set root directory to `proxy`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables

### Option C: Your VPS (Docker)
```bash
# Build proxy image
cd proxy
docker build -t isp-proxy .

# Run container
docker run -d -p 3001:3001 --name isp-proxy isp-proxy

# Setup Cloudflare Tunnel (for HTTPS)
docker run -d cloudflare/cloudflared:latest tunnel run
```

## Step 4: Update Frontend API Calls

The frontend currently uses `/api/*` proxy. Update to use environment variable:

```typescript
// src/lib/api.ts (create this file)
const API_BASE = import.meta.env.VITE_BACKEND_API_URL || '/api';

export async function callBackend(endpoint: string, data: any) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

## Step 5: Configure CORS on Backend

Update `proxy/server.js` to allow your Cloudflare domain:

```javascript
app.use(cors({ 
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: false 
}));
```

## Step 6: Test Deployment

1. **Frontend**: Visit `https://yourproject.pages.dev`
2. **Backend**: Test `https://your-backend.railway.app/api/health`
3. **Integration**: Test MikroTik connection from frontend

## Troubleshooting

### CORS Errors
- Backend must allow frontend domain in CORS
- Check browser console for exact error

### API Calls Failing
- Verify `VITE_BACKEND_API_URL` is set correctly
- Check backend logs for errors
- Test backend directly: `curl https://backend-url/api/health`

### Build Fails on Cloudflare
- Check build logs in Cloudflare dashboard
- Ensure `package.json` has correct build script
- Verify Node version compatibility

## Domain Setup (Optional)

### Custom Domain for Cloudflare Pages
1. Cloudflare Dashboard → Pages → Your project
2. Custom domains → Add custom domain
3. Follow DNS setup instructions

### Custom Domain for Backend
- Railway: Add custom domain in project settings
- Render: Add custom domain in web service settings
- VPS: Configure DNS + SSL (use Cloudflare)

## Cost Estimate
- **Cloudflare Pages**: Free (unlimited requests)
- **Supabase**: Free tier (500MB database, 50K MAU)
- **Railway**: $5/month (after $5 free credit)
- **Render**: Free tier available (with limitations)
- **Fly.io**: Free tier (3 shared VMs)
