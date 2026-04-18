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
import { CreditCard, CheckCircle, AlertTriangle, TrendingUp, Building2, Zap } from "lucide-react";

const gateways = [
  { name: "UddoktaPay", status: "active", successRate: 96.5, totalTx: 12450, volume: 2850000, icon: "🇧🇩" },
  { name: "bKash", status: "active", successRate: 98.2, totalTx: 8200, volume: 1920000, icon: "📱" },
  { name: "Nagad", status: "active", successRate: 95.8, totalTx: 5100, volume: 1180000, icon: "💳" },
  { name: "SSLCommerz", status: "inactive", successRate: 0, totalTx: 0, volume: 0, icon: "🔒" },
];

const recentTransactions = [
  { id: "TXN-001", isp: "SpeedLink ISP", amount: 2500, method: "bKash", status: "success", time: "2 min ago" },
  { id: "TXN-002", isp: "FastNet BD", amount: 1800, method: "UddoktaPay", status: "success", time: "5 min ago" },
  { id: "TXN-003", isp: "NetZone", amount: 3200, method: "Nagad", status: "failed", time: "12 min ago" },
  { id: "TXN-004", isp: "DataStream BD", amount: 1500, method: "bKash", status: "success", time: "20 min ago" },
  { id: "TXN-005", isp: "ConnectPlus", amount: 4000, method: "UddoktaPay", status: "success", time: "35 min ago" },
];

export default function AdminPaymentInfra() {
  const activeGateways = gateways.filter(g => g.status === "active").length;
  const totalVolume = gateways.reduce((s, g) => s + g.volume, 0);
  const avgSuccessRate = gateways.filter(g => g.status === "active").reduce((s, g) => s + g.successRate, 0) / activeGateways;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Infrastructure</h1>
        <p className="text-muted-foreground">Monitor payment gateways and transaction health</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10"><CreditCard className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Active Gateways</p>
              <p className="text-xl font-bold">{activeGateways}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10"><CheckCircle className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Success Rate</p>
              <p className="text-xl font-bold">{avgSuccessRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-info/10"><TrendingUp className="h-5 w-5 text-info" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-xl font-bold">৳{(totalVolume / 1000000).toFixed(1)}M</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10"><Zap className="h-5 w-5 text-warning" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-xl font-bold">{gateways.reduce((s, g) => s + g.totalTx, 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gateways */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>Gateway status and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {gateways.map((gw) => (
              <div key={gw.name} className="flex items-center gap-4 p-4 rounded-lg border">
                <span className="text-2xl">{gw.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{gw.name}</p>
                    <Badge variant={gw.status === "active" ? "default" : "secondary"}>
                      {gw.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {gw.status === "active" && (
                    <>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <span>{gw.successRate}% success</span>
                        <span>{gw.totalTx.toLocaleString()} txns</span>
                        <span>৳{gw.volume.toLocaleString()}</span>
                      </div>
                      <Progress value={gw.successRate} className="h-1.5" />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>ID</TableHead>
                  <TableHead>ISP</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{tx.id}</TableCell>
                    <TableCell className="font-medium text-sm">{tx.isp}</TableCell>
                    <TableCell className="text-right font-semibold text-sm">৳{tx.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{tx.method}</TableCell>
                    <TableCell>
                      <Badge variant={tx.status === "success" ? "default" : "destructive"} className="gap-1 text-xs">
                        {tx.status === "success" ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tx.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
