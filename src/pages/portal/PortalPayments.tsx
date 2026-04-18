import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search,
  CreditCard,
  CheckCircle,
  Banknote,
  Smartphone,
  Download,
  FileX
} from "lucide-react";
import { usePortalPayments } from "@/hooks/usePortalData";

const methodConfig: Record<string, { label: string; icon: typeof CreditCard }> = {
  cash: { label: "Cash", icon: Banknote },
  online: { label: "Online", icon: Smartphone },
  bank_transfer: { label: "Bank Transfer", icon: CreditCard },
  bkash: { label: "bKash", icon: Smartphone },
  nagad: { label: "Nagad", icon: Smartphone },
  uddoktapay: { label: "UddoktaPay", icon: Smartphone },
};

export default function PortalPayments() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: payments, isLoading } = usePortalPayments();

  const filteredPayments = (payments || []).filter(
    (payment) =>
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.reference || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.bills?.invoice_number || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const totalPaid = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
  const lastPayment = payments?.[0];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payment History</h1>
        <p className="text-muted-foreground">
          View all your past payments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Paid (All Time)</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totalPaid)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {payments?.length || 0} payments made
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Last Payment</CardDescription>
            <CardTitle className="text-3xl">
              {lastPayment ? formatCurrency(Number(lastPayment.amount)) : "৳0"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {lastPayment ? `on ${formatDate(lastPayment.created_at)}` : "No payments yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            All Payments
          </CardTitle>
          <CardDescription>
            Complete history of your payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileX className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium">No Payments Found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "Try a different search term" : "You haven't made any payments yet"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>For Invoice</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const method = payment.method || "cash";
                    const config = methodConfig[method] || methodConfig.cash;
                    const MethodIcon = config.icon;
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium font-mono text-xs">
                          {payment.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>{formatDate(payment.created_at)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(Number(payment.amount))}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MethodIcon className="h-4 w-4 text-muted-foreground" />
                            {config.label}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.reference || "-"}
                        </TableCell>
                        <TableCell>
                          {payment.bills?.invoice_number ? (
                            <Badge variant="outline">{payment.bills.invoice_number}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
