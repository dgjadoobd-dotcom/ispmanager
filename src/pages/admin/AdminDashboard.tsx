import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  DollarSign,
  Activity,
  AlertTriangle,
  Clock,
  Package,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { usePlatformStats, useAllTenants, type TenantWithStats } from "@/hooks/useTenants";
import { useTenantContext } from "@/contexts/TenantContext";
import { StatCard } from "@/components/admin/StatCard";
import { AlertsSection, defaultAlerts } from "@/components/admin/AlertsSection";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { ISPGrowthChart } from "@/components/admin/ISPGrowthChart";
import { RecentISPTable } from "@/components/admin/RecentISPTable";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: tenants, isLoading: tenantsLoading } = useAllTenants();
  const { startImpersonation } = useTenantContext();

  const handleLoginAsAdmin = (tenant: TenantWithStats) => {
    startImpersonation(tenant.id);
    toast({
      title: "Logged in as tenant",
      description: `You are now viewing "${tenant.name}" as admin.`,
    });
    navigate("/dashboard");
  };

  const activeISPs = stats?.activeSubscriptions ?? 0;
  const totalISPs = stats?.totalTenants ?? 0;
  const totalCustomers = stats?.totalEndUsers ?? 0;
  const trialISPs = stats?.trialTenants ?? 0;
  const suspendedISPs = stats?.suspendedTenants ?? 0;

  const monthlyRevenue = 125000;
  const pendingPayouts = 3;
  const systemAlerts = suspendedISPs + (pendingPayouts > 0 ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Control Center</h1>
        <p className="text-muted-foreground">
          Real-time overview of platform health, revenue, and ISP operations
        </p>
      </div>

      {/* Primary Metrics — Revenue & Financials first for authority */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Platform Revenue"
          value={`৳${monthlyRevenue.toLocaleString()}`}
          trend={{ value: 8, isPositive: true }}
          icon={DollarSign}
          variant="success"
          href="/admin/revenue"
          isLoading={statsLoading}
        />
        <StatCard
          title="Active ISPs"
          value={activeISPs}
          trend={{ value: 12, isPositive: true }}
          icon={Activity}
          variant="success"
          href="/admin/tenants?status=active"
          isLoading={statsLoading}
        />
        <StatCard
          title="Total ISPs"
          value={totalISPs}
          subtitle={`${trialISPs} on trial`}
          icon={Building2}
          variant="default"
          href="/admin/tenants"
          isLoading={statsLoading}
        />
        <StatCard
          title="End Customers"
          value={totalCustomers.toLocaleString()}
          subtitle="Across all ISPs"
          icon={Users}
          variant="info"
          isLoading={statsLoading}
        />
        <StatCard
          title="Pending Payouts"
          value={pendingPayouts}
          subtitle="Awaiting approval"
          icon={Clock}
          variant={pendingPayouts > 0 ? "warning" : "default"}
          href="/admin/payouts"
          isLoading={statsLoading}
        />
        <StatCard
          title="Alerts"
          value={systemAlerts}
          subtitle={systemAlerts > 0 ? "Requires attention" : "All systems clear"}
          icon={systemAlerts > 0 ? AlertTriangle : ShieldCheck}
          variant={systemAlerts > 0 ? "danger" : "success"}
          isLoading={statsLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        <RevenueChart className="lg:col-span-3" />
        <ISPGrowthChart className="lg:col-span-2" />
      </div>

      {/* Alerts and Recent ISPs */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <AlertsSection
            alerts={
              suspendedISPs > 0
                ? [
                    {
                      id: "suspended",
                      type: "warning",
                      title: "Suspended ISPs",
                      description: `${suspendedISPs} ISP${suspendedISPs > 1 ? "s" : ""} currently suspended — review billing status`,
                      count: suspendedISPs,
                      href: "/admin/tenants?status=suspended",
                      icon: AlertTriangle,
                    },
                    ...defaultAlerts,
                  ]
                : defaultAlerts
            }
            isLoading={statsLoading}
          />
        </div>
        <div className="lg:col-span-3">
          <RecentISPTable
            tenants={tenants ?? []}
            isLoading={tenantsLoading}
            onLoginAsAdmin={handleLoginAsAdmin}
          />
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Add-on Adoption"
          value="68%"
          subtitle="ISPs using premium features"
          icon={Package}
          variant="default"
          href="/admin/addons"
        />
        <StatCard
          title="Payment Success Rate"
          value="96.5%"
          trend={{ value: 2, isPositive: true }}
          icon={TrendingUp}
          variant="success"
          href="/admin/payments"
        />
        <StatCard
          title="Trial → Paid Conversion"
          value="42%"
          trend={{ value: 5, isPositive: true }}
          icon={Activity}
          variant="info"
        />
        <StatCard
          title="Revenue per ISP"
          value="৳2,450"
          subtitle="Monthly average"
          icon={DollarSign}
          variant="default"
          href="/admin/revenue"
        />
      </div>
    </div>
  );
}
