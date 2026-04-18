import { useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotificationLogs, useNotificationStats } from "@/hooks/useNotificationLogs";
import { NotificationStatsCards } from "@/components/notifications/NotificationStatsCards";
import { NotificationLogTable } from "@/components/notifications/NotificationLogTable";
import { NotificationFilters } from "@/components/notifications/NotificationFilters";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Notifications() {
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: logs, isLoading: logsLoading } = useNotificationLogs({
    type,
    status,
    search,
  });
  const { data: stats, isLoading: statsLoading } = useNotificationStats();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["notificationLogs"] });
    queryClient.invalidateQueries({ queryKey: ["notificationStats"] });
    toast.success("Refreshing...");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground">
              Notification logs and delivery status
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <NotificationStatsCards stats={stats} isLoading={statsLoading} />

      {/* Logs */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            Notification Logs
          </CardTitle>
          <NotificationFilters
            type={type}
            status={status}
            search={search}
            onTypeChange={setType}
            onStatusChange={setStatus}
            onSearchChange={setSearch}
          />
        </CardHeader>
        <CardContent className="pt-0">
          <NotificationLogTable
            logs={logs || []}
            isLoading={logsLoading}
            onResend={(log) => {
              toast.info(`Resend feature for "${log.title}" is coming soon`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
