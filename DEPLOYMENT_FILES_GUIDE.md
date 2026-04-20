# ISP Manager - Self-Hosted Deployment Files Guide

Complete reference for all files needed to deploy ISP Manager on your Ubuntu 24.04 server.

## 📁 Key Deployment Files

### Configuration Files

| File | Purpose | Edit Before Deployment |
|------|---------|------------------------|
| `.env.selfhosted` | Environment variables template | ✅ Yes - Set all values |
| `docker-compose-selfhosted.yml` | Docker services configuration | ✅ Yes - Set domain |
| `nginx-selfhosted.conf` | Nginx reverse proxy config | ✅ Yes - Replace yourdomain.com |
| `.env.production` | Production environment variables | ✅ Yes - Generated during setup |

### Server Files

| File | Purpose |
|------|---------|
| `proxy/server-selfhosted.js` | Backend API with RADIUS & Piprapay |
| `proxy/radius.js` | RADIUS server implementation |
| `proxy/piprapay.js` | Payment gateway integration |
| `proxy/package.json` | Backend dependencies |
| `SELF_HOSTED_UBUNTU.md` | Detailed setup instructions |
| `quick-deploy.sh` | Automated deployment script |

### Documentation

| File | Content |
|------|---------|
| `README.md` | Main project documentation |
| `DEPLOY_STEPS_UPDATED.md` | Deployment method comparison |
| `DEPLOY_CLOUDFLARE.md` | Cloud deployment alternative |
| `SELF_HOSTED_UBUNTU.md` | Step-by-step self-hosted guide |

---

## 🚀 Quick Deployment (2 Methods)

### Method 1: Automated Script (5 minutes)

```bash
# Best for quick deployment
sudo chmod +x quick-deploy.sh
sudo ./quick-deploy.sh
```

Follow the interactive prompts for:
- PostgreSQL password
- Domain name
- Automatic configuration

### Method 2: Manual Setup (30-60 minutes)

```bash
# Follow SELF_HOSTED_UBUNTU.md for step-by-step instructions
# Full control over each component
# Recommended for learning
```

---

## 🛠️ Configuration Setup

### Step 1: Create Environment File

```bash
# Copy template
cp .env.selfhosted .env.production

# Edit with your values
nano .env.production
```

**Critical Values to Set:**

```
DOMAIN=yourdomain.com
DB_PASSWORD=your_strong_password_here
JWT_SECRET=generate_with_openssl_rand_-base64_32
SESSION_SECRET=generate_with_openssl_rand_-base64_32
RADIUS_SECRET=generate_with_openssl_rand_-base64_32
PIPRAPAY_MERCHANT_ID=your_merchant_id
PIPRAPAY_API_KEY=your_api_key
```

**Generate Secure Keys:**
```bash
# Generate 32-byte base64 encoded random keys
openssl rand -base64 32  # Run 3 times for JWT, SESSION, ENCRYPTION, RADIUS secrets
```

### Step 2: Docker Compose Configuration

The `docker-compose-selfhosted.yml` includes:

```yaml
services:
  postgres:      # PostgreSQL database
  redis:         # Cache layer
  backend:       # Node.js API server
  frontend:      # React application
  nginx:         # Reverse proxy
  pgadmin:       # Database UI (optional)
```

### Step 3: Nginx Configuration

The `nginx-selfhosted.conf` includes:

- HTTP to HTTPS redirect
- SSL/TLS configuration
- Security headers (HSTS, CSP, X-Frame-Options)
- Gzip compression
- Rate limiting
- API proxying
- Static asset caching
- SPA routing

**Customize for your domain:**
```bash
sed -i 's/yourdomain.com/yourdomain.com/g' nginx-selfhosted.conf
```

---

## 📊 Architecture Overview

```
                          ┌─────────────────┐
                          │   Clients       │
                          │ (Web Browsers)  │
                          └────────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
            (Port 80)        (Port 443)    (Port 1812 UDP)
                    │              │              │
                    └──────────────┴──────────────┤
                                   ▼
                    ┌─────────────────────────────┐
                    │   Nginx Reverse Proxy       │
                    │ - SSL/TLS Termination       │
                    │ - Request Routing           │
                    │ - Compression               │
                    └─────────────────────────────┘
                             │       │       │
              ┌──────────────┼───────┼───────┬──────────────┐
              │              │       │       │              │
              ▼              ▼       ▼       ▼              ▼
        ┌─────────┐    ┌─────────┐  │   ┌─────────┐  ┌──────────┐
        │Frontend │    │Backend  │  │   │RADIUS   │  │pgAdmin   │
        │:3000    │    │:3001    │  │   │:1812    │  │:5050     │
        │(React)  │    │(Node)   │  │   │(UDP)    │  │(Debug)   │
        └─────────┘    └─────────┘  │   └─────────┘  └──────────┘
              │              │       │
              └──────────────┼───────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌──────────────┐  ┌──────────────┐
            │ PostgreSQL   │  │    Redis     │
            │ Port 5432    │  │  Port 6379   │
            │              │  │              │
            │ - Customers  │  │ - Sessions   │
            │ - Billing    │  │ - Cache      │
            │ - RADIUS     │  │ - Queues     │
            │ - Payments   │  │              │
            └──────────────┘  └──────────────┘
```

---

## 📋 Required Ports

| Port | Protocol | Service | Purpose |
|------|----------|---------|---------|
| 22 | TCP | SSH | Server access |
| 80 | TCP | HTTP | Web (redirects to 443) |
| 443 | TCP | HTTPS | Secure web traffic |
| 3001 | TCP | Backend API | Backend server |
| 5432 | TCP | PostgreSQL | Database |
| 6379 | TCP | Redis | Cache (internal) |
| 1812 | UDP | RADIUS | Authentication |
| 1813 | UDP | RADIUS | Accounting |
| 5050 | TCP | pgAdmin | Database admin (optional) |

**Firewall Configuration:**
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001
sudo ufw allow 1812/udp
sudo ufw allow 1813/udp
sudo ufw --force enable
```

---

## 🔑 Environment Variables Reference

### Database

```env
DB_HOST=postgres              # Docker service name or IP
DB_PORT=5432                  # PostgreSQL port
DB_NAME=ispmanager            # Database name
DB_USER=ispmanager            # Database user
DB_PASSWORD=change_me_secure  # Strong password (32+ chars)
```

### Security

```env
JWT_SECRET=base64_random_32_chars        # For JWT tokens
SESSION_SECRET=base64_random_32_chars    # For sessions
ENCRYPTION_KEY=base64_random_32_chars    # For data encryption
RADIUS_SECRET=base64_random_32_chars     # For RADIUS authentication
```

### RADIUS Server

```env
RADIUS_HOST=0.0.0.0           # Bind to all interfaces
RADIUS_PORT=1812              # Authentication port
RADIUS_SECRET=your_secret_key # Shared secret with clients
```

### Piprapay Payment Gateway

```env
PIPRAPAY_API_BASE_URL=https://sandbox.piprapay.com
PIPRAPAY_MERCHANT_ID=your_merchant_id
PIPRAPAY_API_KEY=your_api_key
PIPRAPAY_API_SECRET=your_api_secret
PIPRAPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Backend Server

```env
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
API_BASE_URL=https://api.yourdomain.com
```

### Redis Cache (Optional)

```env
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=leave_empty_if_no_password
REDIS_DB=0
```

---

## 🔄 Common Operations

### Start Services

```bash
cd /opt/ispmanager

# Start all services
docker-compose -f docker-compose-selfhosted.yml up -d --build

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend
```

### Database Operations

```bash
# Connect to database
psql -U ispmanager -d ispmanager -h localhost

# Create backup
pg_dump -U ispmanager ispmanager > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U ispmanager ispmanager < backup_20240421.sql

# Check database size
psql -U ispmanager -d ispmanager -c "SELECT pg_size_pretty(pg_database_size('ispmanager'));"
```

### RADIUS Operations

```bash
# Test RADIUS authentication
radtest username password 127.0.0.1:1812 0 your-radius-secret

# View RADIUS logs
sudo tail -f /var/log/freeradius/radius.log

# Restart RADIUS
sudo systemctl restart freeradius

# Check RADIUS status
sudo systemctl status freeradius
```

### Nginx Operations

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔍 Monitoring & Logs

### View Service Logs

```bash
# Docker logs
docker-compose logs -f                    # All services
docker-compose logs -f backend            # Backend only
docker-compose logs -f postgres           # Database only

# System logs
journalctl -u ispmanager-backend -f       # If running as service
tail -f /var/log/nginx/access.log         # Nginx access
tail -f /var/log/freeradius/radius.log    # RADIUS
```

### Health Checks

```bash
# API health
curl -s https://yourdomain.com/api/health | jq

# Database health
psql -U ispmanager -d ispmanager -c "SELECT now();"

# RADIUS health
radtest testuser testpass localhost:1812 0 your-secret

# Service status
docker-compose ps
```

---

## 🔐 Security Best Practices

### 1. Change Default Credentials

```sql
-- After installation, update admin password
UPDATE users SET password = crypt('new_strong_password', gen_salt('bf'))
WHERE username = 'admin';
```

### 2. Enable SSL/TLS

```bash
# Certificate auto-renewal
sudo systemctl enable certbot.timer
sudo certbot renew --dry-run
```

### 3. Configure Firewall

```bash
# Default deny, explicitly allow
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### 4. Database Hardening

```bash
# Edit /etc/postgresql/*/main/pg_hba.conf
# Restrict connections to trusted hosts only
# Use md5 or scram-sha-256 for authentication

# Test database access
psql -U ispmanager -d ispmanager -c "SELECT version();"
```

### 5. RADIUS Security

```bash
# Use strong RADIUS secrets (32+ characters)
# Restrict RADIUS access by IP in /etc/freeradius/3.0/clients.conf
# Monitor RADIUS logs for unauthorized access attempts
```

---

## 📦 Backup & Restore

### Automated Backup Script

```bash
#!/bin/bash
# Save as /usr/local/bin/backup-ispmanager.sh

BACKUP_DIR="/backups/ispmanager"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U ispmanager ispmanager | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Application backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/ispmanager

# Docker volumes backup
docker run --rm -v ispmanager_postgres_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/postgres_$DATE.tar.gz /data

# Keep only last 30 days
find $BACKUP_DIR -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Schedule Daily Backups

```bash
# Add to crontab (runs at 2 AM daily)
0 2 * * * /usr/local/bin/backup-ispmanager.sh
```

### Restore from Backup

```bash
# Restore database
gunzip -c /backups/ispmanager/db_20240421_020000.sql.gz | \
  psql -U ispmanager ispmanager

# Restore application
tar -xzf /backups/ispmanager/app_20240421_020000.tar.gz -C /
```

---

## 🚨 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs -f service_name

# Verify configuration
docker-compose config

# Rebuild images
docker-compose down
docker-compose up -d --build
```

### Database Connection Error

```bash
# Test connection
psql -U ispmanager -d ispmanager -h postgres

# Check PostgreSQL status
docker-compose logs -f postgres

# Verify environment variables
echo $DB_PASSWORD
echo $DB_HOST
```

### RADIUS Not Working

```bash
# Check if listening
netstat -unap | grep 1812

# Test authentication
radtest testuser testpass 127.0.0.1:1812 0 your-secret

# View logs
docker-compose logs -f backend | grep RADIUS

# Restart FreeRADIUS
docker-compose exec backend systemctl restart freeradius
```

### SSL Certificate Issues

```bash
# Test certificate
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout

# Verify renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

---

## 📚 Additional Resources

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **FreeRADIUS Documentation**: https://wiki.freeradius.org/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Docker Documentation**: https://docs.docker.com/
- **Let's Encrypt**: https://letsencrypt.org/

---

## ✅ Deployment Checklist

- [ ] Server provisioned (Ubuntu 24.04)
- [ ] Domain DNS configured
- [ ] SSL certificate issued
- [ ] Environment variables configured
- [ ] PostgreSQL database created
- [ ] RADIUS server configured
- [ ] Docker services running
- [ ] Frontend accessible
- [ ] API responding
- [ ] RADIUS authenticating
- [ ] Payment gateway configured
- [ ] Backups scheduled
- [ ] Monitoring active
- [ ] Admin login verified

---

**For detailed instructions, follow [SELF_HOSTED_UBUNTU.md](SELF_HOSTED_UBUNTU.md)**
