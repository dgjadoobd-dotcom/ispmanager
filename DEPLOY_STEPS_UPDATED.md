# ISP Manager - Deployment Guide

Choose your deployment method:

## 🏠 Self-Hosted on Ubuntu 24.04 (Recommended)

Deploy everything on your own server with complete control over infrastructure, database, and services.

### Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/ispmanager.git
cd ispmanager

# 2. Make deploy script executable
chmod +x quick-deploy.sh

# 3. Run deployment (requires sudo)
sudo ./quick-deploy.sh

# Follow the interactive prompts:
# - Enter PostgreSQL password
# - Enter your domain name
# - Wait for installation to complete
```

### Manual Self-Hosted Setup

See [SELF_HOSTED_UBUNTU.md](SELF_HOSTED_UBUNTU.md) for detailed step-by-step instructions.

### Self-Hosted Components

- **PostgreSQL**: Database with RADIUS user tables
- **RADIUS Server**: FreeRADIUS for network authentication
- **Node.js Backend**: Express API with MikroTik integration
- **Frontend**: React SPA served via Nginx
- **Nginx**: Reverse proxy with SSL/TLS
- **Piprapay**: Payment gateway integration
- **Redis**: Optional caching layer

### System Requirements

- Ubuntu 24.04 LTS
- Minimum: 2GB RAM, 20GB disk
- Recommended: 4GB RAM, 50GB disk
- Static IP address
- Ports 80/443 open

### What's Included

✅ PostgreSQL with pgvector support
✅ FreeRADIUS authentication server
✅ Node.js backend with REST API
✅ React frontend with PWA support
✅ Nginx reverse proxy with SSL
✅ Piprapay payment gateway integration
✅ MikroTik API integration
✅ OLT device management
✅ Docker containerization
✅ Automated backups
✅ Monitoring and logging

---

## ☁️ Cloud Deployment (Cloudflare + Railway)

For cloud-only hosting without self-hosting, see [DEPLOY_CLOUDFLARE.md](DEPLOY_CLOUDFLARE.md)

### Cloud Architecture

```
┌──────────────────────────────────────────┐
│      Cloudflare Pages (Frontend)        │
│      - CDN Distribution                  │
│      - Automatic SSL                     │
│      - DDoS Protection                   │
└──────────────────────────────────────────┘
           ↓ HTTPS API Calls ↓
┌──────────────────────────────────────────┐
│         Railway (Backend API)            │
│      - Node.js Express Server            │
│      - Auto Scaling                      │
│      - PostgreSQL Database               │
└──────────────────────────────────────────┘
```

### Requirements

- Cloudflare account (free tier available)
- Railway account ($5/month minimum)
- Supabase account (free tier available)
- GitHub repository

### Advantages

- Low maintenance
- Auto-scaling
- Global CDN
- Pay-as-you-go pricing

### Disadvantages

- Dependency on third-party services
- Limited control
- Data hosted externally
- Monthly cloud costs

---

## 🐳 Docker Deployment

### Using Docker Compose for Self-Hosted

```bash
# 1. Clone repository
git clone https://github.com/yourusername/ispmanager.git
cd ispmanager

# 2. Copy and edit environment
cp .env.selfhosted .env
nano .env

# 3. Start all services
docker-compose -f docker-compose-selfhosted.yml up -d --build

# 4. View logs
docker-compose logs -f

# 5. Access services
# - Frontend: http://localhost
# - API: http://localhost:3001
# - Database: localhost:5432
# - pgAdmin: http://localhost:5050
```

### Docker Services

| Service | Port | Purpose |
|---------|------|---------|
| postgres | 5432 | PostgreSQL Database |
| redis | 6379 | Cache & Sessions |
| backend | 3001 | Node.js API Server |
| frontend | 3000 | React Application |
| nginx | 80/443 | Reverse Proxy |
| pgadmin | 5050 | Database Admin Panel |

### Docker Compose Files

- `docker-compose-selfhosted.yml` - Full self-hosted with all services
- `docker-compose.yml` - Simple setup for development

---

## 📊 Deployment Comparison

| Feature | Self-Hosted | Cloud |
|---------|------------|-------|
| Cost | Low (VPS only) | $100+/month |
| Control | Full | Limited |
| Maintenance | Required | Managed |
| Setup Time | 30-60 min | 5-10 min |
| Scalability | Manual | Automatic |
| Data Privacy | Full | Third-party |
| SSL Certs | Auto renewal | Automatic |
| Database Backup | Manual setup | Automatic |
| Performance | Depends on VPS | Excellent |
| Uptime SLA | None | 99.9% |

---

## 🔒 Security Configuration

### Self-Hosted Security

```bash
# 1. Change default credentials
# Edit /etc/ispmanager/.env.production

# 2. Generate strong keys
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # SESSION_SECRET
openssl rand -base64 32  # ENCRYPTION_KEY
openssl rand -base64 32  # RADIUS_SECRET

# 3. Configure firewall
sudo ufw default deny incoming
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 1812/udp  # RADIUS
sudo ufw allow 1813/udp  # RADIUS accounting

# 4. Enable SSL auto-renewal
sudo systemctl enable certbot.timer

# 5. Configure PostgreSQL
# Edit /etc/postgresql/*/main/pg_hba.conf
# Restrict access to trusted hosts only

# 6. Setup monitoring
docker-compose logs -f ispmanager-backend
```

### Cloud Security (Cloudflare + Railway)

- Enable Cloudflare WAF (Web Application Firewall)
- Setup Railway environment variable encryption
- Use strong API keys
- Enable 2FA on both platforms
- Monitor logs regularly

---

## 📈 Performance Optimization

### Database Optimization

```bash
# Create indexes for faster queries
psql -U ispmanager -d ispmanager << EOF
CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_bills_customer_id ON bills(customer_id);
CREATE INDEX idx_bills_status ON bills(payment_status);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_raduser_username ON raduser(username);
EOF
```

### Nginx Optimization

- Enable gzip compression
- Configure caching headers
- Use HTTP/2
- Enable OCSP stapling

### Backend Optimization

- Use connection pooling
- Implement caching
- Optimize queries
- Monitor resource usage

---

## 🔄 Backup & Recovery

### Self-Hosted Backups

```bash
# Create backup script
cat > /home/ubuntu/backup-ispmanager.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump -U ispmanager ispmanager | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Application files backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/ispmanager

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /home/ubuntu/backup-ispmanager.sh

# Schedule daily backups at 2 AM
echo "0 2 * * * /home/ubuntu/backup-ispmanager.sh" | crontab -
```

### Cloud Backups

- Cloudflare Pages: Automatic (stored in Git)
- Railway: Configure automatic backups
- Supabase: Enable point-in-time recovery

---

## 🚀 Scaling for Large Deployments

### 100-1000 Customers

- Single server sufficient
- 2GB RAM, 2 CPU cores
- PostgreSQL standard
- No caching needed

### 1000-10,000 Customers

- 4GB RAM, 4 CPU cores
- Redis caching layer
- Database optimization
- Consider load balancing

### 10,000+ Customers

- Multi-server setup
- Database replication
- Kubernetes orchestration
- CDN for static assets
- Dedicated payment gateway server

---

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
sudo lsof -i :3001
kill -9 <PID>
```

**Database connection failed:**
```bash
psql -U ispmanager -d ispmanager -h localhost
```

**RADIUS server not responding:**
```bash
sudo systemctl restart freeradius
sudo tail -f /var/log/freeradius/radius.log
```

**Nginx not starting:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

**Docker services won't start:**
```bash
docker-compose logs -f
docker-compose restart
```

### Debug Mode

```bash
# Enable detailed logging
LOG_LEVEL=debug docker-compose up

# Test API endpoint
curl -v http://localhost:3001/api/health

# Test database
docker-compose exec postgres psql -U ispmanager -d ispmanager -c "SELECT 1"

# Test RADIUS
radtest testuser testpass 127.0.0.1:1812 0 test-secret
```

---

## 📞 Support & Resources

- **Documentation**: [README.md](README.md)
- **Self-Hosted Guide**: [SELF_HOSTED_UBUNTU.md](SELF_HOSTED_UBUNTU.md)
- **Cloud Deployment**: [DEPLOY_CLOUDFLARE.md](DEPLOY_CLOUDFLARE.md)
- **GitHub Issues**: https://github.com/yourusername/ispmanager/issues
- **Community**: https://github.com/yourusername/ispmanager/discussions

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Domain name registered
- [ ] Server provisioned
- [ ] Firewall rules configured
- [ ] SSL certificates ready
- [ ] Backups planned
- [ ] Monitoring set up

### Deployment
- [ ] Repository cloned
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Services started
- [ ] SSL enabled
- [ ] Health checks passing

### Post-Deployment
- [ ] Admin login verified
- [ ] Database connection working
- [ ] RADIUS server running
- [ ] Payment gateway configured
- [ ] MikroTik integration tested
- [ ] Backups verified
- [ ] Monitoring active
- [ ] Documentation updated

---

**Choose your deployment method above and follow the corresponding guide for complete instructions.**
