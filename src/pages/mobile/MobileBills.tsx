import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Receipt,
  ChevronRight,
  FileText,
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { usePortalBills, usePortalCustomer } from "@/hooks/usePortalData";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MobileBillDetail from "@/components/mobile/MobileBillDetail";
import type { Bill } from "@/hooks/usePortalData";
import { useInitiatePayment } from "@/hooks/usePaymentGateway";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

const billStatusMap = {
  paid: "paid" as const,
  due: "due" as const,
  partial: "partial" as const,
  overdue: "overdue" as const,
};

export default function MobileBills() {
  const { data: customer } = usePortalCustomer();
  const { data: bills, isLoading, refetch } = usePortalBills();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { initiatePayment, isProcessing } = useInitiatePayment();

  const paymentStatus = searchParams.get("status");
  const [showPaymentResult, setShowPaymentResult] = useState(false);

  useEffect(() => {
    if (paymentStatus) {
      setShowPaymentResult(true);
      refetch();
      const timer = setTimeout(() => {
        setShowPaymentResult(false);
        setSearchParams({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, refetch, setSearchParams]);

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  const unpaidBills =
    bills?.filter(
      (bill) =>
        bill.status === "due" ||
        bill.status === "overdue" ||
        bill.status === "partial"
    ) || [];

  const totalDue = unpaidBills.reduce(
    (sum, bill) => sum + Number(bill.amount),
    0
  );
  const oldestUnpaidBill =
    unpaidBills.length > 0 ? unpaidBills[unpaidBills.length - 1] : null;

  const handlePayAll = () => {
    if (oldestUnpaidBill) {
      initiatePayment({
        billId: oldestUnpaidBill.id,
        amount: Number(oldestUnpaidBill.amount),
      });
    }
  };

  if (selectedBill) {
    return (
      <MobileBillDetail bill={selectedBill} onBack={() => setSelectedBill(null)} />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bills</h1>
        <p className="text-sm text-muted-foreground">Your billing history</p>
      </div>

      {/* Payment Feedback */}
      {showPaymentResult && paymentStatus === "success" && (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-2xl animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="font-semibold text-sm">Payment Successful!</p>
            <p className="text-xs text-muted-foreground">Your connection will be restored shortly.</p>
          </div>
        </div>
      )}
      {showPaymentResult && paymentStatus === "cancelled" && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
            <XCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-sm">Payment Cancelled</p>
            <p className="text-xs text-muted-foreground">No charges were made. Please try again.</p>
          </div>
        </div>
      )}

      {/* Due Summary with Pay Now */}
      {totalDue > 0 && (
        <Card className="overflow-hidden border-0 shadow-xl rounded-2xl">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground p-5 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 blur-2xl" />
              <div className="relative z-10">
                <p className="text-sm text-white/80 mb-0.5">Total Due</p>
                <p className="text-3xl font-bold tabular-nums tracking-tight">
                  {formatCurrency(totalDue)}
                </p>
                <p className="text-xs text-white/60 mt-1 mb-4">
                  {unpaidBills.length} unpaid bill{unpaidBills.length > 1 ? "s" : ""}
                </p>
                <Button
                  onClick={handlePayAll}
                  disabled={isProcessing}
                  className="w-full h-11 bg-white text-primary font-semibold hover:bg-white/90 active:scale-[0.98] touch-manipulation rounded-xl"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  {unpaidBills.length > 1 ? "Pay Oldest Bill" : "Pay Now"}
                </Button>
                <div className="flex items-center justify-center gap-1.5 mt-3 text-white/50 text-xs">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Secure payment · Instant connection restore</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bill List */}
      <div className="space-y-2.5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] rounded-xl" />
          ))
        ) : bills && bills.length > 0 ? (
          bills.map((bill) => {
            const status = bill.status || "due";
            return (
              <button
                key={bill.id}
                onClick={() => setSelectedBill(bill)}
                className="w-full flex items-center gap-3.5 p-3.5 bg-card rounded-xl border active:scale-[0.98] touch-manipulation transition-all duration-150 text-left"
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                    status === "paid"
                      ? "bg-success/10"
                      : status === "overdue"
                      ? "bg-destructive/10"
                      : "bg-warning/10"
                  )}
                >
                  <Receipt
                    className={cn(
                      "w-5 h-5",
                      status === "paid"
                        ? "text-success"
                        : status === "overdue"
                        ? "text-destructive"
                        : "text-warning"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {bill.invoice_number}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(bill.billing_period_start).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short" }
                    )}{" "}
                    –{" "}
                    {new Date(bill.billing_period_end).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" }
                    )}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold tabular-nums text-sm">
                    {formatCurrency(Number(bill.amount))}
                  </p>
                  <StatusBadge
                    variant={billStatusMap[status] ?? "default"}
                    dot={false}
                    className="mt-1 text-[10px] px-2 py-0"
                  >
                    {status === "paid"
                      ? "Paid"
                      : status === "overdue"
                      ? "Overdue"
                      : status === "partial"
                      ? "Partial"
                      : "Due"}
                  </StatusBadge>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <FileText className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-semibold">No Bills Yet</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your bills will appear here once generated
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
