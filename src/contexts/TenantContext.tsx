import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Tenant = {
  id: string;
  name: string;
  subdomain: string | null;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  plan?: string | null;
  plan_expires_at?: string | null;
  owner_id?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  currency: string | null;
  timezone: string | null;
  language: string | null;
  enable_online_payment?: boolean;
  auto_suspend_days?: number;
  resend_api_key?: string | null;
  sender_email?: string | null;
  api_enabled?: boolean;
  allow_reseller_branding?: boolean;
  allow_reseller_logo?: boolean;
  allow_reseller_name?: boolean;
  allow_reseller_theme?: boolean;
  uddoktapay_api_key?: string | null;
  uddoktapay_base_url?: string | null;
  subscription_status?: string;
};

// Default local tenant used as fallback when DB is unreachable
const DEFAULT_TENANT: Tenant = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "My ISP",
  subdomain: "local",
  logo_url: null,
  primary_color: null,
  accent_color: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_active: true,
  plan: "pro",
  plan_expires_at: null,
  owner_id: "local-super-admin-001",
  contact_email: "admin@ispmanager.local",
  contact_phone: null,
  address: null,
  currency: "USD",
  timezone: "UTC",
  language: "en",
};

const LOCAL_TENANT_KEY = "local_tenant_settings";

function loadPersistedTenant(): Partial<Tenant> {
  try {
    const raw = localStorage.getItem(LOCAL_TENANT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

interface TenantContextType {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  allTenants: Tenant[];
  isLoading: boolean;
  isSuperAdmin: boolean;
  isImpersonating: boolean;
  impersonatedTenantId: string | null;
  startImpersonation: (tenantId: string) => void;
  stopImpersonation: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);
const IMPERSONATION_KEY = "super_admin_impersonating_tenant";

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: role } = useUserRole();
  const isSuperAdmin = role === "super_admin";

  const [overrideTenant, setOverrideTenant] = useState<Tenant | null>(null);
  const [impersonatedTenantId, setImpersonatedTenantId] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem(IMPERSONATION_KEY) : null
  );

  // Try to fetch real tenants from Supabase (non-blocking)
  const { data: dbTenants = [], isLoading } = useQuery({
    queryKey: ["tenants-for-context", isSuperAdmin],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenants").select("*").order("name");
      if (error) return [] as Tenant[];
      return data as Tenant[];
    },
    enabled: !!user?.id,
    retry: 1,
    // Never block the UI — always show something immediately
    staleTime: 30_000,
  });

  // Merge DB tenant with any locally persisted settings overrides
  const persisted = loadPersistedTenant();
  const baseTenant: Tenant = dbTenants[0]
    ? { ...dbTenants[0], ...persisted }
    : { ...DEFAULT_TENANT, ...persisted };

  const isImpersonating = isSuperAdmin && !!impersonatedTenantId;
  const currentTenant = overrideTenant ?? (
    isImpersonating
      ? dbTenants.find((t) => t.id === impersonatedTenantId) ?? baseTenant
      : baseTenant
  );

  const setCurrentTenant = (tenant: Tenant | null) => {
    setOverrideTenant(tenant);
    if (tenant) {
      localStorage.setItem(LOCAL_TENANT_KEY, JSON.stringify(tenant));
    }
  };

  const startImpersonation = (tenantId: string) => {
    setImpersonatedTenantId(tenantId);
    sessionStorage.setItem(IMPERSONATION_KEY, tenantId);
  };

  const stopImpersonation = () => {
    setImpersonatedTenantId(null);
    sessionStorage.removeItem(IMPERSONATION_KEY);
  };

  useEffect(() => {
    if (!user || !isSuperAdmin) {
      setImpersonatedTenantId(null);
      sessionStorage.removeItem(IMPERSONATION_KEY);
    }
  }, [user, isSuperAdmin]);

  return (
    <TenantContext.Provider value={{
      currentTenant,
      setCurrentTenant,
      allTenants: dbTenants.length > 0 ? dbTenants : [DEFAULT_TENANT],
      isLoading: false,   // never block the UI on tenant fetch
      isSuperAdmin,
      isImpersonating,
      impersonatedTenantId,
      startImpersonation,
      stopImpersonation,
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) throw new Error("useTenantContext must be used within a TenantProvider");
  return context;
}
