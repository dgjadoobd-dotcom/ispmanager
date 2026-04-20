-- ============================================================
-- ISP MANAGER - LOCAL POSTGRES SETUP
-- Run this after creating the database with setup_local_db.ps1
-- ============================================================

-- STEP 1: ENUMS
CREATE TYPE app_role AS ENUM ('super_admin', 'isp_owner', 'admin', 'manager', 'staff', 'accountant', 'marketing', 'member');
CREATE TYPE connection_status AS ENUM ('active', 'suspended', 'pending');
CREATE TYPE payment_status AS ENUM ('paid', 'due', 'partial', 'overdue');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'suspended', 'trial');
CREATE TYPE network_provider_type AS ENUM ('mikrotik', 'radius', 'custom');
CREATE TYPE network_sync_action AS ENUM ('enable', 'disable', 'update_speed', 'create', 'delete', 'test_connection');
CREATE TYPE network_sync_status AS ENUM ('pending', 'in_progress', 'success', 'failed', 'retrying');
CREATE TYPE network_sync_mode AS ENUM ('manual', 'scheduled', 'event_driven');
CREATE TYPE api_key_scope AS ENUM ('read_only', 'read_write');
CREATE TYPE platform_billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');
CREATE TYPE addon_pricing_type AS ENUM ('fixed', 'tiered', 'usage_based');

-- STEP 2: CORE TABLES

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3b82f6',
    accent_color TEXT DEFAULT '#8b5cf6',
    auto_suspend_days INTEGER DEFAULT 7,
    enable_online_payment BOOLEAN DEFAULT false,
    currency TEXT DEFAULT 'BDT',
    timezone TEXT DEFAULT 'Asia/Dhaka',
    language TEXT DEFAULT 'en',
    subscription_status subscription_status DEFAULT 'trial',
    uddoktapay_api_key TEXT DEFAULT NULL,
    uddoktapay_base_url TEXT DEFAULT 'https://sandbox.uddoktapay.com',
    resend_api_key TEXT DEFAULT NULL,
    sender_email TEXT DEFAULT NULL,
    api_enabled BOOLEAN DEFAULT false,
    allow_reseller_branding BOOLEAN DEFAULT false,
    allow_reseller_logo BOOLEAN DEFAULT false,
    allow_reseller_name BOOLEAN DEFAULT false,
    allow_reseller_theme BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    plan TEXT DEFAULT NULL,
    plan_expires_at TIMESTAMPTZ DEFAULT NULL,
    owner_id UUID DEFAULT NULL,
    contact_email TEXT DEFAULT NULL,
    contact_phone TEXT DEFAULT NULL,
    address TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    speed_label TEXT NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    validity_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    mikrotik_profile_name TEXT,
    mikrotik_rate_limit TEXT,
    mikrotik_address_pool TEXT,
    mikrotik_queue_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert sample data
INSERT INTO tenants (name, subdomain) VALUES ('Demo ISP', 'demo');
INSERT INTO packages (tenant_id, name, speed_label, monthly_price) VALUES
((SELECT id FROM tenants LIMIT 1), 'Basic Plan', '10 Mbps', 500.00),
((SELECT id FROM tenants LIMIT 1), 'Standard Plan', '25 Mbps', 1000.00),
((SELECT id FROM tenants LIMIT 1), 'Premium Plan', '50 Mbps', 1500.00);