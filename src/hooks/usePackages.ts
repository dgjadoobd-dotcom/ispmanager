import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";

export interface Package {
  id: string;
  tenant_id: string;
  name: string;
  speed_label: string;
  monthly_price: number;
  is_active: boolean;
  validity_days: number | null;
  mikrotik_profile_name: string | null;
  mikrotik_rate_limit: string | null;
  mikrotik_address_pool: string | null;
  mikrotik_queue_type: string | null;
  created_at: string;
  updated_at: string;
}

export function usePackages(tenantId?: string) {
  const { currentTenant } = useTenantContext();
  const tid = tenantId ?? currentTenant?.id;
  return useQuery({
    queryKey: ["packages", tid],
    queryFn: async () => {
      let query = supabase.from("packages").select("*").order("monthly_price", { ascending: true });
      if (tid) query = query.eq("tenant_id", tid);
      const { data, error } = await query;
      if (error) throw error;
      return data as Package[];
    },
  });
}

export function useCreatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pkg: Partial<Package>) => {
      const { data, error } = await supabase.from("packages").insert(pkg as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["packages"] }),
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Package> }) => {
      const { data, error } = await supabase.from("packages").update(updates as any).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["packages"] }),
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (packageId: string) => {
      const { error } = await supabase.from("packages").delete().eq("id", packageId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["packages"] }),
  });
}
