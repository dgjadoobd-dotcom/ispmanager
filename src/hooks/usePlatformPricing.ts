import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dbGet, dbInsert, dbUpdate, dbDelete, now, genId, TABLES } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

const PLANS_KEY = "db_platform_plans";
const ADDONS_KEY = "db_platform_addons";
const ADDON_TIERS_KEY = "db_platform_addon_tiers";
const TENANT_SUBS_KEY = "db_tenant_subscriptions";
const TENANT_ADDON_SUBS_KEY = "db_tenant_addon_subscriptions";

export interface PlatformPlan {
  id: string; name: string; description: string | null; base_price: number;
  billing_cycle: "monthly" | "quarterly" | "yearly"; max_customers: number | null;
  max_staff: number | null; features: string[]; is_active: boolean;
  sort_order: number; created_at: string; updated_at: string;
}

export interface PlatformAddon {
  id: string; name: string; code: string; description: string | null;
  pricing_type: "fixed" | "tiered" | "usage_based"; base_price: number;
  is_active: boolean; sort_order: number; created_at: string; updated_at: string;
  tiers?: AddonTier[];
}

export interface AddonTier {
  id: string; addon_id: string; min_customers: number;
  max_customers: number | null; price: number; created_at: string;
}

export interface TenantSubscription {
  id: string; tenant_id: string; plan_id: string;
  status: "active" | "past_due" | "cancelled" | "trial";
  current_period_start: string; current_period_end: string;
  trial_ends_at: string | null; cancelled_at: string | null; plan?: PlatformPlan;
}

export interface TenantAddonSubscription {
  id: string; tenant_id: string; addon_id: string;
  activated_at: string; deactivated_at: string | null; is_active: boolean; addon?: PlatformAddon;
}

export interface BillingEstimate {
  base_plan_cost: number; addons_cost: number; total_cost: number; customer_count: number;
}

export interface ProrationItem {
  id: string; tenant_id: string; item_type: string; description: string;
  original_price: number; prorated_amount: number; days_remaining: number;
  total_days: number; period_start: string; period_end: string;
  effective_date: string; status: string; created_at: string;
}

export interface ProrationPreview {
  prorated_amount: number; days_remaining: number; total_days: number; daily_rate: number;
}

export function usePlatformPlans() {
  return useQuery({ queryKey: ["platform-plans"], queryFn: () => dbGet<PlatformPlan>(PLANS_KEY) });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (plan: Partial<PlatformPlan>) => dbInsert<PlatformPlan>(PLANS_KEY, { name: "", base_price: 0, billing_cycle: "monthly", description: null, max_customers: null, max_staff: null, features: [], is_active: true, sort_order: 0, updated_at: now(), ...plan } as any),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["platform-plans"] }); toast({ title: "Plan created" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PlatformPlan> }) => dbUpdate<PlatformPlan>(PLANS_KEY, id, { ...updates, updated_at: now() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["platform-plans"] }); toast({ title: "Plan updated" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function usePlatformAddons() {
  return useQuery({
    queryKey: ["platform-addons"],
    queryFn: () => {
      const addons = dbGet<PlatformAddon>(ADDONS_KEY);
      const tiers = dbGet<AddonTier>(ADDON_TIERS_KEY);
      return addons.map((a) => ({ ...a, tiers: tiers.filter((t) => t.addon_id === a.id) }));
    },
  });
}

export function useCreateAddon() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (addon: Partial<PlatformAddon>) => dbInsert<PlatformAddon>(ADDONS_KEY, { name: "", code: "", description: null, pricing_type: "fixed", base_price: 0, is_active: true, sort_order: 0, updated_at: now(), ...addon } as any),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["platform-addons"] }); toast({ title: "Add-on created" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateAddon() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PlatformAddon> }) => dbUpdate<PlatformAddon>(ADDONS_KEY, id, { ...updates, updated_at: now() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["platform-addons"] }); toast({ title: "Add-on updated" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateAddonTiers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ addonId, tiers }: { addonId: string; tiers: Partial<AddonTier>[] }) => {
      const all = dbGet<AddonTier>(ADDON_TIERS_KEY).filter((t) => t.addon_id !== addonId);
      const newTiers = tiers.map((t) => ({ ...t, id: genId(), addon_id: addonId, created_at: now() } as AddonTier));
      localStorage.setItem(ADDON_TIERS_KEY, JSON.stringify([...all, ...newTiers]));
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["platform-addons"] }); toast({ title: "Tiers updated" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useProrationPreview() {
  return useMutation({
    mutationFn: async ({ originalPrice, periodStart, periodEnd, effectiveDate }: { originalPrice: number; periodStart: string; periodEnd: string; effectiveDate?: string }) => {
      const start = new Date(periodStart); const end = new Date(periodEnd);
      const effective = new Date(effectiveDate ?? new Date().toISOString().split("T")[0]);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000);
      const daysRemaining = Math.max(0, Math.ceil((end.getTime() - effective.getTime()) / 86400000));
      const dailyRate = originalPrice / totalDays;
      return { prorated_amount: dailyRate * daysRemaining, days_remaining: daysRemaining, total_days: totalDays, daily_rate: dailyRate } as ProrationPreview;
    },
  });
}

export function usePendingProrations(tenantId?: string) {
  return useQuery({ queryKey: ["pending-prorations", tenantId], queryFn: () => [] as ProrationItem[], enabled: !!tenantId });
}

export function useTenantSubscription(tenantId?: string) {
  return useQuery({
    queryKey: ["tenant-subscription", tenantId],
    queryFn: (): TenantSubscription | null => {
      if (!tenantId) return null;
      const subs = dbGet<TenantSubscription>(TENANT_SUBS_KEY);
      const sub = subs.find((s) => s.tenant_id === tenantId) ?? null;
      if (!sub) return null;
      const plans = dbGet<PlatformPlan>(PLANS_KEY);
      return { ...sub, plan: plans.find((p) => p.id === sub.plan_id) };
    },
    enabled: !!tenantId,
  });
}

export function useTenantAddonSubscriptions(tenantId?: string) {
  return useQuery({
    queryKey: ["tenant-addon-subscriptions", tenantId],
    queryFn: (): TenantAddonSubscription[] => {
      if (!tenantId) return [];
      const subs = dbGet<TenantAddonSubscription>(TENANT_ADDON_SUBS_KEY).filter((s) => s.tenant_id === tenantId && s.is_active);
      const addons = dbGet<PlatformAddon>(ADDONS_KEY);
      return subs.map((s) => ({ ...s, addon: addons.find((a) => a.id === s.addon_id) }));
    },
    enabled: !!tenantId,
  });
}

export function useBillingEstimate(tenantId?: string) {
  return useQuery({
    queryKey: ["billing-estimate", tenantId],
    queryFn: (): BillingEstimate | null => {
      if (!tenantId) return null;
      const customers = dbGet<any>(TABLES.customers).filter((c: any) => c.tenant_id === tenantId);
      return { base_plan_cost: 0, addons_cost: 0, total_cost: 0, customer_count: customers.length };
    },
    enabled: !!tenantId,
  });
}

export function useAssignPlanToTenant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ tenantId, planId }: { tenantId: string; planId: string; createProration?: boolean }) => {
      const subs = dbGet<TenantSubscription>(TENANT_SUBS_KEY).filter((s) => s.tenant_id !== tenantId);
      const periodEnd = new Date(); periodEnd.setMonth(periodEnd.getMonth() + 1);
      const newSub: TenantSubscription = { id: genId(), tenant_id: tenantId, plan_id: planId, status: "active", current_period_start: now(), current_period_end: periodEnd.toISOString(), trial_ends_at: null, cancelled_at: null };
      localStorage.setItem(TENANT_SUBS_KEY, JSON.stringify([...subs, newSub]));
      return newSub;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tenant-subscription"] }); toast({ title: "Plan assigned" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useToggleTenantAddon() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ tenantId, addonId, activate }: { tenantId: string; addonId: string; activate: boolean; createProration?: boolean }) => {
      const subs = dbGet<TenantAddonSubscription>(TENANT_ADDON_SUBS_KEY);
      const existing = subs.findIndex((s) => s.tenant_id === tenantId && s.addon_id === addonId);
      if (existing >= 0) {
        subs[existing] = { ...subs[existing], is_active: activate, deactivated_at: activate ? null : now() };
      } else if (activate) {
        subs.push({ id: genId(), tenant_id: tenantId, addon_id: addonId, is_active: true, activated_at: now(), deactivated_at: null });
      }
      localStorage.setItem(TENANT_ADDON_SUBS_KEY, JSON.stringify(subs));
    },
    onSuccess: (_, v) => { queryClient.invalidateQueries({ queryKey: ["tenant-addon-subscriptions"] }); toast({ title: v.activate ? "Add-on activated" : "Add-on deactivated" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function usePlatformInvoices(tenantId?: string) {
  return useQuery({ queryKey: ["platform-invoices", tenantId], queryFn: () => [] });
}
