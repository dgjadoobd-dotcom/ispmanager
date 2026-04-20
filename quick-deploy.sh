#!/bin/bash

# ISP Manager Self-Hosted Quick Start
# Deploy everything on Ubuntu 24.04 in a few commands

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Colors
print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

print_header "ISP Manager Self-Hosted Deployment"

# Step 1: System Update
print_header "Step 1: System Preparation"
apt update && apt upgrade -y
print_success "System updated"

# Step 2: Install Dependencies
print_header "Step 2: Installing Dependencies"
apt install -y curl wget git unzip software-properties-common ufw htop net-tools nginx

# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
print_success "Node.js $(node --version) installed"

# Docker
apt install -y docker.io docker-compose-v2
systemctl enable docker
systemctl start docker
print_success "Docker installed"

# PostgreSQL
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
print_success "PostgreSQL installed"

# FreeRADIUS
apt install -y freeradius freeradius-postgresql
systemctl enable freeradius
systemctl start freeradius
print_success "FreeRADIUS installed"

# Step 3: Firewall Configuration
print_header "Step 3: Firewall Configuration"
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3001
ufw allow 1812/udp
ufw allow 1813/udp
ufw --force enable
print_success "Firewall configured"

# Step 4: Database Setup
print_header "Step 4: Database Setup"

# Read database password
read -sp "Enter PostgreSQL password for 'ispmanager' user: " DB_PASSWORD
echo

sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE IF NOT EXISTS ispmanager;

-- Create user
CREATE USER ispmanager WITH ENCRYPTED PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ispmanager TO ispmanager;

-- Connect and set schema privileges
\c ispmanager
GRANT ALL PRIVILEGES ON SCHEMA public TO ispmanager;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS pgvector;
EOF

print_success "Database created"

# Step 5: SSL Certificate
print_header "Step 5: SSL Certificate (Let's Encrypt)"

# Read domain
read -p "Enter your domain name: " DOMAIN

apt install -y certbot python3-certbot-nginx
certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN
print_success "SSL certificate obtained for $DOMAIN"

# Step 6: Environment Configuration
print_header "Step 6: Environment Configuration"

# Create environment file
cat > /etc/ispmanager/.env.production << EOF
DOMAIN=$DOMAIN
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
RADIUS_SECRET=$(openssl rand -base64 32)
PIPRAPAY_API_BASE_URL=https://sandbox.piprapay.com
PIPRAPAY_MERCHANT_ID=CHANGE_ME
PIPRAPAY_API_KEY=CHANGE_ME
PIPRAPAY_API_SECRET=CHANGE_ME
EOF

print_success "Environment file created at /etc/ispmanager/.env.production"

# Step 7: Clone/Deploy Application
print_header "Step 7: Application Deployment"

DEPLOY_PATH="/opt/ispmanager"
mkdir -p $DEPLOY_PATH

# Copy application files
cp -r ./* $DEPLOY_PATH/

cd $DEPLOY_PATH

# Install dependencies
print_warning "Installing dependencies..."
npm install --production

# Build frontend
print_warning "Building frontend..."
npm run build

print_success "Application deployed"

# Step 8: Docker Compose Setup
print_header "Step 8: Docker Services"

cp docker-compose-selfhosted.yml docker-compose.yml
cp .env.selfhosted .env.production

# Start services
docker-compose up -d --build

print_success "Docker services started"

# Step 9: Nginx Configuration
print_header "Step 9: Nginx Configuration"

cp nginx-selfhosted.conf /etc/nginx/nginx.conf
sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/nginx.conf

nginx -t && systemctl reload nginx
print_success "Nginx configured"

# Step 10: Verification
print_header "Step 10: Verification"

sleep 5

# Test health endpoints
print_warning "Testing API health..."
curl -s https://api.$DOMAIN/api/health | jq . && print_success "API is running" || print_error "API health check failed"

print_warning "Testing RADIUS..."
radtest testuser testpass 127.0.0.1:1812 0 test || print_error "RADIUS test failed (expected)"

# Summary
print_header "Deployment Complete!"

echo -e "${GREEN}Application is ready at:${NC}"
echo -e "  Frontend: ${BLUE}https://$DOMAIN${NC}"
echo -e "  API: ${BLUE}https://api.$DOMAIN${NC}"
echo -e "  Database: PostgreSQL on localhost:5432"
echo -e "  RADIUS: On 0.0.0.0:1812"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Configure Piprapay credentials in /etc/ispmanager/.env.production"
echo "2. Setup MikroTik connection in the admin panel"
echo "3. Configure RADIUS users and settings"
echo "4. Setup automatic backups"
echo "5. Monitor services with: docker-compose logs -f"

echo -e "\n${YELLOW}Important URLs:${NC}"
echo "  Admin Login: https://$DOMAIN (admin/admin123)"
echo "  Database Backups: /home/ubuntu/backups/"
echo "  Logs: docker-compose logs -f"

echo -e "\n${GREEN}Setup completed successfully!${NC}\n"
