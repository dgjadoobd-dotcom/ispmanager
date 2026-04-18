import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dbGet, dbUpdate, dbDelete, now, TABLES } from "@/lib/db";
import { useTenantContext } from "@/contexts/TenantContext";
import type { Tenant } from "@/contexts/TenantContext";

export type { Tenant };
export type TenantWithStats = Tenant & {
  customer_count?: number;
  owner_name?: string;
  owner_email?: string;
  subscription_status?: string;
};

export function useAllTenants() {
  return useQuery({
    queryKey: ["allTenants"],
    queryFn: (): TenantWithStats[] => {
      // In local mode, return the single local tenant
      const customers = dbGet<any>(TABLES.customers);
      const tenantCustomers = customers.filter((c: any) => c.tenant_id === "00000000-0000-0000-0000-000000000001");
      const stored = dbGet<any>(TABLES.tenants);
      const base: TenantWithStats = stored[0] ?? {
        id: "00000000-0000-0000-0000-000000000001", name: "My ISP", subdomain: "local",
        logo_url: null, primary_color: null, created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(), is_active: true, plan: "pro",
        plan_expires_at: null, owner_id: "local-super-admin-001",
        contact_email: "admin@ispmanager.local", contact_phone: null,
        address: null, currency: "USD", timezone: "UTC", language: "en",
        subscription_status: "active",
      };
      return [{ ...base, customer_count: tenantCustomers.length, owner_name: "Super Admin", owner_email: "admin@ispmanager.local" }];
    },
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platformStats"],
    queryFn: () => {
      const customers = dbGet<any>(TABLES.customers);
      const activeConnections = customers.filter((c: any) => c.connection_status === "active").length;
      return {
        totalTenants: 1,
        activeSubscriptions: 1,
        trialTenants: 0,
        suspendedTenants: 0,
        totalEndUsers: customers.length,
        activeConnections,
      };
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  const { setCurrentTenant, currentTenant } = useTenantContext();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tenant> }) => {
      if (currentTenant) {
        const updated = { ...currentTenant, ...updates, updated_at: now() };
        setCurrentTenant(updated);
        return updated;
      }
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTenants"] });
      queryClient.invalidateQueries({ queryKey: ["platformStats"] });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_tenantId: string) => {
      // Cannot delete the only local tenant
      throw new Error("Cannot delete the local tenant");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTenants"] });
    },
  });
}
