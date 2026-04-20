# ISP Manager - Deployment Guide

This guide covers deploying ISP Manager to production with all features enabled.

## Prerequisites

- Ubuntu 24.04 LTS server or compatible Linux distribution
- Domain name (optional, but recommended for production)
- Supabase account for database
- GitHub repository access

## Quick Deployment (Ubuntu 24.04 LTS)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git unzip software-properties-common ufw

# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable docker
sudo systemctl start docker

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

### 2. Clone Repository

```bash
git clone https://github.com/yourusername/ispmanager.git
cd ispmanager
```

### 3. Database Setup (Supabase)

1. **Create Supabase Project**
   - Visit [supabase.com](https://supabase.com)
   - Create new project
   - Note project URL and API keys

2. **Run Database Migrations**
   - Open Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/setup_all.sql`
   - Execute the SQL

### 4. Environment Configuration

**Create `.env.local` (Frontend)**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_API_URL=https://api.yourdomain.com
```

**Create `proxy/.env` (Backend)**
```bash
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ALLOWED_ORIGINS=https://yourdomain.com
```

### 5. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Note: Certificate path will be /etc/letsencrypt/live/yourdomain.com/
```

### 6. Deploy with Docker

```bash
# Build and start services
docker-compose up -d --build

# Check deployment
docker-compose logs -f

# Access application
# Frontend: https://yourdomain.com
# Backend API: https://api.yourdomain.com
```

## Manual Deployment

### Backend Deployment

```bash
cd proxy
npm install --production

# Create systemd service
sudo nano /etc/systemd/system/ispmanager-backend.service
```

**Service file content:**
```ini
[Unit]
Description=ISP Manager Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/ispmanager/proxy
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable ispmanager-backend
sudo systemctl start ispmanager-backend
```

### Frontend Deployment

```bash
# Build frontend
npm run build

# Install Nginx
sudo apt install -y nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/ispmanager
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /home/ubuntu/ispmanager/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ispmanager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Cloud Deployment Options

### Frontend (Static Hosting)

**Cloudflare Pages:**
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set build output: `dist`
4. Add environment variables in dashboard

**Vercel:**
1. Import GitHub repository
2. Configure build settings
3. Add environment variables

### Backend (API Server)

**Railway:**
1. Connect GitHub repository
2. Set root directory: `proxy`
3. Add environment variables
4. Deploy

**Render:**
1. Create new Web Service
2. Connect repository
3. Set build/start commands
4. Add environment variables

## Environment Variables Reference

### Frontend (.env.local)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend API
VITE_BACKEND_API_URL=https://api.yourdomain.com

# Optional: Analytics, etc.
VITE_GA_TRACKING_ID=your-ga-id
```

### Backend (proxy/.env)
```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Optional: External Services
MIKROTIK_API_KEY=your-mikrotik-key
PAYMENT_GATEWAY_KEY=your-payment-key
```

## Post-Deployment Checklist

- [ ] Domain configured and SSL enabled
- [ ] Database migrations completed
- [ ] Environment variables set correctly
- [ ] Frontend accessible via HTTPS
- [ ] Backend API responding
- [ ] Login functionality working
- [ ] Customer management functional
- [ ] Billing system operational
- [ ] Network integrations configured
- [ ] Email notifications working
- [ ] Backup strategy implemented

## Monitoring & Maintenance

### Logs
```bash
# Docker logs
docker-compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
sudo journalctl -u ispmanager-backend -f
```

### Backups
```bash
# Database backup (Supabase)
# Configure automated backups in Supabase dashboard

# File backup
tar -czf backup-$(date +%Y%m%d).tar.gz /home/ubuntu/ispmanager
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

### Common Issues

**API Connection Failed:**
- Check `VITE_BACKEND_API_URL` in frontend
- Verify backend is running on correct port
- Check CORS settings in backend

**Database Connection Issues:**
- Verify Supabase credentials
- Check network connectivity
- Review Supabase project status

**SSL Certificate Problems:**
- Renew certificates: `sudo certbot renew`
- Check certificate paths in Nginx config
- Restart Nginx after certificate renewal

**Performance Issues:**
- Monitor server resources with `htop`
- Check Docker container resource usage
- Optimize database queries
- Enable caching if needed

For additional support, check the [GitHub Issues](https://github.com/yourusername/ispmanager/issues) or community forums.