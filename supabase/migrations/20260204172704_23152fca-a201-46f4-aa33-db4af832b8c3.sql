-- Create table for storing push notification subscriptions
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

-- Create index for efficient lookups
CREATE INDEX idx_push_subscriptions_customer ON public.push_subscriptions(customer_id);
CREATE INDEX idx_push_subscriptions_tenant ON public.push_subscriptions(tenant_id);
CREATE INDEX idx_push_subscriptions_active ON public.push_subscriptions(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Customers can manage their own subscriptions
CREATE POLICY "Customers can manage their push subscriptions"
ON public.push_subscriptions
FOR ALL
USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()))
WITH CHECK (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- Staff can view subscriptions in their tenant
CREATE POLICY "Staff can view push subscriptions in their tenant"
ON public.push_subscriptions
FOR SELECT
USING (can_access_tenant(auth.uid(), tenant_id));

-- Create notifications log table
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

-- Create indexes
CREATE INDEX idx_notification_logs_tenant ON public.notification_logs(tenant_id);
CREATE INDEX idx_notification_logs_customer ON public.notification_logs(customer_id);
CREATE INDEX idx_notification_logs_type ON public.notification_logs(notification_type);
CREATE INDEX idx_notification_logs_status ON public.notification_logs(status);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Customers can view their own notifications
CREATE POLICY "Customers can view their notifications"
ON public.notification_logs
FOR SELECT
USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- Staff can view notifications in their tenant
CREATE POLICY "Staff can view notifications in their tenant"
ON public.notification_logs
FOR SELECT
USING (can_access_tenant(auth.uid(), tenant_id));

-- Add trigger for updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();