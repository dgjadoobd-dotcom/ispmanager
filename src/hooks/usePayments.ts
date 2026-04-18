import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";

export interface Payment {
  id: string;
  tenant_id: string;
  customer_id: string;
  bill_id: string | null;
  amount: number;
  method: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  customer?: { id: string; name: string; phone: string } | null;
  bill?: { id: string; amount: number; status: string } | null;
}

export function usePayments(tenantId?: string) {
  const { currentTenant } = useTenantContext();
  const tid = tenantId ?? currentTenant?.id;
  return useQuery({
    queryKey: ["payments", tid],
    queryFn: async () => {
      let query = supabase.from("payments").select("*, customer:customers(*), bill:bills(*)").order("created_at", { ascending: false });
      if (tid) query = query.eq("tenant_id", tid);
      const { data, error } = await query;
      if (error) throw error;
      return data as Payment[];
    },
  });
}

export function useCustomerPayments(customerId: string) {
  return useQuery({
    queryKey: ["payments", "customer", customerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("*, bill:bills(*)").eq("customer_id", customerId).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!customerId,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payment: Partial<Payment>) => {
      const { data, error } = await supabase.from("payments").insert(payment as any).select().single();
      if (error) throw error;

      // Update bill status if linked
      if (payment.bill_id) {
        const { data: allPayments } = await supabase.from("payments").select("amount").eq("bill_id", payment.bill_id);
        const { data: bill } = await supabase.from("bills").select("amount").eq("id", payment.bill_id).single();
        if (bill && allPayments) {
          const totalPaid = allPayments.reduce((s, p) => s + Number(p.amount), 0);
          const status = totalPaid >= Number(bill.amount) ? "paid" : totalPaid > 0 ? "partial" : "due";
          await supabase.from("bills").update({ status }).eq("id", payment.bill_id);
        }
      }

      // Update customer last_payment_date
      if (payment.customer_id) {
        await supabase.from("customers").update({ last_payment_date: new Date().toISOString().split("T")[0] }).eq("id", payment.customer_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
