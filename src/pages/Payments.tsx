import { useState } from "react";
import { Plus, Search, Filter, Download, MoreHorizontal, CreditCard, Banknote, Globe, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePayments, type Payment } from "@/hooks/usePayments";
import { useTenantContext } from "@/contexts/TenantContext";
import { QuickPaymentDialog } from "@/components/payments/QuickPaymentDialog";
import { generatePaymentReceipt } from "@/lib/generatePaymentReceipt";

type PaymentMethod = "cash" | "online" | "bank_transfer";

const methodIcons: Record<PaymentMethod, React.ReactNode> = {
  cash: <Banknote className="h-4 w-4" />,
  online: <Globe className="h-4 w-4" />,
  bank_transfer: <CreditCard className="h-4 w-4" />,
};

const methodLabels: Record<PaymentMethod, string> = {
  cash: "Cash",
  online: "Online",
  bank_transfer: "Bank Transfer",
};

const methodStyles: Record<PaymentMethod, string> = {
  cash: "bg-success/10 text-success border-success/20",
  online: "bg-primary/10 text-primary border-primary/20",
  bank_transfer: "bg-info/10 text-info border-info/20",
};

export default function Payments() {
  const { currentTenant } = useTenantContext();
  const { data: payments = [], isLoading, error, refetch } = usePayments(currentTenant?.id);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const totalToday = payments
    .filter((p) => {
      const paymentDate = new Date(p.created_at);
      paymentDate.setHours(0, 0, 0, 0);
      return paymentDate.getTime() === today.getTime();
    })
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const thisMonth = new Date();
  const totalThisMonth = payments
    .filter((p) => {
      const paymentDate = new Date(p.created_at);
      return (
        paymentDate.getMonth() === thisMonth.getMonth() &&
        paymentDate.getFullYear() === thisMonth.getFullYear()
      );
    })
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">পেমেন্ট তথ্য লোড করতে সমস্যা হয়েছে।</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          পুনরায় চেষ্টা করুন
        </Button>
      </div>
    );
  }

  const handlePrintReceipt = (payment: Payment) => {
    generatePaymentReceipt({
      receiptNumber: `RCP-${payment.id.slice(0, 8).toUpperCase()}`,
      paymentDate: new Date(payment.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      customerName: payment.customer?.name || "Unknown",
      customerPhone: payment.customer?.phone || "",
      customerAddress: payment.customer?.address || undefined,
      amount: Number(payment.amount),
      method: payment.method || "cash",
      reference: payment.reference || undefined,
      notes: payment.notes || undefined,
      branding: {
        name: currentTenant?.name || "ISP Provider",
        logoUrl: currentTenant?.logo_url,
        primaryColor: currentTenant?.primary_color,
        accentColor: currentTenant?.accent_color,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Payment Dialog */}
      <QuickPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSuccess={() => refetch()}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Track and manage all payment transactions
          </p>
        </div>
        <Button className="gap-2" onClick={() => setPaymentDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Collection</CardDescription>
            <CardTitle className="text-3xl text-success">
              ৳{totalToday.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-3xl">
              ৳{totalThisMonth.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Transactions</CardDescription>
            <CardTitle className="text-3xl">{payments.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        {filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium">
              {payments.length === 0 ? "Enable payments to collect faster" : "No payments found"}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mt-1">
              {payments.length === 0
                ? "Record manual payments or enable online collections so customers can pay from their portal"
                : "Try adjusting your search or filters"}
            </p>
            {payments.length === 0 && (
              <Button className="mt-4" size="sm" onClick={() => setPaymentDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Record First Payment
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment, index) => {
                const method = (payment.method || "cash") as PaymentMethod;
                return (
                  <TableRow
                    key={payment.id}
                    className="data-table-row animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {payment.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.customer?.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.customer?.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-success">
                        ৳{Number(payment.amount).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("gap-1.5", methodStyles[method])}
                      >
                        {methodIcons[method]}
                        {methodLabels[method]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {payment.reference || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {new Date(payment.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.created_at).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePrintReceipt(payment)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Receipt
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Void Payment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPayments.length} of {payments.length} payments
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={filteredPayments.length <= 10}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
