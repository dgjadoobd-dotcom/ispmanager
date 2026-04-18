import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Key, Activity, TrendingUp, AlertTriangle, Building2, Clock } from "lucide-react";

const apiStats = [
  { endpoint: "/api/customers", calls: 45200, avgLatency: 42, errorRate: 0.3 },
  { endpoint: "/api/billing", calls: 28500, avgLatency: 65, errorRate: 0.8 },
  { endpoint: "/api/payments", calls: 22100, avgLatency: 88, errorRate: 1.2 },
  { endpoint: "/api/network/sync", calls: 15800, avgLatency: 120, errorRate: 2.1 },
  { endpoint: "/api/auth", calls: 12000, avgLatency: 35, errorRate: 0.1 },
];

const topConsumers = [
  { isp: "SpeedLink ISP", calls: 32000, keys: 3, lastCall: "1 min ago" },
  { isp: "FastNet BD", calls: 24500, keys: 2, lastCall: "5 min ago" },
  { isp: "NetZone", calls: 18200, keys: 1, lastCall: "12 min ago" },
  { isp: "DataStream BD", calls: 9800, keys: 2, lastCall: "1 hour ago" },
  { isp: "ConnectPlus", calls: 7500, keys: 1, lastCall: "3 hours ago" },
];

export default function AdminApiUsage() {
  const totalCalls = apiStats.reduce((s, a) => s + a.calls, 0);
  const avgLatency = Math.round(apiStats.reduce((s, a) => s + a.avgLatency, 0) / apiStats.length);
  const avgErrorRate = (apiStats.reduce((s, a) => s + a.errorRate, 0) / apiStats.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API Usage</h1>
        <p className="text-muted-foreground">Monitor API consumption across all ISPs</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10"><Activity className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total API Calls</p>
              <p className="text-xl font-bold">{(totalCalls / 1000).toFixed(1)}K</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10"><Clock className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Latency</p>
              <p className="text-xl font-bold">{avgLatency}ms</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10"><AlertTriangle className="h-5 w-5 text-warning" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Error Rate</p>
              <p className="text-xl font-bold">{avgErrorRate}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-info/10"><Key className="h-5 w-5 text-info" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Active Keys</p>
              <p className="text-xl font-bold">{topConsumers.reduce((s, c) => s + c.keys, 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Endpoint Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Endpoint Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiStats.map((ep) => (
              <div key={ep.endpoint} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">{ep.endpoint}</span>
                  <span className="text-xs text-muted-foreground">{ep.calls.toLocaleString()} calls</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={(ep.calls / 50000) * 100} className="flex-1 h-1.5" />
                  <div className="flex gap-2 text-xs">
                    <span className="text-muted-foreground">{ep.avgLatency}ms</span>
                    <Badge variant={ep.errorRate > 1 ? "destructive" : "outline"} className="text-[10px]">
                      {ep.errorRate}% err
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Consumers */}
        <Card>
          <CardHeader>
            <CardTitle>Top API Consumers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>ISP</TableHead>
                    <TableHead className="text-right">Calls</TableHead>
                    <TableHead className="text-center">Keys</TableHead>
                    <TableHead>Last Call</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topConsumers.map((c) => (
                    <TableRow key={c.isp}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{c.isp}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">{c.calls.toLocaleString()}</TableCell>
                      <TableCell className="text-center"><Badge variant="outline">{c.keys}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.lastCall}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
