import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Send,
  Printer,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Phone,
  Calendar,
  CreditCard,
  Wifi,
} from "lucide-react";
import type { PaymentStatus } from "@/types";
import { downloadInvoicePdf } from "@/lib/generateInvoicePdf";
import { useToast } from "@/hooks/use-toast";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PaymentRecord {
  id: string;
  date: Date;
  amount: number;
  method: "cash" | "online" | "bank_transfer";
  reference?: string;
  receivedBy: string;
}

export interface InvoiceDetail {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  packageName: string;
  amount: number;
  dueDate: Date;
  status: PaymentStatus;
  billingPeriod: {
    start: Date;
    end: Date;
  };
  createdAt: Date;
  lineItems: LineItem[];
  payments: PaymentRecord[];
  paidAmount: number;
  notes?: string;
}

interface TenantBranding {
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  address?: string;
  phone?: string;
  email?: string;
}

interface InvoiceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceDetail | null;
  branding?: TenantBranding;
  onRecordPayment?: (invoiceId: string) => void;
}

const statusConfig: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ComponentType<{ className?: string }> }
> = {
  paid: { label: "Paid", variant: "default", icon: CheckCircle },
  due: { label: "Due", variant: "secondary", icon: Clock },
  partial: { label: "Partial", variant: "outline", icon: AlertCircle },
  overdue: { label: "Overdue", variant: "destructive", icon: AlertCircle },
};

const paymentMethodLabels: Record<string, string> = {
  cash: "Cash",
  online: "Online Payment",
  bank_transfer: "Bank Transfer",
};

export function InvoiceDetailDialog({
  open,
  onOpenChange,
  invoice,
  branding,
  onRecordPayment,
}: InvoiceDetailDialogProps) {
  const { toast } = useToast();
  
  if (!invoice) return null;

  const StatusIcon = statusConfig[invoice.status].icon;
  const remainingBalance = invoice.amount - invoice.paidAmount;

  const handleDownloadPdf = async () => {
    try {
      await downloadInvoicePdf(invoice, branding);
      toast({
        title: "PDF Downloaded",
        description: `Invoice ${invoice.id} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = async () => {
    try {
      const { generateInvoicePdf } = await import("@/lib/generateInvoicePdf");
      const doc = await generateInvoicePdf(invoice, branding);
      doc.autoPrint();
      window.open(doc.output("bloburl"), "_blank");
    } catch (error) {
      toast({
        title: "Print Failed",
        description: "Failed to generate print preview. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Receipt className="h-5 w-5" />
                Invoice {invoice.id}
              </DialogTitle>
              <DialogDescription>
                Created on {formatDate(invoice.createdAt)}
              </DialogDescription>
            </div>
            <Badge variant={statusConfig[invoice.status].variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusConfig[invoice.status].label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer & Billing Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Customer Info */}
            <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Customer Details
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{invoice.customerName}</p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {invoice.customerPhone}
                </p>
                {invoice.customerEmail && (
                  <p className="text-muted-foreground">{invoice.customerEmail}</p>
                )}
                {invoice.customerAddress && (
                  <p className="text-muted-foreground">{invoice.customerAddress}</p>
                )}
              </div>
            </div>

            {/* Billing Info */}
            <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Billing Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Period:</span>
                  <span>
                    {formatDate(invoice.billingPeriod.start)} - {formatDate(invoice.billingPeriod.end)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className={invoice.status === "overdue" ? "text-destructive font-medium" : ""}>
                    {formatDate(invoice.dueDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package:</span>
                  <span className="flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    {invoice.packageName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div className="space-y-3">
            <h3 className="font-semibold">Invoice Breakdown</h3>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="flex flex-col items-end space-y-2 pt-2">
              <div className="flex justify-between w-48 text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(invoice.amount)}</span>
              </div>
              {invoice.paidAmount > 0 && (
                <div className="flex justify-between w-48 text-sm text-primary">
                  <span>Paid:</span>
                  <span>-{formatCurrency(invoice.paidAmount)}</span>
                </div>
              )}
              <Separator className="w-48" />
              <div className="flex justify-between w-48 font-semibold">
                <span>{remainingBalance === 0 ? "Total:" : "Balance Due:"}</span>
                <span className={remainingBalance > 0 ? "text-destructive" : "text-primary"}>
                  {formatCurrency(remainingBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment History
                </h3>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Received By</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.date)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {paymentMethodLabels[payment.method]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {payment.reference || "-"}
                          </TableCell>
                          <TableCell>{payment.receivedBy}</TableCell>
                          <TableCell className="text-right font-medium text-primary">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {invoice.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Notes</h3>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Send className="h-4 w-4" />
            Send to Customer
          </Button>
          {invoice.status !== "paid" && onRecordPayment && (
            <Button
              size="sm"
              className="gap-2 ml-auto"
              onClick={() => {
                onRecordPayment(invoice.id);
                onOpenChange(false);
              }}
            >
              <Receipt className="h-4 w-4" />
              Record Payment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
