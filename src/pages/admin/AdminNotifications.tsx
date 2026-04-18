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
import { Bell, Mail, MessageSquare, Smartphone, CheckCircle, AlertTriangle, Send, TrendingUp } from "lucide-react";

const channels = [
  { name: "Push Notifications", icon: Smartphone, sent: 12500, delivered: 12200, failed: 300, active: true },
  { name: "Email (Resend)", icon: Mail, sent: 8400, delivered: 8150, failed: 250, active: true },
  { name: "SMS", icon: MessageSquare, sent: 0, delivered: 0, failed: 0, active: false },
];

const recentNotifications = [
  { id: "1", type: "Payment Reminder", channel: "Push", isp: "SpeedLink ISP", recipients: 45, status: "delivered", time: "5 min ago" },
  { id: "2", type: "Bill Generated", channel: "Email", isp: "FastNet BD", recipients: 120, status: "delivered", time: "1 hour ago" },
  { id: "3", type: "Service Restored", channel: "Push", isp: "NetZone", recipients: 8, status: "delivered", time: "2 hours ago" },
  { id: "4", type: "Payment Reminder", channel: "Email", isp: "DataStream BD", recipients: 200, status: "partial", time: "3 hours ago" },
  { id: "5", type: "Suspension Warning", channel: "Push", isp: "ConnectPlus", recipients: 15, status: "delivered", time: "5 hours ago" },
];

export default function AdminNotificationSystem() {
  const totalSent = channels.reduce((s, c) => s + c.sent, 0);
  const totalDelivered = channels.reduce((s, c) => s + c.delivered, 0);
  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notification System</h1>
        <p className="text-muted-foreground">Monitor notification channels and delivery metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10"><Send className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sent</p>
              <p className="text-xl font-bold">{totalSent.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10"><CheckCircle className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-xl font-bold">{totalDelivered.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-info/10"><TrendingUp className="h-5 w-5 text-info" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Delivery Rate</p>
              <p className="text-xl font-bold">{deliveryRate}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10"><Bell className="h-5 w-5 text-warning" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Active Channels</p>
              <p className="text-xl font-bold">{channels.filter(c => c.active).length}/{channels.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {channels.map((ch) => {
              const Icon = ch.icon;
              const rate = ch.sent > 0 ? (ch.delivered / ch.sent) * 100 : 0;
              return (
                <div key={ch.name} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium text-sm">{ch.name}</span>
                    </div>
                    <Badge variant={ch.active ? "default" : "secondary"}>
                      {ch.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{ch.sent.toLocaleString()} sent</span>
                      <span>{rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={rate} className="h-1.5" />
                    {ch.failed > 0 && (
                      <p className="text-xs text-destructive">{ch.failed} failed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent */}
      <Card>
        <CardHeader><CardTitle>Recent Notifications</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Type</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>ISP</TableHead>
                  <TableHead className="text-center">Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentNotifications.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium text-sm">{n.type}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{n.channel}</Badge></TableCell>
                    <TableCell className="text-sm">{n.isp}</TableCell>
                    <TableCell className="text-center text-sm">{n.recipients}</TableCell>
                    <TableCell>
                      <Badge variant={n.status === "delivered" ? "default" : "secondary"} className="text-xs">
                        {n.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{n.time}</TableCell>
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
