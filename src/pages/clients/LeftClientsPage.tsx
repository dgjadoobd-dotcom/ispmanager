import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  UserX, Search, FileSpreadsheet, FileText, Users, Eye, RotateCcw,
  Filter, Trash2, MessageSquare, Pencil, MoreHorizontal, ChevronRight,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const demoData = [
  { id: "1", code: "C-1021", ip: "172.16.0.45", name: "Rafiq Hossain", mobile: "01712345678", zone: "Zone-A", connType: "Fiber", clientType: "Residential", package: "10 Mbps", speed: "10M", bill: 800, due: 1600, server: "MK-Main", bStatus: "Overdue", leftDate: "15-12-2025", recovered: true, recoveredBy: "Jamal" },
  { id: "2", code: "C-1034", ip: "172.16.0.78", name: "Sultana Begum", mobile: "01898765432", zone: "Zone-B", connType: "Cable", clientType: "Residential", package: "5 Mbps", speed: "5M", bill: 500, due: 500, server: "MK-Main", bStatus: "Due", leftDate: "03-01-2026", recovered: false, recoveredBy: null },
  { id: "3", code: "C-1050", ip: "172.16.1.12", name: "Kamal Uddin", mobile: "01611223344", zone: "Zone-C", connType: "Fiber", clientType: "Corporate", package: "50 Mbps", speed: "50M", bill: 5000, due: 0, server: "MK-Corp", bStatus: "Paid", leftDate: "20-01-2026", recovered: true, recoveredBy: "Shimul" },
  { id: "4", code: "C-1067", ip: "172.16.0.99", name: "Nusrat Jahan", mobile: "01555667788", zone: "Zone-A", connType: "Wireless", clientType: "Residential", package: "15 Mbps", speed: "15M", bill: 1000, due: 3000, server: "MK-Main", bStatus: "Overdue", leftDate: "28-11-2025", recovered: false, recoveredBy: null },
  { id: "5", code: "C-1082", ip: "172.16.2.5", name: "Mahbub Alam", mobile: "01922334455", zone: "Zone-D", connType: "Fiber", clientType: "SME", package: "30 Mbps", speed: "30M", bill: 2500, due: 2500, server: "MK-Sub1", bStatus: "Due", leftDate: "10-02-2026", recovered: true, recoveredBy: "Jamal" },
  { id: "6", code: "C-1095", ip: "172.16.0.130", name: "Fatema Khatun", mobile: "01744556677", zone: "Zone-B", connType: "Fiber", clientType: "Residential", package: "20 Mbps", speed: "20M", bill: 1200, due: 0, server: "MK-Main", bStatus: "Paid", leftDate: "25-02-2026", recovered: false, recoveredBy: null },
];

const LeftClientsPage = () => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [zone, setZone] = useState("all");
  const [connType, setConnType] = useState("all");
  const [clientType, setClientType] = useState("all");
  const [pkg, setPkg] = useState("all");
  const [protocol, setProtocol] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [assignFor, setAssignFor] = useState("all");
  const [recoveryStatus, setRecoveryStatus] = useState("all");
  const [recoveredBy, setRecoveredBy] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [pageSize, setPageSize] = useState("100");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => demoData.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.code.toLowerCase().includes(search.toLowerCase()) && !c.mobile.includes(search)) return false;
    if (zone !== "all" && c.zone !== zone) return false;
    if (connType !== "all" && c.connType !== connType) return false;
    if (clientType !== "all" && c.clientType !== clientType) return false;
    if (pkg !== "all" && c.package !== pkg) return false;
    if (recoveryStatus === "recovered" && !c.recovered) return false;
    if (recoveryStatus === "not_recovered" && c.recovered) return false;
    return true;
  }), [search, zone, connType, clientType, pkg, recoveryStatus]);

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;
  const toggleAll = () => setSelectedIds(allSelected ? [] : filtered.map((c) => c.id));
  const toggleOne = (id: string) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const totalPages = Math.ceil(filtered.length / Number(pageSize));
  const paginated = filtered.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize));

  const FilterSelect = ({ label, value, onValueChange, options }: { label: string; value: string; onValueChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Dark Header */}
      <div className="flex items-center justify-between bg-primary text-primary-foreground px-5 py-3 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
            <UserX className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Left Clients</h1>
            <p className="text-xs text-primary-foreground/70">View All Left Client</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary-foreground/70">
          <span>Client</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary-foreground font-medium">Left Clients</span>
        </div>
      </div>

      {/* Filter Panel */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Filters</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => toast({ title: "Assigning...", description: `${selectedIds.length} client(s) selected` })} disabled={selectedIds.length === 0}>
                <Users className="h-3.5 w-3.5 mr-1" /> Assign To Employee
              </Button>
              <Button size="sm" variant="secondary" onClick={() => toast({ title: "Generating Excel..." })}>
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> Generate Excel
              </Button>
              <Button size="sm" variant="secondary" onClick={() => toast({ title: "Generating PDF..." })}>
                <FileText className="h-3.5 w-3.5 mr-1" /> Generate Pdf
              </Button>
              <CollapsibleTrigger asChild>
                <Button size="sm" variant="outline">
                  {filtersOpen ? "Hide" : "Show"}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <FilterSelect label="Zone" value={zone} onValueChange={setZone} options={[{ value: "Zone-A", label: "Zone-A" }, { value: "Zone-B", label: "Zone-B" }, { value: "Zone-C", label: "Zone-C" }, { value: "Zone-D", label: "Zone-D" }]} />
                <FilterSelect label="Connection Type" value={connType} onValueChange={setConnType} options={[{ value: "Fiber", label: "Fiber" }, { value: "Cable", label: "Cable" }, { value: "Wireless", label: "Wireless" }]} />
                <FilterSelect label="Client Type" value={clientType} onValueChange={setClientType} options={[{ value: "Residential", label: "Residential" }, { value: "Corporate", label: "Corporate" }, { value: "SME", label: "SME" }]} />
                <FilterSelect label="Package" value={pkg} onValueChange={setPkg} options={[{ value: "5 Mbps", label: "5 Mbps" }, { value: "10 Mbps", label: "10 Mbps" }, { value: "15 Mbps", label: "15 Mbps" }, { value: "20 Mbps", label: "20 Mbps" }, { value: "30 Mbps", label: "30 Mbps" }, { value: "50 Mbps", label: "50 Mbps" }]} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <FilterSelect label="Protocol Type" value={protocol} onValueChange={setProtocol} options={[{ value: "PPPoE", label: "PPPoE" }, { value: "Static", label: "Static" }, { value: "DHCP", label: "DHCP" }]} />
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">From Left Date</label>
                  <Input placeholder="DD-MM-YYYY" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">To Left Date</label>
                  <Input placeholder="DD-MM-YYYY" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 text-xs" />
                </div>
                <FilterSelect label="Asgn. Cus. For" value={assignFor} onValueChange={setAssignFor} options={[{ value: "Jamal", label: "Jamal" }, { value: "Shimul", label: "Shimul" }]} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <FilterSelect label="Recovery Status" value={recoveryStatus} onValueChange={setRecoveryStatus} options={[{ value: "recovered", label: "Recovered" }, { value: "not_recovered", label: "Not Recovered" }]} />
                <FilterSelect label="Recovered By" value={recoveredBy} onValueChange={setRecoveredBy} options={[{ value: "Jamal", label: "Jamal" }, { value: "Shimul", label: "Shimul" }]} />
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Show Entries + Search */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold uppercase text-muted-foreground">Show</span>
          <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-8 w-20 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["10", "25", "50", "100"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="font-semibold uppercase text-muted-foreground">Entries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Search:</span>
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary">
                <TableHead className="w-10 text-primary-foreground"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></TableHead>
                <TableHead className="text-xs text-primary-foreground font-semibold">C.Code</TableHead>
                <TableHead className="text-xs text-primary-foreground font-semibold">ID / IP</TableHead>
                <TableHead className="text-xs text-primary-foreground font-semibold">Client Name</TableHead>
                <TableHead className="text-xs text-primary-foreground font-semibold">Mobile</TableHead>
                <TableHead className="text-xs text-primary-foreground font-semibold">Zone</TableHead>
                <TableHead className="text-xs text-primary-foreground font-semibold">Conn. Type</TableHead>
                <TableHead className="text-xs text-primary-foreground font-semibold">Client Type</TableHead>
                <TableHead className="text-xs text-primary-foreground font-semibold">Package/Speed</TableHead>
                <TableHead className="text-xs text-primary-foreground font-semibold text-right">M.Bill</TableHead>
                <TableHead className="text-xs text-primary-foreground font-semibold text-right">Due</TableHead>
                <TableHead className="text-xs text-primary-foreground font-semibold">Server</TableHead>
                <TableHead className="text-xs text-primary-foreground font-semibold">B.Status</TableHead>
                <TableHead className="text-xs text-primary-foreground font-semibold">Left Date</TableHead>
                <TableHead className="text-xs text-primary-foreground font-semibold text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((c) => (
                <TableRow key={c.id} className="text-xs">
                  <TableCell><Checkbox checked={selectedIds.includes(c.id)} onCheckedChange={() => toggleOne(c.id)} /></TableCell>
                  <TableCell className="font-medium">{c.code}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{c.ip}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{c.name}</span>
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-500 cursor-pointer" />
                    </div>
                  </TableCell>
                  <TableCell>{c.mobile}</TableCell>
                  <TableCell>{c.zone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span>{c.connType}</span>
                      {c.recovered && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[10px] px-1.5 py-0">Recovered</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{c.clientType}</TableCell>
                  <TableCell>{c.package} / {c.speed}</TableCell>
                  <TableCell className="text-right font-medium">৳{c.bill}</TableCell>
                  <TableCell className={cn("text-right font-medium", c.due > 0 ? "text-destructive" : "text-emerald-600")}>৳{c.due}</TableCell>
                  <TableCell>{c.server}</TableCell>
                  <TableCell>
                    <Badge variant={c.bStatus === "Paid" ? "default" : c.bStatus === "Due" ? "secondary" : "destructive"} className="text-[10px]">{c.bStatus}</Badge>
                  </TableCell>
                  <TableCell>{c.leftDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-0.5">
                      <Button size="xs" variant="ghost" title="Delete" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="xs" variant="ghost" title="SMS">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="xs" variant="ghost" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="xs" variant="ghost" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="xs" variant="ghost"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast({ title: "Recovery initiated", description: c.name })}>
                            <RotateCcw className="h-3.5 w-3.5 mr-2" /> Recover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow><TableCell colSpan={15} className="text-center py-8 text-muted-foreground">No left clients found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
            <span>Showing {((currentPage - 1) * Number(pageSize)) + 1} to {Math.min(currentPage * Number(pageSize), filtered.length)} of {filtered.length} entries</span>
            <div className="flex items-center gap-1">
              <Button size="xs" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i} size="xs" variant={currentPage === i + 1 ? "default" : "outline"} onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
              ))}
              <Button size="xs" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftClientsPage;
