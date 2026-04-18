import React, { useState, useMemo } from "react";
import { ClipboardList, FileText, FileSpreadsheet, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const demoData = [
  { id: "TSK-001", title: "Router Reset at Client Site", category: "Home shifting", zone: "Mirpur", client: "Rahim Net", description: "Router was not responding, needed hard reset", solvedBy: "Technician A", startTime: "2025-07-10 09:00", endTime: "2025-07-10 10:30", remark: "Completed successfully", duration: "1h 30m" },
  { id: "TSK-002", title: "New Line Installation", category: "New Line Add", zone: "Uttara", client: "Karim ISP", description: "Install fiber line to new customer", solvedBy: "Technician B", startTime: "2025-07-09 11:00", endTime: "2025-07-09 14:45", remark: "Line active", duration: "3h 45m" },
  { id: "TSK-003", title: "Office Network Setup", category: "Office Work", zone: "Gulshan", client: "Hasan Net", description: "Setup LAN for 20 workstations", solvedBy: "Admin", startTime: "2025-07-08 08:30", endTime: "2025-07-08 16:00", remark: "All stations connected", duration: "7h 30m" },
];

const TaskHistoryPage = () => {
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const filtered = useMemo(() => {
    if (!search) return demoData;
    const s = search.toLowerCase();
    return demoData.filter(
      (t) =>
        t.id.toLowerCase().includes(s) ||
        t.title.toLowerCase().includes(s) ||
        t.category.toLowerCase().includes(s) ||
        t.client.toLowerCase().includes(s) ||
        t.zone.toLowerCase().includes(s) ||
        t.solvedBy.toLowerCase().includes(s)
    );
  }, [search]);

  const perPage = parseInt(entriesPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Dashboard</span><span>/</span>
        <span>Task Management</span><span>/</span>
        <span className="text-foreground font-medium">Task History</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Task History</h1>
            <p className="text-muted-foreground text-sm">Monthly Task History</p>
          </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">Task Category</label>
                  <Select><SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="new_line">New Line Add</SelectItem>
                      <SelectItem value="home_shifting">Home shifting</SelectItem>
                      <SelectItem value="office_work">Office Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">Zone</label>
                  <Select><SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="mirpur">Mirpur</SelectItem>
                      <SelectItem value="uttara">Uttara</SelectItem>
                      <SelectItem value="gulshan">Gulshan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">Solved By</label>
                  <Select><SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="tech_a">Technician A</SelectItem>
                      <SelectItem value="tech_b">Technician B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">Clients</label>
                  <Select><SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="rahim">Rahim Net</SelectItem>
                      <SelectItem value="karim">Karim ISP</SelectItem>
                      <SelectItem value="hasan">Hasan Net</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">From Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">To Date</label>
                  <Input type="date" />
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
              <TableRow className="bg-primary hover:bg-primary">
                {["Task Id", "ToDo Title", "Task Category", "Zone", "Client", "Description", "Solved By", "Start Time", "End Time", "Remark", "Complete Duration"].map((h) => (
                  <TableHead key={h} className="text-primary-foreground font-semibold whitespace-nowrap text-xs">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">No records found</TableCell>
                </TableRow>
              ) : (
                paginated.map((t) => (
                  <TableRow key={t.id} className="text-sm">
                    <TableCell><span className="font-mono text-primary">{t.id}</span></TableCell>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{t.category}</Badge></TableCell>
                    <TableCell>{t.zone}</TableCell>
                    <TableCell>{t.client}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{t.description}</TableCell>
                    <TableCell>{t.solvedBy}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{t.startTime}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{t.endTime}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{t.remark}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{t.duration}</span>
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

export default TaskHistoryPage;
