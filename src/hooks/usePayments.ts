import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";
import { dbGet, dbInsert, dbUpdate, now, TABLES } from "@/lib/db";

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
      try {
        let query = supabase.from("payments").select("*, customer:customers(*), bill:bills(*)").order("created_at", { ascending: false });
        if (tid) query = query.eq("tenant_id", tid);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Payment[];
      } catch {}
      // Fallback to localStorage
      const customers = dbGet<any>(TABLES.customers);
      const bills = dbGet<any>(TABLES.bills);
      return dbGet<Payment>(TABLES.payments)
        .filter(p => !tid || p.tenant_id === tid)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(p => ({
          ...p,
          customer: customers.find((c: any) => c.id === p.customer_id) ?? null,
          bill: bills.find((b: any) => b.id === p.bill_id) ?? null,
        }));
    },
    enabled: !!tid,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useCustomerPayments(customerId: string) {
  return useQuery({
    queryKey: ["payments", "customer", customerId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("payments").select("*, bill:bills(*)").eq("customer_id", customerId).order("created_at", { ascending: false });
        if (!error && data) return data as Payment[];
      } catch {}
      const bills = dbGet<any>(TABLES.bills);
      return dbGet<Payment>(TABLES.payments)
        .filter(p => p.customer_id === customerId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(p => ({ ...p, bill: bills.find((b: any) => b.id === p.bill_id) ?? null }));
    },
    enabled: !!customerId,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payment: Partial<Payment>) => {
      try {
        const { data, error } = await supabase.from("payments").insert(payment as any).select().single();
        if (!error && data) {
          if (payment.bill_id) {
            const { data: allPayments } = await supabase.from("payments").select("amount").eq("bill_id", payment.bill_id);
            const { data: bill } = await supabase.from("bills").select("amount").eq("id", payment.bill_id).single();
            if (bill && allPayments) {
              const totalPaid = allPayments.reduce((s: number, p: any) => s + Number(p.amount), 0);
              const status = totalPaid >= Number(bill.amount) ? "paid" : totalPaid > 0 ? "partial" : "due";
              await supabase.from("bills").update({ status }).eq("id", payment.bill_id);
            }
          }
          if (payment.customer_id) {
            await supabase.from("customers").update({ last_payment_date: new Date().toISOString().split("T")[0] }).eq("id", payment.customer_id);
          }
          return data;
        }
      } catch {}
      // Fallback localStorage
      const newPayment = dbInsert<Payment>(TABLES.payments, { ...payment, created_at: now() } as any);
      if (payment.customer_id) {
        dbUpdate(TABLES.customers, payment.customer_id, { last_payment_date: new Date().toISOString().split("T")[0] });
      }
      return newPayment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
