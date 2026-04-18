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
import { FileText, Search, Filter, Shield, Building2, User, Clock, AlertTriangle, CheckCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const mockAuditLogs = [
  { id: "AL001", timestamp: "2026-02-08 14:32:15", actor: "admin@platform.com", role: "Super Admin", action: "tenant.suspend", target: "TestISP Demo", severity: "high", ip: "103.25.**.***" },
  { id: "AL002", timestamp: "2026-02-08 13:15:42", actor: "admin@platform.com", role: "Super Admin", action: "payout.approve", target: "৳25,000 → SpeedLink", severity: "medium", ip: "103.25.**.***" },
  { id: "AL003", timestamp: "2026-02-08 11:22:08", actor: "admin@platform.com", role: "Super Admin", action: "plan.update", target: "Enterprise Plan pricing", severity: "medium", ip: "103.25.**.***" },
  { id: "AL004", timestamp: "2026-02-08 10:05:33", actor: "owner@fastnet.com", role: "ISP Owner", action: "api_key.create", target: "Production key", severity: "high", ip: "182.48.**.***" },
  { id: "AL005", timestamp: "2026-02-07 22:18:45", actor: "admin@platform.com", role: "Super Admin", action: "user.role_change", target: "karim@fastnet.com → Admin", severity: "high", ip: "103.25.**.***" },
  { id: "AL006", timestamp: "2026-02-07 18:44:12", actor: "admin@platform.com", role: "Super Admin", action: "settings.update", target: "Platform notification config", severity: "low", ip: "103.25.**.***" },
  { id: "AL007", timestamp: "2026-02-07 15:30:00", actor: "admin@platform.com", role: "Super Admin", action: "tenant.delete", target: "OldISP Removed", severity: "critical", ip: "103.25.**.***" },
  { id: "AL008", timestamp: "2026-02-07 12:10:22", actor: "manager@netzone.com", role: "Manager", action: "customer.bulk_suspend", target: "12 customers", severity: "medium", ip: "103.11.**.***" },
];

const severityConfig = {
  critical: { label: "Critical", color: "bg-destructive/10 text-destructive border-destructive/20" },
  high: { label: "High", color: "bg-warning/10 text-warning border-warning/20" },
  medium: { label: "Medium", color: "bg-primary/10 text-primary border-primary/20" },
  low: { label: "Low", color: "bg-muted text-muted-foreground" },
};

export default function AdminAuditLogs() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filtered = mockAuditLogs.filter((log) => {
    const matchSearch = !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === "all" || log.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Immutable record of all security-sensitive actions</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-xl font-bold">{mockAuditLogs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-xl font-bold">{mockAuditLogs.filter(l => l.severity === "critical").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10"><Shield className="h-5 w-5 text-warning" /></div>
            <div>
              <p className="text-sm text-muted-foreground">High Severity</p>
              <p className="text-xl font-bold">{mockAuditLogs.filter(l => l.severity === "high").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10"><User className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Actors</p>
              <p className="text-xl font-bold">{new Set(mockAuditLogs.map(l => l.actor)).size}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Audit Trail</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search actions, actors, targets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No audit logs found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((log) => {
                    const sev = severityConfig[log.severity as keyof typeof severityConfig];
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="font-mono">{log.timestamp}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{log.actor}</p>
                            <p className="text-xs text-muted-foreground">{log.role}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{log.action}</code>
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{log.target}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", sev.color)}>{sev.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{log.ip}</TableCell>
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
