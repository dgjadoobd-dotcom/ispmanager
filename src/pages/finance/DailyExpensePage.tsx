import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Plus, CalendarIcon, FileText, FileDown, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const EXPENSE_CATEGORIES = [
  "Office Rent",
  "Salary",
  "Internet Bill",
  "Electricity",
  "Transport",
  "Maintenance",
  "Equipment",
  "Miscellaneous",
];

const RESPONSIBLE_PERSONS = ["Admin", "Manager", "Accountant", "Technician 1", "Technician 2"];

interface ExpenseEntry {
  id: string;
  date: string;
  category: string;
  amount: number;
  details: string;
  responsible: string;
  createdBy: string;
}

const DEMO_EXPENSES: ExpenseEntry[] = [
  { id: "1", date: "2025-03-01", category: "Office Rent", amount: 15000, details: "Monthly office rent - March", responsible: "Manager", createdBy: "Admin" },
  { id: "2", date: "2025-03-01", category: "Electricity", amount: 3500, details: "Electricity bill - February", responsible: "Accountant", createdBy: "Admin" },
  { id: "3", date: "2025-03-02", category: "Internet Bill", amount: 5000, details: "Office internet connection", responsible: "Admin", createdBy: "Admin" },
  { id: "4", date: "2025-03-03", category: "Transport", amount: 800, details: "Fuel for service vehicle", responsible: "Technician 1", createdBy: "Manager" },
  { id: "5", date: "2025-03-03", category: "Maintenance", amount: 2500, details: "Router repair parts", responsible: "Technician 2", createdBy: "Admin" },
  { id: "6", date: "2025-03-04", category: "Equipment", amount: 12000, details: "New fiber splicer tool", responsible: "Manager", createdBy: "Admin" },
  { id: "7", date: "2025-03-04", category: "Transport", amount: 600, details: "Client visit transportation", responsible: "Technician 1", createdBy: "Manager" },
  { id: "8", date: "2025-03-05", category: "Salary", amount: 25000, details: "Technician salary - partial", responsible: "Accountant", createdBy: "Admin" },
  { id: "9", date: "2025-03-05", category: "Miscellaneous", amount: 1200, details: "Office supplies - paper, toner", responsible: "Admin", createdBy: "Admin" },
  { id: "10", date: "2025-03-06", category: "Maintenance", amount: 3000, details: "Cable replacement - Zone A", responsible: "Technician 2", createdBy: "Manager" },
  { id: "11", date: "2025-03-06", category: "Electricity", amount: 1500, details: "Generator fuel", responsible: "Admin", createdBy: "Admin" },
  { id: "12", date: "2025-03-07", category: "Equipment", amount: 8500, details: "ONU batch purchase (10 units)", responsible: "Manager", createdBy: "Admin" },
];

export default function DailyExpensePage() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [responsibleFilter, setResponsibleFilter] = useState("all");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filtered = useMemo(() => {
    return DEMO_EXPENSES.filter((entry) => {
      if (categoryFilter !== "all" && entry.category !== categoryFilter) return false;
      if (responsibleFilter !== "all" && entry.responsible !== responsibleFilter) return false;
      if (fromDate && new Date(entry.date) < fromDate) return false;
      if (toDate && new Date(entry.date) > toDate) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          entry.category.toLowerCase().includes(q) ||
          entry.responsible.toLowerCase().includes(q) ||
          entry.details.toLowerCase().includes(q) ||
          entry.createdBy.toLowerCase().includes(q) ||
          entry.date.includes(q)
        );
      }
      return true;
    });
  }, [categoryFilter, responsibleFilter, fromDate, toDate, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  const pageTotal = paginated.reduce((s, e) => s + e.amount, 0);

  return (
    <PageContainer
      title="Daily Expense Sheet"
      description="All Daily Expenses"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info("PDF generation (demo)")}>
            <FileText className="h-4 w-4" /> Generate PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info("CSV export (demo)")}>
            <FileDown className="h-4 w-4" /> Generate CSV
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Expense
          </Button>
        </div>
      }
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground -mt-4">
        <span>Expense</span>
        <span>/</span>
        <span className="text-foreground font-medium">Daily Expense Sheet</span>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Category</Label>
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Responsible</Label>
              <Select value={responsibleFilter} onValueChange={(v) => { setResponsibleFilter(v); setCurrentPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Persons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Persons</SelectItem>
                  {RESPONSIBLE_PERSONS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Responsible</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-center w-24">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No expense records found
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
                      <TableCell className="text-right font-semibold text-sm">৳{entry.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{entry.details}</TableCell>
                      <TableCell className="text-sm">{entry.responsible}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{entry.createdBy}</TableCell>
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
                    <TableCell colSpan={3} className="text-right">TOTAL</TableCell>
                    <TableCell className="text-right text-primary">৳{pageTotal.toLocaleString()}</TableCell>
                    <TableCell colSpan={4} />
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
          {filtered.length < DEMO_EXPENSES.length && ` (filtered from ${DEMO_EXPENSES.length} total entries)`}
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

      {/* Add Expense Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (৳)</Label>
              <Input type="number" placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Responsible</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
                <SelectContent>
                  {RESPONSIBLE_PERSONS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Details</Label>
              <Textarea placeholder="Expense details..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Expense entry saved (demo)"); setShowAddDialog(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
