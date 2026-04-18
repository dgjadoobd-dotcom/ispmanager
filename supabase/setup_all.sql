-- ============================================================
-- ISP MANAGER - FULL SETUP SQL
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- STEP 1: ENUMS
CREATE TYPE public.app_role AS ENUM ('super_admin', 'isp_owner', 'admin', 'manager', 'staff', 'accountant', 'marketing', 'member');
CREATE TYPE public.connection_status AS ENUM ('active', 'suspended', 'pending');
CREATE TYPE public.payment_status AS ENUM ('paid', 'due', 'partial', 'overdue');
CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');
CREATE TYPE public.subscription_status AS ENUM ('active', 'suspended', 'trial');
CREATE TYPE public.network_provider_type AS ENUM ('mikrotik', 'radius', 'custom');
CREATE TYPE public.network_sync_action AS ENUM ('enable', 'disable', 'update_speed', 'create', 'delete', 'test_connection');
CREATE TYPE public.network_sync_status AS ENUM ('pending', 'in_progress', 'success', 'failed', 'retrying');
CREATE TYPE public.network_sync_mode AS ENUM ('manual', 'scheduled', 'event_driven');
CREATE TYPE public.api_key_scope AS ENUM ('read_only', 'read_write');
CREATE TYPE public.platform_billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');
CREATE TYPE public.addon_pricing_type AS ENUM ('fixed', 'tiered', 'usage_based');

-- STEP 2: CORE TABLES

CREATE TABLE public.tenants (
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
    subscription_status public.subscription_status DEFAULT 'trial',
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

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, tenant_id, role)
);

CREATE TABLE public.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
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

CREATE TABLE public.resellers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    commission_type TEXT NOT NULL DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'flat', 'per_payment')),
    commission_value NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    brand_name TEXT,
    logo_url TEXT,
    primary_color TEXT,
    accent_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);

CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT,
    package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
    reseller_id UUID REFERENCES public.resellers(id) ON DELETE SET NULL,
    connection_status public.connection_status DEFAULT 'pending',
    due_balance DECIMAL(10,2) DEFAULT 0,
    advance_balance DECIMAL(10,2) DEFAULT 0,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_payment_date DATE,
    network_username TEXT,
    network_password_encrypted TEXT,
    last_network_sync_at TIMESTAMP WITH TIME ZONE,
    network_sync_status public.network_sync_status,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    invoice_number TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status public.payment_status DEFAULT 'due',
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    bill_id UUID REFERENCES public.bills(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    method TEXT DEFAULT 'cash',
    reference TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STEP 3: HELPER FUNCTIONS

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.user_tenant_id(_user_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT tenant_id FROM public.profiles WHERE id = _user_id $$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin') $$;

CREATE OR REPLACE FUNCTION public.can_access_tenant(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT public.is_super_admin(_user_id) OR public.user_tenant_id(_user_id) = _tenant_id $$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT role FROM public.user_roles WHERE user_id = _user_id
    ORDER BY CASE role WHEN 'super_admin' THEN 1 WHEN 'isp_owner' THEN 2 WHEN 'admin' THEN 3
        WHEN 'manager' THEN 4 WHEN 'accountant' THEN 5 WHEN 'staff' THEN 6 WHEN 'marketing' THEN 7 ELSE 8 END
    LIMIT 1 $$;

CREATE OR REPLACE FUNCTION public.is_isp_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
        AND role IN ('super_admin', 'isp_owner', 'admin', 'manager', 'staff', 'accountant', 'marketing')) $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
    RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- onboard_tenant function
CREATE OR REPLACE FUNCTION public.onboard_tenant(_tenant_name text, _subdomain text, _user_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE _tenant_id uuid;
BEGIN
    INSERT INTO public.tenants (name, subdomain) VALUES (_tenant_name, _subdomain) RETURNING id INTO _tenant_id;
    UPDATE public.profiles SET tenant_id = _tenant_id WHERE id = _user_id;
    INSERT INTO public.user_roles (user_id, role, tenant_id) VALUES (_user_id, 'isp_owner', _tenant_id);
    RETURN _tenant_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.onboard_tenant(text, text, uuid) TO authenticated;

-- STEP 4: RLS - DISABLE on core tables so anon key works (local-auth mode)
-- The app uses localStorage auth, not Supabase Auth, so RLS blocks all queries.
-- We disable RLS on the tables the app queries directly.

ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.resellers DISABLE ROW LEVEL SECURITY;

-- Keep RLS on auth-sensitive tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid() AND (tenant_id IS NOT DISTINCT FROM (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Super admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Tenant members can view profiles in same tenant" ON public.profiles FOR SELECT USING (tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Super admins can manage all roles" ON public.user_roles FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "ISP owners can manage roles in their tenant" ON public.user_roles FOR ALL TO authenticated
    USING (has_role(auth.uid(), 'isp_owner'::app_role) AND tenant_id = user_tenant_id(auth.uid()) AND role != 'super_admin'::app_role)
    WITH CHECK (has_role(auth.uid(), 'isp_owner'::app_role) AND tenant_id = user_tenant_id(auth.uid()) AND role != 'super_admin'::app_role);

-- STEP 5: INSERT DEFAULT TENANT matching the app's local-tenant-001 fallback
INSERT INTO public.tenants (id, name, subdomain, currency, timezone, language, is_active, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'My ISP', 'local', 'USD', 'UTC', 'en', true, 'pro')
ON CONFLICT (id) DO NOTHING;

-- STEP 6: RESELLER COMMISSION TABLES

CREATE TABLE public.reseller_commissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    payment_amount NUMERIC NOT NULL,
    commission_type TEXT NOT NULL,
    commission_value NUMERIC NOT NULL,
    commission_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.reseller_wallet_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('commission', 'adjustment', 'withdrawal')),
    amount NUMERIC NOT NULL,
    balance_after NUMERIC NOT NULL,
    description TEXT NOT NULL,
    reference_id UUID,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reseller_commissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_wallet_transactions DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_customers_reseller_id ON public.customers(reseller_id);
CREATE INDEX idx_resellers_tenant_id ON public.resellers(tenant_id);
CREATE INDEX idx_reseller_commissions_reseller ON public.reseller_commissions(reseller_id);
CREATE INDEX idx_reseller_wallet_reseller ON public.reseller_wallet_transactions(reseller_id);

-- STEP 7: NETWORK INTEGRATION TABLES

CREATE TABLE public.network_integrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    provider_type network_provider_type NOT NULL,
    name TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    host TEXT NOT NULL,
    port INTEGER DEFAULT 8728,
    username TEXT NOT NULL,
    credentials_encrypted TEXT,
    sync_mode network_sync_mode NOT NULL DEFAULT 'manual',
    sync_interval_minutes INTEGER DEFAULT 60,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_sync_status network_sync_status,
    radius_secret_encrypted TEXT,
    radius_auth_port INTEGER DEFAULT 1812,
    radius_acct_port INTEGER DEFAULT 1813,
    mikrotik_use_ssl BOOLEAN DEFAULT false,
    mikrotik_ppp_profile TEXT,
    mikrotik_address_list TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(tenant_id, name)
);

CREATE TABLE public.network_sync_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.network_integrations(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    action network_sync_action NOT NULL,
    status network_sync_status NOT NULL DEFAULT 'pending',
    request_payload JSONB,
    response_payload JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    triggered_by TEXT,
    triggered_by_user UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.network_sync_queue (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES public.network_integrations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    action network_sync_action NOT NULL,
    priority INTEGER DEFAULT 0,
    payload JSONB,
    status network_sync_status NOT NULL DEFAULT 'pending',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.network_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_sync_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_sync_queue DISABLE ROW LEVEL SECURITY;

-- STEP 8: OLT TABLES

CREATE TABLE public.olt_devices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    brand text NOT NULL DEFAULT 'huawei',
    model text,
    host text NOT NULL,
    port integer DEFAULT 23,
    protocol text NOT NULL DEFAULT 'telnet',
    username text NOT NULL DEFAULT '',
    credentials_encrypted text,
    snmp_community text DEFAULT 'public',
    snmp_version text DEFAULT 'v2c',
    total_pon_ports integer DEFAULT 8,
    is_enabled boolean NOT NULL DEFAULT true,
    notes text,
    created_by uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.olt_ports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    olt_device_id uuid NOT NULL REFERENCES public.olt_devices(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    slot integer NOT NULL DEFAULT 0,
    port integer NOT NULL,
    port_label text,
    port_type text NOT NULL DEFAULT 'gpon',
    status text NOT NULL DEFAULT 'active',
    max_onus integer DEFAULT 128,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(olt_device_id, slot, port)
);

CREATE TABLE public.customer_onu (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    olt_port_id uuid NOT NULL REFERENCES public.olt_ports(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    onu_number integer,
    onu_serial text,
    onu_mac text,
    onu_type text DEFAULT 'router',
    vlan_id integer,
    service_port_id integer,
    onu_status text NOT NULL DEFAULT 'online',
    rx_power numeric,
    tx_power numeric,
    last_seen_at timestamptz,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(customer_id)
);

ALTER TABLE public.olt_devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.olt_ports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_onu DISABLE ROW LEVEL SECURITY;

-- STEP 9: API KEYS TABLE

CREATE TABLE public.api_keys (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    scope api_key_scope NOT NULL DEFAULT 'read_only',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID,
    CONSTRAINT api_keys_key_hash_unique UNIQUE (key_hash)
);

CREATE TABLE public.api_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    request_ip TEXT,
    user_agent TEXT,
    response_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs DISABLE ROW LEVEL SECURITY;

-- STEP 10: PUSH NOTIFICATIONS & NOTIFICATION LOGS

CREATE TABLE public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(customer_id, endpoint)
);

CREATE TABLE public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs DISABLE ROW LEVEL SECURITY;

-- STEP 11: PLATFORM PRICING TABLES

CREATE TABLE public.platform_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC NOT NULL DEFAULT 0,
    billing_cycle platform_billing_cycle NOT NULL DEFAULT 'monthly',
    max_customers INTEGER,
    max_staff INTEGER,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.platform_addons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    pricing_type addon_pricing_type NOT NULL DEFAULT 'fixed',
    base_price NUMERIC NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.platform_addon_tiers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    addon_id UUID NOT NULL REFERENCES public.platform_addons(id) ON DELETE CASCADE,
    min_customers INTEGER NOT NULL DEFAULT 0,
    max_customers INTEGER,
    price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.tenant_subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.platform_plans(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'trial')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(tenant_id)
);

CREATE TABLE public.tenant_addon_subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    addon_id UUID NOT NULL REFERENCES public.platform_addons(id),
    activated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deactivated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, addon_id)
);

ALTER TABLE public.platform_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_addons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_addon_tiers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_addon_subscriptions DISABLE ROW LEVEL SECURITY;

-- Default plans
INSERT INTO public.platform_plans (name, description, base_price, billing_cycle, max_customers, features, sort_order) VALUES
('Starter', 'Small ISP plan', 500, 'monthly', 100, '["Customer Management","Bill Generation","Payment Tracking"]'::jsonb, 1),
('Professional', 'Medium ISP plan', 1500, 'monthly', 500, '["All Starter","API Access","Advanced Reporting","Email Notifications"]'::jsonb, 2),
('Enterprise', 'Large ISP plan', 3500, 'monthly', NULL, '["All Professional","Unlimited Customers","Priority Support"]'::jsonb, 3);

-- Default addons
INSERT INTO public.platform_addons (name, code, description, pricing_type, base_price, sort_order) VALUES
('Network Automation Pack', 'network_automation', 'MikroTik/RADIUS automation', 'tiered', 300, 1),
('SMS Gateway', 'sms_gateway', 'SMS notifications', 'fixed', 200, 2),
('Online Payment', 'online_payment', 'bKash/Nagad payment integration', 'fixed', 150, 3),
('White Label', 'white_label', 'Custom branding', 'fixed', 500, 4);

-- STEP 12: INDEXES
CREATE INDEX idx_customers_tenant ON public.customers(tenant_id);
CREATE INDEX idx_customers_status ON public.customers(connection_status);
CREATE INDEX idx_bills_tenant ON public.bills(tenant_id);
CREATE INDEX idx_bills_customer ON public.bills(customer_id);
CREATE INDEX idx_bills_status ON public.bills(status);
CREATE INDEX idx_payments_tenant ON public.payments(tenant_id);
CREATE INDEX idx_payments_customer ON public.payments(customer_id);
CREATE INDEX idx_packages_tenant ON public.packages(tenant_id);
