-- Create enum for API key scope
CREATE TYPE public.api_key_scope AS ENUM ('read_only', 'read_write');

-- Create table for API keys
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

-- Create table for API request logs
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

-- Add api_enabled column to tenants table
ALTER TABLE public.tenants ADD COLUMN api_enabled BOOLEAN DEFAULT false;

-- Enable RLS on api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Enable RLS on api_logs  
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for api_keys: Only ISP owners can manage
CREATE POLICY "ISP owners can manage their API keys"
ON public.api_keys
FOR ALL
USING (
    can_access_tenant(auth.uid(), tenant_id) 
    AND has_role(auth.uid(), 'isp_owner'::app_role)
);

-- Super admins can view all API keys
CREATE POLICY "Super admins can view all API keys"
ON public.api_keys
FOR SELECT
USING (is_super_admin(auth.uid()));

-- RLS policies for api_logs: ISP owners can view their logs
CREATE POLICY "ISP owners can view their API logs"
ON public.api_logs
FOR SELECT
USING (
    can_access_tenant(auth.uid(), tenant_id)
    AND has_role(auth.uid(), 'isp_owner'::app_role)
);

-- Super admins can view all API logs
CREATE POLICY "Super admins can view all API logs"
ON public.api_logs
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_api_keys_tenant_id ON public.api_keys(tenant_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_logs_tenant_id ON public.api_logs(tenant_id);
CREATE INDEX idx_api_logs_created_at ON public.api_logs(created_at);
CREATE INDEX idx_api_logs_api_key_id ON public.api_logs(api_key_id);

-- Function to validate API key and return tenant info
CREATE OR REPLACE FUNCTION public.validate_api_key(_key_hash TEXT)
RETURNS TABLE (
    tenant_id UUID,
    api_key_id UUID,
    scope api_key_scope,
    is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ak.tenant_id,
        ak.id as api_key_id,
        ak.scope,
        (ak.is_active = true 
         AND ak.revoked_at IS NULL 
         AND (ak.expires_at IS NULL OR ak.expires_at > now())
         AND t.api_enabled = true) as is_valid
    FROM public.api_keys ak
    JOIN public.tenants t ON t.id = ak.tenant_id
    WHERE ak.key_hash = _key_hash
    LIMIT 1;
END;
$$;

-- Function to update last_used_at timestamp
CREATE OR REPLACE FUNCTION public.update_api_key_last_used(_api_key_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.api_keys
    SET last_used_at = now()
    WHERE id = _api_key_id;
END;
$$;

-- Function to log API request
CREATE OR REPLACE FUNCTION public.log_api_request(
    _tenant_id UUID,
    _api_key_id UUID,
    _endpoint TEXT,
    _method TEXT,
    _status_code INTEGER,
    _request_ip TEXT DEFAULT NULL,
    _user_agent TEXT DEFAULT NULL,
    _response_time_ms INTEGER DEFAULT NULL,
    _error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _log_id UUID;
BEGIN
    INSERT INTO public.api_logs (
        tenant_id, api_key_id, endpoint, method, status_code,
        request_ip, user_agent, response_time_ms, error_message
    ) VALUES (
        _tenant_id, _api_key_id, _endpoint, _method, _status_code,
        _request_ip, _user_agent, _response_time_ms, _error_message
    )
    RETURNING id INTO _log_id;
    
    RETURN _log_id;
END;
$$;