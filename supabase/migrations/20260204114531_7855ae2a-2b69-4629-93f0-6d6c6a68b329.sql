-- Create enum for network provider types
CREATE TYPE public.network_provider_type AS ENUM ('mikrotik', 'radius', 'custom');

-- Create enum for sync action types
CREATE TYPE public.network_sync_action AS ENUM ('enable', 'disable', 'update_speed', 'create', 'delete', 'test_connection');

-- Create enum for sync status
CREATE TYPE public.network_sync_status AS ENUM ('pending', 'in_progress', 'success', 'failed', 'retrying');

-- Create enum for sync mode
CREATE TYPE public.network_sync_mode AS ENUM ('manual', 'scheduled', 'event_driven');

-- Network integration settings per tenant
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

-- Network sync logs
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

-- Network sync queue
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

-- Add customer network identifier columns
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS network_username TEXT,
ADD COLUMN IF NOT EXISTS network_password_encrypted TEXT,
ADD COLUMN IF NOT EXISTS last_network_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS network_sync_status network_sync_status;

-- Enable RLS
ALTER TABLE public.network_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for network_integrations
CREATE POLICY "ISP owners can manage their network integrations"
ON public.network_integrations FOR ALL
USING (can_access_tenant(auth.uid(), tenant_id) AND has_role(auth.uid(), 'isp_owner'));

CREATE POLICY "Staff can view network integrations"
ON public.network_integrations FOR SELECT
USING (can_access_tenant(auth.uid(), tenant_id) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'staff')));

CREATE POLICY "Super admins can view all network integrations"
ON public.network_integrations FOR SELECT
USING (is_super_admin(auth.uid()));

-- RLS Policies for network_sync_logs
CREATE POLICY "Tenant staff can view their sync logs"
ON public.network_sync_logs FOR SELECT
USING (can_access_tenant(auth.uid(), tenant_id));

CREATE POLICY "Super admins can view all sync logs"
ON public.network_sync_logs FOR SELECT
USING (is_super_admin(auth.uid()));

-- RLS Policies for network_sync_queue
CREATE POLICY "Tenant staff can manage their sync queue"
ON public.network_sync_queue FOR ALL
USING (can_access_tenant(auth.uid(), tenant_id));

CREATE POLICY "Super admins can view all sync queues"
ON public.network_sync_queue FOR SELECT
USING (is_super_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_network_integrations_tenant ON public.network_integrations(tenant_id);
CREATE INDEX idx_network_sync_logs_tenant ON public.network_sync_logs(tenant_id);
CREATE INDEX idx_network_sync_logs_customer ON public.network_sync_logs(customer_id);
CREATE INDEX idx_network_sync_logs_created ON public.network_sync_logs(created_at DESC);
CREATE INDEX idx_network_sync_queue_tenant ON public.network_sync_queue(tenant_id);
CREATE INDEX idx_network_sync_queue_status ON public.network_sync_queue(status, scheduled_at);

-- Update timestamp trigger
CREATE TRIGGER update_network_integrations_updated_at
    BEFORE UPDATE ON public.network_integrations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();