#!/bin/bash

# ISP Manager Deployment Script
# This script provides automated deployment commands for different platforms

set -e

echo "🚀 ISP Manager Deployment Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git."
        exit 1
    fi

    print_status "Dependencies check passed."
}

# Setup environment variables
setup_env() {
    print_status "Setting up environment variables..."

    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            print_warning "Copied .env.example to .env.local. Please edit .env.local with your actual values."
        else
            print_error ".env.example not found. Please create environment configuration."
            exit 1
        fi
    else
        print_status "Environment file already exists."
    fi
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    npm install
    print_status "Dependencies installed."
}

# Build application
build_app() {
    print_status "Building application..."
    npm run build
    print_status "Build completed."
}

# Deploy to different platforms
deploy_cloudflare() {
    print_status "Deploying to Cloudflare Pages..."

    if ! command -v wrangler &> /dev/null; then
        print_status "Installing Wrangler CLI..."
        npm install -g wrangler
    fi

    wrangler login
    wrangler pages deploy dist --project-name=ispmanager

    print_status "Cloudflare deployment completed."
}

deploy_railway() {
    print_status "Deploying backend to Railway..."

    if ! command -v railway &> /dev/null; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi

    cd proxy
    railway login
    railway init
    railway up
    cd ..

    print_status "Railway deployment completed."
}

# Main deployment function
main() {
    echo "Select deployment option:"
    echo "1. Local development setup"
    echo "2. Full production deployment (Cloudflare + Railway)"
    echo "3. Frontend only (Cloudflare Pages)"
    echo "4. Backend only (Railway)"
    echo "5. Docker deployment"
    read -p "Enter your choice (1-5): " choice

    check_dependencies

    case $choice in
        1)
            print_status "Setting up local development..."
            setup_env
            install_deps
            print_status "Local setup complete. Run 'npm run dev' to start development server."
            ;;
        2)
            print_status "Starting full production deployment..."
            setup_env
            install_deps
            build_app
            deploy_railway
            deploy_cloudflare
            print_status "Full deployment completed!"
            ;;
        3)
            print_status "Deploying frontend to Cloudflare Pages..."
            setup_env
            install_deps
            build_app
            deploy_cloudflare
            ;;
        4)
            print_status "Deploying backend to Railway..."
            deploy_railway
            ;;
        5)
            print_status "Starting Docker deployment..."
            if command -v docker-compose &> /dev/null; then
                docker-compose up -d --build
                print_status "Docker deployment completed. Access at http://localhost"
            else
                print_error "Docker Compose not found. Please install Docker and Docker Compose."
                exit 1
            fi
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac
}

# Run main function
main
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
