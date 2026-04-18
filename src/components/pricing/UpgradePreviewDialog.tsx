import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Check, Info, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlatformPlan } from "@/hooks/usePlatformPricing";

interface UpgradePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: PlatformPlan | null;
  newPlan: PlatformPlan | null;
  currentCost?: number;
  estimatedNewCost?: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function UpgradePreviewDialog({
  open,
  onOpenChange,
  currentPlan,
  newPlan,
  currentCost,
  estimatedNewCost,
  onConfirm,
  isLoading,
}: UpgradePreviewDialogProps) {
  if (!newPlan) return null;

  const isUpgrade =
    currentPlan && newPlan.base_price > currentPlan.base_price;
  const isDowngrade =
    currentPlan && newPlan.base_price < currentPlan.base_price;

  const priceDiff = currentPlan
    ? newPlan.base_price - currentPlan.base_price
    : newPlan.base_price;

  // Features that are new compared to current plan
  const newFeatures = newPlan.features?.filter(
    (f) => !currentPlan?.features?.includes(f)
  ) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Select"} Plan
          </DialogTitle>
          <DialogDescription>
            Review what changes when you switch to {newPlan.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan comparison */}
          {currentPlan && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex-1 text-center">
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="font-semibold text-sm">{currentPlan.name}</p>
                <p className="text-xs text-muted-foreground">
                  ৳{currentPlan.base_price}/mo
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 text-center">
                <p className="text-xs text-muted-foreground">New</p>
                <p className="font-semibold text-sm text-primary">
                  {newPlan.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  ৳{newPlan.base_price}/mo
                </p>
              </div>
            </div>
          )}

          {/* What changes */}
          <div className="space-y-3">
            <p className="text-sm font-medium">What changes</p>

            <div className="space-y-2 text-sm">
              {/* Customer limit */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Customer limit</span>
                <span className="font-medium">
                  {newPlan.max_customers
                    ? `${newPlan.max_customers.toLocaleString()}`
                    : "Unlimited"}
                </span>
              </div>

              {/* Monthly cost */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Monthly base cost</span>
                <span
                  className={cn(
                    "font-semibold",
                    isUpgrade && "text-destructive",
                    isDowngrade && "text-success"
                  )}
                >
                  ৳{newPlan.base_price.toLocaleString()}
                  {priceDiff !== 0 && currentPlan && (
                    <span className="text-xs ml-1">
                      ({priceDiff > 0 ? "+" : ""}
                      {priceDiff.toLocaleString()})
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* New features gained */}
            {newFeatures.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {isUpgrade ? "You'll gain" : "Included features"}
                </p>
                <div className="space-y-1.5">
                  {newFeatures.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Proration notice */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <p>
              Changes take effect at the start of the next billing cycle. If
              upgrading mid-cycle, the difference will be prorated on your next
              invoice.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading
              ? "Processing..."
              : `Confirm ${isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Selection"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
