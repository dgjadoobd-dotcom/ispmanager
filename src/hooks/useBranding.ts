import { useQuery } from "@tanstack/react-query";
import { dbGet, TABLES } from "@/lib/db";
import { useTenantContext } from "@/contexts/TenantContext";

/**
 * Resolved branding object consumed by all UI components.
 * Components should NEVER access raw tenant/reseller configs directly.
 */
export interface ResolvedBranding {
  brandName: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  /** The source of the resolved branding */
  source: "isp" | "reseller" | "platform";
}

/** ISP-level controls for reseller branding */
export interface ResellerBrandingControls {
  allowResellerBranding: boolean;
  allowResellerLogo: boolean;
  allowResellerName: boolean;
  allowResellerTheme: boolean;
}

interface ResellerBrandingData {
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
}

const PLATFORM_DEFAULTS: ResolvedBranding = {
  brandName: "ISP Manager",
  logoUrl: null,
  primaryColor: "#3b82f6",
  accentColor: "#8b5cf6",
  source: "platform",
};

/**
 * Central branding resolution hook for ISP panel context.
 * Always returns ISP branding. Platform branding never leaks.
 */
export function useISPBranding(): {
  branding: ResolvedBranding;
  controls: ResellerBrandingControls;
  isLoading: boolean;
} {
  const { currentTenant, isLoading: tenantLoading } = useTenantContext();

  const branding: ResolvedBranding = currentTenant
    ? {
        brandName: currentTenant.name,
        logoUrl: currentTenant.logo_url ?? null,
        primaryColor: currentTenant.primary_color || PLATFORM_DEFAULTS.primaryColor,
        accentColor: currentTenant.accent_color || PLATFORM_DEFAULTS.accentColor,
        source: "isp",
      }
    : PLATFORM_DEFAULTS;

  const controls: ResellerBrandingControls = {
    allowResellerBranding: (currentTenant as any)?.allow_reseller_branding ?? false,
    allowResellerLogo: (currentTenant as any)?.allow_reseller_logo ?? false,
    allowResellerName: (currentTenant as any)?.allow_reseller_name ?? false,
    allowResellerTheme: (currentTenant as any)?.allow_reseller_theme ?? false,
  };

  return { branding, controls, isLoading: tenantLoading };
}

/**
 * Resolve branding for a specific reseller, respecting ISP controls.
 * Used in reseller panel and customer portal contexts.
 */
export function useResellerBranding(resellerId: string | null | undefined): {
  branding: ResolvedBranding;
  isLoading: boolean;
} {
  const { branding: ispBranding, controls, isLoading: ispLoading } = useISPBranding();

  const { data: resellerData, isLoading: resellerLoading } = useQuery({
    queryKey: ["reseller-branding", resellerId],
    queryFn: async () => {
      if (!resellerId) return null;
      const resellers = dbGet<any>(TABLES.resellers);
      const r = resellers.find((res: any) => res.id === resellerId);
      if (!r) return null;
      return { brand_name: r.brand_name ?? null, logo_url: r.logo_url ?? null, primary_color: r.primary_color ?? null, accent_color: r.accent_color ?? null };
    },
    enabled: !!resellerId && controls.allowResellerBranding,
    staleTime: 5 * 60 * 1000,
  });

  // If reseller branding is not enabled or no reseller, fall back to ISP
  if (!controls.allowResellerBranding || !resellerData) {
    return { branding: ispBranding, isLoading: ispLoading || resellerLoading };
  }

  // Merge with ISP fallbacks, respecting granular controls
  const resolved: ResolvedBranding = {
    brandName:
      controls.allowResellerName && resellerData.brand_name
        ? resellerData.brand_name
        : ispBranding.brandName,
    logoUrl:
      controls.allowResellerLogo && resellerData.logo_url
        ? resellerData.logo_url
        : ispBranding.logoUrl,
    primaryColor:
      controls.allowResellerTheme && resellerData.primary_color
        ? resellerData.primary_color
        : ispBranding.primaryColor,
    accentColor:
      controls.allowResellerTheme && resellerData.accent_color
        ? resellerData.accent_color
        : ispBranding.accentColor,
    source: "reseller",
  };

  return { branding: resolved, isLoading: ispLoading || resellerLoading };
}

/**
 * Resolve branding for the customer portal/mobile app.
 * Priority: Reseller (if linked + enabled) → ISP → never platform.
 */
export function useCustomerBranding(customerId: string | null | undefined): {
  branding: ResolvedBranding;
  isLoading: boolean;
} {
  // First get customer's reseller_id
  const { data: customerResellerId, isLoading: customerLoading } = useQuery({
    queryKey: ["customer-reseller", customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const customers = dbGet<any>(TABLES.customers);
      const c = customers.find((cu: any) => cu.id === customerId);
      return c?.reseller_id ?? null;
    },
    enabled: !!customerId,
    staleTime: 10 * 60 * 1000,
  });

  const { branding, isLoading: resellerLoading } = useResellerBranding(customerResellerId);

  return { branding, isLoading: customerLoading || resellerLoading };
}

/**
 * Get branding data formatted for PDF generation (invoices, receipts).
 */
export function usePDFBranding(customerId?: string | null) {
  const { branding: ispBranding } = useISPBranding();
  const { branding: customerBranding, isLoading } = useCustomerBranding(customerId);

  const activeBranding = customerId ? customerBranding : ispBranding;

  return {
    branding: {
      name: activeBranding.brandName,
      logoUrl: activeBranding.logoUrl,
      primaryColor: activeBranding.primaryColor,
      accentColor: activeBranding.accentColor,
    },
    isLoading,
  };
}
