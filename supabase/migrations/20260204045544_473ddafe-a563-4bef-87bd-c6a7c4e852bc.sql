-- Add UddoktaPay configuration columns to tenants table
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS uddoktapay_api_key text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS uddoktapay_base_url text DEFAULT 'https://sandbox.uddoktapay.com';