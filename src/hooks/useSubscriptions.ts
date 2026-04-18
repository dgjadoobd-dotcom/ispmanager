import { useQuery } from "@tanstack/react-query";
import { dbGet, TABLES } from "@/lib/db";

export type SubscriptionWithTenant = {
  id: string; tenant_id: string; tenant_name: string; subdomain: string;
  subscription_status: "active" | "trial" | "suspended"; customer_count: number; created_at: string;
};

export function useAllSubscriptions() {
  return useQuery({
    queryKey: ["allSubscriptions"],
    queryFn: (): SubscriptionWithTenant[] => {
      const customers = dbGet<any>(TABLES.customers);
      return [{
        id: "00000000-0000-0000-0000-000000000001", tenant_id: "00000000-0000-0000-0000-000000000001",
        tenant_name: "My ISP", subdomain: "local",
        subscription_status: "active",
        customer_count: customers.filter((c: any) => c.tenant_id === "00000000-0000-0000-0000-000000000001").length,
        created_at: new Date().toISOString(),
      }];
    },
  });
}

export function useSubscriptionStats() {
  return useQuery({
    queryKey: ["subscriptionStats"],
    queryFn: () => ({ active: 1, trial: 0, suspended: 0, total: 1 }),
  });
}
