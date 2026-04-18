import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Plus,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  CalendarIcon,
  Search,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface JournalEntry {
  id: string;
  journalDate: string;
  voucherNumber: string;
  accountDr: string;
  accountCr: string;
  amount: number;
  description: string;
  createdBy: string;
  creationDate: string;
  approvedBy: string | null;
  approvedDate: string | null;
  status: "Approved" | "Pending" | "Rejected";
}

const demoData: JournalEntry[] = [
  { id: "1", journalDate: "2025-03-01", voucherNumber: "JV-2025-001", accountDr: "Cash in Hand", accountCr: "Service Revenue", amount: 15000, description: "Monthly subscription collection", createdBy: "Admin", creationDate: "2025-03-01", approvedBy: "Manager", approvedDate: "2025-03-01", status: "Approved" },
  { id: "2", journalDate: "2025-03-02", voucherNumber: "JV-2025-002", accountDr: "Office Rent", accountCr: "Cash in Hand", amount: 25000, description: "Office rent payment for March", createdBy: "Admin", creationDate: "2025-03-02", approvedBy: "Manager", approvedDate: "2025-03-02", status: "Approved" },
  { id: "3", journalDate: "2025-03-03", voucherNumber: "JV-2025-003", accountDr: "Internet Bandwidth", accountCr: "Bank Account", amount: 50000, description: "Bandwidth purchase from upstream", createdBy: "Staff", creationDate: "2025-03-03", approvedBy: null, approvedDate: null, status: "Pending" },
  { id: "4", journalDate: "2025-03-05", voucherNumber: "JV-2025-004", accountDr: "Salary Expense", accountCr: "Bank Account", amount: 80000, description: "Staff salary for February", createdBy: "Admin", creationDate: "2025-03-05", approvedBy: "Manager", approvedDate: "2025-03-06", status: "Approved" },
  { id: "5", journalDate: "2025-03-07", voucherNumber: "JV-2025-005", accountDr: "Network Equipment", accountCr: "Accounts Payable", amount: 120000, description: "OLT device purchase", createdBy: "Staff", creationDate: "2025-03-07", approvedBy: null, approvedDate: null, status: "Pending" },
  { id: "6", journalDate: "2025-03-08", voucherNumber: "JV-2025-006", accountDr: "Cash in Hand", accountCr: "Service Revenue", amount: 8500, description: "New connection fees", createdBy: "Admin", creationDate: "2025-03-08", approvedBy: "Manager", approvedDate: "2025-03-08", status: "Approved" },
  { id: "7", journalDate: "2025-03-10", voucherNumber: "JV-2025-007", accountDr: "Electricity Bill", accountCr: "Cash in Hand", amount: 12000, description: "Server room electricity", createdBy: "Staff", creationDate: "2025-03-10", approvedBy: null, approvedDate: null, status: "Rejected" },
  { id: "8", journalDate: "2025-03-12", voucherNumber: "JV-2025-008", accountDr: "Bank Account", accountCr: "Service Revenue", amount: 45000, description: "Online payment collection", createdBy: "Admin", creationDate: "2025-03-12", approvedBy: "Manager", approvedDate: "2025-03-13", status: "Approved" },
];

const allAccounts = ["Cash in Hand", "Bank Account", "Service Revenue", "Office Rent", "Internet Bandwidth", "Salary Expense", "Network Equipment", "Accounts Payable", "Electricity Bill"];

const JournalVoucherPage: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return demoData.filter((entry) => {
      if (statusFilter !== "all" && entry.status !== statusFilter) return false;
      if (accountFilter !== "all" && entry.accountDr !== accountFilter && entry.accountCr !== accountFilter) return false;
      if (fromDate && new Date(entry.journalDate) < fromDate) return false;
      if (toDate && new Date(entry.journalDate) > toDate) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          entry.voucherNumber.toLowerCase().includes(q) ||
          entry.accountDr.toLowerCase().includes(q) ||
          entry.accountCr.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [statusFilter, accountFilter, fromDate, toDate, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((e) => e.id)));
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Approved: "bg-success/15 text-success border-success/30",
      Pending: "bg-warning/15 text-warning border-warning/30",
      Rejected: "bg-destructive/15 text-destructive border-destructive/30",
    };
    return <Badge variant="outline" className={cn("font-medium", map[status])}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">Accounting &gt; Journal Voucher</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Journal Voucher</h1>
            <p className="text-muted-foreground text-sm">Journal Voucher List</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="success" size="sm" disabled={selectedIds.size === 0}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Approve Selected
            </Button>
            <Button variant="destructive" size="sm" disabled={selectedIds.size === 0}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Journal
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">Filter by</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {allAccounts.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal w-full", !fromDate && "text-muted-foreground")}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                {fromDate ? format(fromDate, "PPP") : "From Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={fromDate} onSelect={setFromDate} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal w-full", !toDate && "text-muted-foreground")}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                {toDate ? format(toDate, "PPP") : "To Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={toDate} onSelect={setToDate} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Show entries + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Show</span>
          <Select value={String(entriesPerPage)} onValueChange={(v) => { setEntriesPerPage(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">entries</span>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 h-9" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10"><Checkbox checked={selectedIds.size === paginated.length && paginated.length > 0} onCheckedChange={toggleAll} /></TableHead>
                <TableHead>Journal Date</TableHead>
                <TableHead>Voucher No.</TableHead>
                <TableHead>Account (Dr)</TableHead>
                <TableHead>Account (Cr)</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Creation Date</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Approved Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-10 text-muted-foreground">No journal entries found.</TableCell>
                </TableRow>
              ) : (
                paginated.map((entry) => (
                  <TableRow key={entry.id} className={cn(selectedIds.has(entry.id) && "bg-primary/5")}>
                    <TableCell><Checkbox checked={selectedIds.has(entry.id)} onCheckedChange={() => toggleSelect(entry.id)} /></TableCell>
                    <TableCell className="whitespace-nowrap">{entry.journalDate}</TableCell>
                    <TableCell className="font-medium text-primary">{entry.voucherNumber}</TableCell>
                    <TableCell>{entry.accountDr}</TableCell>
                    <TableCell>{entry.accountCr}</TableCell>
                    <TableCell className="text-right font-mono font-medium">{entry.amount.toLocaleString()}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                    <TableCell>{entry.createdBy}</TableCell>
                    <TableCell className="whitespace-nowrap">{entry.creationDate}</TableCell>
                    <TableCell>{entry.approvedBy || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{entry.approvedDate || "—"}</TableCell>
                    <TableCell>{statusBadge(entry.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-muted/70 font-semibold">
                <TableCell colSpan={5} className="text-right">Total</TableCell>
                <TableCell className="text-right font-mono">{totalAmount.toLocaleString()}</TableCell>
                <TableCell colSpan={7} />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filtered.length)} of {filtered.length} entries</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </Button>
          ))}
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JournalVoucherPage;
