import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";
import { dbGet, dbInsert, dbUpdate, dbDelete, now, TABLES } from "@/lib/db";

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  package_id: string | null;
  reseller_id: string | null;
  connection_status: "active" | "suspended" | "pending";
  due_balance: number;
  advance_balance: number;
  join_date: string | null;
  last_payment_date: string | null;
  network_username: string | null;
  network_password_encrypted: string | null;
  network_sync_status: string | null;
  last_network_sync_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  package?: { id: string; name: string; speed_label: string; monthly_price: number } | null;
}

export function useCustomers(tenantId?: string) {
  const { currentTenant } = useTenantContext();
  const tid = tenantId ?? currentTenant?.id;
  return useQuery({
    queryKey: ["customers", tid],
    queryFn: async () => {
      // Try Supabase first
      try {
        let query = supabase.from("customers").select("*, package:packages(*)").order("created_at", { ascending: false });
        if (tid) query = query.eq("tenant_id", tid);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Customer[];
      } catch {}
      // Fallback to localStorage
      const packages = dbGet<any>(TABLES.packages);
      const customers = dbGet<Customer>(TABLES.customers)
        .filter(c => !tid || c.tenant_id === tid)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return customers.map(c => ({
        ...c,
        package: packages.find(p => p.id === c.package_id) ?? null,
      }));
    },
    enabled: !!tid,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("customers").select("*, package:packages(*)").eq("id", customerId).single();
        if (!error && data) return data as Customer;
      } catch {}
      const packages = dbGet<any>(TABLES.packages);
      const c = dbGet<Customer>(TABLES.customers).find(c => c.id === customerId) ?? null;
      if (!c) return null;
      return { ...c, package: packages.find((p: any) => p.id === c.package_id) ?? null } as Customer;
    },
    enabled: !!customerId,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customer: Partial<Customer>) => {
      try {
        const { data, error } = await supabase.from("customers").insert(customer as any).select().single();
        if (!error && data) return data;
      } catch {}
      return dbInsert<Customer>(TABLES.customers, { ...customer, updated_at: now() } as any);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Customer> }) => {
      try {
        const { data, error } = await supabase.from("customers").update(updates as any).eq("id", id).select().single();
        if (!error && data) return data;
      } catch {}
      return dbUpdate<Customer>(TABLES.customers, id, { ...updates, updated_at: now() });
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", v.id] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customerId: string) => {
      try {
        const { error } = await supabase.from("customers").delete().eq("id", customerId);
        if (!error) return;
      } catch {}
      dbDelete(TABLES.customers, customerId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}
