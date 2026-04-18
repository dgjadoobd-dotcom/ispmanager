import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wifi,
  WifiOff,
  Receipt,
  CreditCard,
  ChevronRight,
  CheckCircle,
  Clock,
  UserX,
  Bell,
  Package,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePortalCustomer, usePortalBills, usePortalPayments } from "@/hooks/usePortalData";
import { useCustomerBranding } from "@/hooks/useBranding";
import { cn } from "@/lib/utils";
import { MobileNotificationSheet } from "@/components/mobile/MobileNotificationSheet";
import { StatusBadge } from "@/components/shared/StatusBadge";

const statusConfig = {
  active: { label: "Active", icon: CheckCircle, variant: "active" as const },
  suspended: { label: "Suspended", icon: WifiOff, variant: "suspended" as const },
  pending: { label: "Pending", icon: Clock, variant: "pending" as const },
};

export default function MobileHome() {
  const navigate = useNavigate();
  const { data: customer, isLoading: customerLoading } = usePortalCustomer();
  const { data: bills, isLoading: billsLoading } = usePortalBills();
  const { data: payments } = usePortalPayments();
  const { branding } = useCustomerBranding(customer?.id);
  const [notificationSheetOpen, setNotificationSheetOpen] = useState(false);

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;
  const currentBill = bills?.find((b) => b.status !== "paid") || bills?.[0];
  const lastPayment = payments?.[0];
  const dueBalance = Number(customer?.due_balance) || 0;

  if (customerLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-28" />
          </div>
          <Skeleton className="h-11 w-11 rounded-full" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 text-center px-6">
        <div className="h-20 w-20 rounded-full bg-muted/60 flex items-center justify-center">
          <UserX className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">No Account Found</h2>
        <p className="text-muted-foreground text-sm max-w-[260px]">
          Your login is not linked to any customer account. Please contact your ISP.
        </p>
      </div>
    );
  }

  const connectionStatus = customer.connection_status || "pending";
  const statusInfo = statusConfig[connectionStatus];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-5">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-2xl font-bold tracking-tight truncate max-w-[220px]">
            {customer.name.split(" ")[0]}
          </h1>
        </div>
        <button
          onClick={() => setNotificationSheetOpen(true)}
          className="relative h-11 w-11 rounded-full bg-muted/50 flex items-center justify-center active:scale-95 touch-manipulation transition-transform"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Due Amount Hero Card */}
      <Card className="overflow-hidden border-0 shadow-xl rounded-2xl">
        <CardContent className="p-0">
          <div
            className={cn(
              "relative p-6 text-white overflow-hidden",
              dueBalance > 0
                ? "bg-gradient-to-br from-destructive via-destructive/90 to-destructive/70"
                : "bg-gradient-to-br from-success via-success/90 to-success/70"
            )}
          >
            {/* Background decoration */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5 blur-xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white/80">
                  {dueBalance > 0 ? "Amount Due" : "All Paid"}
                </span>
              </div>
              <p className="text-4xl font-bold tabular-nums tracking-tight mb-4">
                {formatCurrency(dueBalance)}
              </p>

              {dueBalance > 0 ? (
                <>
                  <Button
                    onClick={() => navigate("/app/bills")}
                    className="w-full h-12 bg-white text-destructive font-semibold text-base hover:bg-white/90 active:scale-[0.98] touch-manipulation rounded-xl shadow-lg"
                  >
                    Pay Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-white/60 text-xs">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Secure payment · Instant connection restore</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>You're all caught up!</span>
                </div>
              )}
            </div>
          </div>

          {/* Connection status strip */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-card">
            <div className="flex items-center gap-3">
              <Wifi className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {customer.packages?.name || "No Package"}
              </span>
            </div>
            <StatusBadge variant={statusInfo.variant}>
              {statusInfo.label}
            </StatusBadge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/app/bills")}
          className="bg-card border rounded-2xl p-4 text-left active:scale-[0.97] touch-manipulation transition-transform"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Receipt className="w-[18px] h-[18px] text-primary" />
          </div>
          {billsLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : currentBill ? (
            <>
              <p className="text-xl font-bold tabular-nums">
                {formatCurrency(Number(currentBill.amount))}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Current Bill</p>
            </>
          ) : (
            <>
              <p className="text-base font-medium text-muted-foreground">—</p>
              <p className="text-xs text-muted-foreground mt-0.5">No bills</p>
            </>
          )}
        </button>

        <button
          onClick={() => navigate("/app/payments")}
          className="bg-card border rounded-2xl p-4 text-left active:scale-[0.97] touch-manipulation transition-transform"
        >
          <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center mb-3">
            <CreditCard className="w-[18px] h-[18px] text-success" />
          </div>
          {lastPayment ? (
            <>
              <p className="text-xl font-bold tabular-nums">
                {formatCurrency(Number(lastPayment.amount))}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Last Payment</p>
            </>
          ) : (
            <>
              <p className="text-base font-medium text-muted-foreground">—</p>
              <p className="text-xs text-muted-foreground mt-0.5">No payments</p>
            </>
          )}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Quick Actions
        </p>
        <QuickAction
          icon={Receipt}
          iconClass="bg-primary/10 text-primary"
          title="View All Bills"
          onClick={() => navigate("/app/bills")}
        />
        <QuickAction
          icon={CreditCard}
          iconClass="bg-success/10 text-success"
          title="Payment History"
          onClick={() => navigate("/app/payments")}
        />
        <QuickAction
          icon={Package}
          iconClass="bg-info/10 text-info"
          title="My Package"
          onClick={() => navigate("/app/profile")}
        />
      </div>

      <MobileNotificationSheet
        open={notificationSheetOpen}
        onOpenChange={setNotificationSheetOpen}
      />
    </div>
  );
}

function QuickAction({
  icon: Icon,
  iconClass,
  title,
  onClick,
}: {
  icon: React.ElementType;
  iconClass: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-3.5 bg-card rounded-xl border active:scale-[0.98] touch-manipulation transition-all duration-150 hover:bg-muted/30"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="flex-1 text-left font-medium text-[15px]">{title}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}
