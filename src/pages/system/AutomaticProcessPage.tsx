import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Wrench, Search, Info, Eye, Pencil, ChevronLeft, ChevronRight, Settings2, Clock, CalendarClock, Repeat } from "lucide-react";

interface ProcessItem {
  id: string;
  branch: string;
  processName: string;
  executeAt: string;
  interval: string;
  executionDay: string;
}

const tabData: Record<string, ProcessItem[]> = {
  system: [
    { id: "1", branch: "Main", processName: "Fund Credit of MAC Resellers", executeAt: "00:15", interval: "Daily", executionDay: "Every Day" },
    { id: "2", branch: "Main", processName: "Sync All Customer By Servers", executeAt: "Default", interval: "Hourly", executionDay: "Every Day" },
    { id: "3", branch: "Main", processName: "Generate Monthly Bill", executeAt: "06:00", interval: "Daily", executionDay: "1st of Month" },
    { id: "4", branch: "Main", processName: "Disable Unpaid Customers", executeAt: "12:00", interval: "Daily", executionDay: "Every Day" },
    { id: "5", branch: "Main", processName: "Auto Backup Database", executeAt: "02:00", interval: "Daily", executionDay: "Every Day" },
    { id: "6", branch: "Main", processName: "Clear Expired Sessions", executeAt: "03:00", interval: "Weekly", executionDay: "Sunday" },
  ],
  admin_customer: [
    { id: "7", branch: "Admin", processName: "Send Payment Reminder SMS", executeAt: "09:00", interval: "Daily", executionDay: "Every Day" },
    { id: "8", branch: "Admin", processName: "Auto Suspend Overdue Accounts", executeAt: "10:00", interval: "Daily", executionDay: "Every Day" },
    { id: "9", branch: "Admin", processName: "Customer Balance Update", executeAt: "23:00", interval: "Daily", executionDay: "Every Day" },
  ],
  pop: [
    { id: "10", branch: "POP-1", processName: "Bandwidth Usage Sync", executeAt: "00:00", interval: "Hourly", executionDay: "Every Day" },
    { id: "11", branch: "POP-1", processName: "Device Health Check", executeAt: "05:00", interval: "Every 6 Hours", executionDay: "Every Day" },
  ],
  pop_customer: [
    { id: "12", branch: "POP-1", processName: "Customer Speed Profile Sync", executeAt: "01:00", interval: "Daily", executionDay: "Every Day" },
    { id: "13", branch: "POP-2", processName: "MAC Address Validation", executeAt: "04:00", interval: "Weekly", executionDay: "Monday" },
  ],
  bandwidth_pop: [
    { id: "14", branch: "BW-POP", processName: "Bandwidth Allocation Report", executeAt: "06:00", interval: "Daily", executionDay: "Every Day" },
    { id: "15", branch: "BW-POP", processName: "Peak Usage Analysis", executeAt: "22:00", interval: "Daily", executionDay: "Every Day" },
  ],
};

const tabs = [
  { value: "system", label: "System" },
  { value: "admin_customer", label: "Admin Customer" },
  { value: "pop", label: "POP" },
  { value: "pop_customer", label: "POP Customer" },
  { value: "bandwidth_pop", label: "Bandwidth POP" },
];

const statCards = [
  { label: "Total Processes", value: "15", icon: Settings2, gradient: "from-blue-500 to-blue-600" },
  { label: "Active Schedules", value: "12", icon: Clock, gradient: "from-emerald-500 to-emerald-600" },
  { label: "Daily Tasks", value: "10", icon: CalendarClock, gradient: "from-amber-500 to-amber-600" },
  { label: "Hourly Tasks", value: "3", icon: Repeat, gradient: "from-violet-500 to-violet-600" },
];

const intervalColor: Record<string, string> = {
  Daily: "bg-blue-500/10 text-blue-600",
  Hourly: "bg-emerald-500/10 text-emerald-600",
  Weekly: "bg-amber-500/10 text-amber-600",
  "Every 6 Hours": "bg-violet-500/10 text-violet-600",
};

export default function AutomaticProcessPage() {
  const [activeTab, setActiveTab] = useState("system");
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const data = tabData[activeTab] || [];
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((r) =>
      r.processName.toLowerCase().includes(q) || r.branch.toLowerCase().includes(q)
    );
  }, [activeTab, search]);

  const perPage = parseInt(entriesPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const page = Math.min(currentPage, totalPages);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const from = filtered.length ? (page - 1) * perPage + 1 : 0;
  const to = Math.min(page * perPage, filtered.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>System</span>
          <span>/</span>
          <span className="text-foreground font-medium">Automatic Process</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Automatic Process</h1>
            <p className="text-sm text-muted-foreground">Application Auto Process and Scheduling</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <Card key={c.label} className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-r ${c.gradient} p-4 flex items-center justify-between`}>
                <div>
                  <p className="text-xs font-medium text-white/80">{c.label}</p>
                  <p className="text-2xl font-bold text-white">{c.value}</p>
                </div>
                <c.icon className="h-8 w-8 text-white/30" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); setSearch(""); }}>
        <TabsList className="bg-muted/50 p-1">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs sm:text-sm">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Table Card */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="bg-foreground/90 text-background px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Process List — {tabs.find((t) => t.value === activeTab)?.label}</h3>
        </div>
        <CardContent className="p-4 space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Show</span>
              <Select value={entriesPerPage} onValueChange={(v) => { setEntriesPerPage(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[70px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["5", "10", "25", "50"].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">entries</span>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search process..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 h-8 text-sm" />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12 text-center font-semibold">Sr.</TableHead>
                  <TableHead className="font-semibold">Branch</TableHead>
                  <TableHead className="font-semibold">Process Name</TableHead>
                  <TableHead className="font-semibold">Execute At</TableHead>
                  <TableHead className="font-semibold">Interval</TableHead>
                  <TableHead className="font-semibold">Execution Day</TableHead>
                  <TableHead className="text-center font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No processes found</TableCell>
                  </TableRow>
                ) : (
                  paged.map((row, idx) => (
                    <TableRow key={row.id} className="hover:bg-muted/30">
                      <TableCell className="text-center text-muted-foreground">{from + idx}</TableCell>
                      <TableCell className="font-medium">{row.branch}</TableCell>
                      <TableCell>{row.processName}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">{row.executeAt}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${intervalColor[row.interval] || "bg-muted text-muted-foreground"}`}>
                          {row.interval}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.executionDay}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7"><Info className="h-3.5 w-3.5 text-blue-500" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>{row.processName}</TooltipContent>
                          </Tooltip>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5 text-emerald-500" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5 text-amber-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Showing {from} to {to} of {filtered.length} entries</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-8" disabled={page <= 1} onClick={() => setCurrentPage(page - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button variant="outline" size="sm" className="h-8 min-w-[32px] bg-primary text-primary-foreground">{page}</Button>
              <Button variant="outline" size="sm" className="h-8" disabled={page >= totalPages} onClick={() => setCurrentPage(page + 1)}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
