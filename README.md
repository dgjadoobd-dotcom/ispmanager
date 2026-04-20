# ISP Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-%3E%3D20.10.0-blue)](https://www.docker.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)

A comprehensive Internet Service Provider (ISP) management system built with modern web technologies. Manage customers, billing, network infrastructure, resellers, and more with an intuitive web interface.

## 🚀 Features

### Core Management
- **Customer Management**: Full CRUD operations, connection status tracking, network synchronization
- **Billing & Payments**: Automated invoice generation, payment recording, PDF exports, multiple payment gateways
- **Service Packages**: Flexible plan management with MikroTik integration
- **Network Integration**: MikroTik server management, OLT devices, RADIUS authentication
- **Reseller Management**: Multi-level reseller system with commissions and branding

### Analytics & Reporting
- **Dashboard**: Revenue charts, customer statistics, activity logs
- **Reports**: Revenue analysis, collection reports, customer growth metrics
- **Notifications**: Automated notifications, logs, and delivery tracking

### Advanced Features
- **Multi-Tenant Architecture**: Support for multiple ISPs with custom branding
- **API Access**: RESTful API for integrations and third-party access
- **PWA Support**: Installable as a mobile app with offline capabilities
- **Customer Portal**: Self-service portal for end customers
- **Demo Mode**: Explore features without setup

### Technical Features
- **Responsive Design**: Mobile-first UI with dark/light theme support
- **Real-time Updates**: Live data synchronization across devices
- **Offline Support**: Core functionality works without internet
- **Security**: Role-based access control, secure API endpoints

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js/Express API server for external integrations
- **Database**: Supabase (PostgreSQL) with localStorage fallback
- **Deployment**: Docker containers with Nginx reverse proxy
- **Hosting**: Cloudflare Pages (frontend) + Railway/Render/VPS (backend)

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker & Docker Compose (for containerized deployment)
- Supabase account (for production database)
- Ubuntu 24.04 LTS or compatible Linux distribution

## 🛠️ Installation & Setup

### Quick Start (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ispmanager.git
   cd ispmanager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Visit [http://localhost:5173](http://localhost:5173)
   - Login with demo credentials (see below)

### Production Deployment on Ubuntu 24.04 LTS

#### 1. System Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group (optional, for non-root usage)
sudo usermod -aG docker $USER
```

#### 2. Database Setup (Supabase)

1. **Create Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Run database migrations**
   - Open Supabase Dashboard → SQL Editor
   - Copy and run the contents of `supabase/setup_all.sql`

#### 3. Environment Configuration

Create environment files:

**Frontend (.env.local)**
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_API_URL=http://localhost:3001
```

**Backend (proxy/.env)**
```bash
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### 4. Build and Deploy

**Option A: Docker Deployment (Recommended)**

```bash
# Build and start all services
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:3001
```

**Option B: Manual Deployment**

```bash
# Backend deployment
cd proxy
npm install
npm start

# Frontend build (in new terminal)
npm run build

# Serve frontend with Nginx
sudo apt install -y nginx
sudo cp nginx.conf /etc/nginx/sites-available/ispmanager
sudo ln -s /etc/nginx/sites-available/ispmanager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. SSL Configuration (Production)

```bash
# Install Certbot for Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# Update ALLOWED_ORIGINS in proxy/.env with HTTPS URLs
```

## 🔐 Authentication

### Default Login Credentials

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Super Admin | `admin` | `admin123` | Full system access |
| Staff | `staff` | `staff123` | Limited access |

### Custom Authentication

To change credentials, modify `src/lib/localAuth.ts` or configure external auth providers.

## 📊 API Documentation

The backend provides RESTful APIs for:

- Customer management
- Billing operations
- Network device control
- Payment processing
- Report generation

API endpoints are available at `http://localhost:3001/api/*`

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build
```

## 🚀 Deployment Options

### Cloud Deployment

- **Frontend**: Cloudflare Pages, Vercel, Netlify
- **Backend**: Railway, Render, Heroku, DigitalOcean App Platform
- **Database**: Supabase, PlanetScale, Railway PostgreSQL

### Self-Hosted

- **Single Server**: Docker Compose (recommended)
- **Multi-Server**: Kubernetes, Docker Swarm
- **VPS**: Ubuntu 24.04 LTS with Nginx reverse proxy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Charts from [Recharts](https://recharts.org/)

## 📞 Support

For support, email support@ispmanager.com or join our [Discord community](https://discord.gg/ispmanager).

---

**Made with ❤️ for ISPs worldwide**
