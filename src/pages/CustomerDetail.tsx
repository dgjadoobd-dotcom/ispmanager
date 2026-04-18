import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, CreditCard, Receipt, Phone, Mail, MapPin, Calendar, Wifi, Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useCustomer, useUpdateCustomer } from "@/hooks/useCustomers";
import { useCustomerBills } from "@/hooks/useBills";
import { useCustomerPayments } from "@/hooks/usePayments";
import { useTenantContext } from "@/contexts/TenantContext";
import { QuickPaymentDialog } from "@/components/payments/QuickPaymentDialog";
import { NetworkSyncButton } from "@/components/customers/NetworkSyncButton";
import { toast } from "sonner";
import type { ConnectionStatus, PaymentStatus } from "@/types";

const statusStyles: Record<ConnectionStatus, string> = {
  active: "status-active",
  suspended: "status-suspended",
  pending: "status-pending",
};

const statusLabels: Record<ConnectionStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
};

const billStatusStyles: Record<PaymentStatus, string> = {
  paid: "bg-success/10 text-success border-success/20",
  due: "bg-warning/10 text-warning border-warning/20",
  partial: "bg-info/10 text-info border-info/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function CustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenantContext();
  const { data: customer, isLoading: customerLoading, refetch: refetchCustomer } = useCustomer(customerId || "");
  const { data: bills = [], isLoading: billsLoading, refetch: refetchBills } = useCustomerBills(customerId || "");
  const { data: payments = [], isLoading: paymentsLoading, refetch: refetchPayments } = useCustomerPayments(customerId || "");
  const updateCustomer = useUpdateCustomer();
  
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const isLoading = customerLoading || billsLoading || paymentsLoading;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleToggleStatus = async () => {
    if (!customer) return;
    const newStatus = customer.connection_status === "active" ? "suspended" : "active";
    try {
      await updateCustomer.mutateAsync({
        id: customer.id,
        updates: { connection_status: newStatus },
      });
      toast.success(`Connection ${newStatus === "active" ? "activated" : "suspended"} successfully`);
    } catch (error) {
      toast.error("Failed to update connection status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Customer not found</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/customers")}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const status = (customer.connection_status || "pending") as ConnectionStatus;
  const totalBilled = bills.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/customers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
          <p className="text-muted-foreground">Customer Details</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <NetworkSyncButton
            customerId={customer.id}
            customerName={customer.name}
            connectionStatus={status}
            networkUsername={customer.network_username}
            lastSyncAt={customer.last_network_sync_at}
            syncStatus={customer.network_sync_status}
            onSyncComplete={() => refetchCustomer()}
          />
          {status === "active" ? (
            <Button variant="outline" className="gap-2 text-destructive" onClick={handleToggleStatus} disabled={updateCustomer.isPending}>
              <Pause className="h-4 w-4" />
              Suspend
            </Button>
          ) : (
            <Button variant="outline" className="gap-2 text-success" onClick={handleToggleStatus} disabled={updateCustomer.isPending}>
              <Play className="h-4 w-4" />
              Activate
            </Button>
          )}
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xl font-semibold">
                    {customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-xl">{customer.name}</CardTitle>
                  <CardDescription>Customer since {formatDate(customer.join_date)}</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className={cn("text-sm", statusStyles[status])}>
                {statusLabels[status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{customer.email || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{customer.address || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Package</p>
                  <p className="font-medium">{customer.package?.name || "No Package"}</p>
                  {customer.package && (
                    <p className="text-xs text-muted-foreground">{customer.package.speed_label} - ৳{customer.package.monthly_price}/month</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Due Balance</CardDescription>
              <CardTitle className={cn("text-3xl", (customer.due_balance || 0) > 0 ? "text-destructive" : "text-muted-foreground")}>
                ৳{(customer.due_balance || 0).toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Advance Balance</CardDescription>
              <CardTitle className={cn("text-3xl", (customer.advance_balance || 0) > 0 ? "text-success" : "text-muted-foreground")}>
                ৳{(customer.advance_balance || 0).toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Last Payment</CardDescription>
              <CardTitle className="text-xl">
                {formatDate(customer.last_payment_date)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Tabs for Bills and Payments */}
      <Tabs defaultValue="bills" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bills" className="gap-2">
            <Receipt className="h-4 w-4" />
            Bills ({bills.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payments ({payments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bills">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>Total billed: ৳{totalBilled.toLocaleString()}</CardDescription>
                </div>
                <Button className="gap-2">
                  <Receipt className="h-4 w-4" />
                  Generate Bill
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No bills found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => {
                      const billStatus = (bill.status || "due") as PaymentStatus;
                      return (
                        <TableRow key={bill.id}>
                          <TableCell className="font-mono text-sm">{bill.invoice_number}</TableCell>
                          <TableCell>
                            {formatDate(bill.billing_period_start)} - {formatDate(bill.billing_period_end)}
                          </TableCell>
                          <TableCell>{formatDate(bill.due_date)}</TableCell>
                          <TableCell className="text-right font-medium">
                            ৳{Number(bill.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={billStatusStyles[billStatus]}>
                              {billStatus.charAt(0).toUpperCase() + billStatus.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Records</CardTitle>
                  <CardDescription>Total paid: ৳{totalPaid.toLocaleString()}</CardDescription>
                </div>
                <Button className="gap-2" onClick={() => setPaymentDialogOpen(true)}>
                  <CreditCard className="h-4 w-4" />
                  Record Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payments found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p>{formatDate(payment.created_at)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(payment.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-success">
                          ৳{Number(payment.amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="capitalize">{payment.method || "cash"}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.reference || "—"}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {payment.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <QuickPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        preselectedCustomerId={customerId}
        onSuccess={() => {
          refetchCustomer();
          refetchPayments();
          refetchBills();
        }}
      />
    </div>
  );
}
