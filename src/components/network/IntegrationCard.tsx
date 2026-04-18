import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Wifi,
  Server,
  Network as NetworkIcon,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useTestConnection, useUpdateNetworkIntegration } from "@/hooks/useNetworkIntegration";

interface IntegrationCardProps {
  integration: any;
}

const providerIcons: Record<string, any> = {
  mikrotik: Wifi,
  radius: Server,
  custom: NetworkIcon,
};

const providerLabels: Record<string, string> = {
  mikrotik: "MikroTik RouterOS",
  radius: "RADIUS Server",
  custom: "Custom Provider",
};

const syncModeLabels: Record<string, string> = {
  manual: "Manual",
  scheduled: "Scheduled",
  event_driven: "Event-driven",
};

const statusStyles: Record<string, { label: string; className: string; icon: any }> = {
  success: { label: "Connected", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  in_progress: { label: "In Progress", className: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: RefreshCw },
  retrying: { label: "Retrying", className: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: RefreshCw },
};

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const Icon = providerIcons[integration.provider_type] || NetworkIcon;
  const testConnection = useTestConnection();
  const updateIntegration = useUpdateNetworkIntegration();
  const status = statusStyles[integration.last_sync_status || "pending"] || statusStyles.pending;
  const StatusIcon = status.icon;

  const handleToggle = async (enabled: boolean) => {
    await updateIntegration.mutateAsync({
      id: integration.id,
      updates: { is_enabled: enabled },
    });
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      integration.is_enabled ? "border-primary/20" : "opacity-60"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
              integration.is_enabled ? "bg-primary/10" : "bg-muted"
            )}>
              <Icon className={cn("h-5 w-5", integration.is_enabled ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{integration.name}</h3>
                <Badge variant="outline" className={cn("text-[10px] shrink-0", status.className)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {providerLabels[integration.provider_type]}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                <span className="font-mono">{integration.host}:{integration.port}</span>
                <span>User: {integration.username}</span>
                <span>Sync: {syncModeLabels[integration.sync_mode]}</span>
                {integration.last_sync_at && (
                  <span>
                    Last sync: {formatDistanceToNow(parseISO(integration.last_sync_at), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={testConnection.isPending || !integration.is_enabled}
              onClick={() => testConnection.mutateAsync(integration.id)}
            >
              {testConnection.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Switch
              checked={integration.is_enabled}
              onCheckedChange={handleToggle}
              disabled={updateIntegration.isPending}
            />
          </div>
        </div>

        {integration.provider_type === "mikrotik" && (integration.mikrotik_ppp_profile || integration.mikrotik_address_list) && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t text-xs text-muted-foreground">
            {integration.mikrotik_ppp_profile && <span>PPP: {integration.mikrotik_ppp_profile}</span>}
            {integration.mikrotik_address_list && <span>Block List: {integration.mikrotik_address_list}</span>}
            {integration.mikrotik_use_ssl && <Badge variant="outline" className="text-[10px]">SSL</Badge>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
