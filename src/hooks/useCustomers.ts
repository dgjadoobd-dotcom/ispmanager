import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";

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
      let query = supabase.from("customers").select("*, package:packages(*)").order("created_at", { ascending: false });
      if (tid) query = query.eq("tenant_id", tid);
      const { data, error } = await query;
      if (error) throw error;
      return data as Customer[];
    },
  });
}

export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*, package:packages(*)").eq("id", customerId).single();
      if (error) throw error;
      return data as Customer;
    },
    enabled: !!customerId,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customer: Partial<Customer>) => {
      const { data, error } = await supabase.from("customers").insert(customer as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Customer> }) => {
      const { data, error } = await supabase.from("customers").update(updates as any).eq("id", id).select().single();
      if (error) throw error;
      return data;
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
      const { error } = await supabase.from("customers").delete().eq("id", customerId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}
