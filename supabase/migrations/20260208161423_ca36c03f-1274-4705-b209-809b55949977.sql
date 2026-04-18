
-- Add reseller branding fields to resellers table
ALTER TABLE public.resellers 
  ADD COLUMN IF NOT EXISTS brand_name text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS primary_color text,
  ADD COLUMN IF NOT EXISTS accent_color text;

-- Add ISP-level reseller branding controls to tenants table
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS allow_reseller_branding boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_reseller_logo boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_reseller_name boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_reseller_theme boolean DEFAULT false;
