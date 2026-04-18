-- Create enum for billing cycle type
CREATE TYPE platform_billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');

-- Create enum for addon pricing type
CREATE TYPE addon_pricing_type AS ENUM ('fixed', 'tiered', 'usage_based');

-- Platform Plans (Base subscription plans)
CREATE TABLE public.platform_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC NOT NULL DEFAULT 0,
    billing_cycle platform_billing_cycle NOT NULL DEFAULT 'monthly',
    max_customers INTEGER, -- null = unlimited
    max_staff INTEGER,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Platform Add-ons
CREATE TABLE public.platform_addons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE, -- e.g., 'network_automation', 'sms_gateway'
    description TEXT,
    pricing_type addon_pricing_type NOT NULL DEFAULT 'fixed',
    base_price NUMERIC NOT NULL DEFAULT 0, -- for fixed pricing
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Platform Add-on Tiers (for tiered pricing based on customer count)
CREATE TABLE public.platform_addon_tiers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    addon_id UUID NOT NULL REFERENCES public.platform_addons(id) ON DELETE CASCADE,
    min_customers INTEGER NOT NULL DEFAULT 0,
    max_customers INTEGER, -- null = unlimited
    price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tenant Subscriptions (ISP subscription to a plan)
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

-- Tenant Add-on Subscriptions
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

-- Platform Invoices (Invoices for ISPs)
CREATE TABLE public.platform_invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.tenant_subscriptions(id),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax_amount NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    customer_count_snapshot INTEGER, -- snapshot of customer count at billing time
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Platform Invoice Line Items
CREATE TABLE public.platform_invoice_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES public.platform_invoices(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('base_plan', 'addon', 'usage', 'discount', 'proration')),
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    addon_id UUID REFERENCES public.platform_addons(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.platform_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_addon_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_addon_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_plans
CREATE POLICY "Anyone can view active plans"
ON public.platform_plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Super admins can manage all plans"
ON public.platform_plans FOR ALL
USING (is_super_admin(auth.uid()));

-- RLS Policies for platform_addons
CREATE POLICY "Anyone can view active addons"
ON public.platform_addons FOR SELECT
USING (is_active = true);

CREATE POLICY "Super admins can manage all addons"
ON public.platform_addons FOR ALL
USING (is_super_admin(auth.uid()));

-- RLS Policies for platform_addon_tiers
CREATE POLICY "Anyone can view addon tiers"
ON public.platform_addon_tiers FOR SELECT
USING (true);

CREATE POLICY "Super admins can manage addon tiers"
ON public.platform_addon_tiers FOR ALL
USING (is_super_admin(auth.uid()));

-- RLS Policies for tenant_subscriptions
CREATE POLICY "Tenants can view their own subscription"
ON public.tenant_subscriptions FOR SELECT
USING (can_access_tenant(auth.uid(), tenant_id));

CREATE POLICY "Super admins can manage all subscriptions"
ON public.tenant_subscriptions FOR ALL
USING (is_super_admin(auth.uid()));

-- RLS Policies for tenant_addon_subscriptions
CREATE POLICY "Tenants can view their own addon subscriptions"
ON public.tenant_addon_subscriptions FOR SELECT
USING (can_access_tenant(auth.uid(), tenant_id));

CREATE POLICY "Super admins can manage all addon subscriptions"
ON public.tenant_addon_subscriptions FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "ISP owners can manage their addon subscriptions"
ON public.tenant_addon_subscriptions FOR ALL
USING (can_access_tenant(auth.uid(), tenant_id) AND has_role(auth.uid(), 'isp_owner'));

-- RLS Policies for platform_invoices
CREATE POLICY "Tenants can view their own invoices"
ON public.platform_invoices FOR SELECT
USING (can_access_tenant(auth.uid(), tenant_id));

CREATE POLICY "Super admins can manage all invoices"
ON public.platform_invoices FOR ALL
USING (is_super_admin(auth.uid()));

-- RLS Policies for platform_invoice_items
CREATE POLICY "Users can view invoice items for their invoices"
ON public.platform_invoice_items FOR SELECT
USING (
    invoice_id IN (
        SELECT id FROM public.platform_invoices 
        WHERE can_access_tenant(auth.uid(), tenant_id)
    )
);

CREATE POLICY "Super admins can manage all invoice items"
ON public.platform_invoice_items FOR ALL
USING (is_super_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_platform_plans_updated_at
BEFORE UPDATE ON public.platform_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_addons_updated_at
BEFORE UPDATE ON public.platform_addons
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_subscriptions_updated_at
BEFORE UPDATE ON public.tenant_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_invoices_updated_at
BEFORE UPDATE ON public.platform_invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate addon price based on customer count
CREATE OR REPLACE FUNCTION public.calculate_addon_price(
    _addon_id UUID,
    _customer_count INTEGER
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    _addon RECORD;
    _tier RECORD;
BEGIN
    SELECT * INTO _addon FROM platform_addons WHERE id = _addon_id;
    
    IF _addon IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Fixed pricing
    IF _addon.pricing_type = 'fixed' THEN
        RETURN _addon.base_price;
    END IF;
    
    -- Tiered pricing
    IF _addon.pricing_type = 'tiered' THEN
        SELECT * INTO _tier
        FROM platform_addon_tiers
        WHERE addon_id = _addon_id
          AND min_customers <= _customer_count
          AND (max_customers IS NULL OR max_customers >= _customer_count)
        ORDER BY min_customers DESC
        LIMIT 1;
        
        IF _tier IS NOT NULL THEN
            RETURN _tier.price;
        END IF;
        
        RETURN _addon.base_price;
    END IF;
    
    RETURN _addon.base_price;
END;
$$;

-- Create function to get tenant's total billing estimate
CREATE OR REPLACE FUNCTION public.get_tenant_billing_estimate(_tenant_id UUID)
RETURNS TABLE (
    base_plan_cost NUMERIC,
    addons_cost NUMERIC,
    total_cost NUMERIC,
    customer_count INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    _customer_count INTEGER;
    _base_cost NUMERIC := 0;
    _addons_total NUMERIC := 0;
    _addon RECORD;
BEGIN
    -- Get customer count
    SELECT COUNT(*) INTO _customer_count
    FROM customers
    WHERE tenant_id = _tenant_id AND connection_status = 'active';
    
    -- Get base plan cost
    SELECT COALESCE(pp.base_price, 0) INTO _base_cost
    FROM tenant_subscriptions ts
    JOIN platform_plans pp ON pp.id = ts.plan_id
    WHERE ts.tenant_id = _tenant_id AND ts.status = 'active';
    
    -- Calculate addons cost
    FOR _addon IN
        SELECT pa.id
        FROM tenant_addon_subscriptions tas
        JOIN platform_addons pa ON pa.id = tas.addon_id
        WHERE tas.tenant_id = _tenant_id AND tas.is_active = true
    LOOP
        _addons_total := _addons_total + calculate_addon_price(_addon.id, _customer_count);
    END LOOP;
    
    RETURN QUERY SELECT _base_cost, _addons_total, _base_cost + _addons_total, _customer_count;
END;
$$;

-- Insert default plans
INSERT INTO public.platform_plans (name, description, base_price, billing_cycle, max_customers, features, sort_order) VALUES
('Starter', 'ছোট ISP-এর জন্য উপযুক্ত', 500, 'monthly', 100, '["গ্রাহক ম্যানেজমেন্ট", "বিল জেনারেশন", "পেমেন্ট ট্র্যাকিং"]'::jsonb, 1),
('Professional', 'মাঝারি ISP-এর জন্য পারফেক্ট', 1500, 'monthly', 500, '["সব Starter ফিচার", "API অ্যাক্সেস", "অ্যাডভান্সড রিপোর্টিং", "ইমেইল নোটিফিকেশন"]'::jsonb, 2),
('Enterprise', 'বড় ISP-এর জন্য সম্পূর্ণ সমাধান', 3500, 'monthly', NULL, '["সব Professional ফিচার", "আনলিমিটেড গ্রাহক", "প্রায়োরিটি সাপোর্ট", "কাস্টম ইন্টিগ্রেশন"]'::jsonb, 3);

-- Insert default addons
INSERT INTO public.platform_addons (name, code, description, pricing_type, base_price, sort_order) VALUES
('Network Automation Pack', 'network_automation', 'MikroTik/RADIUS অটোমেশন সাপোর্ট', 'tiered', 300, 1),
('SMS Gateway', 'sms_gateway', 'SMS নোটিফিকেশন ও বিল রিমাইন্ডার', 'fixed', 200, 2),
('Online Payment', 'online_payment', 'bKash/Nagad পেমেন্ট ইন্টিগ্রেশন', 'fixed', 150, 3),
('White Label', 'white_label', 'কাস্টম ব্র্যান্ডিং ও ডোমেইন', 'fixed', 500, 4);

-- Insert tiers for network automation addon
INSERT INTO public.platform_addon_tiers (addon_id, min_customers, max_customers, price)
SELECT id, 0, 100, 300 FROM platform_addons WHERE code = 'network_automation'
UNION ALL
SELECT id, 101, 300, 500 FROM platform_addons WHERE code = 'network_automation'
UNION ALL
SELECT id, 301, 500, 800 FROM platform_addons WHERE code = 'network_automation'
UNION ALL
SELECT id, 501, NULL, 1200 FROM platform_addons WHERE code = 'network_automation';