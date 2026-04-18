import { useState } from "react";
import { Server, Plus, Search, Eye, EyeOff, Wifi, WifiOff, RefreshCw, Pencil, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dbGet, dbUpdate, now, TABLES } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/useTenant";
import { useTestConnection } from "@/hooks/useNetworkIntegration";
import { toast } from "sonner";

export default function MikrotikServersPage() {
  const { data: tenant } = useCurrentTenant();
  const tenantId = tenant?.id;
  const queryClient = useQueryClient();
  const testConnection = useTestConnection();
  const [testingId, setTestingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const { data: servers = [], isLoading } = useQuery({
    queryKey: ["mikrotik-servers", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("network_integrations")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("provider_type", "mikrotik")
        .order("created_at", { ascending: false });
      if (error || !data?.length) {
        return dbGet<any>(TABLES.network_integrations)
          .filter((n: any) => n.tenant_id === tenantId && n.provider_type === "mikrotik");
      }
      return data;
    },
    enabled: !!tenantId,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase
        .from("network_integrations")
        .update({ is_enabled, updated_at: now() })
        .eq("id", id);
      if (error) dbUpdate(TABLES.network_integrations, id, { is_enabled, updated_at: now() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mikrotik-servers"] });
      toast.success("Server status updated");
    },
  });

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      await testConnection.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: ["mikrotik-servers"] });
    } finally {
      setTestingId(null);
    }
  };

  const filtered = servers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.host.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase())
  );

  const perPage = parseInt(entriesPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getStatusInfo = (server: (typeof servers)[0]) => {
    if (!server.is_enabled) return { text: "Mikrotik Is InActive", color: "text-destructive", icon: WifiOff };
    if (server.last_sync_status === "success") return { text: "Mikrotik Connected", color: "text-success", icon: Wifi };
    if (server.last_sync_status === "pending") return { text: "Checking...", color: "text-warning", icon: Loader2 };
    return { text: "Mikrotik Is InActive", color: "text-destructive", icon: WifiOff };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Server className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mikrotik Server</h1>
            <p className="text-sm text-muted-foreground">All Mikrotik Servers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">System &gt; Server</span>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Server
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase">Show</span>
              <Select value={entriesPerPage} onValueChange={(v) => { setEntriesPerPage(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[70px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["5", "10", "25", "50"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs font-medium text-muted-foreground uppercase">Entries</span>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead className="w-14 text-xs font-semibold uppercase">Serial</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">ServerName</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Server IP</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Username</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Password</TableHead>
                  <TableHead className="text-xs font-semibold uppercase w-16">Port</TableHead>
                  <TableHead className="text-xs font-semibold uppercase w-20">Version</TableHead>
                  <TableHead className="text-xs font-semibold uppercase w-20">Timeout</TableHead>
                  <TableHead className="text-xs font-semibold uppercase w-16">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase w-28 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-1" /> Loading...
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No MikroTik servers found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((server, idx) => {
                    const status = getStatusInfo(server);
                    const StatusIcon = status.icon;
                    const showPw = visiblePasswords[server.id];
                    return (
                      <TableRow key={server.id}>
                        <TableCell className="font-medium text-sm">
                          {(currentPage - 1) * perPage + idx + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium text-sm">{server.name}</span>
                            <div className={`flex items-center gap-1 text-xs mt-0.5 ${status.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.text}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-mono">{server.host}</TableCell>
                        <TableCell className="text-sm">{server.username}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-mono">
                              {showPw ? "••decoded••" : "••••••••"}
                            </span>
                            <button
                              onClick={() =>
                                setVisiblePasswords((p) => ({ ...p, [server.id]: !p[server.id] }))
                              }
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{server.port || 8728}</TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline" className="text-xs">
                            {server.mikrotik_use_ssl ? "API-SSL" : "API"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">10 sec.</TableCell>
                        <TableCell>
                          <Switch
                            checked={server.is_enabled}
                            onCheckedChange={(checked) =>
                              toggleMutation.mutate({ id: server.id, is_enabled: checked })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  disabled={testingId === server.id}
                                  onClick={() => handleTestConnection(server.id)}
                                >
                                  {testingId === server.id
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : <Wifi className="h-3.5 w-3.5 text-primary" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Test Connection</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Sync</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to{" "}
              {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="xs"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="xs"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="xs"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
