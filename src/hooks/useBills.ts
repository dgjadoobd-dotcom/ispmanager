import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";
import { dbGet, dbInsert, dbUpdate, now, TABLES } from "@/lib/db";

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
      try {
        let query = supabase.from("bills").select("*, customer:customers(*, package:packages(*)), payments(*)").order("created_at", { ascending: false });
        if (tid) query = query.eq("tenant_id", tid);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Bill[];
      } catch {}
      // Fallback to localStorage
      const customers = dbGet<any>(TABLES.customers);
      const packages = dbGet<any>(TABLES.packages);
      const payments = dbGet<any>(TABLES.payments);
      return dbGet<Bill>(TABLES.bills)
        .filter(b => !tid || b.tenant_id === tid)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(b => {
          const cust = customers.find((c: any) => c.id === b.customer_id) ?? null;
          return {
            ...b,
            customer: cust ? { ...cust, package: packages.find((p: any) => p.id === cust.package_id) ?? null } : null,
            payments: payments.filter((p: any) => p.bill_id === b.id),
          };
        });
    },
    enabled: !!tid,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useBill(billId: string) {
  return useQuery({
    queryKey: ["bill", billId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("bills").select("*, customer:customers(*, package:packages(*)), payments(*)").eq("id", billId).single();
        if (!error && data) return data as Bill;
      } catch {}
      const customers = dbGet<any>(TABLES.customers);
      const packages = dbGet<any>(TABLES.packages);
      const payments = dbGet<any>(TABLES.payments);
      const b = dbGet<Bill>(TABLES.bills).find(b => b.id === billId) ?? null;
      if (!b) return null;
      const cust = customers.find((c: any) => c.id === b.customer_id) ?? null;
      return { ...b, customer: cust ? { ...cust, package: packages.find((p: any) => p.id === cust.package_id) ?? null } : null, payments: payments.filter((p: any) => p.bill_id === b.id) } as Bill;
    },
    enabled: !!billId,
  });
}

export function useCustomerBills(customerId: string) {
  return useQuery({
    queryKey: ["bills", "customer", customerId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("bills").select("*").eq("customer_id", customerId).order("created_at", { ascending: false });
        if (!error && data) return data;
      } catch {}
      return dbGet<Bill>(TABLES.bills)
        .filter(b => b.customer_id === customerId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: !!customerId,
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bill: Partial<Bill>) => {
      try {
        const { data, error } = await supabase.from("bills").insert(bill as any).select().single();
        if (!error && data) return data;
      } catch {}
      return dbInsert<Bill>(TABLES.bills, { ...bill, updated_at: now() } as any);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bills"] }),
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Bill> }) => {
      try {
        const { data, error } = await supabase.from("bills").update(updates as any).eq("id", id).select().single();
        if (!error && data) return data;
      } catch {}
      return dbUpdate<Bill>(TABLES.bills, id, { ...updates, updated_at: now() });
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
