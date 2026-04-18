import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, FileText, FileSpreadsheet, Plus, CheckCircle, Trash2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { usePayments } from "@/hooks/usePayments";
import { useCurrentTenant } from "@/hooks/useTenant";

export default function DailyCollectionPage() {
  const { data: tenant } = useCurrentTenant();
  const { data: payments = [], isLoading } = usePayments(tenant?.id);

  const [activeTab, setActiveTab] = useState("collected");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  // Filter & search
  const filtered = useMemo(() => {
    let result = payments;

    if (fromDate) {
      result = result.filter(p => new Date(p.created_at) >= fromDate);
    }
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59);
      result = result.filter(p => new Date(p.created_at) <= end);
    }
    if (methodFilter !== "all") {
      result = result.filter(p => p.method === methodFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.customer?.name?.toLowerCase().includes(q) ||
        p.customer?.phone?.includes(q) ||
        p.customer?.network_username?.toLowerCase().includes(q) ||
        p.reference?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [payments, fromDate, toDate, methodFilter, search]);

  // Stats
  const totalReceived = filtered.reduce((s, p) => s + Number(p.amount), 0);
  const totalDue = filtered.reduce((s, p) => s + Number(p.bill?.amount || 0) - Number(p.amount), 0);
  const totalDiscount = 0; // placeholder

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(p => p.id)));
    }
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const staffNames = ["Admin", "Manager", "Staff", "Accountant"];

  return (
    <PageContainer title="Daily Bill Collection" description="Billing → Daily Bill Collection">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="collected">Collected Bills</TabsTrigger>
          <TabsTrigger value="webhook">Webhook Payments</TabsTrigger>
          <TabsTrigger value="paybill">Paybill Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="collected" className="space-y-4 mt-4">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-success/90 to-primary/80 text-primary-foreground border-0">
              <p className="text-sm font-medium opacity-90">Receive</p>
              <p className="text-2xl font-bold mt-1">৳ {totalReceived.toLocaleString()}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-secondary to-accent text-secondary-foreground border-0">
              <p className="text-sm font-medium opacity-90">Discount</p>
              <p className="text-2xl font-bold mt-1">৳ {totalDiscount.toLocaleString()}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-primary to-accent text-primary-foreground border-0">
              <p className="text-sm font-medium opacity-90">Due</p>
              <p className="text-2xl font-bold mt-1">৳ {Math.max(0, totalDue).toLocaleString()}</p>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm"><FileSpreadsheet className="mr-1 h-4 w-4" /> Generate CSV</Button>
            <Button variant="outline" size="sm"><FileText className="mr-1 h-4 w-4" /> Generate PDF</Button>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Receive Bill</Button>
            <Button variant="secondary" size="sm" disabled={selectedIds.size === 0}>
              <CheckCircle className="mr-1 h-4 w-4" /> Approve Selected
            </Button>
            <Button variant="destructive" size="sm" disabled={selectedIds.size === 0}>
              <Trash2 className="mr-1 h-4 w-4" /> Delete Selected
            </Button>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Username</label>
                <Input placeholder="Search username..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full h-9 justify-start text-sm font-normal", !fromDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                      {fromDate ? format(fromDate, "dd/MM/yyyy") : "Select"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={fromDate} onSelect={setFromDate} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full h-9 justify-start text-sm font-normal", !toDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                      {toDate ? format(toDate, "dd/MM/yyyy") : "Select"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={toDate} onSelect={setToDate} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Trans. Status</label>
                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Payment Method</label>
                <Select value={methodFilter} onValueChange={v => { setMethodFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Show entries + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[70px] h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-8 h-8 text-sm" />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10">
                      <Checkbox checked={paginated.length > 0 && selectedIds.size === paginated.length} onCheckedChange={toggleAll} />
                    </TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">C.Code</TableHead>
                    <TableHead className="text-xs">UserName</TableHead>
                    <TableHead className="text-xs">Cus.Name</TableHead>
                    <TableHead className="text-xs">MobileNo</TableHead>
                    <TableHead className="text-xs">Note/Remarks</TableHead>
                    <TableHead className="text-xs text-right">M.Bill</TableHead>
                    <TableHead className="text-xs text-right">Received</TableHead>
                    <TableHead className="text-xs text-right">VAT</TableHead>
                    <TableHead className="text-xs text-right">Discount</TableHead>
                    <TableHead className="text-xs text-right">BalanceDue</TableHead>
                    <TableHead className="text-xs">PaymentMethod</TableHead>
                    <TableHead className="text-xs">ReceivedBy</TableHead>
                    <TableHead className="text-xs">ApprovedBy</TableHead>
                    <TableHead className="text-xs">CreatedBy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={16} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={16} className="text-center py-8 text-muted-foreground">No records found</TableCell>
                    </TableRow>
                  ) : paginated.map((payment, idx) => {
                    const billAmount = Number(payment.bill?.amount || payment.amount);
                    const received = Number(payment.amount);
                    const due = Math.max(0, billAmount - received);
                    const staffIdx = idx % staffNames.length;
                    return (
                      <TableRow key={payment.id} className="text-xs">
                        <TableCell>
                          <Checkbox checked={selectedIds.has(payment.id)} onCheckedChange={() => toggleSelect(payment.id)} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{format(new Date(payment.created_at), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{payment.customer?.id?.slice(0, 6).toUpperCase() || "—"}</TableCell>
                        <TableCell>{payment.customer?.network_username || "—"}</TableCell>
                        <TableCell className="font-medium">{payment.customer?.name || "—"}</TableCell>
                        <TableCell>{payment.customer?.phone || "—"}</TableCell>
                        <TableCell className="max-w-[120px] truncate">{payment.notes || "—"}</TableCell>
                        <TableCell className="text-right font-medium">৳{billAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold text-success">৳{received.toLocaleString()}</TableCell>
                        <TableCell className="text-right">৳0</TableCell>
                        <TableCell className="text-right">৳0</TableCell>
                        <TableCell className="text-right">{due > 0 ? <span className="text-destructive font-medium">৳{due.toLocaleString()}</span> : <span className="text-success">৳0</span>}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] capitalize">{payment.method || "cash"}</Badge>
                        </TableCell>
                        <TableCell>{staffNames[staffIdx]}</TableCell>
                        <TableCell>{staffNames[(staffIdx + 1) % staffNames.length]}</TableCell>
                        <TableCell>{staffNames[(staffIdx + 2) % staffNames.length]}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
            <p className="text-muted-foreground">
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="xs" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="xs" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              {pageNumbers.map(n => (
                <Button key={n} variant={n === currentPage ? "default" : "outline"} size="xs" onClick={() => setCurrentPage(n)}>
                  {n}
                </Button>
              ))}
              <Button variant="outline" size="xs" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="xs" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="webhook" className="mt-4">
          <Card className="p-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">Webhook Payments</p>
            <p className="text-sm mt-1">Webhook payment records will appear here.</p>
          </Card>
        </TabsContent>

        <TabsContent value="paybill" className="mt-4">
          <Card className="p-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">Paybill Payments</p>
            <p className="text-sm mt-1">Paybill payment records will appear here.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
