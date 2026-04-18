-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'isp_owner', 'admin', 'manager', 'staff', 'accountant', 'marketing', 'member');

-- Create enum for connection status
CREATE TYPE public.connection_status AS ENUM ('active', 'suspended', 'pending');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('paid', 'due', 'partial', 'overdue');

-- Create enum for billing cycle
CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');

-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'suspended', 'trial');

-- ============================================
-- TENANTS TABLE (ISP Organizations)
-- ============================================
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PROFILES TABLE (User Profiles)
-- ============================================
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

-- ============================================
-- USER ROLES TABLE (Separate table for roles)
-- ============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, tenant_id, role)
);

-- ============================================
-- PACKAGES TABLE (Internet Packages)
-- ============================================
CREATE TABLE public.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    speed_label TEXT NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    validity_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- CUSTOMERS TABLE (ISP Customers/Members)
-- ============================================
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT,
    package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
    connection_status public.connection_status DEFAULT 'pending',
    due_balance DECIMAL(10,2) DEFAULT 0,
    advance_balance DECIMAL(10,2) DEFAULT 0,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_payment_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- BILLS TABLE
-- ============================================
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

-- ============================================
-- PAYMENTS TABLE
-- ============================================
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

-- ============================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Function to check if user belongs to a tenant
CREATE OR REPLACE FUNCTION public.user_tenant_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT tenant_id FROM public.profiles WHERE id = _user_id
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = 'super_admin'
    )
$$;

-- Function to check if user can access tenant data
CREATE OR REPLACE FUNCTION public.can_access_tenant(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.is_super_admin(_user_id) OR public.user_tenant_id(_user_id) = _tenant_id
$$;

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR TENANTS
-- ============================================
CREATE POLICY "Super admins can manage all tenants"
ON public.tenants FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own tenant"
ON public.tenants FOR SELECT
USING (id = public.user_tenant_id(auth.uid()));

CREATE POLICY "ISP owners can update their tenant"
ON public.tenants FOR UPDATE
USING (id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'isp_owner'));

-- ============================================
-- RLS POLICIES FOR PROFILES
-- ============================================
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Super admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant members can view profiles in same tenant"
ON public.profiles FOR SELECT
USING (tenant_id = public.user_tenant_id(auth.uid()));

-- ============================================
-- RLS POLICIES FOR USER ROLES
-- ============================================
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "ISP owners can manage roles in their tenant"
ON public.user_roles FOR ALL
USING (
    public.has_role(auth.uid(), 'isp_owner') 
    AND tenant_id = public.user_tenant_id(auth.uid())
);

-- ============================================
-- RLS POLICIES FOR PACKAGES
-- ============================================
CREATE POLICY "Users can view packages in their tenant"
ON public.packages FOR SELECT
USING (public.can_access_tenant(auth.uid(), tenant_id));

CREATE POLICY "Admins can manage packages in their tenant"
ON public.packages FOR ALL
USING (
    public.can_access_tenant(auth.uid(), tenant_id) 
    AND (public.has_role(auth.uid(), 'isp_owner') OR public.has_role(auth.uid(), 'admin'))
);

-- ============================================
-- RLS POLICIES FOR CUSTOMERS
-- ============================================
CREATE POLICY "Users can view customers in their tenant"
ON public.customers FOR SELECT
USING (public.can_access_tenant(auth.uid(), tenant_id));

CREATE POLICY "Staff can manage customers in their tenant"
ON public.customers FOR ALL
USING (
    public.can_access_tenant(auth.uid(), tenant_id)
    AND (
        public.has_role(auth.uid(), 'isp_owner') 
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'manager')
        OR public.has_role(auth.uid(), 'staff')
    )
);

-- ============================================
-- RLS POLICIES FOR BILLS
-- ============================================
CREATE POLICY "Users can view bills in their tenant"
ON public.bills FOR SELECT
USING (public.can_access_tenant(auth.uid(), tenant_id));

CREATE POLICY "Staff can manage bills in their tenant"
ON public.bills FOR ALL
USING (
    public.can_access_tenant(auth.uid(), tenant_id)
    AND (
        public.has_role(auth.uid(), 'isp_owner') 
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'manager')
        OR public.has_role(auth.uid(), 'accountant')
    )
);

-- ============================================
-- RLS POLICIES FOR PAYMENTS
-- ============================================
CREATE POLICY "Users can view payments in their tenant"
ON public.payments FOR SELECT
USING (public.can_access_tenant(auth.uid(), tenant_id));

CREATE POLICY "Staff can manage payments in their tenant"
ON public.payments FOR ALL
USING (
    public.can_access_tenant(auth.uid(), tenant_id)
    AND (
        public.has_role(auth.uid(), 'isp_owner') 
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'manager')
        OR public.has_role(auth.uid(), 'accountant')
        OR public.has_role(auth.uid(), 'staff')
    )
);

-- ============================================
-- TRIGGER FOR AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();