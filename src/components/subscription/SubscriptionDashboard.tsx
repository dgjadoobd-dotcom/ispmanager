import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Network, BarChart3, Bell, Users, Zap, Shield } from "lucide-react";
import { useTenantContext } from "@/contexts/TenantContext";
import {
  useTenantSubscription,
  useTenantAddonSubscriptions,
  useBillingEstimate,
  usePlatformPlans,
  usePlatformAddons,
  useAssignPlanToTenant,
  useToggleTenantAddon,
  PlatformPlan,
} from "@/hooks/usePlatformPricing";
import {
  PlanCard,
  FeatureComparisonTable,
  AddonUpsellCard,
  UpgradePreviewDialog,
  CurrentPlanSummary,
} from "@/components/pricing";

// Add-on metadata for conversion-focused display
const addonMeta: Record<string, { icon: typeof Network; benefitHeadline: string; recommendation: string }> = {
  network_auto: {
    icon: Network,
    benefitHeadline: "Automate customer speed & access",
    recommendation: "Recommended for ISPs with 200+ customers",
  },
  analytics_pro: {
    icon: BarChart3,
    benefitHeadline: "Understand your revenue & churn trends",
    recommendation: "Recommended for growing ISPs",
  },
  push_notify: {
    icon: Bell,
    benefitHeadline: "Reach customers instantly on their phone",
    recommendation: "Recommended for ISPs with due collection challenges",
  },
  multi_staff: {
    icon: Users,
    benefitHeadline: "Give your team secure, role-based access",
    recommendation: "Recommended for ISPs with 3+ staff",
  },
  api_access: {
    icon: Zap,
    benefitHeadline: "Connect with your existing tools via API",
    recommendation: "Best for ISPs with custom integrations",
  },
  white_label: {
    icon: Shield,
    benefitHeadline: "Your brand, your portal — fully customized",
    recommendation: "Best for ISPs with resellers",
  },
};

// Plan size guidance
function getSizeGuidance(plan: PlatformPlan, index: number, total: number): string {
  if (plan.max_customers && plan.max_customers <= 200) {
    return "Best for small ISPs starting out";
  }
  if (plan.max_customers && plan.max_customers <= 1000) {
    return `Best for ISPs with up to ${plan.max_customers} customers`;
  }
  if (plan.max_customers && plan.max_customers > 1000) {
    return `Best for ISPs with ${Math.floor(plan.max_customers / 2).toLocaleString()}+ customers`;
  }
  if (index === total - 1) {
    return "Best for large ISPs with unlimited growth";
  }
  return "";
}

export function SubscriptionDashboard() {
  const { currentTenant } = useTenantContext();
  const tenantId = currentTenant?.id;

  const { data: subscription, isLoading: subscriptionLoading } = useTenantSubscription(tenantId);
  const { data: addonSubscriptions, isLoading: addonsLoading } = useTenantAddonSubscriptions(tenantId);
  const { data: billingEstimate, isLoading: estimateLoading } = useBillingEstimate(tenantId);
  const { data: allPlans } = usePlatformPlans();
  const { data: allAddons } = usePlatformAddons();

  const assignPlan = useAssignPlanToTenant();
  const toggleAddon = useToggleTenantAddon();

  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const isLoading = subscriptionLoading || addonsLoading || estimateLoading;
  const currentPlan = subscription?.plan;
  const activeAddonIds = addonSubscriptions?.map((a) => a.addon_id) ?? [];
  const activePlans = allPlans?.filter((p) => p.is_active) ?? [];

  // Find the "most popular" plan (middle plan or the one with most features)
  const popularIndex = activePlans.length >= 3 ? 1 : activePlans.length - 1;

  const handlePlanSelect = (plan: PlatformPlan) => {
    setSelectedPlan(plan);
    setUpgradeDialogOpen(true);
  };

  const handleConfirmUpgrade = () => {
    if (selectedPlan && tenantId) {
      assignPlan.mutate({ tenantId, planId: selectedPlan.id });
      setUpgradeDialogOpen(false);
    }
  };

  const handleToggleAddon = (addonId: string, activate: boolean) => {
    if (tenantId) {
      toggleAddon.mutate({ tenantId, addonId, activate });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Plan Summary */}
      <CurrentPlanSummary
        subscription={subscription}
        addonSubscriptions={addonSubscriptions}
        billingEstimate={billingEstimate}
      />

      {/* Plans Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold">Choose the right plan for your ISP</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Scale your operations with automated billing, collections, and network management
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activePlans.map((plan, idx) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={plan.id === currentPlan?.id}
              isPopular={idx === popularIndex && activePlans.length > 1}
              onSelect={handlePlanSelect}
              isLoading={assignPlan.isPending}
              sizeGuidance={getSizeGuidance(plan, idx, activePlans.length)}
            />
          ))}
        </div>

        {/* Comparison Toggle */}
        {activePlans.length > 1 && (
          <div className="text-center pt-2">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-sm text-primary hover:underline underline-offset-2 font-medium"
            >
              {showComparison ? "Hide" : "Compare"} all features
            </button>
          </div>
        )}

        {/* Feature Comparison */}
        {showComparison && (
          <div className="animate-fade-in">
            <FeatureComparisonTable
              plans={activePlans}
              currentPlanId={currentPlan?.id}
            />
          </div>
        )}
      </div>

      {/* Add-ons Section */}
      {allAddons && allAddons.filter((a) => a.is_active).length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold">Extend your platform</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Add powerful capabilities as your ISP grows — activate or deactivate anytime
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {allAddons
              .filter((a) => a.is_active)
              .map((addon) => {
                const meta = addonMeta[addon.code];
                return (
                  <AddonUpsellCard
                    key={addon.id}
                    addon={addon}
                    isActive={activeAddonIds.includes(addon.id)}
                    onToggle={handleToggleAddon}
                    isLoading={toggleAddon.isPending}
                    icon={meta?.icon}
                    benefitHeadline={meta?.benefitHeadline}
                    recommendation={meta?.recommendation}
                  />
                );
              })}
          </div>
        </div>
      )}

      {/* Upgrade Preview Dialog */}
      <UpgradePreviewDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        currentPlan={currentPlan}
        newPlan={selectedPlan}
        currentCost={billingEstimate?.total_cost}
        onConfirm={handleConfirmUpgrade}
        isLoading={assignPlan.isPending}
      />
    </div>
  );
}
