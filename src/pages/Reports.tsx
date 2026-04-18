import { BarChart3, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReports } from "@/hooks/useReports";
import { RevenueReport } from "@/components/reports/RevenueReport";
import { CollectionReport } from "@/components/reports/CollectionReport";
import { CustomerGrowthReport } from "@/components/reports/CustomerGrowthReport";
import { PackageDistribution } from "@/components/reports/PackageDistribution";
import { DueOverdueReport } from "@/components/reports/DueOverdueReport";
import { generateReportPdf } from "@/lib/generateReportPdf";
import { useTenantContext } from "@/contexts/TenantContext";
import { useQueryClient } from "@tanstack/react-query";

export default function Reports() {
  const { customers, payments, bills, packages, isLoading } = useReports();
  const { currentTenant } = useTenantContext();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["reports-customers"] });
    queryClient.invalidateQueries({ queryKey: ["reports-payments"] });
    queryClient.invalidateQueries({ queryKey: ["reports-bills"] });
    queryClient.invalidateQueries({ queryKey: ["reports-packages"] });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[380px]" />
          <Skeleton className="h-[380px]" />
          <Skeleton className="h-[320px]" />
          <Skeleton className="h-[320px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground">
              Complete analytics of your ISP business
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() =>
              generateReportPdf(
                { customers: customers || [], payments: payments || [], bills: bills || [], packages: packages || [] },
                currentTenant?.name
              )
            }
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueReport payments={payments || []} bills={bills || []} />
        <DueOverdueReport customers={customers || []} bills={bills || []} />
        <CustomerGrowthReport customers={customers || []} />
        <CollectionReport payments={payments || []} />
        <PackageDistribution customers={customers || []} packages={packages || []} />
      </div>
    </div>
  );
}
