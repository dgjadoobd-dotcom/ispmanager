# ISP Manager Deployment Scripts

## Quick Deploy Commands

### 1. Database Migration (Required First)
```bash
# Run in Supabase Dashboard SQL Editor
# Copy content from: supabase/setup_all.sql
# URL: https://supabase.com/dashboard/project/ugfzypauzjgfhgqlvxei
```

### 2. Build Frontend Locally
```bash
npm install
npm run build
npm run preview
```

### 3. Deploy Backend to Railway
```bash
cd proxy
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway init
railway up
```

### 4. Deploy Frontend to Cloudflare Pages
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy (manual method)
npm run build
npx wrangler pages deploy dist --project-name=ispmanager
```

### 5. Push to GitHub (for auto-deploy)
```bash
git add .
git commit -m "Setup Cloudflare deployment"
git push origin main
```

## Environment Setup

### Create .env file
```bash
cp .env.example .env
# Edit .env with your values
```

### Cloudflare Pages Environment Variables
Go to: Cloudflare Dashboard → Pages → Your Project → Settings → Environment Variables

Add:
```
VITE_SUPABASE_URL=https://ugfzypauzjgfhgqlvxei.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_esTrcxRDNF2fRxuAfWTtIQ_Fd3vk7MB
VITE_BACKEND_API_URL=https://your-backend.railway.app
```

### Railway Environment Variables
Go to: Railway → Your Project → Variables

Add:
```
PORT=3001
ALLOWED_ORIGINS=https://yourproject.pages.dev
```

## Testing Deployment

### Test Backend Health
```bash
curl https://your-backend.railway.app/api/health
```

### Test Frontend Build
```bash
npm run build
ls dist/  # Should have index.html, assets/, etc.
```

### Test Supabase Connection
```bash
# In browser console on deployed site:
console.log(supabase.from('tenants').select('*'))
```

## Troubleshooting

### Git Push Failing (Network Issues)
```bash
# Check internet connection
ping github.com

# Try alternative remote
git remote set-url origin https://github.com/USERNAME/ispmanager.git

# Use SSH instead
git remote set-url origin git@github.com:USERNAME/ispmanager.git
```

### Build Fails on Cloudflare
- Check build logs in Cloudflare dashboard
- Verify Node version: `node --version` (should be 18+)
- Clear cache: Cloudflare → Deployments → Retry deployment

### CORS Errors
- Backend must allow frontend domain in `ALLOWED_ORIGINS`
- Check browser console for exact error message
- Test backend directly: `curl -X OPTIONS https://backend/api/health`

### API Calls Failing
- Verify `VITE_BACKEND_API_URL` is set correctly (no trailing slash)
- Check backend logs on Railway/Render
- Test health endpoint first

## Cost Optimization

### Free Tier Limits
- **Cloudflare Pages**: Unlimited requests, 100 builds/day
- **Supabase**: 500MB database, 50K monthly active users
- **Railway**: $5 credit/month, then pay-as-you-go
- **Render**: Free tier with 750 hours/month limit

### Reduce Costs
- Use Cloudflare caching for static assets
- Enable Supabase query caching
- Monitor Railway/Render usage dashboard
- Consider upgrading Supabase Pro ($25/mo) for production

## Production Checklist

- [ ] Database migrated (setup_all.sql)
- [ ] Backend deployed and healthy
- [ ] Frontend deployed to Cloudflare
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] HTTPS working on both frontend and backend
- [ ] MikroTik API calls tested
- [ ] OLT API calls tested
- [ ] Supabase queries working
- [ ] Error monitoring setup (optional)
- [ ] Backup strategy in place (optional)

## Support

For issues:
1. Check deployment logs (Cloudflare/Railway dashboard)
2. Review browser console errors
3. Test backend endpoints directly
4. Verify environment variables
5. Check Supabase dashboard for database errors
