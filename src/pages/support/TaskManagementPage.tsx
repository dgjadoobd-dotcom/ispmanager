import React, { useState, useMemo } from "react";
import { ClipboardList, FileText, FileSpreadsheet, Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CalendarIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TaskItem {
  id: string;
  taskId: string;
  taskName: string;
  category: string;
  zone: string;
  client: string;
  description: string;
  complainTime: string;
  status: "Processing" | "Pending" | "Completed";
  createdBy: string;
  lastUpdatedBy: string;
  assignTo: string[];
  startTime: string;
  endTime: string;
  priority: "High" | "Medium" | "Low";
}

const demoTasks: TaskItem[] = [
  {
    id: "1",
    taskId: "TK-001",
    taskName: "Fiber Cable Repair",
    category: "Maintenance",
    zone: "Zone A",
    client: "Rahim Uddin",
    description: "Fiber cable damaged near pole #45, needs immediate repair",
    complainTime: "2025-03-10 09:30 AM",
    status: "Processing",
    createdBy: "Admin",
    lastUpdatedBy: "Karim",
    assignTo: ["Jamal", "Sumon", "Rafiq"],
    startTime: "2025-03-10 10:00 AM",
    endTime: "",
    priority: "High",
  },
  {
    id: "2",
    taskId: "TK-002",
    taskName: "New Connection Setup",
    category: "Installation",
    zone: "Zone B",
    client: "Fatema Begum",
    description: "New FTTH connection installation at client premises",
    complainTime: "2025-03-10 11:15 AM",
    status: "Pending",
    createdBy: "Admin",
    lastUpdatedBy: "Admin",
    assignTo: ["Habib"],
    startTime: "",
    endTime: "",
    priority: "Medium",
  },
  {
    id: "3",
    taskId: "TK-003",
    taskName: "ONU Replacement",
    category: "Hardware",
    zone: "Zone A",
    client: "Kamal Hossain",
    description: "ONU device malfunctioning, replace with new unit",
    complainTime: "2025-03-09 02:45 PM",
    status: "Processing",
    createdBy: "Karim",
    lastUpdatedBy: "Karim",
    assignTo: ["Sumon", "Rafiq"],
    startTime: "2025-03-09 03:30 PM",
    endTime: "",
    priority: "High",
  },
  {
    id: "4",
    taskId: "TK-004",
    taskName: "Speed Upgrade",
    category: "Configuration",
    zone: "Zone C",
    client: "Nasir Ahmed",
    description: "Upgrade bandwidth from 10Mbps to 20Mbps as per request",
    complainTime: "2025-03-09 04:00 PM",
    status: "Completed",
    createdBy: "Admin",
    lastUpdatedBy: "Jamal",
    assignTo: ["Jamal"],
    startTime: "2025-03-09 04:30 PM",
    endTime: "2025-03-09 05:15 PM",
    priority: "Low",
  },
];

const categories = ["All", "Maintenance", "Installation", "Hardware", "Configuration"];
const zones = ["All", "Zone A", "Zone B", "Zone C"];
const staff = ["All", "Admin", "Karim", "Jamal", "Sumon", "Habib", "Rafiq"];
const clients = ["All", "Rahim Uddin", "Fatema Begum", "Kamal Hossain", "Nasir Ahmed"];

const TaskManagementPage = () => {
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterZone, setFilterZone] = useState("All");
  const [filterAssignTo, setFilterAssignTo] = useState("All");
  const [filterClient, setFilterClient] = useState("All");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [showNewTask, setShowNewTask] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const filtered = useMemo(() => {
    return demoTasks.filter((t) => {
      if (filterCategory !== "All" && t.category !== filterCategory) return false;
      if (filterZone !== "All" && t.zone !== filterZone) return false;
      if (filterAssignTo !== "All" && !t.assignTo.includes(filterAssignTo)) return false;
      if (filterClient !== "All" && t.client !== filterClient) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !t.taskId.toLowerCase().includes(q) &&
          !t.taskName.toLowerCase().includes(q) &&
          !t.client.toLowerCase().includes(q) &&
          !t.description.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [search, filterCategory, filterZone, filterAssignTo, filterClient]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  const startEntry = filtered.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, filtered.length);

  const statusBadge = (status: TaskItem["status"]) => {
    switch (status) {
      case "Processing":
        return <Badge className="bg-cyan-500/15 text-cyan-600 border-cyan-500/30 hover:bg-cyan-500/20 font-medium">Processing</Badge>;
      case "Pending":
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/20 font-medium">Pending</Badge>;
      case "Completed":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20 font-medium">Completed</Badge>;
    }
  };

  const priorityBadge = (priority: TaskItem["priority"]) => {
    switch (priority) {
      case "High":
        return <Badge variant="destructive" className="text-xs">H</Badge>;
      case "Medium":
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs">M</Badge>;
      case "Low":
        return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-xs">L</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Task</h1>
            <p className="text-sm text-muted-foreground">Task &gt; Task Management</p>
          </div>
        </div>
        <Button onClick={() => setShowNewTask(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Task
        </Button>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <FileText className="h-3.5 w-3.5" /> Generate PDF
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <FileSpreadsheet className="h-3.5 w-3.5" /> Generate CSV
        </Button>
      </div>

      {/* Filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground mb-1">
            <Filter className="h-4 w-4" /> {filtersOpen ? "Hide Filters" : "Show Filters"}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-lg border bg-card">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Task Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Zone</Label>
              <Select value={filterZone} onValueChange={setFilterZone}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{zones.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Assign To</Label>
              <Select value={filterAssignTo} onValueChange={setFilterAssignTo}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{staff.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Clients</Label>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{clients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("h-9 w-full justify-start text-xs font-normal", !fromDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                    {fromDate ? format(fromDate, "dd/MM/yyyy") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("h-9 w-full justify-start text-xs font-normal", !toDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                    {toDate ? format(toDate, "dd/MM/yyyy") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Show entries + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Show
          <Select value={String(entriesPerPage)} onValueChange={(v) => { setEntriesPerPage(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="h-8 w-[70px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          entries
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 h-9 text-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-800 dark:bg-slate-900 hover:bg-slate-800 dark:hover:bg-slate-900">
                {["TaskId", "Task Name", "Category", "Zone", "Client", "Description", "Complain Time", "Status", "Created By", "Last Updated", "Assign To", "Start Time", "End Time"].map((h) => (
                  <TableHead key={h} className="text-white font-semibold text-xs whitespace-nowrap">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-10 text-muted-foreground">No tasks found</TableCell>
                </TableRow>
              ) : (
                paginated.map((task, idx) => (
                  <TableRow key={task.id} className={idx % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                    <TableCell className="font-mono text-xs font-semibold text-primary whitespace-nowrap">{task.taskId}</TableCell>
                    <TableCell className="text-sm font-medium whitespace-nowrap max-w-[150px] truncate">
                      <div className="flex items-center gap-1.5">
                        {priorityBadge(task.priority)}
                        {task.taskName}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{task.category}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{task.zone}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{task.client}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate" title={task.description}>{task.description}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">{task.complainTime}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {statusBadge(task.status)}
                        <button className="p-1 hover:bg-muted rounded"><Edit2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        <button className="p-1 hover:bg-destructive/10 rounded"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{task.createdBy}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{task.lastUpdatedBy}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
                          {task.assignTo.length > 0 ? "Re Assign" : "Assign"}
                        </Button>
                        {task.assignTo.slice(0, 2).map((name) => (
                          <Badge key={name} variant="secondary" className="text-[10px] font-normal">{name}</Badge>
                        ))}
                        {task.assignTo.length > 2 && (
                          <Badge variant="secondary" className="text-[10px] font-normal">+{task.assignTo.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">{task.startTime || "—"}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">{task.endTime || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground text-xs">
          Showing {startEntry} to {endEntry} of {filtered.length} entries
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8 text-xs" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), currentPage + 2).map(p => (
            <Button key={p} variant={p === currentPage ? "default" : "outline"} size="sm" className="h-8 w-8 text-xs p-0" onClick={() => setCurrentPage(p)}>
              {p}
            </Button>
          ))}
          <Button variant="outline" size="sm" className="h-8 text-xs" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* New Task Dialog */}
      <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Add New Task
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Task Name</Label>
              <Input placeholder="Enter task name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Zone</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {zones.filter(z => z !== "All").map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Client</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {clients.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Assign To</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>
                  {staff.filter(s => s !== "All").map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Task description..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTask(false)}>Cancel</Button>
            <Button onClick={() => setShowNewTask(false)}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManagementPage;
