import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, CheckCircle, FileText, Download, ShieldCheck } from "lucide-react";
import { usePortalPayments } from "@/hooks/usePortalData";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

export default function MobilePayments() {
  const { data: payments, isLoading } = usePortalPayments();

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;
  const totalPaid =
    payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">Your payment history</p>
      </div>

      {/* Summary Card */}
      <Card className="overflow-hidden border-0 shadow-xl rounded-2xl">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-success via-success/90 to-success/70 text-white p-5 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-white/80">Total Paid</span>
              </div>
              <p className="text-3xl font-bold tabular-nums tracking-tight">
                {formatCurrency(totalPaid)}
              </p>
              <p className="text-xs text-white/60 mt-1">
                {payments?.length || 0} transaction{(payments?.length || 0) !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Recent Transactions
        </p>

        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[80px] rounded-xl" />
          ))
        ) : payments && payments.length > 0 ? (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-card rounded-xl border p-3.5 space-y-0"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold tabular-nums text-sm">
                    {formatCurrency(Number(payment.amount))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(payment.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge variant="paid" dot={false} className="text-[10px] px-2 py-0">
                    Paid
                  </StatusBadge>
                  <p className="text-[11px] text-muted-foreground mt-1 capitalize">
                    {payment.method || "Cash"}
                  </p>
                </div>
              </div>
              {payment.bills?.invoice_number && (
                <div className="mt-2.5 pt-2.5 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Invoice: {payment.bills.invoice_number}</span>
                  </div>
                  <button className="text-primary text-xs flex items-center gap-1 font-medium active:scale-95 touch-manipulation">
                    <Download className="w-3.5 h-3.5" />
                    Receipt
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <CreditCard className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-semibold">No Payments Yet</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your payment history will appear here after your first payment
            </p>
          </div>
        )}
      </div>

      {/* Trust footer */}
      {payments && payments.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60 py-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>All payments are securely processed</span>
        </div>
      )}
    </div>
  );
}
