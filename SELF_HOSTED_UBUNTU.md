# Self-Hosted ISP Manager on Ubuntu 24.04 LTS

Complete guide for deploying all services (frontend, backend, database, RADIUS, Piprapay) on a single Ubuntu 24.04 server.

## 📋 Prerequisites

- Ubuntu 24.04 LTS server (2GB RAM minimum, 4GB+ recommended)
- Domain name (optional but recommended)
- Static IP address
- Root or sudo access

## 🛠️ Step 1: System Setup

### 1.1 Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common ufw htop net-tools
```

### 1.2 Configure Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001  # Backend API
sudo ufw allow 1812/udp  # RADIUS
sudo ufw allow 1813/udp  # RADIUS
sudo ufw --force enable
```

### 1.3 Install Node.js 20.x LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### 1.4 Install Docker & Docker Compose

```bash
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

## 📦 Step 2: Install PostgreSQL Database

### 2.1 Install PostgreSQL 15

```bash
sudo apt install -y postgresql postgresql-contrib postgresql-15-pgvector

# Start PostgreSQL
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 2.2 Create Database & User

```bash
sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE ispmanager;

-- Create user
CREATE USER ispmanager WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ispmanager TO ispmanager;

-- Connect to database and set schema privileges
\c ispmanager
GRANT ALL PRIVILEGES ON SCHEMA public TO ispmanager;

-- Create pgvector extension for AI features
CREATE EXTENSION IF NOT EXISTS pgvector;

\q
EOF
```

### 2.3 Run Database Migrations

```bash
# Clone or navigate to your project
cd /home/ubuntu/ispmanager

# Run migrations
psql -U ispmanager -d ispmanager -h localhost < supabase/setup_all.sql
```

Verify connection:
```bash
psql -U ispmanager -d ispmanager -h localhost -c "SELECT version();"
```

## 🔐 Step 3: RADIUS Server Setup

### 3.1 Install FreeRADIUS

```bash
sudo apt install -y freeradius freeradius-postgresql freeradius-utils

# Start service
sudo systemctl enable freeradius
sudo systemctl start freeradius
```

### 3.2 Configure PostgreSQL Database Module

Edit `/etc/freeradius/3.0/mods-enabled/sql`:

```bash
sudo nano /etc/freeradius/3.0/mods-enabled/sql
```

Update the database section:
```
database {
    driver = "rlm_sql_postgresql"
    dialect = "postgresql"
    connection_info = "server=localhost user=ispmanager password=your_secure_password_here dbname=ispmanager"
    radius_db = "ispmanager"
}
```

### 3.3 Create RADIUS Tables

```bash
# Connect to ispmanager database
psql -U ispmanager -d ispmanager << EOF
-- RADIUS Users Table
CREATE TABLE IF NOT EXISTS raduser (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    attribute VARCHAR(64),
    op VARCHAR(2),
    value VARCHAR(253),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RADIUS Checks Table
CREATE TABLE IF NOT EXISTS radcheck (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL,
    attribute VARCHAR(64) NOT NULL,
    op VARCHAR(2) NOT NULL,
    value VARCHAR(253) NOT NULL,
    FOREIGN KEY (username) REFERENCES raduser(username) ON DELETE CASCADE
);

-- RADIUS Replies Table
CREATE TABLE IF NOT EXISTS radreply (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL,
    attribute VARCHAR(64) NOT NULL,
    op VARCHAR(2) NOT NULL,
    value VARCHAR(253) NOT NULL,
    FOREIGN KEY (username) REFERENCES raduser(username) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_raduser_username ON raduser(username);
CREATE INDEX idx_radcheck_username ON radcheck(username);
CREATE INDEX idx_radreply_username ON radreply(username);
EOF
```

### 3.4 Configure RADIUS Clients

Edit `/etc/freeradius/3.0/clients.conf`:

```bash
sudo nano /etc/freeradius/3.0/clients.conf
```

Add your MikroTik servers:
```
client mikrotik-1 {
    ipaddr = 192.168.1.100
    secret = "your-radius-secret-key"
    proto = udp
}

client localhost {
    ipaddr = 127.0.0.1
    secret = "local-radius-secret"
    proto = udp
}
```

### 3.5 Test RADIUS

```bash
# Test authentication
radtest username_test password_test 127.0.0.1:1812 0 local-radius-secret

# View RADIUS logs
sudo tail -f /var/log/freeradius/radius.log
```

## 💳 Step 4: Piprapay Payment Gateway Setup

### 4.1 Create Piprapay Configuration File

```bash
mkdir -p /home/ubuntu/ispmanager/config
nano /home/ubuntu/ispmanager/config/piprapay.env
```

Add configuration:
```
PIPRAPAY_API_BASE_URL=https://sandbox.piprapay.com
PIPRAPAY_MERCHANT_ID=your_merchant_id
PIPRAPAY_API_KEY=your_api_key
PIPRAPAY_API_SECRET=your_api_secret
PIPRAPAY_WEBHOOK_SECRET=your_webhook_secret
PIPRAPAY_CURRENCY=BDT
```

### 4.2 Create Piprapay Integration Module

```bash
cat > /home/ubuntu/ispmanager/proxy/piprapay.js << 'EOF'
const axios = require('axios');
const crypto = require('crypto');

class PiprapayGateway {
    constructor() {
        this.baseURL = process.env.PIPRAPAY_API_BASE_URL;
        this.merchantId = process.env.PIPRAPAY_MERCHANT_ID;
        this.apiKey = process.env.PIPRAPAY_API_KEY;
        this.apiSecret = process.env.PIPRAPAY_API_SECRET;
    }

    // Create payment request
    async createPayment(amount, orderId, description, customerEmail) {
        try {
            const payload = {
                merchant_id: this.merchantId,
                amount: amount,
                order_id: orderId,
                description: description,
                customer_email: customerEmail,
                currency: process.env.PIPRAPAY_CURRENCY || 'BDT',
                return_url: `${process.env.VITE_BACKEND_API_URL}/api/payments/piprapay/callback`
            };

            const signature = this.generateSignature(payload);
            payload.signature = signature;

            const response = await axios.post(
                `${this.baseURL}/api/v1/payments/create`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Piprapay payment creation error:', error);
            throw error;
        }
    }

    // Verify payment
    async verifyPayment(transactionId) {
        try {
            const response = await axios.get(
                `${this.baseURL}/api/v1/payments/${transactionId}/verify`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Piprapay verification error:', error);
            throw error;
        }
    }

    // Generate signature
    generateSignature(payload) {
        const sortedKeys = Object.keys(payload).sort();
        const signatureData = sortedKeys
            .map(key => `${key}=${payload[key]}`)
            .join('&');
        
        return crypto
            .createHmac('sha256', this.apiSecret)
            .update(signatureData)
            .digest('hex');
    }

    // Verify webhook signature
    verifyWebhookSignature(payload, signature) {
        const expectedSignature = this.generateSignature(payload);
        return expectedSignature === signature;
    }
}

module.exports = PiprapayGateway;
EOF
```

## 🌐 Step 5: Nginx Reverse Proxy Setup

### 5.1 Install Nginx

```bash
sudo apt install -y nginx
```

### 5.2 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/ispmanager
```

Add complete configuration:

```nginx
# Upstream backend
upstream ispmanager_backend {
    server 127.0.0.1:3001;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    return 301 https://$server_name$request_uri;
}

# HTTPS - Frontend
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    # Frontend root directory
    root /home/ubuntu/ispmanager/dist;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        expires -1;
    }

    # API proxy
    location /api/ {
        proxy_pass http://ispmanager_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker
    location = /sw.js {
        add_header Cache-Control "max-age=0, no-cache, no-store, must-revalidate";
    }

    # Manifest
    location = /manifest.webmanifest {
        add_header Cache-Control "max-age=3600, public";
        add_header Content-Type "application/manifest+json";
    }
}

# API subdomain (optional)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://ispmanager_backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5.3 Enable Nginx Site

```bash
sudo ln -s /etc/nginx/sites-available/ispmanager /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 Step 6: SSL Certificate (Let's Encrypt)

### 6.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo certbot renew --dry-run
```

## 🐳 Step 7: Docker Compose Setup

### 7.1 Create docker-compose.yml

```bash
nano /home/ubuntu/ispmanager/docker-compose.yml
```

Replace content with self-hosted configuration (see docker-compose-selfhosted.yml file).

### 7.2 Create Environment File

```bash
nano /home/ubuntu/ispmanager/.env.production
```

```
# Frontend
VITE_SUPABASE_URL=http://localhost
VITE_BACKEND_API_URL=https://api.yourdomain.com
VITE_ENVIRONMENT=production

# PostgreSQL Database
DB_HOST=db
DB_PORT=5432
DB_NAME=ispmanager
DB_USER=ispmanager
DB_PASSWORD=your_secure_password_here

# Node Backend
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# RADIUS
RADIUS_SECRET=your-radius-secret-key
RADIUS_PORT=1812

# Piprapay
PIPRAPAY_API_BASE_URL=https://sandbox.piprapay.com
PIPRAPAY_MERCHANT_ID=your_merchant_id
PIPRAPAY_API_KEY=your_api_key
PIPRAPAY_API_SECRET=your_api_secret

# Security
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_key_here
ENCRYPTION_KEY=your_encryption_key_here
```

### 7.3 Build and Start Services

```bash
cd /home/ubuntu/ispmanager

# Build frontend
npm install
npm run build

# Start Docker services
docker-compose up -d --build

# View logs
docker-compose logs -f
```

## ⚙️ Step 8: Backend Server Setup

### 8.1 Install Backend Dependencies

```bash
cd /home/ubuntu/ispmanager/proxy
npm install --production

# Verify installation
npm list
```

### 8.2 Create Backend Service File

```bash
sudo nano /etc/systemd/system/ispmanager-backend.service
```

```ini
[Unit]
Description=ISP Manager Backend API
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/ispmanager/proxy
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment="NODE_ENV=production"
Environment="DB_HOST=localhost"
Environment="DB_PORT=5432"
Environment="DB_NAME=ispmanager"
Environment="DB_USER=ispmanager"
EnvironmentFile=/home/ubuntu/ispmanager/.env.production

StandardOutput=append:/var/log/ispmanager/backend.log
StandardError=append:/var/log/ispmanager/backend.error.log

[Install]
WantedBy=multi-user.target
```

### 8.3 Setup Logging

```bash
sudo mkdir -p /var/log/ispmanager
sudo chown ubuntu:ubuntu /var/log/ispmanager

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable ispmanager-backend
sudo systemctl start ispmanager-backend

# Check status
sudo systemctl status ispmanager-backend
```

## 📊 Step 9: Monitoring & Maintenance

### 9.1 System Monitoring

```bash
# View service status
sudo systemctl status ispmanager-backend
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status freeradius

# View logs
sudo journalctl -u ispmanager-backend -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/freeradius/radius.log
```

### 9.2 Database Backups

Create backup script `/home/ubuntu/backup-db.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ispmanager_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U ispmanager ispmanager | gzip > $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "ispmanager_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

Setup cron job:
```bash
chmod +x /home/ubuntu/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup-db.sh
```

## 🔍 Step 10: Verification & Testing

### 10.1 Test Frontend

```bash
# Build frontend
cd /home/ubuntu/ispmanager
npm run build

# Verify dist folder
ls -la dist/

# Test locally
npm run preview
```

### 10.2 Test Backend API

```bash
# Health check
curl https://api.yourdomain.com/api/health

# Database connection
curl https://api.yourdomain.com/api/database/status
```

### 10.3 Test RADIUS

```bash
# Test authentication
radtest testuser testpassword 127.0.0.1:1812 0 local-radius-secret

# Check RADIUS status
sudo systemctl status freeradius
```

### 10.4 Test Piprapay Integration

```bash
# Test payment gateway connection
curl -X POST https://api.yourdomain.com/api/payments/test \
  -H "Content-Type: application/json" \
  -d '{"amount":100, "orderId":"test-001"}'
```

## 🚨 Troubleshooting

### Frontend not loading
```bash
# Check Nginx
sudo nginx -t
sudo systemctl restart nginx

# Check frontend build
ls -la /home/ubuntu/ispmanager/dist/
```

### Backend API not responding
```bash
# Check backend service
sudo systemctl status ispmanager-backend

# Check logs
sudo journalctl -u ispmanager-backend -n 50

# Check port
sudo lsof -i :3001
```

### Database connection issues
```bash
# Test PostgreSQL
psql -U ispmanager -d ispmanager -h localhost -c "SELECT version();"

# Check PostgreSQL status
sudo systemctl status postgresql
```

### RADIUS not working
```bash
# Check FreeRADIUS
sudo systemctl status freeradius

# Test RADIUS client
radtest username password 127.0.0.1:1812 0 local-radius-secret

# Check logs
sudo tail -f /var/log/freeradius/radius.log
```

## 📈 Performance Optimization

### Enable Database Indexing

```bash
psql -U ispmanager -d ispmanager << EOF
-- Customer indexes
CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customers_status ON customers(connection_status);

-- Billing indexes
CREATE INDEX idx_bills_customer ON bills(customer_id);
CREATE INDEX idx_bills_status ON bills(payment_status);

-- Payment indexes
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_gateway ON payments(payment_gateway);

-- Network indexes
CREATE INDEX idx_network_integrations_tenant ON network_integrations(tenant_id);
EOF
```

### Monitor Resources

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor resources
htop
iotop
nethogs
```

## 📝 Summary

Your ISP Manager is now fully self-hosted with:
- ✅ Frontend served via Nginx with SSL
- ✅ Backend API running on Node.js
- ✅ PostgreSQL database for data persistence
- ✅ RADIUS server for network authentication
- ✅ Piprapay payment gateway integration
- ✅ SSL/HTTPS encryption
- ✅ Automatic backups
- ✅ System monitoring

Access your application at: **https://yourdomain.com**
