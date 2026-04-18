import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Download,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { Bill } from "@/hooks/usePortalData";
import { usePortalCustomer } from "@/hooks/usePortalData";
import { useInitiatePayment } from "@/hooks/usePaymentGateway";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

interface MobileBillDetailProps {
  bill: Bill;
  onBack: () => void;
}

const statusMap = {
  paid: "paid" as const,
  due: "due" as const,
  partial: "partial" as const,
  overdue: "overdue" as const,
};

export default function MobileBillDetail({ bill, onBack }: MobileBillDetailProps) {
  const { data: customer } = usePortalCustomer();
  const { initiatePayment, isProcessing, error } = useInitiatePayment();
  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;
  const status = bill.status || "due";

  const handlePayNow = () => {
    initiatePayment({ billId: bill.id, amount: Number(bill.amount) });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center active:scale-95 touch-manipulation"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold">{bill.invoice_number}</h1>
          <p className="text-xs text-muted-foreground">Bill Details</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-sm">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-destructive">{error.message}</span>
        </div>
      )}

      {/* Amount Card */}
      <Card
        className={cn(
          "rounded-2xl border-0 shadow-xl overflow-hidden"
        )}
      >
        <CardContent className="p-0">
          <div
            className={cn(
              "p-6 text-center text-white relative overflow-hidden",
              status === "paid"
                ? "bg-gradient-to-br from-success to-success/70"
                : status === "overdue"
                ? "bg-gradient-to-br from-destructive to-destructive/70"
                : "bg-gradient-to-br from-warning to-warning/70"
            )}
          >
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10">
              <p className="text-sm text-white/80 mb-1">Bill Amount</p>
              <p className="text-4xl font-bold tabular-nums tracking-tight mb-3">
                {formatCurrency(Number(bill.amount))}
              </p>
              <StatusBadge
                variant={statusMap[status] ?? "default"}
                dot={false}
                className="bg-white/20 border-white/10 text-white"
              >
                {status === "paid" ? "Paid" : status === "overdue" ? "Overdue" : status === "partial" ? "Partial" : "Due"}
              </StatusBadge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-0 divide-y divide-border">
          <DetailRow label="Customer" value={customer?.name || "—"} />
          <DetailRow
            label="Period"
            value={`${new Date(bill.billing_period_start).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })} – ${new Date(bill.billing_period_end).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}`}
          />
          <DetailRow
            label="Due Date"
            value={new Date(bill.due_date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            icon={Calendar}
          />
          <DetailRow label="Package" value={customer?.packages?.name || "N/A"} />
          {bill.notes && <DetailRow label="Notes" value={bill.notes} />}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-2.5 pt-2">
        {status !== "paid" && (
          <Button
            className="w-full h-13 text-base font-semibold gap-2 rounded-xl active:scale-[0.98] touch-manipulation"
            onClick={handlePayNow}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay Now · {formatCurrency(Number(bill.amount))}
              </>
            )}
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full h-12 gap-2 rounded-xl active:scale-[0.98] touch-manipulation"
        >
          <Download className="w-5 h-5" />
          Download Invoice
        </Button>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium text-sm text-right flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
        {value}
      </span>
    </div>
  );
}
