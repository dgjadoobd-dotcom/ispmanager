import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  HeartPulse,
  Server,
  Database,
  Wifi,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  Zap,
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
  { name: "API Gateway", status: "operational", uptime: 99.98, responseTime: 45, icon: Zap },
  { name: "Database Cluster", status: "operational", uptime: 99.99, responseTime: 12, icon: Database },
  { name: "Authentication", status: "operational", uptime: 100, responseTime: 32, icon: Server },
  { name: "Edge Functions", status: "degraded", uptime: 99.85, responseTime: 120, icon: Activity },
  { name: "File Storage", status: "operational", uptime: 99.97, responseTime: 55, icon: HardDrive },
  { name: "Network Sync", status: "operational", uptime: 99.92, responseTime: 88, icon: Wifi },
];

const statusStyles = {
  operational: { label: "Operational", color: "bg-success text-success-foreground", dot: "bg-success" },
  degraded: { label: "Degraded", color: "bg-warning text-warning-foreground", dot: "bg-warning" },
  down: { label: "Down", color: "bg-destructive text-destructive-foreground", dot: "bg-destructive" },
};

const incidents = [
  { id: 1, title: "Edge Function latency spike", status: "investigating", time: "12 min ago", severity: "warning" },
  { id: 2, title: "Scheduled maintenance: DB migration", status: "scheduled", time: "Tomorrow 2:00 AM", severity: "info" },
];

export default function AdminSystemHealth() {
  const operationalCount = services.filter(s => s.status === "operational").length;
  const avgUptime = (services.reduce((s, svc) => s + svc.uptime, 0) / services.length).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
        <p className="text-muted-foreground">Real-time platform infrastructure monitoring</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <HeartPulse className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Status</p>
              <p className="text-lg font-bold">
                {operationalCount === services.length ? "All Systems Normal" : "Partial Issues"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Platform Uptime</p>
              <p className="text-lg font-bold">{avgUptime}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Services Up</p>
              <p className="text-lg font-bold">{operationalCount}/{services.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Incidents</p>
              <p className="text-lg font-bold">{incidents.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Service Status
          </CardTitle>
          <CardDescription>Current health of all platform services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((svc) => {
              const style = statusStyles[svc.status as keyof typeof statusStyles];
              const Icon = svc.icon;
              return (
                <div key={svc.name} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">{svc.name}</p>
                      <Badge variant="outline" className={cn("text-[10px]", style.color)}>
                        {style.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{svc.uptime}% uptime</span>
                      <span>{svc.responseTime}ms avg</span>
                    </div>
                    <Progress value={svc.uptime} className="mt-2 h-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No active incidents</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((inc) => (
                <div key={inc.id} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                  <div className={cn(
                    "p-2 rounded-lg",
                    inc.severity === "warning" ? "bg-warning/10" : "bg-info/10"
                  )}>
                    {inc.severity === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    ) : (
                      <Clock className="h-4 w-4 text-info" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{inc.title}</p>
                    <p className="text-xs text-muted-foreground">{inc.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">{inc.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
