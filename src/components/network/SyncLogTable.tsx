import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface SyncLogTableProps {
  logs: any[];
  isLoading: boolean;
  title?: string;
  description?: string;
  limit?: number;
}

const actionLabels: Record<string, string> = {
  enable: "Enable",
  disable: "Disable",
  update_speed: "Speed Update",
  create: "Create",
  delete: "Delete",
  test_connection: "Test Connection",
};

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  success: { label: "Success", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  in_progress: { label: "In Progress", className: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: RefreshCw },
  retrying: { label: "Retrying", className: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: AlertTriangle },
};

export function SyncLogTable({ logs, isLoading, title = "Sync Logs", description, limit = 15 }: SyncLogTableProps) {
  const displayLogs = logs?.slice(0, limit) || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : displayLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No sync logs found</p>
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Integration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayLogs.map((log: any) => {
                  const status = statusConfig[log.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(parseISO(log.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {actionLabels[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.customers?.name || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.network_integrations?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px] gap-1", status.className)}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-destructive max-w-[200px] truncate">
                        {log.error_message || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
