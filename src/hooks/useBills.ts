import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";

export interface Bill {
  id: string;
  tenant_id: string;
  customer_id: string;
  amount: number;
  invoice_number: string;
  billing_period_start: string;
  billing_period_end: string;
  due_date: string;
  status: "due" | "paid" | "partial" | "overdue" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: { id: string; name: string; phone: string; email: string | null; connection_status: string; package?: { name: string; speed_label: string; monthly_price: number } | null } | null;
  payments?: { id: string; amount: number; method: string; created_at: string }[];
}

export function useBills(tenantId?: string) {
  const { currentTenant } = useTenantContext();
  const tid = tenantId ?? currentTenant?.id;
  return useQuery({
    queryKey: ["bills", tid],
    queryFn: async () => {
      let query = supabase.from("bills").select("*, customer:customers(*, package:packages(*)), payments(*)").order("created_at", { ascending: false });
      if (tid) query = query.eq("tenant_id", tid);
      const { data, error } = await query;
      if (error) throw error;
      return data as Bill[];
    },
  });
}

export function useBill(billId: string) {
  return useQuery({
    queryKey: ["bill", billId],
    queryFn: async () => {
      const { data, error } = await supabase.from("bills").select("*, customer:customers(*, package:packages(*)), payments(*)").eq("id", billId).single();
      if (error) throw error;
      return data as Bill;
    },
    enabled: !!billId,
  });
}

export function useCustomerBills(customerId: string) {
  return useQuery({
    queryKey: ["bills", "customer", customerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("bills").select("*").eq("customer_id", customerId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bill: Partial<Bill>) => {
      const { data, error } = await supabase.from("bills").insert(bill as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bills"] }),
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Bill> }) => {
      const { data, error } = await supabase.from("bills").update(updates as any).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["bill", v.id] });
    },
  });
}

export function useGenerateBills() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tenantId, billingPeriodStart, billingPeriodEnd, dueDate }: {
      tenantId: string; billingPeriodStart: string; billingPeriodEnd: string; dueDate: string;
    }) => {
      const { data: existing } = await supabase.from("bills").select("customer_id").eq("tenant_id", tenantId).eq("billing_period_start", billingPeriodStart).eq("billing_period_end", billingPeriodEnd);
      const existingIds = new Set((existing || []).map((b: any) => b.customer_id));

      const { data: customers, error } = await supabase.from("customers").select("*, package:packages(*)").eq("tenant_id", tenantId).eq("connection_status", "active");
      if (error) throw error;

      const toBill = (customers || []).filter((c: any) => c.package && !existingIds.has(c.id));
      if (toBill.length === 0) {
        if (existingIds.size > 0) throw new Error("Bills already exist for this billing period");
        throw new Error("No active customers with packages to bill");
      }

      const ts = Date.now().toString(36).toUpperCase();
      const bills = toBill.map((c: any, i: number) => ({
        tenant_id: tenantId, customer_id: c.id, amount: c.package.monthly_price,
        invoice_number: `INV-${ts}-${String(i + 1).padStart(4, "0")}`,
        billing_period_start: billingPeriodStart, billing_period_end: billingPeriodEnd,
        due_date: dueDate, status: "due",
      }));

      const { data: created, error: insertError } = await supabase.from("bills").insert(bills).select();
      if (insertError) throw insertError;
      return created;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bills"] }),
  });
}
