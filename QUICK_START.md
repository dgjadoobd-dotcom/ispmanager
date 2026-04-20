# 🎯 Self-Hosted ISP Manager - Quick Start Guide

## ✅ Everything Ready for Ubuntu 24.04 Deployment

Your ISP Manager is now fully configured for self-hosted deployment with all services ready!

---

## 📦 What You Have

### Core Deployment Files Created

```
✅ SELF_HOSTED_UBUNTU.md           - Complete 10-step setup guide
✅ SELF_HOSTED_COMPLETE_SETUP.md   - Summary of all features
✅ DEPLOYMENT_FILES_GUIDE.md       - Configuration reference
✅ DEPLOY_STEPS_UPDATED.md         - Method comparison
✅ docker-compose-selfhosted.yml   - All services configured
✅ nginx-selfhosted.conf           - Production reverse proxy
✅ quick-deploy.sh                 - One-command installer
✅ .env.selfhosted                 - Environment template
✅ proxy/server-selfhosted.js      - Backend API with RADIUS
✅ proxy/radius.js                 - RADIUS server
✅ proxy/piprapay.js              - Payment gateway
```

### All Services Included

| Service | Status | Port | Purpose |
|---------|--------|------|---------|
| PostgreSQL Database | ✅ Ready | 5432 | Customer & billing data |
| RADIUS Server | ✅ Ready | 1812 UDP | Network authentication |
| Node.js Backend | ✅ Ready | 3001 | REST API server |
| React Frontend | ✅ Ready | 3000 | Web UI application |
| Nginx Proxy | ✅ Ready | 80/443 | SSL/TLS + routing |
| Redis Cache | ✅ Ready | 6379 | Optional performance |
| Piprapay Gateway | ✅ Ready | External | Payment processing |
| MikroTik API | ✅ Ready | External | Network devices |

---

## 🚀 Deploy in 3 Steps

### Option 1: Fully Automated (Recommended - 5 min)

```bash
# On your Ubuntu 24.04 server:

# 1. Clone repository
git clone https://github.com/yourusername/ispmanager.git
cd ispmanager

# 2. Run automated deployment
sudo chmod +x quick-deploy.sh
sudo ./quick-deploy.sh

# 3. Follow prompts:
#    - Enter PostgreSQL password
#    - Enter your domain name
#    - Wait for completion
```

**That's it! Everything will be running.**

### Option 2: Docker Compose (5 min)

```bash
# Copy environment template
cp .env.selfhosted .env

# Edit environment (replace yourdomain.com)
nano .env

# Start all services
docker-compose -f docker-compose-selfhosted.yml up -d --build

# Access:
# - Frontend: http://localhost
# - API: http://localhost:3001
# - Database: localhost:5432
```

### Option 3: Manual Setup (30-60 min)

Follow detailed guide: **[SELF_HOSTED_UBUNTU.md](SELF_HOSTED_UBUNTU.md)**

---

## 🎨 What's Deployed

### Frontend Features Ready
- ✅ Admin dashboard with analytics
- ✅ Customer management system
- ✅ Billing & invoice generation
- ✅ Payment processing (Piprapay)
- ✅ Network device management
- ✅ RADIUS user management
- ✅ Reports & analytics
- ✅ Mobile-responsive design

### Backend Features Ready
- ✅ PostgreSQL database (with RADIUS tables)
- ✅ RADIUS server (port 1812/UDP)
- ✅ REST API with JWT auth
- ✅ Payment gateway integration
- ✅ MikroTik API integration
- ✅ Connection pooling
- ✅ Rate limiting
- ✅ Comprehensive logging

### Infrastructure Ready
- ✅ Docker containerization
- ✅ Nginx reverse proxy
- ✅ SSL/TLS with auto-renewal
- ✅ Security headers
- ✅ Gzip compression
- ✅ Static asset caching
- ✅ API request routing
- ✅ Health monitoring

---

## 🔑 Quick Reference

### System Requirements
```
✅ Ubuntu 24.04 LTS
✅ Minimum: 2GB RAM, 20GB disk
✅ Recommended: 4GB RAM, 50GB disk
✅ Static IP address
✅ Ports: 80, 443, 3001, 1812 open
```

### Required Credentials
```
💡 PostgreSQL password (create your own)
💡 Domain name (example: ispmanager.com)
💡 Piprapay credentials (get from Piprapay)
💡 MikroTik router credentials (for testing)
```

### Generated Automatically
```
🔐 JWT_SECRET (32-byte key)
🔐 SESSION_SECRET (32-byte key)
🔐 ENCRYPTION_KEY (32-byte key)
🔐 RADIUS_SECRET (32-byte key)
🔐 SSL certificates (Let's Encrypt)
```

---

## 📊 Default Credentials

After deployment, access the admin panel:

| Role | Username | Password |
|------|----------|----------|
| Super Admin | `admin` | `admin123` |
| Staff | `staff` | `staff123` |

⚠️ **Change these immediately in production!**

---

## 🔍 Verify Deployment

After deployment, run these tests:

```bash
# 1. Frontend is running
curl -s https://yourdomain.com | grep "ISP Manager"

# 2. API is responding
curl -s https://api.yourdomain.com/api/health | jq

# 3. Database connected
psql -U ispmanager -d ispmanager -c "SELECT 1"

# 4. RADIUS listening
netstat -unap | grep 1812

# 5. All services running
docker-compose ps
```

---

## 📁 File Structure

```
ispmanager/
├── 📄 SELF_HOSTED_UBUNTU.md          ← Main guide (start here!)
├── 📄 DEPLOYMENT_FILES_GUIDE.md      ← Config reference
├── 📄 quick-deploy.sh                ← One-click installer
├── 📄 .env.selfhosted                ← Environment template
├── 📄 docker-compose-selfhosted.yml  ← All services
├── 📄 nginx-selfhosted.conf          ← Reverse proxy config
│
├── 📂 proxy/
│   ├── server-selfhosted.js         ← Main API server
│   ├── radius.js                    ← RADIUS implementation
│   ├── piprapay.js                  ← Payment gateway
│   └── package.json                 ← Dependencies
│
├── 📂 supabase/
│   └── setup_all.sql                ← Database schema
│
└── 📂 dist/                          ← Built frontend
```

---

## 🛠️ Common Commands

### Docker Management
```bash
# View all services
docker-compose ps

# View logs
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Start services
docker-compose up -d
```

### Database Management
```bash
# Connect to database
psql -U ispmanager -d ispmanager

# Create backup
pg_dump -U ispmanager ispmanager > backup.sql

# Restore backup
psql -U ispmanager ispmanager < backup.sql
```

### RADIUS Testing
```bash
# Test authentication
radtest username password localhost:1812 0 your-radius-secret

# View RADIUS logs
docker-compose logs -f backend | grep RADIUS
```

### SSL Certificate
```bash
# Check certificate
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text

# Renew certificate
sudo certbot renew
```

---

## 🔐 Security Checklist

Before going live:

- [ ] Change admin password
- [ ] Configure strong database password
- [ ] Generate secure JWT/SESSION/ENCRYPTION keys
- [ ] Update Piprapay credentials with production keys
- [ ] Enable firewall and restrict access
- [ ] Configure SSL certificate auto-renewal
- [ ] Setup database backups
- [ ] Enable monitoring and logging
- [ ] Review Nginx security headers
- [ ] Test RADIUS with real MikroTik

---

## 📈 After Deployment

### Day 1
1. Access admin panel at `https://yourdomain.com`
2. Login with `admin/admin123`
3. Change admin password immediately
4. Configure basic settings

### Day 2-3
1. Setup MikroTik integration
2. Create RADIUS users
3. Configure Piprapay payment gateway
4. Add test customers
5. Generate test invoice

### Week 1
1. Add real customers
2. Test payment processing
3. Monitor system logs
4. Train staff users
5. Setup automated backups

### Ongoing
1. Monitor disk usage
2. Review access logs
3. Update SSL certificates
4. Backup database regularly
5. Monitor performance metrics

---

## 🔗 Documentation Map

| Document | Purpose | Best For |
|----------|---------|----------|
| [SELF_HOSTED_UBUNTU.md](SELF_HOSTED_UBUNTU.md) | Detailed step-by-step guide | Learning & troubleshooting |
| [DEPLOYMENT_FILES_GUIDE.md](DEPLOYMENT_FILES_GUIDE.md) | Configuration reference | Understanding config |
| [DEPLOY_STEPS_UPDATED.md](DEPLOY_STEPS_UPDATED.md) | Method comparison | Choosing deployment method |
| [README.md](README.md) | Project overview | Understanding features |
| [DEPLOY_CLOUDFLARE.md](DEPLOY_CLOUDFLARE.md) | Cloud deployment option | Cloud-only hosting |

---

## 🚨 Common Issues & Solutions

### Services Won't Start
```bash
# Check logs
docker-compose logs -f

# Rebuild images
docker-compose down
docker-compose up -d --build
```

### Database Connection Failed
```bash
# Test PostgreSQL
psql -U ispmanager -d ispmanager -h localhost

# Check password in .env
cat .env | grep DB_PASSWORD
```

### RADIUS Not Working
```bash
# Check if listening on port 1812
netstat -unap | grep 1812

# Test with radtest
radtest testuser testpass 127.0.0.1:1812 0 your-secret
```

### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew --force-renewal

# Test renewal dry-run
sudo certbot renew --dry-run
```

**For more help:** See [SELF_HOSTED_UBUNTU.md - Troubleshooting](SELF_HOSTED_UBUNTU.md#troubleshooting)

---

## 💡 Pro Tips

1. **Start with Docker Compose** - Simplest way to get started
2. **Use strong passwords** - Generate with `openssl rand -base64 32`
3. **Backup early, backup often** - Never lose data
4. **Monitor logs daily** - `docker-compose logs -f`
5. **Test RADIUS before production** - Use `radtest` command
6. **Document your setup** - Keep notes of what you change
7. **Join the community** - Share your deployment experience
8. **Update regularly** - Keep your system secure

---

## 📞 Support Resources

- **Full Documentation**: [README.md](README.md)
- **Setup Guide**: [SELF_HOSTED_UBUNTU.md](SELF_HOSTED_UBUNTU.md)
- **Configuration Help**: [DEPLOYMENT_FILES_GUIDE.md](DEPLOYMENT_FILES_GUIDE.md)
- **GitHub Issues**: https://github.com/yourusername/ispmanager/issues
- **Discussions**: https://github.com/yourusername/ispmanager/discussions

---

## ✨ You're Ready!

All files are created and configured. Choose your preferred deployment method above and get started!

### Quick Decision Tree

```
Do you want automated deployment?
├─ Yes → Run: sudo ./quick-deploy.sh
└─ No → Do you prefer Docker?
    ├─ Yes → Use: docker-compose-selfhosted.yml
    └─ No → Follow: SELF_HOSTED_UBUNTU.md
```

---

## 🎉 Summary

✅ All deployment files created
✅ All services configured
✅ PostgreSQL with RADIUS tables
✅ RADIUS server ready
✅ Backend API configured
✅ Frontend built
✅ Nginx reverse proxy set up
✅ Piprapay integration ready
✅ Docker containerization complete
✅ SSL/TLS configuration done
✅ Documentation comprehensive
✅ One-click deployment script ready

**Everything you need to deploy a production ISP management system on Ubuntu 24.04 is ready to go!**

---

**Start deployment now! Choose [quick-deploy.sh](quick-deploy.sh), [docker-compose-selfhosted.yml](docker-compose-selfhosted.yml), or [SELF_HOSTED_UBUNTU.md](SELF_HOSTED_UBUNTU.md)**

🚀 **Happy deploying!**
