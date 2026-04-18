import {
  Package,
  CreditCard,
  Users,
  Calendar,
  TrendingUp,
  Puzzle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import type {
  TenantSubscription,
  TenantAddonSubscription,
  BillingEstimate,
} from "@/hooks/usePlatformPricing";

interface CurrentPlanSummaryProps {
  subscription?: TenantSubscription | null;
  addonSubscriptions?: TenantAddonSubscription[];
  billingEstimate?: BillingEstimate | null;
  isLoading?: boolean;
}

const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  past_due: { label: "Past Due", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "secondary" },
  trial: { label: "Trial", variant: "outline" },
};

export function CurrentPlanSummary({
  subscription,
  addonSubscriptions,
  billingEstimate,
  isLoading,
}: CurrentPlanSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const plan = subscription?.plan;
  const status = subscription?.status ?? "active";
  const customerCount = billingEstimate?.customer_count ?? 0;
  const maxCustomers = plan?.max_customers;
  const usagePercent = maxCustomers
    ? Math.min((customerCount / maxCustomers) * 100, 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Three-column summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Current Plan */}
        <Card className="border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Package className="h-4 w-4" />
              Current Plan
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold">{plan?.name ?? "No Plan"}</p>
                <Badge variant={statusMap[status]?.variant ?? "default"} className="mt-1">
                  {statusMap[status]?.label ?? status}
                </Badge>
              </div>
              {plan && (
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">
                    ৳{plan.base_price.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">/month</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Usage */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              Customer Usage
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <p className="text-xl font-bold tabular-nums">
                  {customerCount.toLocaleString()}
                </p>
                {maxCustomers && (
                  <p className="text-sm text-muted-foreground">
                    / {maxCustomers.toLocaleString()}
                  </p>
                )}
              </div>
              {maxCustomers && (
                <Progress value={usagePercent} className="h-2" />
              )}
              {!maxCustomers && (
                <p className="text-xs text-muted-foreground">Unlimited</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Billing */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <CreditCard className="h-4 w-4" />
              Next Billing Estimate
            </div>
            <p className="text-xl font-bold tabular-nums">
              ৳{(billingEstimate?.total_cost ?? 0).toLocaleString()}
            </p>
            {subscription?.current_period_end && (
              <p className="text-xs text-muted-foreground mt-1">
                Due {formatDistanceToNow(new Date(subscription.current_period_end), {
                  addSuffix: true,
                })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Billing Breakdown */}
      {billingEstimate && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Billing Breakdown
            </div>

            <div className="flex items-center justify-between text-sm py-1.5">
              <span className="text-muted-foreground">
                Base plan ({plan?.name})
              </span>
              <span className="tabular-nums font-medium">
                ৳{(billingEstimate.base_plan_cost ?? 0).toLocaleString()}
              </span>
            </div>

            {addonSubscriptions && addonSubscriptions.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Active Add-ons
                  </p>
                  {addonSubscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between text-sm py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <Puzzle className="h-4 w-4 text-muted-foreground" />
                        <span>{sub.addon?.name}</span>
                      </div>
                      <span className="tabular-nums font-medium">
                        ৳{(sub.addon?.base_price ?? 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Separator />
            <div className="flex items-center justify-between text-sm font-bold">
              <span>Estimated Total</span>
              <span className="tabular-nums">
                ৳{(billingEstimate.total_cost ?? 0).toLocaleString()}
              </span>
            </div>

            {subscription?.current_period_end && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <Calendar className="h-3.5 w-3.5" />
                Next invoice:{" "}
                {format(
                  new Date(subscription.current_period_end),
                  "dd MMM, yyyy"
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
