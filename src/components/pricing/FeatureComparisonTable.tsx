import { Check, Minus, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PlatformPlan } from "@/hooks/usePlatformPricing";

interface FeatureRow {
  label: string;
  tooltip?: string;
  values: (boolean | string)[];
}

interface FeatureGroup {
  category: string;
  features: FeatureRow[];
}

interface FeatureComparisonTableProps {
  plans: PlatformPlan[];
  currentPlanId?: string;
}

function getFeatureGroups(plans: PlatformPlan[]): FeatureGroup[] {
  // Static comparison matrix — maps plan index to feature availability
  // This is presentation-only; it does not change billing logic
  const allFeatures = plans.flatMap((p) => p.features || []);
  const uniqueFeatures = [...new Set(allFeatures)];

  const billingFeatures: FeatureRow[] = [
    {
      label: "Monthly auto-billing",
      tooltip: "Bills are generated automatically on the 1st of every month",
      values: plans.map(() => true),
    },
    {
      label: "Invoice PDF generation",
      tooltip: "Branded PDF invoices for every bill",
      values: plans.map(() => true),
    },
    {
      label: "Partial & advance payments",
      tooltip: "Accept flexible payment amounts from customers",
      values: plans.map((_, i) => i >= 1),
    },
  ];

  const paymentFeatures: FeatureRow[] = [
    {
      label: "Cash & bank transfer",
      values: plans.map(() => true),
    },
    {
      label: "Online payment gateway",
      tooltip: "Customers pay via bKash, Nagad, cards directly from their portal",
      values: plans.map((_, i) => i >= 1),
    },
    {
      label: "Payment receipts",
      values: plans.map(() => true),
    },
  ];

  const automationFeatures: FeatureRow[] = [
    {
      label: "Auto-suspend overdue connections",
      tooltip: "Automatically suspend service for customers who haven't paid — reduces unpaid bills",
      values: plans.map((_, i) => i >= 1),
    },
    {
      label: "Due date reminders",
      tooltip: "Automatic SMS/push reminders before the due date",
      values: plans.map((_, i) => i >= 1),
    },
    {
      label: "Auto-restore on payment",
      tooltip: "Service resumes immediately once payment is confirmed",
      values: plans.map((_, i) => i >= 1),
    },
  ];

  const networkFeatures: FeatureRow[] = [
    {
      label: "MikroTik integration",
      tooltip: "Control customer bandwidth and access directly from the panel",
      values: plans.map((_, i) => i >= 2),
    },
    {
      label: "RADIUS support",
      tooltip: "Integrate with RADIUS servers for PPPoE authentication",
      values: plans.map((_, i) => i >= 2),
    },
    {
      label: "Real-time speed control",
      values: plans.map((_, i) => i >= 2),
    },
  ];

  const supportFeatures: FeatureRow[] = [
    {
      label: "Email support",
      values: plans.map(() => true),
    },
    {
      label: "Priority support",
      values: plans.map((_, i) => i >= 1),
    },
    {
      label: "Dedicated account manager",
      values: plans.map((_, i) => i >= 2),
    },
  ];

  return [
    { category: "Billing", features: billingFeatures },
    { category: "Payments", features: paymentFeatures },
    { category: "Automation", features: automationFeatures },
    { category: "Network", features: networkFeatures },
    { category: "Support", features: supportFeatures },
  ];
}

export function FeatureComparisonTable({ plans, currentPlanId }: FeatureComparisonTableProps) {
  const groups = getFeatureGroups(plans);

  if (plans.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          {/* Header */}
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-4 font-medium text-muted-foreground w-[40%]">
                Features
              </th>
              {plans.map((plan) => (
                <th
                  key={plan.id}
                  className={cn(
                    "p-4 text-center font-semibold",
                    plan.id === currentPlanId && "bg-primary/5"
                  )}
                >
                  <div>{plan.name}</div>
                  <div className="text-xs font-normal text-muted-foreground mt-0.5">
                    ৳{plan.base_price}/mo
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {groups.map((group) => (
              <>
                {/* Category Header */}
                <tr key={`cat-${group.category}`}>
                  <td
                    colSpan={plans.length + 1}
                    className="px-4 pt-5 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {group.category}
                  </td>
                </tr>

                {/* Feature Rows */}
                {group.features.map((feature, idx) => (
                  <tr
                    key={`${group.category}-${idx}`}
                    className="border-b border-border/50 last:border-b-0"
                  >
                    <td className="p-4 flex items-center gap-1.5">
                      <span>{feature.label}</span>
                      {feature.tooltip && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[240px] text-xs">
                            {feature.tooltip}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </td>
                    {feature.values.map((val, i) => (
                      <td
                        key={i}
                        className={cn(
                          "p-4 text-center",
                          plans[i]?.id === currentPlanId && "bg-primary/5"
                        )}
                      >
                        {val === true ? (
                          <Check className="h-4 w-4 text-success mx-auto" />
                        ) : val === false ? (
                          <Minus className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                        ) : (
                          <span className="font-medium">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}
