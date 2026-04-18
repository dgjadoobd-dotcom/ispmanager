import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ListOrdered, Plus, Eye, Pencil, Trash2, CalendarIcon, Search } from "lucide-react";

interface PurchaseEntry {
  id: string;
  billNo: string;
  date: string;
  vendor: string;
  totalAmount: number;
  paidAmount: number;
  discount: number;
  due: number;
  status: "paid" | "due" | "partial";
}

const demoData: PurchaseEntry[] = [
  { id: "1", billNo: "PUR-2025-001", date: "2025-03-01", vendor: "TechNet Supplies", totalAmount: 45000, paidAmount: 45000, discount: 500, due: 0, status: "paid" },
  { id: "2", billNo: "PUR-2025-002", date: "2025-03-03", vendor: "FiberCom Ltd", totalAmount: 120000, paidAmount: 80000, discount: 0, due: 40000, status: "partial" },
  { id: "3", billNo: "PUR-2025-003", date: "2025-03-05", vendor: "Cable World", totalAmount: 32000, paidAmount: 0, discount: 0, due: 32000, status: "due" },
  { id: "4", billNo: "PUR-2025-004", date: "2025-03-07", vendor: "Network Hub BD", totalAmount: 78500, paidAmount: 78500, discount: 1000, due: 0, status: "paid" },
  { id: "5", billNo: "PUR-2025-005", date: "2025-03-08", vendor: "TechNet Supplies", totalAmount: 15000, paidAmount: 15000, discount: 0, due: 0, status: "paid" },
  { id: "6", billNo: "PUR-2025-006", date: "2025-03-09", vendor: "OptiLink Corp", totalAmount: 250000, paidAmount: 100000, discount: 2500, due: 147500, status: "partial" },
  { id: "7", billNo: "PUR-2025-007", date: "2025-03-10", vendor: "FiberCom Ltd", totalAmount: 67000, paidAmount: 0, discount: 0, due: 67000, status: "due" },
  { id: "8", billNo: "PUR-2025-008", date: "2025-03-11", vendor: "Cable World", totalAmount: 91000, paidAmount: 91000, discount: 1500, due: 0, status: "paid" },
  { id: "9", billNo: "PUR-2025-009", date: "2025-03-11", vendor: "Network Hub BD", totalAmount: 54000, paidAmount: 20000, discount: 0, due: 34000, status: "partial" },
];

const vendors = ["All", "TechNet Supplies", "FiberCom Ltd", "Cable World", "Network Hub BD", "OptiLink Corp"];

const PurchaseBillPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return demoData.filter((entry) => {
      const matchesSearch = search === "" || entry.billNo.toLowerCase().includes(search.toLowerCase()) || entry.vendor.toLowerCase().includes(search.toLowerCase());
      const matchesVendor = vendorFilter === "All" || entry.vendor === vendorFilter;
      const entryDate = new Date(entry.date);
      const matchesFrom = !fromDate || entryDate >= fromDate;
      const matchesTo = !toDate || entryDate <= toDate;
      return matchesSearch && matchesVendor && matchesFrom && matchesTo;
    });
  }, [search, vendorFilter, fromDate, toDate]);

  const perPage = parseInt(entriesPerPage);
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const totals = useMemo(() => ({
    totalAmount: filtered.reduce((s, e) => s + e.totalAmount, 0),
    paidAmount: filtered.reduce((s, e) => s + e.paidAmount, 0),
    discount: filtered.reduce((s, e) => s + e.discount, 0),
    due: filtered.reduce((s, e) => s + e.due, 0),
  }), [filtered]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20">Paid</Badge>;
      case "due": return <Badge variant="destructive">Due</Badge>;
      case "partial": return <Badge className="bg-amber-500/15 text-amber-600 border-amber-200 hover:bg-amber-500/20">Partial</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <PageContainer
      title="Purchase List"
      description="All Purchase List"
      actions={
        <Button onClick={() => navigate("/dashboard/purchase")} className="gap-2">
          <Plus className="h-4 w-4" /> Purchase
        </Button>
      }
    >

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Purchase List</TabsTrigger>
          <TabsTrigger value="bills">Purchase Bills</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="w-full md:w-48">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Vendor</label>
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-44">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !fromDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "dd/MM/yyyy") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-full md:w-44">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !toDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "dd/MM/yyyy") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Show entries + Search */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select value={entriesPerPage} onValueChange={(v) => { setEntriesPerPage(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["5", "10", "25", "50"].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9" />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground font-semibold">SN</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Bill No</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Date</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Vendor</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-right">Total Amount</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-right">Paid Amount</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-right">Discount</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-right">Due</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-center">Status</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No purchase records found</TableCell>
                  </TableRow>
                ) : (
                  paginated.map((entry, idx) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{(currentPage - 1) * perPage + idx + 1}</TableCell>
                      <TableCell className="text-primary font-medium cursor-pointer hover:underline">{entry.billNo}</TableCell>
                      <TableCell>{format(new Date(entry.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{entry.vendor}</TableCell>
                      <TableCell className="text-right font-medium">৳{entry.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">৳{entry.paidAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">৳{entry.discount.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{entry.due > 0 ? `৳${entry.due.toLocaleString()}` : "—"}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {paginated.length > 0 && (
                <TableFooter>
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={4} className="text-right">Total:</TableCell>
                    <TableCell className="text-right">৳{totals.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">৳{totals.paidAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">৳{totals.discount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">৳{totals.due.toLocaleString()}</TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
              ))}
              <Button variant="outline" size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bills" className="py-12 text-center text-muted-foreground">
          <p>Purchase Bills view coming soon.</p>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default PurchaseBillPage;
