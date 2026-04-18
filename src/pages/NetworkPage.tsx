import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Network,
  Plus,
  Settings2,
  RefreshCw,
  Wifi,
  Server,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import {
  useNetworkIntegrations,
  useNetworkSyncLogs,
} from "@/hooks/useNetworkIntegration";
import { useNetworkSyncQueue } from "@/hooks/useNetworkSyncQueue";
import { IntegrationCard } from "@/components/network/IntegrationCard";
import { SyncLogTable } from "@/components/network/SyncLogTable";
import { SyncQueueCard } from "@/components/network/SyncQueueCard";
import { StatCard } from "@/components/admin/StatCard";

export default function NetworkPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: integrations, isLoading: intLoading } = useNetworkIntegrations();
  const { data: syncLogs, isLoading: logsLoading } = useNetworkSyncLogs(undefined, 50);
  const { data: syncQueue, isLoading: queueLoading } = useNetworkSyncQueue(20);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["network-integrations"] });
    queryClient.invalidateQueries({ queryKey: ["network-sync-logs"] });
    queryClient.invalidateQueries({ queryKey: ["network-sync-queue"] });
  };

  // Stats
  const totalIntegrations = integrations?.length || 0;
  const activeIntegrations = integrations?.filter((i) => i.is_enabled).length || 0;
  const recentSuccessLogs = (syncLogs || []).filter((l: any) => l.status === "success").length;
  const recentFailedLogs = (syncLogs || []).filter((l: any) => l.status === "failed").length;
  const pendingQueue = (syncQueue || []).filter((q: any) => q.status === "pending" || q.status === "in_progress").length;

  if (intLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Network className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Network</h1>
            <p className="text-sm text-muted-foreground">
              MikroTik and RADIUS synchronization management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/settings")}>
            <Settings2 className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Integrations"
          value={totalIntegrations}
          subtitle={`${activeIntegrations} active`}
          icon={Wifi}
          variant="info"
        />
        <StatCard
          title="Successful Syncs"
          value={recentSuccessLogs}
          subtitle="In last 50 logs"
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Failed Syncs"
          value={recentFailedLogs}
          subtitle="In last 50 logs"
          icon={XCircle}
          variant={recentFailedLogs > 0 ? "danger" : "default"}
        />
        <StatCard
          title="In Queue"
          value={pendingQueue}
          subtitle="Waiting tasks"
          icon={Clock}
          variant={pendingQueue > 0 ? "warning" : "default"}
        />
      </div>

      {/* Integrations */}
      <div>
        <h2 className="text-base font-semibold mb-3">Integrations</h2>
        {totalIntegrations === 0 ? (
          <div className="rounded-xl border-2 border-dashed p-8 text-center">
            <Network className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No network integrations found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Go to settings to connect a MikroTik or RADIUS server
            </p>
            <Button onClick={() => navigate("/dashboard/settings")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {integrations?.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        )}
      </div>

      {/* Tabs for Queue & Logs */}
      <Tabs defaultValue="logs">
        <TabsList>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
          <TabsTrigger value="queue">
            Sync Queue
            {pendingQueue > 0 && (
              <span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-[10px] font-semibold text-amber-600">
                {pendingQueue}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="logs" className="mt-4">
          <SyncLogTable
            logs={syncLogs || []}
            isLoading={logsLoading}
            title="Recent Sync Logs"
            description="Latest 50 sync operation logs"
          />
        </TabsContent>
        <TabsContent value="queue" className="mt-4">
          <SyncQueueCard queue={syncQueue || []} isLoading={queueLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
