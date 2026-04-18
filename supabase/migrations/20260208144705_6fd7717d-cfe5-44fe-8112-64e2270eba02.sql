
-- 1. Add 'reseller' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'reseller';

-- 2. Create resellers table
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
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);

-- 3. Add reseller_id to customers table
ALTER TABLE public.customers ADD COLUMN reseller_id UUID REFERENCES public.resellers(id) ON DELETE SET NULL;

-- 4. Create reseller_commissions table (immutable ledger)
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

-- 5. Create reseller_wallet_transactions table (ledger-based)
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

-- 6. Create index for performance
CREATE INDEX idx_customers_reseller_id ON public.customers(reseller_id);
CREATE INDEX idx_resellers_tenant_id ON public.resellers(tenant_id);
CREATE INDEX idx_resellers_user_id ON public.resellers(user_id);
CREATE INDEX idx_reseller_commissions_reseller ON public.reseller_commissions(reseller_id);
CREATE INDEX idx_reseller_commissions_payment ON public.reseller_commissions(payment_id);
CREATE INDEX idx_reseller_wallet_reseller ON public.reseller_wallet_transactions(reseller_id);

-- 7. Enable RLS on all new tables
ALTER TABLE public.resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 8. Helper function: check if user is a reseller and get reseller_id
CREATE OR REPLACE FUNCTION public.get_reseller_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.resellers
    WHERE user_id = _user_id AND status = 'active'
    LIMIT 1
$$;

-- 9. Helper function: check if user is a reseller
CREATE OR REPLACE FUNCTION public.is_reseller(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.resellers
        WHERE user_id = _user_id AND status = 'active'
    )
$$;

-- 10. RLS Policies for resellers table
CREATE POLICY "ISP staff can manage resellers"
ON public.resellers FOR ALL
USING (
    can_access_tenant(auth.uid(), tenant_id) AND (
        has_role(auth.uid(), 'isp_owner') OR 
        has_role(auth.uid(), 'admin') OR 
        has_role(auth.uid(), 'manager')
    )
);

CREATE POLICY "Resellers can view own record"
ON public.resellers FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all resellers"
ON public.resellers FOR ALL
USING (is_super_admin(auth.uid()));

-- 11. RLS Policies for reseller_commissions table
CREATE POLICY "ISP staff can view all commissions"
ON public.reseller_commissions FOR SELECT
USING (
    can_access_tenant(auth.uid(), tenant_id) AND (
        has_role(auth.uid(), 'isp_owner') OR 
        has_role(auth.uid(), 'admin') OR 
        has_role(auth.uid(), 'manager') OR 
        has_role(auth.uid(), 'accountant')
    )
);

CREATE POLICY "Resellers can view own commissions"
ON public.reseller_commissions FOR SELECT
USING (reseller_id = get_reseller_id(auth.uid()));

CREATE POLICY "Super admins can manage all commissions"
ON public.reseller_commissions FOR ALL
USING (is_super_admin(auth.uid()));

-- Service role inserts commissions (via edge function/trigger), no INSERT policy for users

-- 12. RLS Policies for reseller_wallet_transactions table
CREATE POLICY "ISP staff can view all wallet transactions"
ON public.reseller_wallet_transactions FOR SELECT
USING (
    can_access_tenant(auth.uid(), tenant_id) AND (
        has_role(auth.uid(), 'isp_owner') OR 
        has_role(auth.uid(), 'admin') OR 
        has_role(auth.uid(), 'manager') OR 
        has_role(auth.uid(), 'accountant')
    )
);

CREATE POLICY "ISP owners can insert wallet adjustments"
ON public.reseller_wallet_transactions FOR INSERT
WITH CHECK (
    can_access_tenant(auth.uid(), tenant_id) AND (
        has_role(auth.uid(), 'isp_owner') OR 
        has_role(auth.uid(), 'admin')
    )
);

CREATE POLICY "Resellers can view own wallet transactions"
ON public.reseller_wallet_transactions FOR SELECT
USING (reseller_id = get_reseller_id(auth.uid()));

CREATE POLICY "Super admins can manage all wallet transactions"
ON public.reseller_wallet_transactions FOR ALL
USING (is_super_admin(auth.uid()));

-- 13. Update customers RLS to allow reseller access to their assigned customers
CREATE POLICY "Resellers can view their assigned customers"
ON public.customers FOR SELECT
USING (reseller_id = get_reseller_id(auth.uid()));

CREATE POLICY "Resellers can update their assigned customers"
ON public.customers FOR UPDATE
USING (reseller_id = get_reseller_id(auth.uid()));

-- 14. Allow resellers to view bills and payments for their customers
CREATE POLICY "Resellers can view bills for their customers"
ON public.bills FOR SELECT
USING (customer_id IN (
    SELECT id FROM public.customers WHERE reseller_id = get_reseller_id(auth.uid())
));

CREATE POLICY "Resellers can view payments for their customers"
ON public.payments FOR SELECT
USING (customer_id IN (
    SELECT id FROM public.customers WHERE reseller_id = get_reseller_id(auth.uid())
));

CREATE POLICY "Resellers can insert payments for their customers"
ON public.payments FOR INSERT
WITH CHECK (
    customer_id IN (
        SELECT id FROM public.customers WHERE reseller_id = get_reseller_id(auth.uid())
    )
);

-- 15. Allow resellers to view packages in their tenant
CREATE POLICY "Resellers can view packages"
ON public.packages FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM public.resellers WHERE user_id = auth.uid()
    )
);

-- 16. Trigger for updated_at on resellers
CREATE TRIGGER update_resellers_updated_at
    BEFORE UPDATE ON public.resellers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 17. Function to calculate and record commission on payment
CREATE OR REPLACE FUNCTION public.calculate_reseller_commission(
    _payment_id UUID,
    _tenant_id UUID,
    _customer_id UUID,
    _payment_amount NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _reseller RECORD;
    _commission_amount NUMERIC := 0;
    _current_balance NUMERIC := 0;
BEGIN
    -- Find the reseller for this customer
    SELECT r.* INTO _reseller
    FROM public.resellers r
    JOIN public.customers c ON c.reseller_id = r.id
    WHERE c.id = _customer_id AND r.status = 'active';
    
    IF _reseller IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate commission
    IF _reseller.commission_type = 'percentage' THEN
        _commission_amount := ROUND(_payment_amount * _reseller.commission_value / 100, 2);
    ELSIF _reseller.commission_type = 'flat' THEN
        _commission_amount := _reseller.commission_value;
    ELSIF _reseller.commission_type = 'per_payment' THEN
        _commission_amount := _reseller.commission_value;
    END IF;
    
    IF _commission_amount <= 0 THEN
        RETURN 0;
    END IF;
    
    -- Record commission
    INSERT INTO public.reseller_commissions (
        tenant_id, reseller_id, payment_id, customer_id,
        payment_amount, commission_type, commission_value, commission_amount
    ) VALUES (
        _tenant_id, _reseller.id, _payment_id, _customer_id,
        _payment_amount, _reseller.commission_type, _reseller.commission_value, _commission_amount
    );
    
    -- Get current wallet balance
    SELECT COALESCE(
        (SELECT balance_after FROM public.reseller_wallet_transactions
         WHERE reseller_id = _reseller.id ORDER BY created_at DESC LIMIT 1),
        0
    ) INTO _current_balance;
    
    -- Add wallet transaction
    INSERT INTO public.reseller_wallet_transactions (
        tenant_id, reseller_id, type, amount, balance_after, description, reference_id
    ) VALUES (
        _tenant_id, _reseller.id, 'commission', _commission_amount,
        _current_balance + _commission_amount,
        format('পেমেন্ট কমিশন - ৳%s এর %s', _payment_amount, 
            CASE _reseller.commission_type 
                WHEN 'percentage' THEN _reseller.commission_value || '%'
                WHEN 'flat' THEN '৳' || _reseller.commission_value
                ELSE '৳' || _reseller.commission_value || '/পেমেন্ট'
            END
        ),
        _payment_id
    );
    
    RETURN _commission_amount;
END;
$$;
