import { useState, useEffect } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CreditCard, Loader2, Banknote, Smartphone, Check, ChevronsUpDown, Printer } from "lucide-react";
import { useRecordPayment } from "@/hooks/usePayments";
import { useCustomers } from "@/hooks/useCustomers";
import { useTenantContext } from "@/contexts/TenantContext";
import { generatePaymentReceipt } from "@/lib/generatePaymentReceipt";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuickPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedCustomerId?: string;
  onSuccess?: () => void;
}

const paymentMethods = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "online", label: "Online Payment", icon: Smartphone },
  { value: "bank_transfer", label: "Bank Transfer", icon: CreditCard },
];

export function QuickPaymentDialog({
  open,
  onOpenChange,
  preselectedCustomerId,
  onSuccess,
}: QuickPaymentDialogProps) {
  const { currentTenant } = useTenantContext();
  const { data: customers = [] } = useCustomers(currentTenant?.id);
  const recordPayment = useRecordPayment();

  const [customerId, setCustomerId] = useState(preselectedCustomerId || "");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [printReceipt, setPrintReceipt] = useState(true);
  const [lastPayment, setLastPayment] = useState<{
    receiptNumber: string;
    amount: number;
    customer: any;
  } | null>(null);

  useEffect(() => {
    if (preselectedCustomerId) {
      setCustomerId(preselectedCustomerId);
    }
  }, [preselectedCustomerId]);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (!currentTenant?.id) {
      toast.error("Tenant not found");
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    try {
      const result = await recordPayment.mutateAsync({
        tenant_id: currentTenant.id,
        customer_id: customerId,
        amount: paymentAmount,
        method: method,
        reference: reference || null,
        notes: notes || null,
      });

      const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`;

      toast.success(`Payment of ৳${paymentAmount.toLocaleString()} recorded successfully`);

      if (printReceipt && selectedCustomer) {
        generatePaymentReceipt({
          receiptNumber,
          paymentDate: new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          customerName: selectedCustomer.name,
          customerPhone: selectedCustomer.phone,
          customerAddress: selectedCustomer.address || undefined,
          amount: paymentAmount,
          method,
          reference: reference || undefined,
          notes: notes || undefined,
          branding: {
            name: currentTenant.name,
            logoUrl: currentTenant.logo_url,
            primaryColor: currentTenant.primary_color,
            accentColor: currentTenant.accent_color,
          },
        });
      }

      onOpenChange(false);
      onSuccess?.();

      // Reset form
      setCustomerId(preselectedCustomerId || "");
      setAmount("");
      setMethod("cash");
      setReference("");
      setNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to record payment");
    }
  };

  const handleQuickAmount = (amt: number) => {
    setAmount(amt.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record a new payment from a customer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label>Customer *</Label>
            <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={customerOpen}
                  className="w-full justify-between"
                  disabled={!!preselectedCustomerId}
                >
                  {selectedCustomer ? (
                    <span className="flex items-center gap-2">
                      <span>{selectedCustomer.name}</span>
                      <span className="text-muted-foreground">
                        ({selectedCustomer.phone})
                      </span>
                    </span>
                  ) : (
                    "Select customer..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search customer..." />
                  <CommandList>
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                      {customers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={`${customer.name} ${customer.phone}`}
                          onSelect={() => {
                            setCustomerId(customer.id);
                            setCustomerOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              customerId === customer.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{customer.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {customer.phone} • Due: ৳{(customer.due_balance || 0).toLocaleString()}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Customer Due Info */}
          {selectedCustomer && (selectedCustomer.due_balance || 0) > 0 && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">Current Due</p>
              <p className="text-xl font-bold text-destructive">
                ৳{(selectedCustomer.due_balance || 0).toLocaleString()}
              </p>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ৳
              </span>
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
            <div className="flex gap-2 flex-wrap">
              {selectedCustomer && (selectedCustomer.due_balance || 0) > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(selectedCustomer.due_balance || 0)}
                >
                  Full Due
                </Button>
              )}
              {selectedCustomer?.package?.monthly_price && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(selectedCustomer.package!.monthly_price)}
                >
                  Monthly (৳{selectedCustomer.package.monthly_price})
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(500)}
              >
                ৳500
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(1000)}
              >
                ৳1000
              </Button>
            </div>
          </div>

          {/* Payment Method */}
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

          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="reference">Reference / Transaction ID</Label>
            <Input
              id="reference"
              placeholder="e.g., TRX-123456"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          {/* Notes */}
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
