import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Receipt, Loader2, Banknote, Smartphone, CreditCard, Printer } from "lucide-react";
import { useRecordPayment } from "@/hooks/usePayments";
import { useToast } from "@/hooks/use-toast";
import { generatePaymentReceipt } from "@/lib/generatePaymentReceipt";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: string;
  customerId: string;
  tenantId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  invoiceNumber: string;
  billingPeriod?: string;
  outstandingAmount: number;
  tenantName?: string;
  tenantLogoUrl?: string | null;
  tenantPrimaryColor?: string | null;
  tenantAccentColor?: string | null;
  onSuccess?: () => void;
}

const paymentMethods = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "online", label: "Online Payment", icon: Smartphone },
  { value: "bank_transfer", label: "Bank Transfer", icon: CreditCard },
];

export function RecordPaymentDialog({
  open,
  onOpenChange,
  billId,
  customerId,
  tenantId,
  customerName,
  customerPhone,
  customerAddress,
  invoiceNumber,
  billingPeriod,
  outstandingAmount,
  tenantName,
  tenantLogoUrl,
  tenantPrimaryColor,
  tenantAccentColor,
  onSuccess,
}: RecordPaymentDialogProps) {
  const { toast } = useToast();
  const recordPayment = useRecordPayment();
  
  const [amount, setAmount] = useState(outstandingAmount.toString());
  const [method, setMethod] = useState<string>("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [printReceipt, setPrintReceipt] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    try {
      await recordPayment.mutateAsync({
        tenant_id: tenantId,
        customer_id: customerId,
        bill_id: billId,
        amount: paymentAmount,
        method: method,
        reference: reference || null,
        notes: notes || null,
      });

      const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`;

      toast({
        title: "Payment recorded",
        description: `Payment of ৳${paymentAmount.toLocaleString()} recorded successfully`,
      });

      // Generate receipt if enabled
      if (printReceipt) {
        generatePaymentReceipt({
          receiptNumber,
          paymentDate: new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          customerName,
          customerPhone: customerPhone || "",
          customerAddress,
          amount: paymentAmount,
          method,
          reference: reference || undefined,
          notes: notes || undefined,
          invoiceNumber,
          billingPeriod,
          branding: {
            name: tenantName || "ISP Provider",
            logoUrl: tenantLogoUrl,
            primaryColor: tenantPrimaryColor,
            accentColor: tenantAccentColor,
          },
        });
      }

      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setAmount("");
      setMethod("cash");
      setReference("");
      setNotes("");
    } catch (error: any) {
      toast({
        title: "Error recording payment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Recording payment for {customerName} - Invoice {invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-sm text-muted-foreground">Outstanding Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(outstandingAmount)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(outstandingAmount.toString())}
              >
                Full Amount
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount((outstandingAmount / 2).toString())}
              >
                Half
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method *</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((pm) => (
                  <SelectItem key={pm.value} value={pm.value}>
                    <div className="flex items-center gap-2">
                      <pm.icon className="h-4 w-4" />
                      {pm.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference / Transaction ID</Label>
            <Input
              id="reference"
              placeholder="e.g., TRX-123456 or Receipt #"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Print Receipt Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="printReceipt"
              checked={printReceipt}
              onChange={(e) => setPrintReceipt(e.target.checked)}
              className="rounded border-input"
            />
            <Label htmlFor="printReceipt" className="flex items-center gap-2 text-sm cursor-pointer">
              <Printer className="h-4 w-4" />
              Generate & download receipt PDF
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={recordPayment.isPending}>
              {recordPayment.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
