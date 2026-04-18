import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Receipt, 
  CreditCard, 
  Wifi, 
  Calendar,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  UserX
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePortalCustomer, usePortalBills, usePortalPayments } from "@/hooks/usePortalData";

const statusConfig = {
  active: { label: "Active", variant: "default" as const, icon: CheckCircle },
  suspended: { label: "Suspended", variant: "destructive" as const, icon: AlertCircle },
  pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
};

const billStatusConfig = {
  paid: { label: "Paid", variant: "default" as const },
  due: { label: "Due", variant: "secondary" as const },
  partial: { label: "Partial", variant: "outline" as const },
  overdue: { label: "Overdue", variant: "destructive" as const },
};

export default function PortalDashboard() {
  const { data: customer, isLoading: customerLoading } = usePortalCustomer();
  const { data: bills, isLoading: billsLoading } = usePortalBills();
  const { data: payments, isLoading: paymentsLoading } = usePortalPayments();

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  // Get current (unpaid) bill or latest bill
  const currentBill = bills?.find(b => b.status !== "paid") || bills?.[0];
  const lastPayment = payments?.[0];

  // Loading state
  if (customerLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  // No customer found - user not linked to a customer account
  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <UserX className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">No Account Found</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Your login is not linked to any customer account. Please contact your ISP to link your account.
        </p>
      </div>
    );
  }

  const connectionStatus = customer.connection_status || "pending";
  const StatusIcon = statusConfig[connectionStatus].icon;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {customer.name}</h1>
        <p className="text-muted-foreground">
          Manage your internet connection and payments
        </p>
      </div>

      {/* Connection Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Connection Status</CardTitle>
            <Badge variant={statusConfig[connectionStatus].variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusConfig[connectionStatus].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Wifi className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Package</p>
                <p className="font-medium">
                  {customer.packages?.name || "No Package"}
                  {customer.packages?.speed_label && (
                    <span className="text-muted-foreground ml-1">
                      ({customer.packages.speed_label})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer ID</p>
                <p className="font-medium font-mono text-sm">{customer.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(customer.join_date).toLocaleDateString('en-GB', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Bill & Payment Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Current Bill */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5" />
              Current Bill
            </CardTitle>
            <CardDescription>Your latest billing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {billsLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : currentBill ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    {formatCurrency(Number(currentBill.amount))}
                  </span>
                  <Badge variant={billStatusConfig[currentBill.status || "due"].variant}>
                    {billStatusConfig[currentBill.status || "due"].label}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Due by {new Date(currentBill.due_date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" asChild>
                    <Link to="/portal/bills">
                      View Bill
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {currentBill.status !== "paid" && (
                    <Button variant="outline" className="flex-1">
                      Pay Now
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No bills yet</p>
            )}
          </CardContent>
        </Card>

        {/* Last Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Last Payment
            </CardTitle>
            <CardDescription>Your most recent payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentsLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : lastPayment ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    {formatCurrency(Number(lastPayment.amount))}
                  </span>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Paid
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Paid on {new Date(lastPayment.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/portal/payments">
                    View Payment History
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">No payments yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Balance Summary */}
      {(customer.due_balance || customer.advance_balance) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Number(customer.due_balance) > 0 && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Due Balance</p>
                    <p className="text-2xl font-bold text-destructive">
                      {formatCurrency(Number(customer.due_balance))}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          )}
          {Number(customer.advance_balance) > 0 && (
            <Card className="border-success/50 bg-success/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Advance Balance</p>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(Number(customer.advance_balance))}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/portal/bills">
                <Receipt className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">View All Bills</p>
                  <p className="text-xs text-muted-foreground">Check your billing history</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/portal/payments">
                <CreditCard className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Payment History</p>
                  <p className="text-xs text-muted-foreground">View past transactions</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/portal/profile">
                <Wifi className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">My Profile</p>
                  <p className="text-xs text-muted-foreground">Update your information</p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
