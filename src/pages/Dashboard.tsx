import { Calculator } from "lucide-react";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { CustomerTable } from "@/components/dashboard/CustomerTable";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DashboardStatGrid } from "@/components/dashboard/DashboardStatGrid";
import { useTenantContext } from "@/contexts/TenantContext";
import { useCustomers } from "@/hooks/useCustomers";
import { usePayments } from "@/hooks/usePayments";
import { useBills } from "@/hooks/useBills";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { demoMetrics } from "@/data/demoData";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentTenant, isLoading: tenantLoading } = useTenantContext();
  const { isDemoMode } = useDemoMode();
  const { data: customers = [], isLoading: customersLoading } = useCustomers(currentTenant?.id);
  const { data: payments = [], isLoading: paymentsLoading } = usePayments(currentTenant?.id);
  const { data: bills = [], isLoading: billsLoading } = useBills(currentTenant?.id);

  const isLoading = !isDemoMode && (tenantLoading || customersLoading || paymentsLoading || billsLoading);

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Client metrics
  const totalCustomers = isDemoMode ? demoMetrics.totalCustomers : customers.length;
  const activeCustomers = isDemoMode ? demoMetrics.activeCustomers : customers.filter(c => c.connection_status === "active").length;
  const suspendedCustomers = isDemoMode ? demoMetrics.suspendedCustomers : customers.filter(c => c.connection_status === "suspended").length;
  const inactiveCustomers = isDemoMode ? 0 : customers.filter(c => !c.connection_status || c.connection_status === "pending").length;

  const newCustomersThisMonth = isDemoMode ? demoMetrics.newCustomersThisMonth : customers.filter(c => new Date(c.join_date) >= thisMonthStart).length;

  // Billing metrics
  const thisMonthBills = isDemoMode ? [] : bills.filter(b => new Date(b.created_at) >= thisMonthStart);
  const billedCount = isDemoMode ? demoMetrics.monthlyBillsCount : thisMonthBills.length;
  const paidCount = isDemoMode ? 0 : thisMonthBills.filter(b => b.status === "paid").length;
  const partiallyPaidCount = isDemoMode ? 0 : thisMonthBills.filter(b => b.status === "partial").length;
  const unpaidCount = isDemoMode ? 0 : thisMonthBills.filter(b => b.status === "due").length;
  const billExpiredCount = isDemoMode ? 0 : thisMonthBills.filter(b => b.status === "overdue").length;

  // Revenue
  const monthlyRevenue = isDemoMode ? demoMetrics.monthlyRevenue : payments.filter(p => new Date(p.created_at) >= thisMonthStart).reduce((sum, p) => sum + Number(p.amount), 0);
  const totalBilled = isDemoMode ? 9300 : thisMonthBills.reduce((sum, b) => sum + Number(b.amount), 0);
  const collectionRate = isDemoMode ? demoMetrics.collectionRate : (totalBilled > 0 ? ((monthlyRevenue / totalBilled) * 100) : 0);

  const totalDue = isDemoMode ? demoMetrics.totalDue : customers.reduce((sum, c) => sum + (c.due_balance || 0), 0);
  const customersWithDue = isDemoMode ? demoMetrics.customersWithDue : customers.filter(c => (c.due_balance || 0) > 0).length;


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })} — your ISP at a glance
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => navigate("/dashboard/finance/accounting")}>
          <Calculator className="h-4 w-4" />
          <span className="hidden sm:inline">Accounting Dashboard</span>
        </Button>
      </div>

      {/* Onboarding Checklist */}
      <OnboardingChecklist />


      {/* Stats Grid — 4×5 colorful cards */}
      <DashboardStatGrid
        totalCustomers={totalCustomers}
        activeCustomers={activeCustomers}
        inactiveCustomers={inactiveCustomers}
        suspendedCustomers={suspendedCustomers}
        newCustomersThisMonth={newCustomersThisMonth}
        renewedCustomers={0}
        deactivatedCustomers={0}
        expiredCustomers={0}
        billedCount={billedCount}
        paidCount={paidCount}
        partiallyPaidCount={partiallyPaidCount}
        unpaidCount={unpaidCount}
        onlineCount={activeCustomers}
        blockedCount={suspendedCustomers}
        billExpiredCount={billExpiredCount}
        dueCustomers={customersWithDue}
        collectionRate={collectionRate}
        monthlyRevenue={monthlyRevenue}
        totalDue={totalDue}
        billsGenerated={billedCount}
      />

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RevenueChart />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>

      {/* Customer Table */}
      <CustomerTable />
    </div>
  );
}
