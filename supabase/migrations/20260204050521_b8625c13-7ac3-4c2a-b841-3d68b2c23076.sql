-- Allow customers to view their own record via user_id
CREATE POLICY "Customers can view their own data"
ON public.customers
FOR SELECT
USING (user_id = auth.uid());

-- Allow customers to update their own record via user_id
CREATE POLICY "Customers can update their own data"
ON public.customers
FOR UPDATE
USING (user_id = auth.uid());

-- Allow customers to view their own bills
CREATE POLICY "Customers can view their own bills"
ON public.bills
FOR SELECT
USING (
  customer_id IN (
    SELECT id FROM public.customers WHERE user_id = auth.uid()
  )
);

-- Allow customers to view their own payments
CREATE POLICY "Customers can view their own payments"
ON public.payments
FOR SELECT
USING (
  customer_id IN (
    SELECT id FROM public.customers WHERE user_id = auth.uid()
  )
);

-- Allow customers to view packages (needed for portal display)
CREATE POLICY "Customers can view packages"
ON public.packages
FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.customers WHERE user_id = auth.uid()
  )
);