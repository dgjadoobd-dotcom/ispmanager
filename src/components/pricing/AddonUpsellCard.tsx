import { LucideIcon, Puzzle, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { PlatformAddon } from "@/hooks/usePlatformPricing";

interface AddonUpsellCardProps {
  addon: PlatformAddon;
  isActive?: boolean;
  onToggle?: (addonId: string, activate: boolean) => void;
  isLoading?: boolean;
  /** e.g. "Recommended for ISPs with 500+ customers" */
  recommendation?: string;
  /** Benefit-first headline override */
  benefitHeadline?: string;
  icon?: LucideIcon;
}

export function AddonUpsellCard({
  addon,
  isActive,
  onToggle,
  isLoading,
  recommendation,
  benefitHeadline,
  icon: Icon = Puzzle,
}: AddonUpsellCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-card p-5 transition-all duration-200",
        isActive
          ? "border-primary/30 bg-primary/[0.02]"
          : "hover:border-border/80 hover:shadow-soft"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "shrink-0 rounded-xl p-3",
            isActive ? "bg-primary/10" : "bg-muted"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-semibold text-sm leading-tight">
                {benefitHeadline || addon.name}
              </h4>
              {addon.description && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {addon.description}
                </p>
              )}
            </div>

            {/* Toggle */}
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => onToggle?.(addon.id, checked)}
              disabled={isLoading}
              className="shrink-0 mt-0.5"
            />
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tabular-nums">
                ৳{addon.base_price.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">/month</span>
              {addon.pricing_type === "tiered" && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  Tiered pricing
                </Badge>
              )}
            </div>

            {recommendation && (
              <p className="text-[11px] text-muted-foreground italic truncate">
                {recommendation}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
