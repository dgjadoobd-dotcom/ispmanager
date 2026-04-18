import { useState, useMemo } from "react";
import { Download, Loader2, FileSpreadsheet, FileText, Users, UserPlus, RefreshCw, ArrowRightLeft, Wifi, Shield, Unlink, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerTable, type CustomerTableData } from "@/components/customers/CustomerTable";
import { CustomerFormDialog, type CustomerFormData } from "@/components/customers/CustomerFormDialog";
import { ConnectionStatusDialog } from "@/components/customers/ConnectionStatusDialog";
import { CustomerFiltersBar, type CustomerFilters, defaultFilters } from "@/components/customers/CustomerFilters";
import { CustomerPagination } from "@/components/customers/CustomerPagination";
import { useToast } from "@/hooks/use-toast";
import { useCustomers, useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomers";
import { usePackages } from "@/hooks/usePackages";
import { useTenantContext } from "@/contexts/TenantContext";
import type { ConnectionStatus } from "@/types";

interface StatCard {
  title: string;
  count: number;
  description: string;
  icon: React.ReactNode;
  bgClass: string;
}

export default function Customers() {
  const { toast } = useToast();
  const { currentTenant } = useTenantContext();
  const { data: customers, isLoading, error } = useCustomers(currentTenant?.id);
  const { data: packages } = usePackages(currentTenant?.id);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const [filters, setFilters] = useState<CustomerFilters>(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerFormData | null>(null);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusDialogCustomer, setStatusDialogCustomer] = useState<CustomerTableData | null>(null);
  const [targetStatus, setTargetStatus] = useState<ConnectionStatus>("active");

  const tableData: CustomerTableData[] = useMemo(() =>
    (customers ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email ?? "",
      phone: c.phone,
      address: c.address ?? "",
      package: c.package?.name ?? "No package",
      packageId: c.package_id ?? "",
      speed: c.package?.speed_label ?? "",
      status: c.connection_status ?? "pending",
      dueAmount: c.due_balance ?? 0,
      advanceAmount: c.advance_balance ?? 0,
      joinDate: c.join_date,
      lastPayment: c.last_payment_date ?? c.join_date,
      networkUsername: c.network_username ?? "",
      monthlyPrice: c.package?.monthly_price ?? 0,
    })), [customers]
  );

  const stats: StatCard[] = useMemo(() => {
    const active = tableData.filter((c) => c.status === "active").length;
    const newThisMonth = tableData.filter((c) => {
      const joinDate = new Date(c.joinDate);
      const now = new Date();
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
    }).length;
    const suspended = tableData.filter((c) => c.status === "suspended").length;
    const pending = tableData.filter((c) => c.status === "pending").length;
    return [
      { title: "Running Clients", count: active, description: "Number of clients without LeftOut status", icon: <Users className="h-7 w-7" />, bgClass: "bg-[hsl(var(--primary))]" },
      { title: "New Clients", count: newThisMonth, description: "Monthly number of clients those are new", icon: <UserPlus className="h-7 w-7" />, bgClass: "bg-[hsl(var(--success))]" },
      { title: "Suspended Clients", count: suspended, description: "Number of currently suspended clients", icon: <Shield className="h-7 w-7" />, bgClass: "bg-[hsl(var(--destructive))]" },
      { title: "Pending Clients", count: pending, description: "Number of clients awaiting activation", icon: <Wifi className="h-7 w-7" />, bgClass: "bg-[hsl(var(--warning))]" },
    ];
  }, [tableData]);

  const filteredCustomers = useMemo(() => {
    return tableData.filter((customer) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        !filters.search ||
        customer.name.toLowerCase().includes(searchLower) ||
        customer.phone.includes(filters.search) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.id.toLowerCase().includes(searchLower);
      const matchesStatus = filters.mikrotikStatus === "all" || customer.status === filters.mikrotikStatus;
      const matchesPackage =
        filters.packageId === "all" ||
        (filters.packageId === "none" && !customer.packageId) ||
        customer.packageId === filters.packageId;
      let matchesBalance = true;
      if (filters.billingStatus === "due") matchesBalance = customer.dueAmount > 0;
      else if (filters.billingStatus === "paid") matchesBalance = customer.advanceAmount > 0;
      else if (filters.billingStatus === "clear") matchesBalance = customer.dueAmount === 0 && customer.advanceAmount === 0;
      return matchesSearch && matchesStatus && matchesPackage && matchesBalance;
    });
  }, [tableData, filters]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(startIndex, startIndex + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

  const handleFiltersChange = (newFilters: CustomerFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleEditCustomer = (customer: CustomerTableData) => {
    setFormMode("edit");
    setSelectedCustomer({
      id: customer.id, name: customer.name, email: customer.email, phone: customer.phone,
      address: customer.address, packageId: customer.packageId, connectionStatus: customer.status,
      dueBalance: customer.dueAmount, advanceBalance: customer.advanceAmount,
    });
    setFormDialogOpen(true);
  };

  const handleFormSubmit = async (data: CustomerFormData) => {
    if (!currentTenant?.id) {
      toast({ title: "Error", description: "Tenant information not found.", variant: "destructive" });
      return;
    }
    try {
      if (formMode === "add") {
        await createCustomer.mutateAsync({
          tenant_id: currentTenant.id, name: data.name, email: data.email || null,
          phone: data.phone, address: data.address || null, package_id: data.packageId || null,
          connection_status: "pending", due_balance: 0, advance_balance: 0,
        });
        toast({ title: "Customer added", description: `${data.name} was added successfully.` });
      } else {
        await updateCustomer.mutateAsync({
          id: data.id!,
          updates: {
            name: data.name, email: data.email || null, phone: data.phone,
            address: data.address || null, package_id: data.packageId || null,
            connection_status: data.connectionStatus, due_balance: data.dueBalance,
            advance_balance: data.advanceBalance,
          },
        });
        toast({ title: "Customer updated", description: `${data.name} details were updated.` });
      }
    } catch (err) {
      console.error("Error saving customer:", err);
      toast({ title: "Error", description: "Failed to save customer.", variant: "destructive" });
      throw err;
    }
  };

  const handleSuspendConnection = (customer: CustomerTableData) => {
    setStatusDialogCustomer(customer);
    setTargetStatus("suspended");
    setStatusDialogOpen(true);
  };

  const handleActivateConnection = (customer: CustomerTableData) => {
    setStatusDialogCustomer(customer);
    setTargetStatus("active");
    setStatusDialogOpen(true);
  };

  const handleStatusChange = async (customerId: string, newStatus: ConnectionStatus, reason?: string) => {
    try {
      await updateCustomer.mutateAsync({ id: customerId, updates: { connection_status: newStatus } });
      const customer = tableData.find((c) => c.id === customerId);
      toast({
        title: newStatus === "active" ? "Connection activated" : "Connection suspended",
        description: `${customer?.name} connection was ${newStatus === "active" ? "activated" : "suspended"}.`,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast({ title: "Error", description: "Failed to update connection status.", variant: "destructive" });
    }
  };

  const handleExport = () => {
    const headers = ["ID", "Name", "Phone", "Email", "Package", "Status", "Due", "Advance"];
    const rows = filteredCustomers.map((c) => [c.id, c.name, c.phone, c.email, c.package, c.status, c.dueAmount, c.advanceAmount]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export complete", description: `${filteredCustomers.length} customers exported.` });
  };

  const handleBulkAction = (action: string) => {
    toast({ title: "Coming soon", description: `${action} feature will be added soon.` });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">Failed to load customer data.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client List</h1>
          <p className="text-muted-foreground">View All Client</p>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleBulkAction("Assign To Employee")}>
          <Users className="h-3.5 w-3.5" /> Assign To Employee
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-success/10 border-success/30 text-success hover:bg-success/20" onClick={handleExport}>
          <FileSpreadsheet className="h-3.5 w-3.5" /> Generate Excel
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20" onClick={() => handleBulkAction("Generate PDF")}>
          <FileText className="h-3.5 w-3.5" /> Generate Pdf
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleBulkAction("Bulk Profile Change")}>
          <ArrowRightLeft className="h-3.5 w-3.5" /> Bulk Profile Change
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleBulkAction("Bulk Package Change")}>
          <ArrowRightLeft className="h-3.5 w-3.5" /> Bulk Package Change
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleBulkAction("Bulk Status Change")}>
          <ArrowRightLeft className="h-3.5 w-3.5" /> Bulk Status Change
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleBulkAction("Sync Clients")}>
          <RefreshCw className="h-3.5 w-3.5" /> Sync Clients & Servers
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-warning/10 border-warning/30 text-warning hover:bg-warning/20" onClick={() => handleBulkAction("Unbind All PPOE MAC")}>
          <Unlink className="h-3.5 w-3.5" /> Unbind All PPOE MAC Address
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-info/10 border-info/30 text-info hover:bg-info/20" onClick={() => handleBulkAction("Bind All PPOE MAC")}>
          <Link className="h-3.5 w-3.5" /> Bind All PPOE MAC Address
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={`${stat.bgClass} border-0 text-primary-foreground overflow-hidden`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-background/15 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium opacity-90 truncate">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-[10px] opacity-75 truncate">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <CustomerFiltersBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        packages={packages ?? []}
        totalCount={tableData.length}
        filteredCount={filteredCustomers.length}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Customer Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <CustomerTable
          customers={paginatedCustomers}
          onEdit={handleEditCustomer}
          onViewDetails={(c) => { window.location.href = `/dashboard/customers/${c.id}`; }}
          onSuspend={handleSuspendConnection}
          onActivate={handleActivateConnection}
          onRecordPayment={(c) => toast({ title: "Coming soon", description: "Payment recording will be added soon." })}
          onGenerateBill={(c) => toast({ title: "Coming soon", description: "Bill generation will be added soon." })}
        />
      )}

      {/* Pagination */}
      <CustomerPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filteredCustomers.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />

      <CustomerFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        customer={selectedCustomer}
        onSubmit={handleFormSubmit}
        mode={formMode}
        tenantId={currentTenant?.id}
      />

      {statusDialogCustomer && (
        <ConnectionStatusDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          customerName={statusDialogCustomer.name}
          customerId={statusDialogCustomer.id}
          currentStatus={statusDialogCustomer.status}
          targetStatus={targetStatus}
          onConfirm={handleStatusChange}
        />
      )}
    </div>
  );
}
