-- Create proration_items table to track mid-cycle changes
CREATE TABLE public.proration_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('plan_upgrade', 'plan_downgrade', 'addon_activation', 'addon_deactivation')),
    description TEXT NOT NULL,
    original_price NUMERIC NOT NULL DEFAULT 0,
    prorated_amount NUMERIC NOT NULL,
    days_remaining INTEGER NOT NULL,
    total_days INTEGER NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    old_plan_id UUID REFERENCES public.platform_plans(id),
    new_plan_id UUID REFERENCES public.platform_plans(id),
    addon_id UUID REFERENCES public.platform_addons(id),
    invoice_id UUID REFERENCES public.platform_invoices(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    metadata JSONB
);

-- Enable RLS
ALTER TABLE public.proration_items ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Super admins can view all proration items"
ON public.proration_items FOR SELECT
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant users can view their proration items"
ON public.proration_items FOR SELECT
USING (public.can_access_tenant(auth.uid(), tenant_id));

CREATE POLICY "Super admins can manage proration items"
ON public.proration_items FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Create proration calculation function
CREATE OR REPLACE FUNCTION public.calculate_proration(
    _original_price NUMERIC,
    _period_start DATE,
    _period_end DATE,
    _effective_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    prorated_amount NUMERIC,
    days_remaining INTEGER,
    total_days INTEGER,
    daily_rate NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    _total_days INTEGER;
    _days_remaining INTEGER;
    _daily_rate NUMERIC;
    _prorated_amount NUMERIC;
BEGIN
    -- Calculate total days in billing period
    _total_days := _period_end - _period_start + 1;
    
    -- Calculate days remaining from effective date
    _days_remaining := GREATEST(0, _period_end - _effective_date + 1);
    
    -- Calculate daily rate
    _daily_rate := CASE WHEN _total_days > 0 THEN _original_price / _total_days ELSE 0 END;
    
    -- Calculate prorated amount
    _prorated_amount := ROUND(_daily_rate * _days_remaining, 2);
    
    RETURN QUERY SELECT _prorated_amount, _days_remaining, _total_days, _daily_rate;
END;
$$;

-- Function to create proration item for plan upgrade
CREATE OR REPLACE FUNCTION public.create_plan_proration(
    _tenant_id UUID,
    _old_plan_id UUID,
    _new_plan_id UUID,
    _effective_date DATE DEFAULT CURRENT_DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    _subscription RECORD;
    _old_plan RECORD;
    _new_plan RECORD;
    _proration RECORD;
    _credit_amount NUMERIC := 0;
    _charge_amount NUMERIC := 0;
    _net_amount NUMERIC;
    _proration_id UUID;
    _item_type TEXT;
    _description TEXT;
BEGIN
    -- Get current subscription period
    SELECT * INTO _subscription
    FROM tenant_subscriptions
    WHERE tenant_id = _tenant_id AND status = 'active';
    
    IF _subscription IS NULL THEN
        RAISE EXCEPTION 'No active subscription found for tenant';
    END IF;
    
    -- Get old and new plan details
    SELECT * INTO _old_plan FROM platform_plans WHERE id = _old_plan_id;
    SELECT * INTO _new_plan FROM platform_plans WHERE id = _new_plan_id;
    
    IF _new_plan IS NULL THEN
        RAISE EXCEPTION 'New plan not found';
    END IF;
    
    -- Calculate credit for unused portion of old plan
    IF _old_plan IS NOT NULL THEN
        SELECT * INTO _proration
        FROM calculate_proration(
            _old_plan.base_price,
            _subscription.current_period_start::DATE,
            _subscription.current_period_end::DATE,
            _effective_date
        );
        _credit_amount := _proration.prorated_amount;
    END IF;
    
    -- Calculate charge for new plan
    SELECT * INTO _proration
    FROM calculate_proration(
        _new_plan.base_price,
        _subscription.current_period_start::DATE,
        _subscription.current_period_end::DATE,
        _effective_date
    );
    _charge_amount := _proration.prorated_amount;
    
    -- Calculate net amount (positive = charge, negative = credit)
    _net_amount := _charge_amount - _credit_amount;
    
    -- Determine item type and description
    IF _net_amount >= 0 THEN
        _item_type := 'plan_upgrade';
        _description := format('%s থেকে %s প্ল্যানে আপগ্রেড - %s দিনের আনুপাতিক চার্জ',
            COALESCE(_old_plan.name, 'পূর্ববর্তী প্ল্যান'),
            _new_plan.name,
            _proration.days_remaining
        );
    ELSE
        _item_type := 'plan_downgrade';
        _description := format('%s থেকে %s প্ল্যানে ডাউনগ্রেড - %s দিনের ক্রেডিট',
            COALESCE(_old_plan.name, 'পূর্ববর্তী প্ল্যান'),
            _new_plan.name,
            _proration.days_remaining
        );
        _net_amount := ABS(_net_amount);
    END IF;
    
    -- Create proration item
    INSERT INTO proration_items (
        tenant_id,
        item_type,
        description,
        original_price,
        prorated_amount,
        days_remaining,
        total_days,
        period_start,
        period_end,
        effective_date,
        old_plan_id,
        new_plan_id,
        metadata
    ) VALUES (
        _tenant_id,
        _item_type,
        _description,
        _new_plan.base_price,
        _net_amount,
        _proration.days_remaining,
        _proration.total_days,
        _subscription.current_period_start::DATE,
        _subscription.current_period_end::DATE,
        _effective_date,
        _old_plan_id,
        _new_plan_id,
        jsonb_build_object(
            'old_plan_price', _old_plan.base_price,
            'new_plan_price', _new_plan.base_price,
            'credit_amount', _credit_amount,
            'charge_amount', _charge_amount
        )
    )
    RETURNING id INTO _proration_id;
    
    RETURN _proration_id;
END;
$$;

-- Function to create proration item for addon activation
CREATE OR REPLACE FUNCTION public.create_addon_proration(
    _tenant_id UUID,
    _addon_id UUID,
    _is_activation BOOLEAN DEFAULT true,
    _effective_date DATE DEFAULT CURRENT_DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    _subscription RECORD;
    _addon RECORD;
    _proration RECORD;
    _customer_count INTEGER;
    _addon_price NUMERIC;
    _proration_id UUID;
    _item_type TEXT;
    _description TEXT;
BEGIN
    -- Get current subscription period
    SELECT * INTO _subscription
    FROM tenant_subscriptions
    WHERE tenant_id = _tenant_id AND status = 'active';
    
    IF _subscription IS NULL THEN
        RAISE EXCEPTION 'No active subscription found for tenant';
    END IF;
    
    -- Get addon details
    SELECT * INTO _addon FROM platform_addons WHERE id = _addon_id;
    
    IF _addon IS NULL THEN
        RAISE EXCEPTION 'Addon not found';
    END IF;
    
    -- Get customer count for tiered pricing
    SELECT COUNT(*) INTO _customer_count
    FROM customers
    WHERE tenant_id = _tenant_id AND connection_status = 'active';
    
    -- Calculate addon price
    _addon_price := calculate_addon_price(_addon_id, _customer_count);
    
    -- Calculate proration
    SELECT * INTO _proration
    FROM calculate_proration(
        _addon_price,
        _subscription.current_period_start::DATE,
        _subscription.current_period_end::DATE,
        _effective_date
    );
    
    -- Determine item type and description
    IF _is_activation THEN
        _item_type := 'addon_activation';
        _description := format('%s অ্যাড-অন অ্যাক্টিভেশন - %s দিনের আনুপাতিক চার্জ',
            _addon.name,
            _proration.days_remaining
        );
    ELSE
        _item_type := 'addon_deactivation';
        _description := format('%s অ্যাড-অন ডিঅ্যাক্টিভেশন - %s দিনের ক্রেডিট',
            _addon.name,
            _proration.days_remaining
        );
    END IF;
    
    -- Create proration item
    INSERT INTO proration_items (
        tenant_id,
        item_type,
        description,
        original_price,
        prorated_amount,
        days_remaining,
        total_days,
        period_start,
        period_end,
        effective_date,
        addon_id,
        metadata
    ) VALUES (
        _tenant_id,
        _item_type,
        _description,
        _addon_price,
        _proration.prorated_amount,
        _proration.days_remaining,
        _proration.total_days,
        _subscription.current_period_start::DATE,
        _subscription.current_period_end::DATE,
        _effective_date,
        _addon_id,
        jsonb_build_object(
            'addon_code', _addon.code,
            'pricing_type', _addon.pricing_type,
            'customer_count', _customer_count
        )
    )
    RETURNING id INTO _proration_id;
    
    RETURN _proration_id;
END;
$$;

-- Create index for faster queries
CREATE INDEX idx_proration_items_tenant_id ON public.proration_items(tenant_id);
CREATE INDEX idx_proration_items_status ON public.proration_items(status);
CREATE INDEX idx_proration_items_created_at ON public.proration_items(created_at DESC);