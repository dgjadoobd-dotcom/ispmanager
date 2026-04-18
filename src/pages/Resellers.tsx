import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  RefreshCw,
  Search,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  Wallet,
  UserPlus,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useResellers, useToggleResellerStatus } from "@/hooks/useResellers";
import { ResellerFormDialog } from "@/components/resellers/ResellerFormDialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
  active: { label: "Active", variant: "default" },
  suspended: { label: "Suspended", variant: "destructive" },
  inactive: { label: "Inactive", variant: "secondary" },
};

const commissionLabels: Record<string, string> = {
  percentage: "Percentage",
  flat: "Flat",
  per_payment: "Per Payment",
};

export default function Resellers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [commissionFilter, setCommissionFilter] = useState("all");
  const [creationFrom, setCreationFrom] = useState<Date>();
  const [creationTo, setCreationTo] = useState<Date>();
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: resellers, isLoading } = useResellers();
  const toggleStatus = useToggleResellerStatus();

  const filtered = (resellers || []).filter((r) => {
    const matchSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      (r.email && r.email.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchCommission = commissionFilter === "all" || r.commission_type === commissionFilter;
    const matchFrom = !creationFrom || new Date(r.created_at) >= creationFrom;
    const matchTo = !creationTo || new Date(r.created_at) <= creationTo;
    return matchSearch && matchStatus && matchCommission && matchFrom && matchTo;
  });

  const perPage = parseInt(entriesPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const totalResellers = resellers?.length || 0;
  const activeResellers = resellers?.filter((r) => r.status === "active").length || 0;
  const totalCustomers = resellers?.reduce((s, r) => s + (r.customer_count || 0), 0) || 0;

  const statCards = [
    {
      label: "Total Resellers",
      value: totalResellers,
      icon: UserPlus,
      gradient: "from-teal-500 to-teal-600",
      shadow: "shadow-teal-500/25",
    },
    {
      label: "Total Customers",
      value: totalCustomers,
      icon: Users,
      gradient: "from-cyan-500 to-cyan-600",
      shadow: "shadow-cyan-500/25",
    },
    {
      label: "Active Resellers",
      value: activeResellers,
      icon: TrendingUp,
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/25",
    },
  ];

  return (
    <div className="space-y-5 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Reseller List</h1>
            <p className="text-sm text-muted-foreground">All Reseller List</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["resellers"] });
              toast.success("Refreshing...");
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Reseller
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className={cn(
              "border-0 bg-gradient-to-br text-white shadow-lg",
              stat.gradient,
              stat.shadow
            )}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/80">{stat.label}</p>
              </div>
              <div className="p-3 rounded-full bg-white/20">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <Select value={commissionFilter} onValueChange={setCommissionFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Commission Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Commission</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="per_payment">Per Payment</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-xs font-normal justify-start">
                  {creationFrom ? format(creationFrom, "dd/MM/yyyy") : "Creation From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={creationFrom} onSelect={setCreationFrom} />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-xs font-normal justify-start">
                  {creationTo ? format(creationTo, "dd/MM/yyyy") : "Creation To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={creationTo} onSelect={setCreationTo} />
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs"
              onClick={() => {
                setCommissionFilter("all");
                setStatusFilter("all");
                setCreationFrom(undefined);
                setCreationTo(undefined);
                setSearch("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          {/* Show entries + Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-b border-border/50">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Show</span>
              <Select value={entriesPerPage} onValueChange={(v) => { setEntriesPerPage(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[70px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["10", "25", "50", "100"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">entries</span>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-9 h-8 text-xs"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No resellers found</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary">
                    {["#", "Name", "Commission", "Phone", "Email", "Customers", "Wallet", "Earned", "Status", "Enabled", "Action"].map(
                      (h) => (
                        <TableHead key={h} className="text-primary-foreground text-xs font-semibold whitespace-nowrap">
                          {h}
                        </TableHead>
                      )
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((reseller, idx) => {
                    const st = statusConfig[reseller.status] || statusConfig.active;
                    return (
                      <TableRow
                        key={reseller.id}
                        className="hover:bg-muted/30 cursor-pointer text-xs"
                        onClick={() => navigate(`/dashboard/resellers/${reseller.id}`)}
                      >
                        <TableCell className="font-medium text-muted-foreground">
                          {(currentPage - 1) * perPage + idx + 1}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm text-foreground">{reseller.name}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {reseller.commission_value}
                            {reseller.commission_type === "percentage" ? "%" : "৳"}{" "}
                            {commissionLabels[reseller.commission_type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{reseller.phone}</TableCell>
                        <TableCell className="text-muted-foreground">{reseller.email || "—"}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-xs">{reseller.customer_count}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">
                          ৳{Number(reseller.wallet_balance || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">
                          ৳{Number(reseller.total_commission || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={st.variant} className="text-xs">{st.label}</Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Switch
                            checked={reseller.status === "active"}
                            onCheckedChange={(checked) =>
                              toggleStatus.mutate({
                                id: reseller.id,
                                status: checked ? "active" : "suspended",
                              })
                            }
                          />
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/dashboard/resellers/${reseller.id}`)}>
                                <Eye className="h-4 w-4 mr-2" /> Details
                              </DropdownMenuItem>
                              {reseller.status === "active" ? (
                                <DropdownMenuItem
                                  onClick={() => toggleStatus.mutate({ id: reseller.id, status: "suspended" })}
                                  className="text-destructive"
                                >
                                  <Ban className="h-4 w-4 mr-2" /> Suspend
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => toggleStatus.mutate({ id: reseller.id, status: "active" })}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" /> Activate
                                </DropdownMenuItem>
                              )}
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

          {/* Pagination Footer */}
          {filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border/50 text-xs text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * perPage + 1} to{" "}
                {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={currentPage === p ? "default" : "outline"}
                    size="sm"
                    className="h-7 w-7 text-xs p-0"
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ResellerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
