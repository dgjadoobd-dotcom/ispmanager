import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Building2, 
  Search, 
  MoreHorizontal,
  Eye,
  Pause,
  Play,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  Loader2,
  LogIn,
  Package,
  Users,
  Wallet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAllTenants, useUpdateTenant, useDeleteTenant, type TenantWithStats } from "@/hooks/useTenants";
import { useTenantContext } from "@/contexts/TenantContext";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/admin/StatCard";

const statusConfig = {
  active: { 
    label: "Active", 
    icon: CheckCircle,
    class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  trial: { 
    label: "Trial", 
    icon: Clock,
    class: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  suspended: { 
    label: "Suspended", 
    icon: AlertTriangle,
    class: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export default function AdminTenants() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { startImpersonation } = useTenantContext();
  const { data: tenants, isLoading, error } = useAllTenants();
  const updateTenant = useUpdateTenant();
  const deleteTenant = useDeleteTenant();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<TenantWithStats | null>(null);

  const handleLoginAsTenant = (tenant: TenantWithStats) => {
    startImpersonation(tenant.id);
    toast({
      title: "Logged in as tenant",
      description: `You are now viewing "${tenant.name}" as admin.`,
    });
    navigate("/dashboard");
  };

  const filteredTenants = (tenants ?? []).filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || tenant.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleSuspend = async (tenant: TenantWithStats) => {
    try {
      await updateTenant.mutateAsync({
        id: tenant.id,
        updates: { subscription_status: "suspended" },
      });
      toast({
        title: "ISP Suspended",
        description: `${tenant.name} has been suspended.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to suspend ISP.",
        variant: "destructive",
      });
    }
  };

  const handleActivate = async (tenant: TenantWithStats) => {
    try {
      await updateTenant.mutateAsync({
        id: tenant.id,
        updates: { subscription_status: "active" },
      });
      toast({
        title: "ISP Activated",
        description: `${tenant.name} has been activated.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to activate ISP.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return;
    
    try {
      await deleteTenant.mutateAsync(tenantToDelete.id);
      toast({
        title: "ISP Deleted",
        description: `${tenantToDelete.name} has been permanently deleted.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete ISP.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
    }
  };

  const activeCount = tenants?.filter(t => t.subscription_status === 'active').length ?? 0;
  const trialCount = tenants?.filter(t => t.subscription_status === 'trial').length ?? 0;
  const suspendedCount = tenants?.filter(t => t.subscription_status === 'suspended').length ?? 0;
  const totalCustomers = tenants?.reduce((sum, t) => sum + (t.customer_count ?? 0), 0) ?? 0;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">Failed to load ISPs.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All ISPs</h1>
        <p className="text-muted-foreground">
          Manage and monitor all ISP tenants on the platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active ISPs"
          value={activeCount}
          icon={CheckCircle}
          variant="success"
          isLoading={isLoading}
        />
        <StatCard
          title="Trial ISPs"
          value={trialCount}
          icon={Clock}
          variant="info"
          isLoading={isLoading}
        />
        <StatCard
          title="Suspended"
          value={suspendedCount}
          icon={AlertTriangle}
          variant={suspendedCount > 0 ? "danger" : "default"}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Customers"
          value={totalCustomers.toLocaleString()}
          subtitle="Across all ISPs"
          icon={Users}
          variant="default"
          isLoading={isLoading}
        />
      </div>

      {/* ISPs Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                ISP Directory
              </CardTitle>
              <CardDescription>
                {filteredTenants.length} ISPs found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, subdomain, or owner..."
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

          {/* Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">ISP</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Add-ons</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-4"><Skeleton className="h-10 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No ISPs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((tenant) => {
                    const status = tenant.subscription_status ?? "trial";
                    const config = statusConfig[status] || statusConfig.trial;
                    const StatusIcon = config.icon;
                    
                    return (
                      <TableRow key={tenant.id} className="group">
                        <TableCell className="pl-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{tenant.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {tenant.subdomain}.app
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{tenant.owner_name || "-"}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {tenant.owner_email || "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{(tenant.customer_count ?? 0).toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            Starter
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">2</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("gap-1 font-normal", config.class)}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(tenant.created_at)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={updateTenant.isPending}
                              >
                                {updateTenant.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleLoginAsTenant(tenant)}>
                                <LogIn className="mr-2 h-4 w-4" />
                                Login as Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Wallet className="mr-2 h-4 w-4" />
                                View Billing
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {status === "active" || status === "trial" ? (
                                <DropdownMenuItem 
                                  onClick={() => handleSuspend(tenant)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Pause className="mr-2 h-4 w-4" />
                                  Suspend ISP
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleActivate(tenant)}>
                                  <Play className="mr-2 h-4 w-4" />
                                  Activate ISP
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setTenantToDelete(tenant);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete ISP
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{tenantToDelete?.name}" and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTenant.isPending}
            >
              {deleteTenant.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete ISP
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
