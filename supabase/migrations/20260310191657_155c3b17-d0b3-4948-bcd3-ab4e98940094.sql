
-- FIX 1: Prevent users from changing their own tenant_id
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND (
    tenant_id IS NOT DISTINCT FROM (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
  )
);

-- FIX 2: Prevent ISP owners from escalating to super_admin
DROP POLICY IF EXISTS "ISP owners can manage roles in their tenant" ON public.user_roles;

CREATE POLICY "ISP owners can manage roles in their tenant"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'isp_owner'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND role != 'super_admin'::app_role
)
WITH CHECK (
  has_role(auth.uid(), 'isp_owner'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND role != 'super_admin'::app_role
);
