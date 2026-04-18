import { useMemo } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { usePackages } from "@/hooks/usePackages";
import { useBills } from "@/hooks/useBills";
import { useTenantContext } from "@/contexts/TenantContext";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  /** Route to navigate to */
  href: string;
  /** CTA label */
  cta: string;
  /** Is optional step */
  optional?: boolean;
}

export function useOnboardingProgress() {
  const { currentTenant, isLoading: tenantLoading } = useTenantContext();
  const tenantId = currentTenant?.id;

  const { data: customers = [], isLoading: customersLoading } = useCustomers(tenantId);
  const { data: packages = [], isLoading: packagesLoading } = usePackages(tenantId);
  const { data: bills = [], isLoading: billsLoading } = useBills(tenantId);

  const isLoading = tenantLoading || customersLoading || packagesLoading || billsLoading;

  const steps: OnboardingStep[] = useMemo(() => {
    const hasBranding = !!(currentTenant?.logo_url || currentTenant?.primary_color);
    const hasPackages = packages.length > 0;
    const hasCustomers = customers.length > 0;
    const hasBills = bills.length > 0;
    const hasOnlinePayment = !!currentTenant?.enable_online_payment;

    return [
      {
        id: "branding",
        title: "Set up your ISP profile",
        description: "Add your logo and brand colors so your customers see a professional portal",
        completed: hasBranding,
        href: "/dashboard/settings",
        cta: "Set Up Branding",
      },
      {
        id: "package",
        title: "Create your first package",
        description: "Define internet plans your customers can subscribe to",
        completed: hasPackages,
        href: "/dashboard/packages",
        cta: "Create Package",
      },
      {
        id: "customer",
        title: "Add your first customer",
        description: "Start managing customers and their connections from one place",
        completed: hasCustomers,
        href: "/dashboard/customers",
        cta: "Add Customer",
      },
      {
        id: "bill",
        title: "Generate your first bill",
        description: "Automated billing saves hours of manual work every month",
        completed: hasBills,
        href: "/dashboard/billing",
        cta: "Generate Bill",
      },
      {
        id: "payment",
        title: "Enable online payments",
        description: "Let customers pay from their portal — reduces manual collection effort",
        completed: hasOnlinePayment,
        href: "/dashboard/settings",
        cta: "Configure Payments",
        optional: true,
      },
    ];
  }, [currentTenant, packages, customers, bills]);

  const completedCount = steps.filter((s) => s.completed).length;
  const totalRequired = steps.filter((s) => !s.optional).length;
  const requiredCompleted = steps.filter((s) => s.completed && !s.optional).length;
  const allRequiredDone = requiredCompleted >= totalRequired;
  const allDone = completedCount === steps.length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // Show onboarding only when not all required steps are done
  // Once dismissed via localStorage, don't show again
  const dismissed = typeof window !== "undefined"
    ? localStorage.getItem(`onboarding_dismissed_${tenantId}`) === "true"
    : false;

  const showOnboarding = !isLoading && !allRequiredDone && !dismissed;
  const showSuccess = !isLoading && allRequiredDone && !allDone && !dismissed;

  const dismiss = () => {
    if (tenantId) {
      localStorage.setItem(`onboarding_dismissed_${tenantId}`, "true");
    }
  };

  return {
    steps,
    completedCount,
    totalSteps: steps.length,
    progressPercent,
    allRequiredDone,
    allDone,
    showOnboarding,
    showSuccess,
    dismiss,
    isLoading,
  };
}
