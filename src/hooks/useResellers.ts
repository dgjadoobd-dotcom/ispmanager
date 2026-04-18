import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";
import { toast } from "sonner";

export interface Reseller {
  id: string; tenant_id: string; user_id: string; name: string; phone: string;
  email: string | null; address: string | null; status: string;
  commission_type: string; commission_value: number; notes: string | null;
  brand_name?: string | null; logo_url?: string | null;
  primary_color?: string | null; accent_color?: string | null;
  created_at: string; updated_at: string;
  customer_count?: number; total_commission?: number; wallet_balance?: number;
}

export interface ResellerFormData {
  name: string; phone: string; email?: string; address?: string;
  commission_type: string; commission_value: number; notes?: string;
}

export function useResellers() {
  const { currentTenant } = useTenantContext();
  const tenantId = currentTenant?.id;
  return useQuery({
    queryKey: ["resellers", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase.from("resellers").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
      if (error) throw error;
      return await Promise.all((data || []).map(async (r: any) => {
        const { count } = await supabase.from("customers").select("*", { count: "exact", head: true }).eq("reseller_id", r.id);
        const { data: comms } = await supabase.from("reseller_commissions").select("commission_amount").eq("reseller_id", r.id);
        const { data: wallet } = await supabase.from("reseller_wallet_transactions").select("balance_after").eq("reseller_id", r.id).order("created_at", { ascending: false }).limit(1);
        return { ...r, customer_count: count || 0, total_commission: comms?.reduce((s: number, c: any) => s + Number(c.commission_amount), 0) || 0, wallet_balance: wallet?.[0]?.balance_after || 0 } as Reseller;
      }));
    },
    enabled: !!tenantId,
  });
}

export function useReseller(id: string | undefined) {
  return useQuery({
    queryKey: ["reseller", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("resellers").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Reseller;
    },
    enabled: !!id,
  });
}

export function useCreateReseller() {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantContext();
  return useMutation({
    mutationFn: async (data: ResellerFormData & { user_email?: string; user_password?: string }) => {
      const tenantId = currentTenant?.id;
      if (!tenantId) throw new Error("No tenant");
      const { data: reseller, error } = await supabase.from("resellers").insert({
        tenant_id: tenantId, user_id: crypto.randomUUID(),
        name: data.name, phone: data.phone, email: data.email ?? null,
        address: data.address ?? null, status: "active",
        commission_type: data.commission_type, commission_value: data.commission_value,
        notes: data.notes ?? null,
      }).select().single();
      if (error) throw error;
      return reseller;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["resellers"] }); toast.success("Reseller created successfully"); },
    onError: (e: any) => toast.error(e.message || "Failed to create reseller"),
  });
}

export function useUpdateReseller() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ResellerFormData> & { id: string }) => {
      const { data: reseller, error } = await supabase.from("resellers").update(data).eq("id", id).select().single();
      if (error) throw error;
      return reseller;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["resellers"] }); toast.success("Reseller updated"); },
    onError: (e: any) => toast.error(e.message || "Update failed"),
  });
}

export function useToggleResellerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("resellers").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["resellers"] }); toast.success("Status updated"); },
  });
}

export function useResellerCommissions(resellerId: string | undefined) {
  return useQuery({
    queryKey: ["resellerCommissions", resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      const { data, error } = await supabase.from("reseller_commissions").select("*, customers:customer_id(name, phone)").eq("reseller_id", resellerId).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!resellerId,
  });
}

export function useResellerWallet(resellerId: string | undefined) {
  return useQuery({
    queryKey: ["resellerWallet", resellerId],
    queryFn: async () => {
      if (!resellerId) return { balance: 0, transactions: [] };
      const { data, error } = await supabase.from("reseller_wallet_transactions").select("*").eq("reseller_id", resellerId).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return { balance: Number(data?.[0]?.balance_after || 0), transactions: data || [] };
    },
    enabled: !!resellerId,
  });
}

export function useResellerCustomers(resellerId: string | undefined) {
  return useQuery({
    queryKey: ["resellerCustomers", resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      const { data, error } = await supabase.from("customers").select("*, packages:package_id(name, speed_label, monthly_price)").eq("reseller_id", resellerId).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!resellerId,
  });
}

export function useAddWalletAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ resellerId, tenantId, amount, description }: { resellerId: string; tenantId: string; amount: number; description: string }) => {
      const { data: lastTx } = await supabase.from("reseller_wallet_transactions").select("balance_after").eq("reseller_id", resellerId).order("created_at", { ascending: false }).limit(1);
      const currentBalance = Number(lastTx?.[0]?.balance_after || 0);
      const { error } = await supabase.from("reseller_wallet_transactions").insert({ tenant_id: tenantId, reseller_id: resellerId, type: "adjustment", amount, balance_after: currentBalance + amount, description, created_by: null });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["resellerWallet"] }); queryClient.invalidateQueries({ queryKey: ["resellers"] }); toast.success("Wallet adjustment successful"); },
    onError: (e: any) => toast.error(e.message || "Adjustment failed"),
  });
}
