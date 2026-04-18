import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollText, Search, Filter, User, Building2, Shield, Settings, CreditCard, Users } from "lucide-react";

const mockLogs = [
  { id: "1", action: "ISP Suspended", actor: "admin@platform.com", actorRole: "Super Admin", target: "FastNet BD", category: "tenant", time: "2 min ago", severity: "warning" },
  { id: "2", action: "Plan Changed", actor: "admin@platform.com", actorRole: "Super Admin", target: "SpeedLink ISP", category: "subscription", time: "15 min ago", severity: "info" },
  { id: "3", action: "Payout Approved", actor: "admin@platform.com", actorRole: "Super Admin", target: "৳25,000 → NetZone", category: "financial", time: "1 hour ago", severity: "success" },
  { id: "4", action: "New ISP Registered", actor: "owner@newnet.com", actorRole: "ISP Owner", target: "NewNet Communications", category: "tenant", time: "2 hours ago", severity: "info" },
  { id: "5", action: "API Key Generated", actor: "admin@fastnet.com", actorRole: "Admin", target: "Production API Key", category: "security", time: "3 hours ago", severity: "info" },
  { id: "6", action: "ISP Activated", actor: "admin@platform.com", actorRole: "Super Admin", target: "DataStream BD", category: "tenant", time: "5 hours ago", severity: "success" },
  { id: "7", action: "Settings Updated", actor: "admin@platform.com", actorRole: "Super Admin", target: "Platform Pricing", category: "settings", time: "1 day ago", severity: "info" },
  { id: "8", action: "ISP Deleted", actor: "admin@platform.com", actorRole: "Super Admin", target: "TestISP Demo", category: "tenant", time: "2 days ago", severity: "danger" },
];

const categoryIcons: Record<string, React.ElementType> = {
  tenant: Building2,
  subscription: CreditCard,
  financial: CreditCard,
  security: Shield,
  settings: Settings,
  user: Users,
};

const severityStyles = {
  info: "bg-primary/10 text-primary border-primary/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AdminActivityLogs() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = mockLogs.filter((log) => {
    const matchSearch = !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || log.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">Track all platform-level actions and changes</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <ScrollText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-lg font-bold">{mockLogs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <Shield className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Security Events</p>
              <p className="text-lg font-bold">{mockLogs.filter(l => l.category === "security").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <User className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Admins</p>
              <p className="text-lg font-bold">3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Event Timeline
          </CardTitle>
          <CardDescription>{filtered.length} events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search actions, actors, targets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((log) => {
                    const CatIcon = categoryIcons[log.category] || ScrollText;
                    const style = severityStyles[log.severity as keyof typeof severityStyles];
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline" className={style}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{log.actor}</p>
                            <p className="text-xs text-muted-foreground">{log.actorRole}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{log.target}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <CatIcon className="h-3.5 w-3.5" />
                            <span className="text-xs capitalize">{log.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.time}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
