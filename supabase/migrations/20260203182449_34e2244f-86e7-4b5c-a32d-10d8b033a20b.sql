-- Create function for tenant onboarding (bypasses RLS)
CREATE OR REPLACE FUNCTION public.onboard_tenant(
    _tenant_name text,
    _subdomain text,
    _user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _tenant_id uuid;
BEGIN
    -- Create the tenant
    INSERT INTO public.tenants (name, subdomain)
    VALUES (_tenant_name, _subdomain)
    RETURNING id INTO _tenant_id;

    -- Update the user's profile with the tenant_id
    UPDATE public.profiles
    SET tenant_id = _tenant_id
    WHERE id = _user_id;

    -- Assign isp_owner role to the user
    INSERT INTO public.user_roles (user_id, role, tenant_id)
    VALUES (_user_id, 'isp_owner', _tenant_id);

    RETURN _tenant_id;
END;
$$;

-- Function to get user's primary role for a tenant
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.user_roles
    WHERE user_id = _user_id
    ORDER BY 
        CASE role
            WHEN 'super_admin' THEN 1
            WHEN 'isp_owner' THEN 2
            WHEN 'admin' THEN 3
            WHEN 'manager' THEN 4
            WHEN 'accountant' THEN 5
            WHEN 'staff' THEN 6
            WHEN 'marketing' THEN 7
            WHEN 'member' THEN 8
        END
    LIMIT 1
$$;

-- Function to check if user is ISP staff (can access dashboard)
CREATE OR REPLACE FUNCTION public.is_isp_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id
        AND role IN ('super_admin', 'isp_owner', 'admin', 'manager', 'staff', 'accountant', 'marketing')
    )
$$;