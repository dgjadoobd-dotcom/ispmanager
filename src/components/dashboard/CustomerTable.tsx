import { MoreHorizontal, Eye, CreditCard, FileText, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { cn } from "@/lib/utils";
import { useTenantContext } from "@/contexts/TenantContext";
import { useCustomers } from "@/hooks/useCustomers";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import type { ConnectionStatus } from "@/types";

const statusStyles: Record<ConnectionStatus, string> = {
  active: "bg-success/10 text-success border-success/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-warning/10 text-warning border-warning/20",
};

const statusLabels: Record<ConnectionStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
};

export function CustomerTable() {
  const navigate = useNavigate();
  const { currentTenant } = useTenantContext();
  const { data: customers = [], isLoading } = useCustomers(currentTenant?.id);

  const recentCustomers = customers.slice(0, 5);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <h3 className="text-base font-semibold">Recent Customers</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quick overview of your customer base
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5"
          onClick={() => navigate("/dashboard/customers")}
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {recentCustomers.length === 0 ? (
        <div className="p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="font-medium text-muted-foreground">No customers yet</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate("/dashboard/customers")}
          >
            Add your first customer
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Customer
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Package
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                  Due
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Last Paid
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCustomers.map((customer, index) => {
                const status = (customer.connection_status || "pending") as ConnectionStatus;
                const initials = customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                
                return (
                  <TableRow 
                    key={customer.id} 
                    className="group hover:bg-muted/30 transition-colors animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => navigate(`/dashboard/customers/${customer.id}`)}
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-primary/10">
                          <span className="text-xs font-semibold text-primary">
                            {initials}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {customer.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {customer.phone}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {customer.package?.name || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wide border",
                          statusStyles[status]
                        )}
                      >
                        {statusLabels[status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "text-sm font-medium tabular-nums",
                          (customer.due_balance || 0) > 0 ? "text-destructive" : "text-muted-foreground"
                        )}
                      >
                        ৳{(customer.due_balance || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(customer.last_payment_date)}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/customers/${customer.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Record Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Bill
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// Missing import
import { Users } from "lucide-react";
