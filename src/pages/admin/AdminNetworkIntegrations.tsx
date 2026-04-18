import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Network, Wifi, CheckCircle, AlertTriangle, Server, RefreshCw, Building2 } from "lucide-react";

const integrations = [
  { id: "1", isp: "SpeedLink ISP", type: "MikroTik", host: "192.168.1.1", status: "connected", syncRate: 98, lastSync: "5 min ago", customers: 450 },
  { id: "2", isp: "FastNet BD", type: "MikroTik", host: "10.0.0.1", status: "connected", syncRate: 96, lastSync: "12 min ago", customers: 380 },
  { id: "3", isp: "NetZone", type: "RADIUS", host: "radius.netzone.bd", status: "error", syncRate: 0, lastSync: "2 hours ago", customers: 220 },
  { id: "4", isp: "DataStream BD", type: "MikroTik", host: "172.16.0.1", status: "connected", syncRate: 99, lastSync: "1 min ago", customers: 180 },
  { id: "5", isp: "ConnectPlus", type: "Custom API", host: "api.connectplus.bd", status: "connected", syncRate: 94, lastSync: "30 min ago", customers: 150 },
];

const statusConfig = {
  connected: { label: "Connected", color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  error: { label: "Error", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  disconnected: { label: "Disconnected", color: "bg-muted text-muted-foreground", icon: Wifi },
};

export default function AdminNetworkIntegrations() {
  const connectedCount = integrations.filter(i => i.status === "connected").length;
  const errorCount = integrations.filter(i => i.status === "error").length;
  const avgSyncRate = integrations.filter(i => i.status === "connected").reduce((s, i) => s + i.syncRate, 0) / connectedCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Network Integrations</h1>
        <p className="text-muted-foreground">Monitor ISP network integration health across the platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10"><Network className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Integrations</p>
              <p className="text-xl font-bold">{integrations.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10"><CheckCircle className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Connected</p>
              <p className="text-xl font-bold">{connectedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Errors</p>
              <p className="text-xl font-bold">{errorCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-info/10"><RefreshCw className="h-5 w-5 text-info" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Sync Rate</p>
              <p className="text-xl font-bold">{avgSyncRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> All Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>ISP</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sync Rate</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead className="text-center">Customers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((intg) => {
                  const config = statusConfig[intg.status as keyof typeof statusConfig];
                  const StatusIcon = config.icon;
                  return (
                    <TableRow key={intg.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{intg.isp}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{intg.type}</Badge></TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{intg.host}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 text-xs ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {intg.status === "connected" ? (
                          <div className="flex items-center gap-2">
                            <Progress value={intg.syncRate} className="h-1.5 w-16" />
                            <span className="text-xs text-muted-foreground">{intg.syncRate}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{intg.lastSync}</TableCell>
                      <TableCell className="text-center text-sm">{intg.customers}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
