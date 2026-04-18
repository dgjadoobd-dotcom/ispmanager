import React, { useState, useMemo } from "react";
import { Monitor, FileSpreadsheet, Upload, Eye, EyeOff, UserPlus, Filter, X, RefreshCw, Loader2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useNetworkIntegrations, usePPPSecrets, useActivePPP } from "@/hooks/useNetworkIntegration";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success border-success/30",
  inactive: "bg-warning/15 text-warning border-warning/30",
  disabled: "bg-destructive/15 text-destructive border-destructive/30",
};

function formatBytes(bytes: string | number | undefined) {
  if (!bytes || bytes === "0") return "0 B";
  const b = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (isNaN(b) || b <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  if (i < 0) return "0 B";
  return parseFloat((b / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function MikrotikImportPage() {
  const [selectedServerId, setSelectedServerId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [selectedExport, setSelectedExport] = useState<Set<string>>(new Set());
  const [filtersApplied, setFiltersApplied] = useState(false);

  const { data: integrations = [] } = useNetworkIntegrations();
  const activeServers = integrations.filter(i => i.is_enabled && i.provider_type === "mikrotik");

  const effectiveServerId = selectedServerId === "all" ? (activeServers[0]?.id || null) : selectedServerId;

  const { data: secrets = [], isLoading: loadingSecrets, refetch: refetchSecrets } = usePPPSecrets(effectiveServerId);
  const { data: active = [], isLoading: loadingActive, refetch: refetchActive } = useActivePPP(effectiveServerId);

  const combinedData = useMemo(() => {
    return secrets.map(s => {
      const isActive = active.find(a => a.name === s.name);
      return {
        id: s[".id"],
        name: s.name,
        password: s.password,
        service: s.service,
        profile: s.profile,
        callerId: isActive?.["caller-id"] || s["caller-id"] || "",
        serverName: isActive?.service || s.service || "",
        uptime: isActive?.uptime || "",
        tx: isActive ? (isActive["tx-byte"] || isActive["tx-bytes"] || "0") : "0",
        rx: isActive ? (isActive["rx-byte"] || isActive["rx-bytes"] || "0") : "0",
        userStatus: s.disabled === "true" ? "disabled" : (isActive ? "active" : "inactive"),
        enabled: s.disabled === "false",
      };
    });
  }, [secrets, active]);

  const filtered = useMemo(() => {
    let data = combinedData;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.profile.toLowerCase().includes(q) || 
        c.callerId.toLowerCase().includes(q)
      );
    }
    return data;
  }, [combinedData, search]);

  const perPage = parseInt(entriesPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleRefresh = () => {
    refetchSecrets();
    refetchActive();
    toast.success("Data refreshed from MikroTik");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-inner">
            <Monitor className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Mikrotik Clients</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <span className="text-primary/80 font-medium">Network</span>
              <span className="text-muted-foreground/40">/</span>
              <span>PPP Secrets & Active Users</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loadingSecrets || loadingActive}>
            <RefreshCw className={`mr-1.5 h-4 w-4 ${(loadingSecrets || loadingActive) ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => toast.info("Exporting to MACReseller...")}>
            <Upload className="mr-1.5 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Server Selector & Filters */}
      <Card className="border-border/60 shadow-sm glass-card overflow-hidden">
        <CardContent className="p-4 bg-muted/30">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Server</label>
              <Select value={selectedServerId} onValueChange={setSelectedServerId}>
                <SelectTrigger className="h-10 bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Select Server" />
                </SelectTrigger>
                <SelectContent>
                  {activeServers.length === 0 && <SelectItem value="none" disabled>No active servers</SelectItem>}
                  {activeServers.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.host})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Search Client</label>
              <div className="relative">
                <Input 
                  placeholder="Name, Profile, or MAC..." 
                  value={search} 
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
                  className="h-10 bg-background/50 pl-9"
                />
                <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
              </div>
            </div>

            <div className="flex items-center gap-2 pb-1">
              <Badge variant="secondary" className="h-8 px-3 rounded-md flex items-center gap-2 bg-background/50 border-border/40">
                <span className="text-xs text-muted-foreground">Total:</span>
                <span className="font-bold text-foreground">{filtered.length}</span>
              </Badge>
              <Badge variant="secondary" className="h-8 px-3 rounded-md flex items-center gap-2 bg-success/10 text-success border-success/20">
                <span className="text-xs opacity-70">Active:</span>
                <span className="font-bold">{active.length}</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden border-border/60 shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2">
                <TableHead className="w-12 text-center text-[10px] font-bold uppercase">#</TableHead>
                <TableHead className="text-[10px] font-bold uppercase">Client Name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase">Password</TableHead>
                <TableHead className="text-[10px] font-bold uppercase">Profile</TableHead>
                <TableHead className="text-[10px] font-bold uppercase">MAC (Caller ID)</TableHead>
                <TableHead className="text-[10px] font-bold uppercase">Uptime</TableHead>
                <TableHead className="text-[10px] font-bold uppercase">Usage (TX/RX)</TableHead>
                <TableHead className="text-[10px] font-bold uppercase">Status</TableHead>
                <TableHead className="text-center text-[10px] font-bold uppercase">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(loadingSecrets || loadingActive) ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-medium">Fetching real-time data from MikroTik...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    No matching clients found on this server
                  </TableCell>
                </TableRow>
              ) : paginated.map((client, idx) => (
                <TableRow key={client.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="text-center text-xs font-medium text-muted-foreground/60">
                    {(currentPage - 1) * perPage + idx + 1}
                  </TableCell>
                  <TableCell className="font-bold text-foreground">{client.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <code className="bg-muted/50 px-1.5 py-0.5 rounded text-[10px] font-mono">
                        {visiblePasswords.has(client.id) ? client.password : "••••••••"}
                      </code>
                      <button onClick={() => togglePassword(client.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                        {visiblePasswords.has(client.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary/80">
                      {client.profile}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground tracking-tighter">
                    {client.callerId || "—"}
                  </TableCell>
                  <TableCell className="text-[11px] font-medium text-muted-foreground">
                    {client.uptime || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 text-[10px] text-success/80 font-medium">
                        <ArrowUpCircle className="h-3 w-3" />
                        {formatBytes(client.tx)}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-primary/80 font-medium">
                        <ArrowDownCircle className="h-3 w-3" />
                        {formatBytes(client.rx)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[9px] font-black uppercase px-1.5 py-0 ${statusStyles[client.userStatus]}`}>
                      {client.userStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Switch
                              checked={client.enabled}
                              className="scale-75"
                              onCheckedChange={async (checked) => {
                                const integration = activeServers.find(s => s.id === effectiveServerId);
                                if (!integration) { toast.error("No active server selected"); return; }
                                try {
                                  const res = await fetch(`/api/mikrotik/ppp/${checked ? "enable" : "disable"}`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      host: integration.host,
                                      port: integration.port,
                                      username: integration.username,
                                      password: integration.credentials_encrypted ?? "",
                                      use_ssl: integration.mikrotik_use_ssl,
                                      ppp_username: client.name,
                                    }),
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    toast.success(data.message);
                                    refetchSecrets();
                                  } else {
                                    toast.error(data.error || "Failed");
                                  }
                                } catch {
                                  toast.error("Proxy unreachable");
                                }
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>{client.enabled ? "Disable" : "Enable"} Secret</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <button 
                        onClick={() => toast.success(`Importing ${client.name}...`)} 
                        className="p-1.5 rounded-md hover:bg-primary/10 text-primary transition-all active:scale-95"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Footer / Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground font-medium">
            Showing <span className="text-foreground">{filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1}</span> to <span className="text-foreground">{Math.min(currentPage * perPage, filtered.length)}</span> of <span className="text-foreground">{filtered.length}</span> entries
          </p>
          <div className="h-4 w-[1px] bg-border/60" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Per Page</span>
            <Select value={entriesPerPage} onValueChange={v => { setEntriesPerPage(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-7 w-[60px] text-[10px] font-bold bg-muted/20"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["10", "25", "50", "100"].map(v => <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage <= 1} 
            onClick={() => setCurrentPage(p => p - 1)}
            className="h-8 text-xs font-semibold px-3"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1;
              return (
                <Button 
                  key={p} 
                  variant={currentPage === p ? "default" : "ghost"} 
                  size="sm" 
                  className="h-8 w-8 p-0 text-xs font-bold"
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </Button>
              );
            })}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage >= totalPages} 
            onClick={() => setCurrentPage(p => p + 1)}
            className="h-8 text-xs font-semibold px-3"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
