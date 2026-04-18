
-- Trigger that automatically calculates reseller commission after a payment is inserted
CREATE OR REPLACE FUNCTION public.trigger_reseller_commission_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Call the existing calculate_reseller_commission function
    PERFORM public.calculate_reseller_commission(
        NEW.id,
        NEW.tenant_id,
        NEW.customer_id,
        NEW.amount
    );
    RETURN NEW;
END;
$$;

-- Create trigger on payments table
CREATE TRIGGER trg_reseller_commission_after_payment
AFTER INSERT ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.trigger_reseller_commission_on_payment();
