import { useQuery } from "@tanstack/react-query";
import { dbGet, TABLES } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Network, CheckCircle2, XCircle, AlertCircle, Clock, RefreshCw, Server,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NetworkIntegrationWithTenant {
  id: string; name: string; provider_type: "mikrotik" | "radius" | "custom";
  is_enabled: boolean; last_sync_at: string | null;
  last_sync_status: "pending" | "in_progress" | "success" | "failed" | "retrying" | null;
  host: string; port: number | null; sync_mode: "manual" | "scheduled" | "event_driven";
  sync_interval_minutes: number | null; mikrotik_use_ssl: boolean | null;
  mikrotik_ppp_profile: string | null;
  tenant: { id: string; name: string; subdomain: string };
}

interface SyncLog {
  id: string; action: string; status: string; started_at: string;
  completed_at: string | null; error_message: string | null;
  customer: { name: string } | null;
}

interface SyncStats { total: number; success: number; failed: number; pending: number; }

const statusConfig = {
  success: { label: "Success", icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-500/10" },
  failed: { label: "Failed", icon: XCircle, color: "text-red-500", bgColor: "bg-red-500/10" },
  in_progress: { label: "In Progress", icon: RefreshCw, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  pending: { label: "Pending", icon: Clock, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  retrying: { label: "Retrying", icon: RefreshCw, color: "text-orange-500", bgColor: "bg-orange-500/10" },
};

const providerLabels = { mikrotik: "MikroTik", radius: "RADIUS", custom: "Custom" };
const syncModeLabels = { manual: "Manual", scheduled: "Scheduled", event_driven: "Event-driven" };
const actionLabels: Record<string, string> = {
  enable: "Enable", disable: "Disable", update_speed: "Speed Update",
  create: "Create", delete: "Delete", test_connection: "Connection Test",
};

function IntegrationDetails({ integration }: { integration: NetworkIntegrationWithTenant }) {
  const { data: syncLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["admin-sync-logs", integration.id],
    queryFn: async () => {
      const logs = dbGet<any>(TABLES.network_sync_logs).filter((l: any) => l.integration_id === integration.id).slice(0, 10);
      const customers = dbGet<any>(TABLES.customers);
      return logs.map((l: any) => ({ ...l, customer: customers.find((c: any) => c.id === l.customer_id) ?? null })) as unknown as SyncLog[];
    },
  });

  return (
    <div className="mt-3 pt-3 border-t space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground mb-1">Host</p>
          <p className="text-sm font-medium flex items-center gap-1">
            {integration.host}:{integration.port ?? 8728}
            {integration.mikrotik_use_ssl && <Badge variant="outline" className="text-xs ml-1">SSL</Badge>}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground mb-1">Sync Mode</p>
          <p className="text-sm font-medium">
            {syncModeLabels[integration.sync_mode]}
            {integration.sync_mode === "scheduled" && integration.sync_interval_minutes && (
              <span className="text-muted-foreground ml-1">(every {integration.sync_interval_minutes} min)</span>
            )}
          </p>
        </div>
        {integration.mikrotik_ppp_profile && (
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">PPP Profile</p>
            <p className="text-sm font-medium">{integration.mikrotik_ppp_profile}</p>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4" />Recent Sync Logs
        </h4>
        {logsLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !syncLogs?.length ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No sync logs found</p>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {syncLogs.map((log) => {
                const logStatus = statusConfig[log.status as keyof typeof statusConfig];
                const LogIcon = logStatus?.icon ?? Clock;
                return (
                  <div key={log.id} className="flex items-start justify-between p-2 rounded-lg bg-muted/20 text-sm">
                    <div className="flex items-start gap-2">
                      <LogIcon className={`h-4 w-4 mt-0.5 ${logStatus?.color ?? "text-muted-foreground"}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{actionLabels[log.action] ?? log.action}</span>
                          {log.customer?.name && <span className="text-muted-foreground">- {log.customer.name}</span>}
                        </div>
                        {log.error_message && <p className="text-xs text-destructive mt-0.5">{log.error_message}</p>}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{format(new Date(log.started_at), "dd MMM, HH:mm")}</p>
                      <Badge variant={log.status === "success" ? "default" : log.status === "failed" ? "destructive" : "secondary"} className="text-xs mt-1">
                        {logStatus?.label ?? log.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

export function NetworkHealthOverview() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ["admin-network-integrations"],
    queryFn: async () => {
      const integrations = dbGet<any>(TABLES.network_integrations);
      const tenants = [{ id: "00000000-0000-0000-0000-000000000001", name: "My ISP", subdomain: "local" }];
      return integrations.map((i: any) => ({
        ...i,
        tenant: tenants.find((t) => t.id === i.tenant_id) ?? { id: i.tenant_id, name: "Unknown", subdomain: "" },
      })) as unknown as NetworkIntegrationWithTenant[];
    },
  });

  const { data: syncStats, isLoading: syncStatsLoading } = useQuery({
    queryKey: ["admin-sync-stats"],
    queryFn: async () => {
      const last24Hours = new Date(); last24Hours.setHours(last24Hours.getHours() - 24);
      const logs = dbGet<any>(TABLES.network_sync_logs).filter((l: any) => new Date(l.created_at) >= last24Hours);
      return {
        total: logs.length,
        success: logs.filter((l: any) => l.status === "success").length,
        failed: logs.filter((l: any) => l.status === "failed").length,
        pending: logs.filter((l: any) => l.status === "pending" || l.status === "in_progress").length,
      } as SyncStats;
    },
  });

  const isLoading = integrationsLoading || syncStatsLoading;
  const enabledIntegrations = integrations?.filter(i => i.is_enabled) ?? [];
  const failedIntegrations = integrations?.filter(i => i.last_sync_status === "failed") ?? [];
  const healthScore = enabledIntegrations.length > 0
    ? Math.round(((enabledIntegrations.length - failedIntegrations.length) / enabledIntegrations.length) * 100) : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Network className="h-5 w-5" />Network Integration Health</CardTitle>
        <CardDescription>Network sync status across all ISPs • Click to view details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className={`text-3xl font-bold ${healthScore >= 80 ? "text-green-500" : healthScore >= 50 ? "text-yellow-500" : "text-red-500"}`}>
              {isLoading ? <Skeleton className="h-9 w-16 mx-auto" /> : `${healthScore}%`}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Health Score</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            {isLoading ? <Skeleton className="h-9 w-16 mx-auto" /> : <div className="text-3xl font-bold">{enabledIntegrations.length}</div>}
            <p className="text-sm text-muted-foreground mt-1">Active Integrations</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            {syncStatsLoading ? <Skeleton className="h-9 w-16 mx-auto" /> : <div className="text-3xl font-bold text-green-500">{syncStats?.success ?? 0}</div>}
            <p className="text-sm text-muted-foreground mt-1">Successful Syncs (24h)</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            {syncStatsLoading ? <Skeleton className="h-9 w-16 mx-auto" /> : <div className={`text-3xl font-bold ${(syncStats?.failed ?? 0) > 0 ? "text-red-500" : ""}`}>{syncStats?.failed ?? 0}</div>}
            <p className="text-sm text-muted-foreground mt-1">Failed Syncs (24h)</p>
          </div>
        </div>

        {failedIntegrations.length > 0 && (
          <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="font-medium text-destructive">{failedIntegrations.length} integration(s) have issues</span>
            </div>
            <div className="space-y-2">
              {failedIntegrations.slice(0, 3).map((integration) => (
                <div key={integration.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span>{integration.tenant?.name ?? "Unknown"}</span>
                    <span className="text-muted-foreground">- {integration.name}</span>
                  </div>
                  <Badge variant="destructive" className="text-xs">Failed</Badge>
                </div>
              ))}
              {failedIntegrations.length > 3 && <p className="text-xs text-muted-foreground">and {failedIntegrations.length - 3} more...</p>}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : integrations?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Network className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No network integrations configured</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {integrations?.map((integration) => {
              const status = integration.last_sync_status;
              const statusInfo = status ? statusConfig[status] : null;
              const StatusIcon = statusInfo?.icon ?? Clock;
              const isExpanded = expandedId === integration.id;
              return (
                <Collapsible key={integration.id} open={isExpanded} onOpenChange={() => setExpandedId(isExpanded ? null : integration.id)}>
                  <div className="rounded-lg border hover:bg-muted/50 transition-colors">
                    <CollapsibleTrigger asChild>
                      <button className="w-full p-3 flex items-center justify-between text-left">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${statusInfo?.bgColor ?? "bg-muted"}`}>
                            <StatusIcon className={`h-5 w-5 ${statusInfo?.color ?? "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{integration.tenant?.name ?? "Unknown Tenant"}</p>
                              <Badge variant="outline" className="text-xs">{providerLabels[integration.provider_type]}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{integration.name} • {integration.host}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <Badge variant={integration.is_enabled ? "default" : "secondary"} className="text-xs">
                              {integration.is_enabled ? "Active" : "Inactive"}
                            </Badge>
                            {integration.last_sync_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(integration.last_sync_at), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                          {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-3 pb-3">
                      <IntegrationDetails integration={integration} />
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
