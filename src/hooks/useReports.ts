import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";
import { subMonths, format } from "date-fns";

export function useReports() {
  const { currentTenant } = useTenantContext();
  const currentTenantId = currentTenant?.id;

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["reports-customers", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const { data, error } = await supabase.from("customers").select("id, name, connection_status, due_balance, advance_balance, join_date, package_id").eq("tenant_id", currentTenantId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenantId,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["reports-payments", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const sixMonthsAgo = format(subMonths(new Date(), 6), "yyyy-MM-dd");
      const { data, error } = await supabase.from("payments").select("id, amount, method, created_at, customer_id").eq("tenant_id", currentTenantId).gte("created_at", sixMonthsAgo).order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenantId,
  });

  const { data: bills, isLoading: billsLoading } = useQuery({
    queryKey: ["reports-bills", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const sixMonthsAgo = format(subMonths(new Date(), 6), "yyyy-MM-dd");
      const { data, error } = await supabase.from("bills").select("id, amount, status, due_date, created_at, customer_id").eq("tenant_id", currentTenantId).gte("created_at", sixMonthsAgo).order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenantId,
  });

  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ["reports-packages", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const { data, error } = await supabase.from("packages").select("id, name, monthly_price, speed_label, is_active").eq("tenant_id", currentTenantId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenantId,
  });

  return { customers, payments, bills, packages, isLoading: customersLoading || paymentsLoading || billsLoading || packagesLoading };
}
