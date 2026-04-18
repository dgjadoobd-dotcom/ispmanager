import { useState } from "react";
import { RefreshCw, Loader2, CheckCircle, XCircle, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { dbGet, TABLES } from "@/lib/db";
import { useTenantContext } from "@/contexts/TenantContext";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface NetworkSyncButtonProps {
  customerId: string;
  customerName: string;
  connectionStatus: "active" | "suspended" | "pending";
  networkUsername?: string | null;
  lastSyncAt?: string | null;
  syncStatus?: "pending" | "in_progress" | "success" | "failed" | "retrying" | null;
  onSyncComplete?: () => void;
}

type SyncAction = "enable" | "disable" | "update_speed";

export function NetworkSyncButton({
  customerId,
  customerName,
  connectionStatus,
  networkUsername,
  lastSyncAt,
  syncStatus,
  onSyncComplete,
}: NetworkSyncButtonProps) {
  const { currentTenant } = useTenantContext();
  const [syncing, setSyncing] = useState(false);
  const [currentAction, setCurrentAction] = useState<SyncAction | null>(null);

  // Fetch active network integration for this tenant
  const { data: integration } = useQuery({
    queryKey: ["network-integration-active", currentTenant?.id],
    queryFn: () => {
      if (!currentTenant?.id) return null;
      const integrations = dbGet<any>(TABLES.network_integrations);
      return integrations.find((n: any) => n.tenant_id === currentTenant.id && n.is_enabled) ?? null;
    },
    enabled: !!currentTenant?.id,
  });

  const performSync = async (action: SyncAction) => {
    if (!integration?.id) {
      toast.error("No active network integration found", {
        description: "Please configure and enable a network integration in Settings → Network",
      });
      return;
    }

    if (!networkUsername) {
      toast.error("Network username not configured", {
        description: `Please set a network username for ${customerName} first`,
      });
      return;
    }

    setSyncing(true);
    setCurrentAction(action);

    try {
      const response = await supabase.functions.invoke("network-sync", {
        body: {
          action,
          integration_id: integration.id,
          customer_id: customerId,
          triggered_by: "manual",
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;

      if (result.success) {
        toast.success("Network sync successful", {
          description: result.message,
        });
        onSyncComplete?.();
      } else {
        toast.error("Network sync failed", {
          description: result.message,
        });
      }
    } catch (error: any) {
      console.error("Network sync error:", error);
      toast.error("Failed to sync with network", {
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setSyncing(false);
      setCurrentAction(null);
    }
  };

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return "Never synced";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getSyncStatusBadge = () => {
    if (!syncStatus) return null;
    
    const styles: Record<string, string> = {
      success: "bg-success/10 text-success border-success/20",
      failed: "bg-destructive/10 text-destructive border-destructive/20",
      pending: "bg-warning/10 text-warning border-warning/20",
      in_progress: "bg-info/10 text-info border-info/20",
      retrying: "bg-warning/10 text-warning border-warning/20",
    };

    const icons: Record<string, React.ReactNode> = {
      success: <CheckCircle className="h-3 w-3" />,
      failed: <XCircle className="h-3 w-3" />,
    };

    return (
      <Badge variant="outline" className={cn("gap-1 text-xs", styles[syncStatus])}>
        {icons[syncStatus]}
        {syncStatus}
      </Badge>
    );
  };

  // If no integration is configured or network username is missing, show disabled state
  const isDisabled = !integration || syncing;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2" 
          disabled={syncing}
        >
          {syncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {syncing ? `Syncing ${currentAction}...` : "Sync to Network"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Network Sync</span>
          {getSyncStatusBadge()}
        </DropdownMenuLabel>
        
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Wifi className="h-3 w-3" />
            <span>{integration?.name || "No integration"}</span>
          </div>
          <div className="mt-1">Last sync: {formatLastSync(lastSyncAt ?? null)}</div>
          {networkUsername && (
            <div className="mt-1 font-mono">Username: {networkUsername}</div>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        {!networkUsername && (
          <div className="px-2 py-2 text-xs text-warning">
            ⚠️ Network username not set for this customer
          </div>
        )}
        
        {!integration && (
          <div className="px-2 py-2 text-xs text-warning">
            ⚠️ No active network integration. Configure in Settings → Network
          </div>
        )}
        
        {integration && networkUsername && (
          <>
            <DropdownMenuItem 
              onClick={() => performSync("enable")}
              disabled={isDisabled}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <div>Enable Access</div>
                <div className="text-xs text-muted-foreground">Activate customer on network</div>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => performSync("disable")}
              disabled={isDisabled}
              className="gap-2"
            >
              <XCircle className="h-4 w-4 text-destructive" />
              <div>
                <div>Disable Access</div>
                <div className="text-xs text-muted-foreground">Suspend customer on network</div>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => performSync("update_speed")}
              disabled={isDisabled}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4 text-info" />
              <div>
                <div>Update Speed Profile</div>
                <div className="text-xs text-muted-foreground">Sync package speed settings</div>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
