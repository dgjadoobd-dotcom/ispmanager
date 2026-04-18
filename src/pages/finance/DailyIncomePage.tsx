import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Plus, CalendarIcon, FileText, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePayments } from "@/hooks/usePayments";
import { useTenantContext } from "@/contexts/TenantContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const INCOME_CATEGORIES = [
  "Internet Service",
  "Installation Fee",
  "Router Sale",
  "Cable Charge",
  "Reconnection Fee",
  "Other Service",
];

interface IncomeEntry {
  id: string;
  date: string;
  category: string;
  servedBy: string;
  serviceCharge: number;
  description: string;
}

export default function DailyIncomePage() {
  const { currentTenant } = useTenantContext();
  const { data: payments } = usePayments(currentTenant?.id);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Map payments to income entries
  const incomeEntries: IncomeEntry[] = useMemo(() => {
    if (!payments?.length) {
      // Demo data fallback
      return [
        { id: "1", date: "2025-03-01", category: "Internet Service", servedBy: "Admin", serviceCharge: 1500, description: "Monthly subscription - Package A" },
        { id: "2", date: "2025-03-01", category: "Installation Fee", servedBy: "Technician 1", serviceCharge: 2000, description: "New connection setup" },
        { id: "3", date: "2025-03-02", category: "Router Sale", servedBy: "Admin", serviceCharge: 3500, description: "TP-Link Archer C6" },
        { id: "4", date: "2025-03-02", category: "Internet Service", servedBy: "Admin", serviceCharge: 1200, description: "Monthly subscription - Package B" },
        { id: "5", date: "2025-03-03", category: "Cable Charge", servedBy: "Technician 2", serviceCharge: 500, description: "Extra cable run 50m" },
        { id: "6", date: "2025-03-03", category: "Internet Service", servedBy: "Admin", serviceCharge: 2000, description: "Monthly subscription - Package C" },
        { id: "7", date: "2025-03-04", category: "Reconnection Fee", servedBy: "Admin", serviceCharge: 300, description: "Account reactivation" },
        { id: "8", date: "2025-03-04", category: "Other Service", servedBy: "Technician 1", serviceCharge: 800, description: "WiFi extender setup" },
        { id: "9", date: "2025-03-05", category: "Internet Service", servedBy: "Admin", serviceCharge: 1500, description: "Monthly subscription - Package A" },
        { id: "10", date: "2025-03-05", category: "Installation Fee", servedBy: "Technician 2", serviceCharge: 2000, description: "New connection setup" },
        { id: "11", date: "2025-03-06", category: "Internet Service", servedBy: "Admin", serviceCharge: 1800, description: "Monthly subscription - Premium" },
        { id: "12", date: "2025-03-06", category: "Router Sale", servedBy: "Admin", serviceCharge: 4500, description: "Mikrotik hAP ac3" },
      ];
    }
    return payments.map((p) => ({
      id: p.id,
      date: format(new Date(p.created_at), "yyyy-MM-dd"),
      category: p.method === "cash" ? "Internet Service" : p.method === "online" ? "Online Payment" : "Internet Service",
      servedBy: "Staff",
      serviceCharge: Number(p.amount),
      description: p.notes || `Payment - ${p.reference || "N/A"}`,
    }));
  }, [payments]);

  // Filter
  const filtered = useMemo(() => {
    return incomeEntries.filter((entry) => {
      if (categoryFilter !== "all" && entry.category !== categoryFilter) return false;
      if (fromDate && new Date(entry.date) < fromDate) return false;
      if (toDate && new Date(entry.date) > toDate) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          entry.category.toLowerCase().includes(q) ||
          entry.servedBy.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q) ||
          entry.date.includes(q)
        );
      }
      return true;
    });
  }, [incomeEntries, categoryFilter, fromDate, toDate, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  const totalCharge = filtered.reduce((s, e) => s + e.serviceCharge, 0);
  const pageTotal = paginated.reduce((s, e) => s + e.serviceCharge, 0);

  return (
    <PageContainer
      title="Daily Income"
      description="All Daily Incomes"
      actions={
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Income
        </Button>
      }
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground -mt-4">
        <span>Income</span>
        <span>/</span>
        <span className="text-foreground font-medium">Daily Income</span>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Category</Label>
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {INCOME_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !fromDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={fromDate} onSelect={(d) => { setFromDate(d); setCurrentPage(1); }} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !toDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={toDate} onSelect={(d) => { setToDate(d); setCurrentPage(1); }} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show entries + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select value={String(entriesPerPage)} onValueChange={(v) => { setEntriesPerPage(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">entries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Search:</span>
          <Input className="h-8 w-48" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search..." />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Served By</TableHead>
                  <TableHead className="text-right">Service Charge</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center w-24">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No income records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((entry, idx) => (
                    <TableRow key={entry.id} className="hover:bg-muted/30">
                      <TableCell className="text-center text-muted-foreground text-xs">
                        {(currentPage - 1) * entriesPerPage + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{format(new Date(entry.date), "dd MMM yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">{entry.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{entry.servedBy}</TableCell>
                      <TableCell className="text-right font-semibold text-sm">৳{entry.serviceCharge.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{entry.description}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {paginated.length > 0 && (
                <TableFooter>
                  <TableRow className="bg-primary/5 font-bold">
                    <TableCell colSpan={4} className="text-right">TOTAL</TableCell>
                    <TableCell className="text-right text-primary">৳{pageTotal.toLocaleString()}</TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to{" "}
          {Math.min(currentPage * entriesPerPage, filtered.length)} of {filtered.length} entries
          {filtered.length < incomeEntries.length && ` (filtered from ${incomeEntries.length} total entries)`}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = currentPage <= 3 ? i + 1 : currentPage + i - 2;
            if (page < 1 || page > totalPages) return null;
            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            );
          })}
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add Income Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Income</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {INCOME_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Service Charge (৳)</Label>
              <Input type="number" placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Description..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Income entry saved (demo)"); setShowAddDialog(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
