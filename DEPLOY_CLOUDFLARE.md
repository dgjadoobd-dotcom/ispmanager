# Cloudflare Pages Deployment Guide

This guide covers deploying the ISP Manager frontend to Cloudflare Pages with backend integration.

## Prerequisites

- ✅ Supabase database set up and migrated
- ✅ Backend API deployed and accessible
- ✅ GitHub repository with latest code
- ✅ Domain configured (optional)

## Environment Variables

### Frontend Environment (.env.local)

Create `.env.local` in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API Configuration
VITE_BACKEND_API_URL=https://api.yourdomain.com

# Optional: Analytics & Monitoring
VITE_GA_TRACKING_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=your-sentry-dsn
```

### Cloudflare Pages Environment Variables

In Cloudflare Dashboard → Pages → Your Project → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_BACKEND_API_URL=https://api.yourdomain.com
```

## Deployment Steps

### 1. Connect Repository

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Click **"Create a project"**
3. Select **"Connect to Git"**
4. Choose your GitHub repository
5. Select repository: `yourusername/ispmanager`

### 2. Configure Build Settings

```
Production branch: main
Build command: npm run build
Build output directory: dist
Root directory: /
```

### 3. Add Environment Variables

Add the environment variables listed above in the Cloudflare Pages dashboard.

### 4. Deploy

Click **"Save and Deploy"**

Cloudflare will:
- Clone your repository
- Install dependencies (`npm install`)
- Build the project (`npm run build`)
- Deploy to global CDN

## Custom Domain (Optional)

1. Go to Pages → Your Project → Custom domains
2. Click **"Set up a custom domain"**
3. Enter your domain (e.g., `isp.yourcompany.com`)
4. Follow DNS configuration instructions

## Backend Deployment Options

### Railway (Recommended)

1. Go to [Railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. Select your repository
4. Set **Root directory**: `proxy`
5. Add environment variables:
   ```
   PORT=3001
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ALLOWED_ORIGINS=https://yourdomain.pages.dev,https://isp.yourcompany.com
   ```
6. Click **Deploy**

### Render

1. Go to [Render.com](https://render.com)
2. **New** → **Web Service**
3. Connect GitHub repository
4. Set **Root directory**: `proxy`
5. Configure:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Add environment variables (same as Railway)
7. Click **Create Web Service**

### VPS/Docker

```bash
# Build backend image
cd proxy
docker build -t ispmanager-backend .

# Run container
docker run -d \
  --name ispmanager-backend \
  -p 3001:3001 \
  -e PORT=3001 \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  -e ALLOWED_ORIGINS=https://yourdomain.com \
  ispmanager-backend
```

## API Integration

The frontend expects the backend API to be available at the URL specified in `VITE_BACKEND_API_URL`.

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/mikrotik/*` - MikroTik operations
- `POST /api/olt/*` - OLT device operations
- `POST /api/payments/*` - Payment processing
- `POST /api/notifications/*` - Notification services

### CORS Configuration

Ensure your backend allows requests from your Cloudflare Pages domain:

```javascript
// In proxy/server.js
const corsOptions = {
  origin: [
    'http://localhost:5173', // Development
    'https://your-project.pages.dev', // Cloudflare Pages preview
    'https://isp.yourcompany.com' // Production domain
  ],
  credentials: true
};
```

## Build Optimization

### Build Commands

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Performance Tips

1. **Enable Brotli compression** in Cloudflare dashboard
2. **Set up caching rules** for static assets
3. **Use WebP images** for better compression
4. **Enable HTTP/2** (automatic on Cloudflare)
5. **Monitor Core Web Vitals** in Pages dashboard

## Troubleshooting

### Build Failures

**Node.js Version Issues:**
- Cloudflare Pages uses Node.js 18+
- Check `package.json` engines field
- Update dependencies if needed

**Environment Variables:**
- Variables prefixed with `VITE_` are exposed to client
- Check variable names match exactly
- Redeploy after changing variables

### Runtime Issues

**API Connection Problems:**
```bash
# Test API connectivity
curl https://api.yourdomain.com/api/health
```

**CORS Errors:**
- Check `ALLOWED_ORIGINS` in backend
- Include both `pages.dev` and custom domain
- Clear browser cache after changes

**Authentication Issues:**
- Verify Supabase keys are correct
- Check Supabase project is active
- Review Supabase RLS policies

### Performance Issues

**Slow Loading:**
- Check Cloudflare analytics
- Optimize bundle size with `npm run build`
- Use code splitting for large components
- Enable caching for API responses

**High Bandwidth:**
- Compress images and assets
- Use CDN for static files
- Implement lazy loading for components

## Monitoring

### Cloudflare Analytics

- **Real User Monitoring (RUM)**: Track user experience
- **Web Vitals**: Monitor Core Web Vitals
- **Security Events**: Review security logs
- **Performance Insights**: Identify bottlenecks

### Application Monitoring

Consider integrating:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Google Analytics** for user analytics
- **UptimeRobot** for availability monitoring

## Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **API Keys**: Use restricted API keys when possible
3. **CORS**: Limit origins to your domains only
4. **HTTPS**: Always use HTTPS in production
5. **CSP Headers**: Implement Content Security Policy
6. **Rate Limiting**: Protect API endpoints from abuse

## Cost Optimization

**Cloudflare Pages (Free Tier):**
- 100 GB bandwidth/month
- 10,000 functions invocations/month
- Unlimited static sites

**Paid Features:**
- Increased bandwidth limits
- Advanced security features
- Custom domains
- Analytics retention

For high-traffic applications, consider:
- CDN optimization
- Image optimization
- Caching strategies
- Database query optimization

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
