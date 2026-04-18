import { Users, UserCheck, AlertCircle, CreditCard, Wallet, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useResellerSelf, useResellerSelfStats, useResellerSelfCustomers, useResellerSelfWallet } from "@/hooks/useResellerDashboard";

const statusConfig: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
  active: { label: "Active", variant: "default" },
  suspended: { label: "Suspended", variant: "destructive" },
  pending: { label: "Pending", variant: "secondary" },
};

export default function ResellerDashboardPage() {
  const { data: reseller, isLoading: resellerLoading } = useResellerSelf();
  const { data: stats, isLoading: statsLoading } = useResellerSelfStats(reseller?.id);
  const { data: customers, isLoading: customersLoading } = useResellerSelfCustomers(reseller?.id);
  const { data: wallet } = useResellerSelfWallet(reseller?.id);

  if (resellerLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (!reseller) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
        <p>Reseller account not found.</p>
      </div>
    );
  }

  const loading = statsLoading;
  const statCards = [
    { label: "Total Customers", value: stats?.totalCustomers || 0, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active Customers", value: stats?.activeCustomers || 0, icon: UserCheck, color: "text-success", bg: "bg-success/10" },
    { label: "Total Due", value: `৳${(stats?.totalDue || 0).toLocaleString()}`, icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Wallet Balance", value: `৳${(wallet?.balance || 0).toLocaleString()}`, icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
  ];

  const recentCustomers = (customers || []).slice(0, 8);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Welcome, {reseller.name}
        </h1>
        <p className="text-sm text-muted-foreground">Your reseller dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly collection card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <CreditCard className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Month's Collection</p>
              {loading ? (
                <Skeleton className="h-7 w-24 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-foreground">
                  ৳{(stats?.monthlyCollection || 0).toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/50">
              <Receipt className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Commission Type</p>
              <p className="text-lg font-bold text-foreground">
                {reseller.commission_value}{reseller.commission_type === "percentage" ? "%" : "৳"}
                <span className="text-sm font-normal text-muted-foreground ml-1.5">
                  ({reseller.commission_type === "percentage" ? "Percentage" : reseller.commission_type === "flat" ? "Flat" : "Per Payment"})
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Recent Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {customersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : recentCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No customers yet</p>
            </div>
          ) : (
            <div className="overflow-auto rounded-lg border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCustomers.map((c: any) => {
                    const st = statusConfig[c.connection_status] || statusConfig.pending;
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-sm">{c.name}</TableCell>
                        <TableCell className="text-sm">{c.phone}</TableCell>
                        <TableCell className="text-sm">{c.packages?.name || "—"}</TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          ৳{Number(c.due_balance || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
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