import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  MoreHorizontal,
  Eye,
  LogIn,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { type TenantWithStats } from "@/hooks/useTenants";
import { cn } from "@/lib/utils";

interface RecentISPTableProps {
  tenants: TenantWithStats[];
  isLoading?: boolean;
  onLoginAsAdmin?: (tenant: TenantWithStats) => void;
}

const statusConfig = {
  active: {
    label: "Active",
    variant: "default" as const,
    icon: CheckCircle,
    class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  trial: {
    label: "Trial",
    variant: "secondary" as const,
    icon: Clock,
    class: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  suspended: {
    label: "Suspended",
    variant: "destructive" as const,
    icon: AlertTriangle,
    class: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function RecentISPTable({
  tenants,
  isLoading,
  onLoginAsAdmin,
}: RecentISPTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Recent ISPs</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest registered ISPs
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/tenants" className="gap-1">
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">ISP</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6">
                      <Skeleton className="h-10 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : tenants.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No ISPs found
                  </TableCell>
                </TableRow>
              ) : (
                tenants.slice(0, 5).map((tenant) => {
                  const status = tenant.subscription_status ?? "trial";
                  const config = statusConfig[status] || statusConfig.trial;
                  const StatusIcon = config.icon;

                  return (
                    <TableRow key={tenant.id} className="group">
                      <TableCell className="pl-6">
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
                        <span className="font-medium">
                          {(tenant.customer_count ?? 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          Starter
                        </Badge>
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
                      <TableCell className="text-muted-foreground">
                        {formatDate(tenant.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/tenants/${tenant.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {onLoginAsAdmin && (
                              <DropdownMenuItem
                                onClick={() => onLoginAsAdmin(tenant)}
                              >
                                <LogIn className="mr-2 h-4 w-4" />
                                Login as Admin
                              </DropdownMenuItem>
                            )}
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
  );
}
