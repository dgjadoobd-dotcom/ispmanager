import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTenantContext } from "@/contexts/TenantContext";
import type { Tenant } from "@/contexts/TenantContext";

export type { Tenant };

export function useCurrentTenant() {
  const { user } = useAuth();
  const { currentTenant } = useTenantContext();

  return useQuery({
    queryKey: ["currentTenant", user?.id],
    queryFn: async () => {
      // Return the local tenant from context (already loaded)
      return currentTenant;
    },
    enabled: !!user?.id,
    staleTime: Infinity,
  });
}

export function useUserRoles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["userRoles", user?.id],
    queryFn: () => user ? [{ role: user.role, tenant_id: "00000000-0000-0000-0000-000000000001" }] : [],
    enabled: !!user?.id,
  });
}

export function useIsSuperAdmin() {
  const { data: roles } = useUserRoles();
  return roles?.some((r) => r.role === "super_admin") ?? false;
}
