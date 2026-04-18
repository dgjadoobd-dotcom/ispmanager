import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useResellerImpersonation } from "@/contexts/ResellerImpersonationContext";

export function useActiveResellerId() {
  const { user } = useAuth();
  const { impersonatedResellerId, isImpersonatingReseller } = useResellerImpersonation();

  const selfQuery = useQuery({
    queryKey: ["resellerSelf", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from("resellers").select("*").eq("user_id", user.id).single();
      return data || null;
    },
    enabled: !!user?.id && !isImpersonatingReseller,
  });

  const impersonatedQuery = useQuery({
    queryKey: ["resellerById", impersonatedResellerId],
    queryFn: async () => {
      if (!impersonatedResellerId) return null;
      const { data } = await supabase.from("resellers").select("*").eq("id", impersonatedResellerId).single();
      return data || null;
    },
    enabled: !!impersonatedResellerId,
  });

  if (isImpersonatingReseller) return { data: impersonatedQuery.data, isLoading: impersonatedQuery.isLoading };
  return { data: selfQuery.data, isLoading: selfQuery.isLoading };
}

export function useResellerSelf() { return useActiveResellerId(); }

export function useResellerSelfCustomers(resellerId: string | undefined) {
  return useQuery({
    queryKey: ["resellerSelfCustomers", resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      const { data, error } = await supabase.from("customers").select("*, packages:package_id(name, speed_label, monthly_price)").eq("reseller_id", resellerId).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!resellerId,
  });
}

export function useResellerSelfPayments(resellerId: string | undefined) {
  return useQuery({
    queryKey: ["resellerSelfPayments", resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      const { data: customers } = await supabase.from("customers").select("id").eq("reseller_id", resellerId);
      if (!customers?.length) return [];
      const { data, error } = await supabase.from("payments").select("*, customers:customer_id(name, phone)").in("customer_id", customers.map((c: any) => c.id)).order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data || [];
    },
    enabled: !!resellerId,
  });
}

export function useResellerSelfWallet(resellerId: string | undefined) {
  return useQuery({
    queryKey: ["resellerSelfWallet", resellerId],
    queryFn: async () => {
      if (!resellerId) return { balance: 0, transactions: [] };
      const { data, error } = await supabase.from("reseller_wallet_transactions").select("*").eq("reseller_id", resellerId).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return { balance: Number(data?.[0]?.balance_after || 0), transactions: data || [] };
    },
    enabled: !!resellerId,
  });
}

export function useResellerSelfCommissions(resellerId: string | undefined) {
  return useQuery({
    queryKey: ["resellerSelfCommissions", resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      const { data, error } = await supabase.from("reseller_commissions").select("*, customers:customer_id(name, phone)").eq("reseller_id", resellerId).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!resellerId,
  });
}

export function useResellerSelfStats(resellerId: string | undefined) {
  return useQuery({
    queryKey: ["resellerSelfStats", resellerId],
    queryFn: async () => {
      if (!resellerId) return { totalCustomers: 0, activeCustomers: 0, totalDue: 0, monthlyCollection: 0 };
      const { data: customers } = await supabase.from("customers").select("id, connection_status, due_balance").eq("reseller_id", resellerId);
      const totalCustomers = customers?.length || 0;
      const activeCustomers = customers?.filter((c: any) => c.connection_status === "active").length || 0;
      const totalDue = customers?.reduce((s: number, c: any) => s + Number(c.due_balance || 0), 0) || 0;
      const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
      const customerIds = customers?.map((c: any) => c.id) || [];
      let monthlyCollection = 0;
      if (customerIds.length > 0) {
        const { data: payments } = await supabase.from("payments").select("amount").in("customer_id", customerIds).gte("created_at", startOfMonth.toISOString());
        monthlyCollection = payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0;
      }
      return { totalCustomers, activeCustomers, totalDue, monthlyCollection };
    },
    enabled: !!resellerId,
  });
}
