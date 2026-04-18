-- Create storage bucket for tenant assets (logos, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant-assets',
  'tenant-assets',
  true,
  2097152, -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view tenant assets (public bucket)
CREATE POLICY "Public read access for tenant assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'tenant-assets');

-- Policy: ISP owners can upload to their own tenant folder
CREATE POLICY "ISP owners can upload their tenant assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'tenant-assets' 
  AND (storage.foldername(name))[1] = (
    SELECT id::text FROM public.tenants 
    WHERE id = public.user_tenant_id(auth.uid())
  )
  AND public.has_role(auth.uid(), 'isp_owner'::app_role)
);

-- Policy: ISP owners can update their own tenant assets
CREATE POLICY "ISP owners can update their tenant assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'tenant-assets'
  AND (storage.foldername(name))[1] = (
    SELECT id::text FROM public.tenants 
    WHERE id = public.user_tenant_id(auth.uid())
  )
  AND public.has_role(auth.uid(), 'isp_owner'::app_role)
);

-- Policy: ISP owners can delete their own tenant assets
CREATE POLICY "ISP owners can delete their tenant assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'tenant-assets'
  AND (storage.foldername(name))[1] = (
    SELECT id::text FROM public.tenants 
    WHERE id = public.user_tenant_id(auth.uid())
  )
  AND public.has_role(auth.uid(), 'isp_owner'::app_role)
);