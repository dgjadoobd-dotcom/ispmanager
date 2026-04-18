import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
  CreditCard, Search, Filter, TrendingUp, Calendar,
  CheckCircle, Clock, AlertTriangle, Building2, Users
} from "lucide-react";
import { useAllSubscriptions, useSubscriptionStats } from "@/hooks/useSubscriptions";

const statusConfig = {
  active: { label: "Active", variant: "default" as const, icon: CheckCircle },
  trial: { label: "Trial", variant: "secondary" as const, icon: Clock },
  suspended: { label: "Suspended", variant: "destructive" as const, icon: AlertTriangle },
};

export default function AdminSubscriptions() {
  const { data: subscriptions, isLoading } = useAllSubscriptions();
  const { data: stats, isLoading: statsLoading } = useSubscriptionStats();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredSubscriptions = (subscriptions ?? []).filter((sub) => {
    const matchesSearch = 
      sub.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subdomain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage tenant subscriptions and billing
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscriptions</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.total ?? 0}</div>}
            <p className="text-xs text-muted-foreground mt-1">All tenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.active ?? 0}</div>}
            <p className="text-xs text-muted-foreground mt-1">Paying customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trial Accounts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.trial ?? 0}</div>}
            <p className="text-xs text-muted-foreground mt-1">Potential conversions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-destructive">{stats?.suspended ?? 0}</div>}
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                {statsLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{stats?.active ?? 0}</p>}
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <Clock className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                {statsLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{stats?.trial ?? 0}</p>}
                <p className="text-sm text-muted-foreground">Trial</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                {statsLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{stats?.suspended ?? 0}</p>}
                <p className="text-sm text-muted-foreground">Suspended</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            All Subscriptions
          </CardTitle>
          <CardDescription>View and manage tenant subscriptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Subdomain</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((sub) => {
                    const status = sub.subscription_status;
                    const StatusIcon = statusConfig[status]?.icon ?? Clock;
                    return (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">{sub.tenant_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{sub.subdomain}.ispmanager.com</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {sub.customer_count.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(sub.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[status]?.variant ?? "secondary"} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[status]?.label ?? status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Manage</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
