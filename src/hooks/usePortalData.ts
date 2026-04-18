import { useQuery } from "@tanstack/react-query";
import { dbGet, TABLES } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";

export type Customer = {
  id: string; tenant_id: string; name: string; phone: string;
  email: string | null; address: string | null; package_id: string | null;
  connection_status: string; due_balance: number; advance_balance: number;
  join_date: string | null; last_payment_date: string | null; user_id: string | null;
  packages?: { id: string; name: string; speed_label: string; monthly_price: number } | null;
};

export type Bill = {
  id: string; tenant_id: string; customer_id: string; amount: number;
  invoice_number: string; billing_period_start: string; billing_period_end: string;
  due_date: string; status: string; notes: string | null; created_at: string;
};

export type Payment = {
  id: string; tenant_id: string; customer_id: string; bill_id: string | null;
  amount: number; method: string; reference: string | null; created_at: string;
  bills?: { invoice_number: string } | null;
};

export function usePortalCustomer() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["portalCustomer", user?.id],
    queryFn: () => {
      if (!user?.id) return null;
      const customers = dbGet<any>(TABLES.customers);
      const packages = dbGet<any>(TABLES.packages);
      const c = customers.find((cu: any) => cu.user_id === user.id) ?? null;
      if (!c) return null;
      return { ...c, packages: packages.find((p: any) => p.id === c.package_id) ?? null } as Customer;
    },
    enabled: !!user?.id,
  });
}

export function usePortalBills() {
  const { data: customer } = usePortalCustomer();
  return useQuery({
    queryKey: ["portalBills", customer?.id],
    queryFn: () => {
      if (!customer?.id) return [];
      return dbGet<Bill>(TABLES.bills)
        .filter((b) => b.customer_id === customer.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    enabled: !!customer?.id,
  });
}

export function usePortalPayments() {
  const { data: customer } = usePortalCustomer();
  return useQuery({
    queryKey: ["portalPayments", customer?.id],
    queryFn: () => {
      if (!customer?.id) return [];
      const payments = dbGet<any>(TABLES.payments).filter((p: any) => p.customer_id === customer.id);
      const bills = dbGet<any>(TABLES.bills);
      return payments
        .sort((a: any, b: any) => b.created_at.localeCompare(a.created_at))
        .map((p: any) => ({
          ...p,
          bills: p.bill_id ? (bills.find((b: any) => b.id === p.bill_id) ?? null) : null,
        })) as (Payment & { bills?: { invoice_number: string } | null })[];
    },
    enabled: !!customer?.id,
  });
}

export function usePortalCurrentBill() {
  const { data: bills } = usePortalBills();
  return bills?.find((b) => b.status !== "paid") || bills?.[0] || null;
}

export function usePortalLastPayment() {
  const { data: payments } = usePortalPayments();
  return payments?.[0] || null;
}
