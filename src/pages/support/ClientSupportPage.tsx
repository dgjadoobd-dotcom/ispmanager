import React, { useState, useMemo } from "react";
import { Headset, Plus, Filter, ChevronDown, ChevronUp, Pencil, Eye, Ticket, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type TicketTab = "accepted" | "pending" | "mac_reseller" | "bandwidth_pop";
type Priority = "High" | "Medium" | "Low";
type Status = "Processing" | "Solved" | "Pending";

interface SupportTicket {
  id: string;
  ticketNo: string;
  clientCode: string;
  idIp: string;
  customerName: string;
  mobile: string;
  complainNo: string;
  zone: string;
  subzone: string;
  box: string;
  problem: string;
  priority: Priority;
  complainTime: string;
  createdBy: string;
  status: Status;
  assignTo: string;
  solvedTime: string;
  tab: TicketTab;
}

const demoTickets: SupportTicket[] = [
  { id: "1", ticketNo: "TKT-001", clientCode: "C-1042", idIp: "192.168.1.101", customerName: "Rahim Uddin", mobile: "01712345678", complainNo: "CMP-2024-001", zone: "Zone A", subzone: "Sub-1", box: "Box-12", problem: "Internet Slow", priority: "High", complainTime: "2024-12-10 09:30", createdBy: "Admin", status: "Processing", assignTo: "Technician A", solvedTime: "-", tab: "accepted" },
  { id: "2", ticketNo: "TKT-002", clientCode: "C-1055", idIp: "192.168.1.115", customerName: "Karim Hasan", mobile: "01812345678", complainNo: "CMP-2024-002", zone: "Zone B", subzone: "Sub-3", box: "Box-05", problem: "No Connection", priority: "High", complainTime: "2024-12-10 10:15", createdBy: "Staff 1", status: "Processing", assignTo: "Technician B", solvedTime: "-", tab: "accepted" },
  { id: "3", ticketNo: "TKT-003", clientCode: "C-1078", idIp: "192.168.2.45", customerName: "Fatema Begum", mobile: "01912345678", complainNo: "CMP-2024-003", zone: "Zone A", subzone: "Sub-2", box: "Box-08", problem: "Frequent Disconnect", priority: "Medium", complainTime: "2024-12-10 11:00", createdBy: "Admin", status: "Solved", assignTo: "Technician A", solvedTime: "2024-12-10 14:30", tab: "accepted" },
  { id: "4", ticketNo: "TKT-004", clientCode: "C-1090", idIp: "192.168.3.22", customerName: "Abdul Kadir", mobile: "01612345678", complainNo: "CMP-2024-004", zone: "Zone C", subzone: "Sub-1", box: "Box-15", problem: "Low Speed", priority: "Medium", complainTime: "2024-12-10 13:45", createdBy: "Staff 2", status: "Pending", assignTo: "-", solvedTime: "-", tab: "pending" },
  { id: "5", ticketNo: "TKT-005", clientCode: "C-1102", idIp: "192.168.1.200", customerName: "Nasima Akter", mobile: "01512345678", complainNo: "CMP-2024-005", zone: "Zone B", subzone: "Sub-4", box: "Box-03", problem: "Router Issue", priority: "Low", complainTime: "2024-12-10 14:20", createdBy: "Admin", status: "Pending", assignTo: "-", solvedTime: "-", tab: "pending" },
];

const statCards = [
  { label: "Total Tickets", value: 5, icon: Ticket, gradient: "from-emerald-500 to-teal-600" },
  { label: "Pending Tickets", value: 2, icon: Clock, gradient: "from-pink-500 to-rose-600" },
  { label: "Processing Tickets", value: 2, icon: Loader2, gradient: "from-orange-500 to-red-500" },
  { label: "Solved Tickets", value: 1, icon: CheckCircle2, gradient: "from-blue-500 to-cyan-500" },
];

const tabs: { key: TicketTab; label: string; count: number }[] = [
  { key: "accepted", label: "Accepted (Client's)", count: 3 },
  { key: "pending", label: "Pending (Client's)", count: 2 },
  { key: "mac_reseller", label: "MAC Reseller's", count: 0 },
  { key: "bandwidth_pop", label: "Bandwidth POP's", count: 0 },
];

const priorityBadge = (p: Priority) => {
  switch (p) {
    case "High": return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">High</Badge>;
    case "Medium": return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Medium</Badge>;
    case "Low": return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Low</Badge>;
  }
};

const statusBadge = (s: Status) => {
  switch (s) {
    case "Processing": return <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-100">Processing</Badge>;
    case "Solved": return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Solved</Badge>;
    case "Pending": return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Pending</Badge>;
  }
};

const ClientSupportPage = () => {
  const [activeTab, setActiveTab] = useState<TicketTab>("accepted");
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [showFilters, setShowFilters] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let data = demoTickets.filter(t => t.tab === activeTab);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(t =>
        t.ticketNo.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.clientCode.toLowerCase().includes(q) ||
        t.mobile.includes(q) ||
        t.problem.toLowerCase().includes(q)
      );
    }
    return data;
  }, [activeTab, search]);

  const perPage = parseInt(entriesPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
          <span>Support & Ticketing</span>
          <span>/</span>
          <span className="text-foreground font-medium">Daily Support Ticket</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Headset className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Support & Ticketing</h1>
            <p className="text-sm text-muted-foreground">Daily Support Ticket</p>
          </div>
        </div>
      </div>

      {/* Tabs + New Ticket */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map(tab => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
            className="gap-1.5"
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1 text-xs rounded-full px-1.5 py-0.5 ${activeTab === tab.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {tab.count}
              </span>
            )}
          </Button>
        ))}
        <div className="flex-1" />
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Open New Ticket
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Card key={card.label} className={`bg-gradient-to-br ${card.gradient} text-white p-4 border-0`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <card.icon className="h-8 w-8 text-white/40" />
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="h-4 w-4" /> Filters
            {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="p-4 mt-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Support Category", "Zone", "Assign To", "Created By"].map(label => (
                <div key={label}>
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Select><SelectTrigger className="mt-1 h-9"><SelectValue placeholder={`Select ${label}`} /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem></SelectContent></Select>
                </div>
              ))}
              {["Status", "Priority"].map(label => (
                <div key={label}>
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Select><SelectTrigger className="mt-1 h-9"><SelectValue placeholder={`Select ${label}`} /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem></SelectContent></Select>
                </div>
              ))}
              <div>
                <Label className="text-xs text-muted-foreground">From Date</Label>
                <Input type="date" className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">To Date</Label>
                <Input type="date" className="mt-1 h-9" />
              </div>
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Entries + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Show</span>
          <Select value={entriesPerPage} onValueChange={v => { setEntriesPerPage(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["5", "10", "25", "50"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">entries</span>
        </div>
        <Input placeholder="Search tickets..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} className="max-w-xs h-8" />
      </div>

      {/* Table */}
      <Card className="overflow-hidden border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="text-xs font-semibold">#</TableHead>
                <TableHead className="text-xs font-semibold">Ticket No</TableHead>
                <TableHead className="text-xs font-semibold">Client Code</TableHead>
                <TableHead className="text-xs font-semibold">ID/IP</TableHead>
                <TableHead className="text-xs font-semibold">Customer Name</TableHead>
                <TableHead className="text-xs font-semibold">Mobile</TableHead>
                <TableHead className="text-xs font-semibold">Complain No</TableHead>
                <TableHead className="text-xs font-semibold">Zone</TableHead>
                <TableHead className="text-xs font-semibold">Subzone</TableHead>
                <TableHead className="text-xs font-semibold">Box</TableHead>
                <TableHead className="text-xs font-semibold">Problem</TableHead>
                <TableHead className="text-xs font-semibold">Priority</TableHead>
                <TableHead className="text-xs font-semibold">Complain Time</TableHead>
                <TableHead className="text-xs font-semibold">Created By</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Assign To</TableHead>
                <TableHead className="text-xs font-semibold">Solved Time</TableHead>
                <TableHead className="text-xs font-semibold text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={18} className="text-center py-10 text-muted-foreground">No tickets found</TableCell></TableRow>
              ) : paginated.map((t, i) => (
                <TableRow key={t.id}>
                  <TableCell className="text-xs">{(currentPage - 1) * perPage + i + 1}</TableCell>
                  <TableCell className="text-xs font-medium text-primary">{t.ticketNo}</TableCell>
                  <TableCell className="text-xs">{t.clientCode}</TableCell>
                  <TableCell className="text-xs font-mono">{t.idIp}</TableCell>
                  <TableCell className="text-xs font-medium">{t.customerName}</TableCell>
                  <TableCell className="text-xs">{t.mobile}</TableCell>
                  <TableCell className="text-xs">{t.complainNo}</TableCell>
                  <TableCell className="text-xs">{t.zone}</TableCell>
                  <TableCell className="text-xs">{t.subzone}</TableCell>
                  <TableCell className="text-xs">{t.box}</TableCell>
                  <TableCell className="text-xs">{t.problem}</TableCell>
                  <TableCell className="text-xs">{priorityBadge(t.priority)}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{t.complainTime}</TableCell>
                  <TableCell className="text-xs">{t.createdBy}</TableCell>
                  <TableCell className="text-xs">{statusBadge(t.status)}</TableCell>
                  <TableCell className="text-xs">{t.assignTo}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{t.solvedTime}</TableCell>
                  <TableCell className="text-xs text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30 text-xs text-muted-foreground">
          <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
            ))}
          </div>
        </div>
      </Card>

      {/* New Ticket Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Open New Ticket</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Customer</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select Customer" /></SelectTrigger><SelectContent><SelectItem value="c1">Rahim Uddin (C-1042)</SelectItem><SelectItem value="c2">Karim Hasan (C-1055)</SelectItem></SelectContent></Select></div>
            <div><Label>Problem</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select Problem" /></SelectTrigger><SelectContent><SelectItem value="slow">Internet Slow</SelectItem><SelectItem value="nocon">No Connection</SelectItem><SelectItem value="disconnect">Frequent Disconnect</SelectItem><SelectItem value="router">Router Issue</SelectItem></SelectContent></Select></div>
            <div><Label>Priority</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select Priority" /></SelectTrigger><SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent></Select></div>
            <div><Label>Description</Label><Textarea className="mt-1" placeholder="Describe the issue..." rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={() => setDialogOpen(false)}>Create Ticket</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientSupportPage;
