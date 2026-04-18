import React, { useState, useMemo } from "react";
import { Headset, FileText, FileSpreadsheet, Ticket, Globe, Shield, AlertTriangle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Filter, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const demoHistory = [
  { id: 1, date: "2025-07-10", ticketNo: "TKT-0045", clientCode: "C-1001", username: "rahim_net", mobile: "01711000001", zone: "Mirpur", category: "Disconnection", solveTime: "2025-07-10 14:30", solvedBy: "Admin", duration: "2h 15m", priority: "High", source: "client" },
  { id: 2, date: "2025-07-09", ticketNo: "TKT-0044", clientCode: "C-1005", username: "karim_isp", mobile: "01811000005", zone: "Uttara", category: "Slow Speed", solveTime: "2025-07-09 18:00", solvedBy: "Technician A", duration: "4h 30m", priority: "Medium", source: "admin" },
  { id: 3, date: "2025-07-08", ticketNo: "TKT-0042", clientCode: "C-1012", username: "jamal_bb", mobile: "01911000012", zone: "Dhanmondi", category: "No Connection", solveTime: "2025-07-08 11:45", solvedBy: "Technician B", duration: "1h 45m", priority: "High", source: "client" },
  { id: 4, date: "2025-07-07", ticketNo: "TKT-0040", clientCode: "C-1008", username: "sumon_link", mobile: "01611000008", zone: "Banani", category: "Router Issue", solveTime: "2025-07-07 16:20", solvedBy: "Admin", duration: "3h 10m", priority: "Low", source: "admin" },
  { id: 5, date: "2025-07-06", ticketNo: "TKT-0038", clientCode: "C-1020", username: "hasan_net", mobile: "01511000020", zone: "Gulshan", category: "Billing Issue", solveTime: "2025-07-06 10:00", solvedBy: "Technician A", duration: "0h 45m", priority: "Low", source: "client" },
];

const tabs = [
  { key: "clients", label: "Client's", count: 5 },
  { key: "pops", label: "POP's", count: 0 },
  { key: "bandwidth", label: "Bandwidth POP's", count: 0 },
];

const statCards = [
  { label: "Total Tickets", value: 5, icon: Ticket, gradient: "from-blue-500 to-blue-700" },
  { label: "From Client Portal", value: 3, icon: Globe, gradient: "from-emerald-500 to-green-700" },
  { label: "From Admin Portal", value: 2, icon: Shield, gradient: "from-orange-500 to-red-600" },
];

const SupportHistoryPage = () => {
  const [activeTab, setActiveTab] = useState("clients");
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const filtered = useMemo(() => {
    if (!search) return demoHistory;
    const s = search.toLowerCase();
    return demoHistory.filter(
      (t) =>
        t.ticketNo.toLowerCase().includes(s) ||
        t.clientCode.toLowerCase().includes(s) ||
        t.username.toLowerCase().includes(s) ||
        t.mobile.includes(s) ||
        t.zone.toLowerCase().includes(s) ||
        t.category.toLowerCase().includes(s)
    );
  }, [search]);

  const perPage = parseInt(entriesPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Dashboard</span>
        <span>/</span>
        <span>Support & Ticketing</span>
        <span>/</span>
        <span className="text-foreground font-medium">Support History</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Headset className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support & Ticketing</h1>
          <p className="text-muted-foreground text-sm">Support History</p>
        </div>
      </div>

      {/* Tab bar + action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">{tab.count}</Badge>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileText className="h-4 w-4" /> Generate PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileSpreadsheet className="h-4 w-4" /> Generate CSV
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className={`bg-gradient-to-br ${card.gradient} text-white border-0 shadow-lg`}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-white/80 text-sm">{card.label}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {/* Priority card */}
        <Card className="bg-gradient-to-br from-slate-700 to-slate-900 text-white border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <p className="text-white/80 text-sm">Ticket's Priority</p>
            </div>
            <div className="flex gap-4 text-sm">
              <span><strong className="text-red-400">H:</strong> 2</span>
              <span><strong className="text-yellow-400">M:</strong> 1</span>
              <span><strong className="text-green-400">L:</strong> 2</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 mb-2">
            <Filter className="h-4 w-4" /> {filtersOpen ? "Hide Filters" : "Show Filters"}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">From Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">To Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">Solved By</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="tech_a">Technician A</SelectItem>
                      <SelectItem value="tech_b">Technician B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">Problem Category</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="disconnection">Disconnection</SelectItem>
                      <SelectItem value="slow_speed">Slow Speed</SelectItem>
                      <SelectItem value="no_connection">No Connection</SelectItem>
                      <SelectItem value="router">Router Issue</SelectItem>
                      <SelectItem value="billing">Billing Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">Zone</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="mirpur">Mirpur</SelectItem>
                      <SelectItem value="uttara">Uttara</SelectItem>
                      <SelectItem value="dhanmondi">Dhanmondi</SelectItem>
                      <SelectItem value="banani">Banani</SelectItem>
                      <SelectItem value="gulshan">Gulshan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Entries + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Show</span>
          <Select value={entriesPerPage} onValueChange={(v) => { setEntriesPerPage(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">entries</span>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 h-9" />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-800 hover:bg-slate-800">
                {["Sr.No.", "Date", "Ticket No.", "Client Code", "Username", "Mobile No.", "Zone", "Category", "Solve Time", "Solved By", "Duration", "Info"].map((h) => (
                  <TableHead key={h} className="text-white font-semibold whitespace-nowrap text-xs">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-10 text-muted-foreground">No records found</TableCell>
                </TableRow>
              ) : (
                paginated.map((t, i) => (
                  <TableRow key={t.id} className="text-sm">
                    <TableCell className="font-medium">{(currentPage - 1) * perPage + i + 1}</TableCell>
                    <TableCell className="whitespace-nowrap">{t.date}</TableCell>
                    <TableCell><span className="font-mono text-primary">{t.ticketNo}</span></TableCell>
                    <TableCell className="font-mono">{t.clientCode}</TableCell>
                    <TableCell>{t.username}</TableCell>
                    <TableCell className="whitespace-nowrap">{t.mobile}</TableCell>
                    <TableCell>{t.zone}</TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{t.solveTime}</TableCell>
                    <TableCell>{t.solvedBy}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{t.duration}</Badge>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Priority: {t.priority} | Source: {t.source}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
        </span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(1)}><ChevronsLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" className="min-w-[36px]">{currentPage}</Button>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default SupportHistoryPage;
