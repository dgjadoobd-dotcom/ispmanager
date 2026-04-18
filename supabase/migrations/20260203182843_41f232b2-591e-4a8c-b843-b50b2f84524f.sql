-- Drop and recreate the onboard_tenant function with proper permissions
-- The function uses SECURITY DEFINER so it runs as the function owner, not the caller
-- This should bypass RLS, but we need to ensure it works correctly

DROP FUNCTION IF EXISTS public.onboard_tenant(text, text, uuid);

CREATE OR REPLACE FUNCTION public.onboard_tenant(
    _tenant_name text,
    _subdomain text,
    _user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    _tenant_id uuid;
BEGIN
    -- Create the tenant (SECURITY DEFINER bypasses RLS)
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.onboard_tenant(text, text, uuid) TO authenticated;