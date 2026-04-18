import { useQuery } from "@tanstack/react-query";
import { dbGet, TABLES } from "@/lib/db";
import { useTenantContext } from "@/contexts/TenantContext";

export function useNetworkSyncQueue(limit = 20) {
  const { currentTenant } = useTenantContext();
  return useQuery({
    queryKey: ["network-sync-queue", currentTenant?.id, limit],
    queryFn: () => {
      if (!currentTenant?.id) return [];
      const customers = dbGet<any>(TABLES.customers);
      const integrations = dbGet<any>(TABLES.network_integrations);
      // network_sync_queue not in TABLES — return empty for now (no queue in local mode)
      return [];
    },
    enabled: !!currentTenant?.id,
  });
}
