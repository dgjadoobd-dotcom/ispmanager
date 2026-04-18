import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  ListTodo,
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface SyncQueueCardProps {
  queue: any[];
  isLoading: boolean;
}

const actionLabels: Record<string, string> = {
  enable: "Enable",
  disable: "Disable",
  update_speed: "Speed Update",
  create: "Create",
  delete: "Delete",
  test_connection: "Test",
};

const statusStyles: Record<string, { className: string; icon: any }> = {
  pending: { className: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  in_progress: { className: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: RefreshCw },
  success: { className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle },
  failed: { className: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  retrying: { className: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: AlertTriangle },
};

export function SyncQueueCard({ queue, isLoading }: SyncQueueCardProps) {
  const pendingItems = queue.filter((q) => q.status === "pending" || q.status === "in_progress" || q.status === "retrying");
  const displayItems = pendingItems.length > 0 ? pendingItems : queue.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <ListTodo className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-base">Sync Queue</CardTitle>
              <CardDescription>
                {pendingItems.length > 0
                  ? `${pendingItems.length} task(s) pending`
                  : "No pending tasks"}
              </CardDescription>
            </div>
          </div>
          {pendingItems.length > 0 && (
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              {pendingItems.length} Pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <ListTodo className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Queue is empty</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayItems.map((item: any) => {
              const style = statusStyles[item.status] || statusStyles.pending;
              const StatusIcon = style.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusIcon className={cn("h-4 w-4 shrink-0", style.className.includes("text-") ? "" : "text-muted-foreground")} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {item.customers?.name || "Unknown"}
                        </span>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {actionLabels[item.action] || item.action}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.network_integrations?.name || "-"} • 
                        {item.retry_count > 0 && ` Attempt: ${item.retry_count}/${item.max_retries} •`}{" "}
                        {formatDistanceToNow(parseISO(item.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] shrink-0", style.className)}>
                    {item.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
