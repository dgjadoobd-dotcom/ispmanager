import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  User,
  Users,
  Wallet,
  Receipt,
  Activity,
  Edit,
  Ban,
  CheckCircle,
  LogIn,
} from "lucide-react";
import { useResellerImpersonation } from "@/contexts/ResellerImpersonationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useReseller,
  useResellerCustomers,
  useResellerCommissions,
  useResellerWallet,
  useToggleResellerStatus,
} from "@/hooks/useResellers";
import { ResellerCustomersTab } from "@/components/resellers/ResellerCustomersTab";
import { ResellerWalletTab } from "@/components/resellers/ResellerWalletTab";
import { ResellerCommissionsTab } from "@/components/resellers/ResellerCommissionsTab";

const commissionLabels: Record<string, string> = {
  percentage: "Percentage",
  flat: "Flat",
  per_payment: "Per Payment",
};

const statusConfig: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
  active: { label: "Active", variant: "default" },
  suspended: { label: "Suspended", variant: "destructive" },
  inactive: { label: "Inactive", variant: "secondary" },
};

export default function ResellerDetail() {
  const { resellerId } = useParams();
  const navigate = useNavigate();
  const { data: reseller, isLoading } = useReseller(resellerId);
  const { data: customers, isLoading: customersLoading } = useResellerCustomers(resellerId);
  const { data: commissions, isLoading: commissionsLoading } = useResellerCommissions(resellerId);
  const { data: wallet, isLoading: walletLoading } = useResellerWallet(resellerId);
  const toggleStatus = useToggleResellerStatus();
  const { startResellerImpersonation } = useResellerImpersonation();

  const handleLoginAsReseller = () => {
    if (reseller) {
      startResellerImpersonation(reseller.id, reseller.name);
      navigate("/dashboard/reseller");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!reseller) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Reseller not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard/resellers")}>
          Go Back
        </Button>
      </div>
    );
  }

  const st = statusConfig[reseller.status] || statusConfig.active;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/resellers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{reseller.name}</h1>
            <Badge variant={st.variant}>{st.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{reseller.phone} {reseller.email ? `• ${reseller.email}` : ""}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleLoginAsReseller}>
            <LogIn className="h-4 w-4 mr-1" /> Login as Reseller
          </Button>
          {reseller.status === "active" ? (
            <Button variant="destructive" size="sm" onClick={() => toggleStatus.mutate({ id: reseller.id, status: "suspended" })}>
              <Ban className="h-4 w-4 mr-1" /> Suspend
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={() => toggleStatus.mutate({ id: reseller.id, status: "active" })}>
              <CheckCircle className="h-4 w-4 mr-1" /> Activate
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Customer Count", value: customers?.length || 0, icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "Commission Type", value: `${reseller.commission_value}${reseller.commission_type === "percentage" ? "%" : "৳"} (${commissionLabels[reseller.commission_type]})`, icon: Receipt, color: "text-accent-foreground", bg: "bg-accent/50" },
          { label: "Total Commission", value: `৳${commissions?.reduce((s: number, c: any) => s + Number(c.commission_amount), 0).toLocaleString() || 0}`, icon: Receipt, color: "text-success", bg: "bg-success/10" },
          { label: "Wallet Balance", value: `৳${(wallet?.balance || 0).toLocaleString()}`, icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="customers">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid">
          <TabsTrigger value="customers" className="gap-1.5">
            <Users className="h-4 w-4" /> Customers
          </TabsTrigger>
          <TabsTrigger value="commissions" className="gap-1.5">
            <Receipt className="h-4 w-4" /> Commissions
          </TabsTrigger>
          <TabsTrigger value="wallet" className="gap-1.5">
            <Wallet className="h-4 w-4" /> Wallet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <ResellerCustomersTab customers={customers || []} isLoading={customersLoading} resellerId={resellerId!} tenantId={reseller.tenant_id} />
        </TabsContent>
        <TabsContent value="commissions">
          <ResellerCommissionsTab commissions={commissions || []} isLoading={commissionsLoading} />
        </TabsContent>
        <TabsContent value="wallet">
          <ResellerWalletTab
            wallet={wallet || { balance: 0, transactions: [] }}
            isLoading={walletLoading}
            resellerId={resellerId!}
            tenantId={reseller.tenant_id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}