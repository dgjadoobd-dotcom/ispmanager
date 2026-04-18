import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHasMikrotikIntegration(tenantId?: string) {
  return useQuery({
    queryKey: ["has-mikrotik-integration", tenantId],
    queryFn: async () => {
      if (!tenantId) return false;
      const { data, error } = await supabase.from("network_integrations").select("id").eq("tenant_id", tenantId).eq("provider_type", "mikrotik").eq("is_enabled", true).limit(1);
      if (error) throw error;
      return (data?.length ?? 0) > 0;
    },
    enabled: !!tenantId,
  });
}
