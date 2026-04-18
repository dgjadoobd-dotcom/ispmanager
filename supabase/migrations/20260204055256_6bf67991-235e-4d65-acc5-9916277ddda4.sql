-- Add Resend API key column to tenants table for email sending
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS resend_api_key TEXT DEFAULT NULL;

-- Add verified sender email column
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS sender_email TEXT DEFAULT NULL;

COMMENT ON COLUMN public.tenants.resend_api_key IS 'Resend API key for sending transactional emails like invoices';
COMMENT ON COLUMN public.tenants.sender_email IS 'Verified sender email address for Resend';