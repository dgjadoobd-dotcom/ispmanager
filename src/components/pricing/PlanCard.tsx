import { Check, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlatformPlan } from "@/hooks/usePlatformPricing";

interface PlanCardProps {
  plan: PlatformPlan;
  isCurrent?: boolean;
  isPopular?: boolean;
  onSelect?: (plan: PlatformPlan) => void;
  isLoading?: boolean;
  /** ISP size guidance e.g. "Best for 100–500 customers" */
  sizeGuidance?: string;
}

export function PlanCard({
  plan,
  isCurrent,
  isPopular,
  onSelect,
  isLoading,
  sizeGuidance,
}: PlanCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-6 transition-all duration-200",
        isPopular && "border-primary shadow-lg ring-1 ring-primary/20",
        isCurrent && !isPopular && "border-primary/50",
        !isPopular && !isCurrent && "hover:border-border/80 hover:shadow-soft"
      )}
    >
      {/* Badges */}
      <div className="flex items-center gap-2 mb-4 min-h-[24px]">
        {isPopular && (
          <Badge className="bg-primary text-primary-foreground gap-1 text-[11px]">
            <Star className="h-3 w-3 fill-current" />
            Most Popular
          </Badge>
        )}
        {isCurrent && (
          <Badge variant="outline" className="border-primary/40 text-primary text-[11px]">
            Current Plan
          </Badge>
        )}
      </div>

      {/* Plan Name & Description */}
      <div className="mb-4">
        <h3 className="text-lg font-bold">{plan.name}</h3>
        {plan.description && (
          <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
        )}
      </div>

      {/* Price */}
      <div className="mb-1">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight tabular-nums">
            ৳{plan.base_price.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-sm">/month</span>
        </div>
      </div>

      {/* Size Guidance */}
      {sizeGuidance && (
        <p className="text-xs text-muted-foreground mb-5">{sizeGuidance}</p>
      )}
      {!sizeGuidance && <div className="mb-5" />}

      {/* CTA */}
      <Button
        className="w-full mb-5"
        variant={isCurrent ? "outline" : isPopular ? "default" : "outline"}
        disabled={isCurrent || isLoading}
        onClick={() => onSelect?.(plan)}
      >
        {isCurrent ? "Current Plan" : "Select Plan"}
      </Button>

      {/* Features */}
      <div className="space-y-2.5 pt-5 border-t border-border">
        <div className="flex items-center gap-2.5 text-sm">
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium">
            {plan.max_customers
              ? `Up to ${plan.max_customers.toLocaleString()} customers`
              : "Unlimited customers"}
          </span>
        </div>
        {plan.max_staff !== null && plan.max_staff !== undefined && (
          <div className="flex items-center gap-2.5 text-sm">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>
              {plan.max_staff ? `${plan.max_staff} staff members` : "Unlimited staff"}
            </span>
          </div>
        )}
        {plan.features?.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-sm">
            <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
