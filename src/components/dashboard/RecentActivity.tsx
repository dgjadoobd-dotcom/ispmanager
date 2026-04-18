import { CreditCard, UserPlus, AlertTriangle, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenantContext } from "@/contexts/TenantContext";
import { usePayments } from "@/hooks/usePayments";
import { useCustomers } from "@/hooks/useCustomers";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityItem {
  id: string;
  type: "payment" | "new_customer" | "suspension" | "reactivation";
  title: string;
  description: string;
  time: string;
  amount?: number;
}

const iconMap = {
  payment: CreditCard,
  new_customer: UserPlus,
  suspension: AlertTriangle,
  reactivation: CheckCircle,
};

const colorMap = {
  payment: "text-success bg-success/10 ring-success/20",
  new_customer: "text-primary bg-primary/10 ring-primary/20",
  suspension: "text-destructive bg-destructive/10 ring-destructive/20",
  reactivation: "text-success bg-success/10 ring-success/20",
};

export function RecentActivity() {
  const navigate = useNavigate();
  const { currentTenant } = useTenantContext();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments(currentTenant?.id);
  const { data: customers = [], isLoading: customersLoading } = useCustomers(currentTenant?.id);

  const isLoading = paymentsLoading || customersLoading;

  // Build activity list from real data
  const activities: ActivityItem[] = [];

  // Add recent payments
  payments.slice(0, 3).forEach((payment) => {
    activities.push({
      id: `payment-${payment.id}`,
      type: "payment",
      title: "Payment Received",
      description: payment.customer?.name || "Customer",
      time: formatDistanceToNow(new Date(payment.created_at), { addSuffix: true }),
      amount: Number(payment.amount),
    });
  });

  // Add recent customers
  const recentCustomers = customers
    .filter((c) => {
      const joinDate = new Date(c.join_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return joinDate >= weekAgo;
    })
    .slice(0, 2);

  recentCustomers.forEach((customer) => {
    activities.push({
      id: `customer-${customer.id}`,
      type: "new_customer",
      title: "New Customer",
      description: `${customer.name} - ${customer.package?.name || "Plan pending"}`,
      time: formatDistanceToNow(new Date(customer.join_date), { addSuffix: true }),
    });
  });

  // Add suspended customers
  const suspendedCustomers = customers
    .filter((c) => c.connection_status === "suspended")
    .slice(0, 1);

  suspendedCustomers.forEach((customer) => {
    activities.push({
      id: `suspended-${customer.id}`,
      type: "suspension",
      title: "Connection Suspended",
      description: customer.name,
      time: formatDistanceToNow(new Date(customer.updated_at), { addSuffix: true }),
    });
  });

  const sortedActivities = activities.slice(0, 5);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-border">
        <h3 className="text-base font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Latest updates from your ISP</p>
      </div>
      
      {sortedActivities.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="font-medium text-muted-foreground">No recent activity</p>
          <p className="text-sm text-muted-foreground mt-1">
            Activity will appear here as you use the system
          </p>
        </div>
      ) : (
        <div className="flex-1 divide-y divide-border overflow-auto">
          {sortedActivities.map((activity, index) => {
            const Icon = iconMap[activity.type];
            return (
              <div
                key={activity.id}
                className={cn(
                  "flex items-center gap-4 p-4 transition-colors hover:bg-muted/30 cursor-pointer animate-fade-in",
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "shrink-0 h-10 w-10 rounded-full flex items-center justify-center ring-1",
                  colorMap[activity.type]
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    {activity.amount && (
                      <span className="text-sm font-semibold text-success shrink-0">
                        +৳{activity.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {activity.description}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                  {activity.time}
                </span>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="p-4 border-t border-border mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          onClick={() => navigate("/dashboard/notifications")}
        >
          View all activity
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
