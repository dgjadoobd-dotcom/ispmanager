import { useState, useMemo } from "react";
import { Server, Wifi, WifiOff, AlertTriangle, Database, Eye, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { useAllCustomerOnus, useOltDevices } from "@/hooks/useOltDevices";
import { format } from "date-fns";

export default function OltUsersPage() {
  const { data: onus = [], isLoading: onuLoading } = useAllCustomerOnus();
  const { data: oltDevices = [] } = useOltDevices();

  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showStats, setShowStats] = useState(true);

  const stats = useMemo(() => {
    const online = onus.filter(o => o.onu_status === "online").length;
    const offline = onus.filter(o => o.onu_status === "offline").length;
    const weakSignal = onus.filter(o => o.rx_power !== null && o.rx_power <= -24).length;
    return { online, offline, weakSignal, totalOlt: oltDevices.length };
  }, [onus, oltDevices]);

  const filtered = useMemo(() => {
    if (!search.trim()) return onus;
    const q = search.toLowerCase();
    return onus.filter(o =>
      (o.customers?.name || "").toLowerCase().includes(q) ||
      (o.onu_serial || "").toLowerCase().includes(q) ||
      (o.onu_mac || "").toLowerCase().includes(q) ||
      (o.onu_status || "").toLowerCase().includes(q) ||
      (o.olt_ports?.olt_devices?.name || "").toLowerCase().includes(q)
    );
  }, [onus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  const startEntry = filtered.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, filtered.length);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Server className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">OLT</h1>
          </div>
          <p className="text-sm text-muted-foreground">OLT Users</p>
          <nav className="mt-1 text-xs text-muted-foreground">
            OLT &gt; <span className="text-foreground font-medium">OLT Users</span>
          </nav>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
          {showStats ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
          {showStats ? "Hide" : "Show"}
        </Button>
      </div>

      {/* Stat Cards */}
      {showStats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <DashboardStatCard title="Online" value={stats.online} icon={Wifi} variant="success" />
          <DashboardStatCard title="Offline" value={stats.offline} icon={WifiOff} variant="info" />
          <DashboardStatCard title="dBm 24+" subtitle="Very weak signal" value={stats.weakSignal} icon={AlertTriangle} variant="purple" />
          <DashboardStatCard title="Total OLT" value={stats.totalOlt} icon={Database} variant="primary" />
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">Show</span>
          <Select value={String(entriesPerPage)} onValueChange={v => { setEntriesPerPage(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-xs font-medium text-muted-foreground uppercase">Entries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">Search</span>
          <Input className="h-8 w-48 text-xs" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/80">
              <TableHead className="text-xs font-semibold">#</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">Client Name</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">ONU Serial</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">MAC Address</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">OLT Name</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">OLT Port</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">Optical Power (Rx)</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">ONU Status</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">ONU Type</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">VLAN</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">Last Seen</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {onuLoading ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-muted-foreground text-sm">Loading...</TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-muted-foreground text-sm">No data available in table</TableCell>
              </TableRow>
            ) : (
              paginated.map((onu, idx) => (
                <TableRow key={onu.id}>
                  <TableCell className="text-xs">{startEntry + idx}</TableCell>
                  <TableCell className="text-xs font-medium whitespace-nowrap">{onu.customers?.name || "—"}</TableCell>
                  <TableCell className="text-xs font-mono whitespace-nowrap">{onu.onu_serial || "—"}</TableCell>
                  <TableCell className="text-xs font-mono whitespace-nowrap">{onu.onu_mac || "—"}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{onu.olt_ports?.olt_devices?.name || "—"}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {onu.olt_ports ? `${onu.olt_ports.slot}/${onu.olt_ports.port}` : "—"}
                    {onu.olt_ports?.port_label && ` (${onu.olt_ports.port_label})`}
                  </TableCell>
                  <TableCell className="text-xs">
                    {onu.rx_power !== null ? (
                      <span className={onu.rx_power <= -24 ? "text-destructive font-semibold" : "text-success font-semibold"}>
                        {onu.rx_power} dBm
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={onu.onu_status === "online" ? "default" : "secondary"} className={`text-[10px] ${onu.onu_status === "online" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                      {onu.onu_status === "online" ? "Online" : "Offline"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs capitalize">{onu.onu_type || "—"}</TableCell>
                  <TableCell className="text-xs">{onu.vlan_id || "—"}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {onu.last_seen_at ? format(new Date(onu.last_seen_at), "dd MMM yyyy HH:mm") : "—"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="View">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
        <span>Showing {startEntry} to {endEntry} of {filtered.length} entries</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-7 text-xs px-2" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>First</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs px-2" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
          {pageNumbers.map(p => (
            <Button key={p} variant={p === currentPage ? "default" : "outline"} size="sm" className="h-7 text-xs px-2.5" onClick={() => setCurrentPage(p)}>{p}</Button>
          ))}
          <Button variant="outline" size="sm" className="h-7 text-xs px-2" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs px-2" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>Last</Button>
        </div>
      </div>
    </div>
  );
}
