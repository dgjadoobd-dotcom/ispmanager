import { useState, useMemo } from "react";
import { 
  Plus, Edit, Trash2, Loader2, Search, Package as PackageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePackages, useCreatePackage, useUpdatePackage, useDeletePackage, type Package } from "@/hooks/usePackages";
import { useTenantContext } from "@/contexts/TenantContext";
import { useCustomers } from "@/hooks/useCustomers";
import { PackageFormDialog } from "@/components/packages/PackageFormDialog";
import { DeletePackageDialog } from "@/components/packages/DeletePackageDialog";
import { useHasMikrotikIntegration } from "@/hooks/useNetworkIntegrations";
import { usePackageSync } from "@/hooks/usePackageSync";
import { useQuery } from "@tanstack/react-query";
import { dbGet, TABLES } from "@/lib/db";
import { toast } from "sonner";

export default function Packages() {
  const { currentTenant } = useTenantContext();
  const { data: packages = [], isLoading } = usePackages(currentTenant?.id);
  const { data: customers = [] } = useCustomers(currentTenant?.id);
  const { data: hasMikrotik = false } = useHasMikrotikIntegration(currentTenant?.id);
  const packageSync = usePackageSync();
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const deletePackage = useDeletePackage();

  const { data: mikrotikIntegration } = useQuery({
    queryKey: ["mikrotik-integration-id", currentTenant?.id],
    queryFn: () => {
      if (!currentTenant?.id) return null;
      const integrations = dbGet<any>(TABLES.network_integrations);
      return integrations.find((n: any) => n.tenant_id === currentTenant.id && n.provider_type === "mikrotik" && n.is_enabled) ?? null;
    },
    enabled: !!currentTenant?.id && hasMikrotik,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const getCustomerCount = (packageId: string) => {
    return customers.filter((c) => c.package_id === packageId).length;
  };

  // Filter packages by search
  const filteredPackages = useMemo(() => {
    if (!searchQuery.trim()) return packages;
    const q = searchQuery.toLowerCase();
    return packages.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.speed_label.toLowerCase().includes(q) ||
        p.monthly_price.toString().includes(q)
    );
  }, [packages, searchQuery]);

  // Pagination
  const totalItems = filteredPackages.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedPackages = filteredPackages.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );
  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safeCurrentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  // Extract bandwidth from speed_label (e.g., "20 Mbps" → "20")
  const extractBandwidth = (speedLabel: string) => {
    const match = speedLabel.match(/(\d+)/);
    return match ? match[1] : "-";
  };

  const handleCreatePackage = () => {
    setEditingPackage(null);
    setDialogOpen(true);
  };

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: {
    name: string;
    speed_label: string;
    monthly_price: number;
    validity_days: number;
    is_active: boolean;
    mikrotik_profile_name: string | null;
    mikrotik_rate_limit: string | null;
    mikrotik_address_pool: string | null;
    mikrotik_queue_type: string | null;
  }) => {
    try {
      if (editingPackage) {
        await updatePackage.mutateAsync({
          id: editingPackage.id,
          updates: data,
        });
        toast.success("Package updated successfully");
      } else {
        if (!currentTenant?.id) {
          toast.error("Tenant not found");
          return;
        }
        await createPackage.mutateAsync({
          ...data,
          tenant_id: currentTenant.id,
        });
        toast.success("New package created successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  const handleDeletePackage = (pkg: Package) => {
    setDeletingPackage(pkg);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPackage) return;
    try {
      await deletePackage.mutateAsync(deletingPackage.id);
      toast.success("Package deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingPackage(null);
    } catch (error) {
      toast.error("Failed to delete package");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>Configuration</span>
            <span>/</span>
            <span className="text-foreground font-medium">Package</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Package — Configure Package</h1>
        </div>
        <Button className="gap-2" onClick={handleCreatePackage}>
          <Plus className="h-4 w-4" />
          Package
        </Button>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          {/* Controls Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Show</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-8"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[60px]">Serial</TableHead>
                  <TableHead>Package Name</TableHead>
                  <TableHead>Package Type</TableHead>
                  <TableHead className="text-right">B. Allocated MB</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>VAS</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[90px] text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <PackageIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchQuery ? "No packages match your search" : "No packages found"}
                        </p>
                        {!searchQuery && (
                          <Button size="sm" onClick={handleCreatePackage}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Package
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPackages.map((pkg, index) => {
                    const serial = (safeCurrentPage - 1) * pageSize + index + 1;
                    const isPersonal = index % 2 === 0;
                    const bandwidth = extractBandwidth(pkg.speed_label);
                    const description = [
                      pkg.mikrotik_rate_limit,
                      pkg.mikrotik_profile_name ? `Profile: ${pkg.mikrotik_profile_name}` : null,
                      pkg.validity_days ? `${pkg.validity_days} days` : null,
                    ]
                      .filter(Boolean)
                      .join(" | ") || "-";

                    return (
                      <TableRow
                        key={pkg.id}
                        className={cn(
                          "transition-colors",
                          !pkg.is_active && "opacity-50"
                        )}
                      >
                        <TableCell className="font-medium text-muted-foreground">
                          {serial}
                        </TableCell>
                        <TableCell className="font-medium">{pkg.name}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold",
                              isPersonal
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            )}
                          >
                            {isPersonal ? "Personal" : "Business"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {bandwidth}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ৳{pkg.monthly_price.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {pkg.mikrotik_address_pool || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                          {description}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => handleEditPackage(pkg)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeletePackage(pkg)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {totalItems > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {startItem} to {endItem} of {totalItems} entries
              </p>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>

                {getPageNumbers().map((page, idx) =>
                  page === "ellipsis" ? (
                    <span key={`e-${idx}`} className="px-2 text-muted-foreground text-sm">
                      …
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={safeCurrentPage === page ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 text-xs p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PackageFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        package={editingPackage}
        onSubmit={handleSubmit}
        isLoading={createPackage.isPending || updatePackage.isPending}
        hasMikrotikIntegration={hasMikrotik}
      />

      <DeletePackageDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        packageName={deletingPackage?.name || ""}
        customerCount={deletingPackage ? getCustomerCount(deletingPackage.id) : 0}
        onConfirm={handleConfirmDelete}
        isLoading={deletePackage.isPending}
      />
    </div>
  );
}
