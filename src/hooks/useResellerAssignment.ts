import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssignableCustomer {
  id: string; name: string; phone: string; reseller_id: string | null;
  connection_status: string; packages: { name: string } | null; current_reseller: string | null;
}

export function useAssignableCustomers(tenantId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["assignableCustomers", tenantId],
    queryFn: async (): Promise<AssignableCustomer[]> => {
      if (!tenantId) return [];
      const { data, error } = await supabase.from("customers").select("id, name, phone, reseller_id, connection_status, packages:package_id(name)").eq("tenant_id", tenantId).order("name");
      if (error) throw error;
      const resellerIds = [...new Set((data || []).filter((c: any) => c.reseller_id).map((c: any) => c.reseller_id!))];
      let resellerMap: Record<string, string> = {};
      if (resellerIds.length > 0) {
        const { data: resellers } = await supabase.from("resellers").select("id, name").in("id", resellerIds);
        resellers?.forEach((r: any) => { resellerMap[r.id] = r.name; });
      }
      return (data || []).map((c: any) => ({ ...c, current_reseller: c.reseller_id ? resellerMap[c.reseller_id] || null : null }));
    },
    enabled: !!tenantId && enabled,
  });
}

export function useAssignCustomers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerIds, resellerId }: { customerIds: string[]; resellerId: string }) => {
      const { error } = await supabase.from("customers").update({ reseller_id: resellerId }).in("id", customerIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resellerCustomers"] });
      queryClient.invalidateQueries({ queryKey: ["assignableCustomers"] });
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
      toast.success("Customers assigned successfully");
    },
    onError: (e: any) => toast.error(e.message || "Failed to assign customers"),
  });
}

export function useUnassignCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase.from("customers").update({ reseller_id: null }).eq("id", customerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resellerCustomers"] });
      queryClient.invalidateQueries({ queryKey: ["assignableCustomers"] });
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
      toast.success("Customer removed from reseller");
    },
    onError: (e: any) => toast.error(e.message || "Failed to remove customer"),
  });
}
