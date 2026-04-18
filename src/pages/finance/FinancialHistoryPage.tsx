import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, FileText, FileSpreadsheet, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { usePayments } from "@/hooks/usePayments";
import { useTenantContext } from "@/contexts/TenantContext";
import { useDemoMode } from "@/contexts/DemoModeContext";

const demoTransactions = [
  { id: "1", transactionFor: "Bill", transactionType: "Income", toWhom: "Rahim Uddin", generatedAmount: 1200, receivedAmount: 1200, discount: 0, paymentMethod: "Cash", createdBy: "Admin", creationDate: "2026-03-01", receivedBy: "Admin", receivedDate: "2026-03-01" },
  { id: "2", transactionFor: "Service", transactionType: "Income", toWhom: "Karim Hossain", generatedAmount: 500, receivedAmount: 500, discount: 0, paymentMethod: "bKash", createdBy: "Admin", creationDate: "2026-03-02", receivedBy: "Staff 1", receivedDate: "2026-03-02" },
  { id: "3", transactionFor: "Bill", transactionType: "Income", toWhom: "Jamal Ahmed", generatedAmount: 800, receivedAmount: 750, discount: 50, paymentMethod: "Cash", createdBy: "Staff 1", creationDate: "2026-03-03", receivedBy: "Admin", receivedDate: "2026-03-03" },
  { id: "4", transactionFor: "Expense", transactionType: "Expense", toWhom: "Cable Supplier", generatedAmount: 5000, receivedAmount: 5000, discount: 0, paymentMethod: "Bank Transfer", createdBy: "Admin", creationDate: "2026-03-04", receivedBy: "-", receivedDate: "2026-03-04" },
  { id: "5", transactionFor: "Bill", transactionType: "Income", toWhom: "Sumon Khan", generatedAmount: 1500, receivedAmount: 1500, discount: 0, paymentMethod: "Nagad", createdBy: "Staff 2", creationDate: "2026-03-05", receivedBy: "Staff 2", receivedDate: "2026-03-05" },
  { id: "6", transactionFor: "Service", transactionType: "Income", toWhom: "Habib Rahman", generatedAmount: 300, receivedAmount: 300, discount: 0, paymentMethod: "Cash", createdBy: "Admin", creationDate: "2026-03-06", receivedBy: "Admin", receivedDate: "2026-03-06" },
  { id: "7", transactionFor: "Expense", transactionType: "Expense", toWhom: "Office Rent", generatedAmount: 10000, receivedAmount: 10000, discount: 0, paymentMethod: "Bank Transfer", createdBy: "Admin", creationDate: "2026-03-07", receivedBy: "-", receivedDate: "2026-03-07" },
  { id: "8", transactionFor: "Bill", transactionType: "Income", toWhom: "Nasir Uddin", generatedAmount: 1000, receivedAmount: 900, discount: 100, paymentMethod: "Cash", createdBy: "Staff 1", creationDate: "2026-03-08", receivedBy: "Staff 1", receivedDate: "2026-03-08" },
];

export default function FinancialHistoryPage() {
  const { currentTenant } = useTenantContext();
  const { isDemoMode } = useDemoMode();
  const { data: payments } = usePayments(currentTenant?.id);

  const [transactionFor, setTransactionFor] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [createdBy, setCreatedBy] = useState("all");
  const [receivedBy, setReceivedBy] = useState("all");
  const [createdFor, setCreatedFor] = useState("all");
  const [generatedFrom, setGeneratedFrom] = useState<Date>();
  const [generatedTo, setGeneratedTo] = useState<Date>();
  const [receiveFrom, setReceiveFrom] = useState<Date>();
  const [receiveTo, setReceiveTo] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const transactions = useMemo(() => {
    if (isDemoMode || !payments?.length) return demoTransactions;
    return payments.map((p) => ({
      id: p.id,
      transactionFor: "Bill",
      transactionType: "Income",
      toWhom: p.customer?.name || "-",
      generatedAmount: Number(p.amount),
      receivedAmount: Number(p.amount),
      discount: 0,
      paymentMethod: p.method || "Cash",
      createdBy: "Admin",
      creationDate: p.created_at?.split("T")[0] || "-",
      receivedBy: "Admin",
      receivedDate: p.created_at?.split("T")[0] || "-",
    }));
  }, [payments, isDemoMode]);

  const filtered = useMemo(() => {
    let result = transactions;
    if (transactionFor !== "all") result = result.filter((t) => t.transactionFor === transactionFor);
    if (paymentMethod !== "all") result = result.filter((t) => t.paymentMethod === paymentMethod);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.toWhom.toLowerCase().includes(q) || t.transactionFor.toLowerCase().includes(q));
    }
    return result;
  }, [transactions, transactionFor, paymentMethod, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  const startEntry = filtered.length ? (currentPage - 1) * entriesPerPage + 1 : 0;
  const endEntry = Math.min(currentPage * entriesPerPage, filtered.length);

  const DatePicker = ({ date, setDate, label }: { date?: Date; setDate: (d?: Date) => void; label: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 text-xs", !date && "text-muted-foreground")}>
          <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
          {date ? format(date, "yyyy-MM-dd") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Transactions</h1>
          <p className="text-sm text-muted-foreground">Get Financial Transactions</p>
          <nav className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <span>Daily Account</span>
            <span>›</span>
            <span className="text-foreground font-medium">Financial Transactions</span>
          </nav>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Generate PDF
          </Button>
          <Button size="sm" variant="success" className="gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Generate CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Row 1: Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Transaction For</label>
              <Select value={transactionFor} onValueChange={setTransactionFor}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Bill">Bill</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="bKash">bKash</SelectItem>
                  <SelectItem value="Nagad">Nagad</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Created By</label>
              <Select value={createdBy} onValueChange={setCreatedBy}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Staff 1">Staff 1</SelectItem>
                  <SelectItem value="Staff 2">Staff 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Received By</label>
              <Select value={receivedBy} onValueChange={setReceivedBy}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Staff 1">Staff 1</SelectItem>
                  <SelectItem value="Staff 2">Staff 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Created/Received For</label>
              <Select value={createdFor} onValueChange={setCreatedFor}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Bill">Bill</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Date pickers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Generated From</label>
              <DatePicker date={generatedFrom} setDate={setGeneratedFrom} label="From date" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Generated To</label>
              <DatePicker date={generatedTo} setDate={setGeneratedTo} label="To date" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Receive From</label>
              <DatePicker date={receiveFrom} setDate={setReceiveFrom} label="From date" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Receive To</label>
              <DatePicker date={receiveTo} setDate={setReceiveTo} label="To date" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Show</span>
          <Select value={String(entriesPerPage)} onValueChange={(v) => { setEntriesPerPage(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="h-8 w-[70px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">entries</span>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-8 h-8 text-xs" />
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold">Transaction For</TableHead>
                  <TableHead className="text-xs font-semibold">Transaction Type</TableHead>
                  <TableHead className="text-xs font-semibold">To Whom</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Generated Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Received/Paid</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Discount</TableHead>
                  <TableHead className="text-xs font-semibold">Payment Method</TableHead>
                  <TableHead className="text-xs font-semibold">Created By</TableHead>
                  <TableHead className="text-xs font-semibold">Creation Date</TableHead>
                  <TableHead className="text-xs font-semibold">Received By</TableHead>
                  <TableHead className="text-xs font-semibold">Received Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">No transactions found</TableCell>
                  </TableRow>
                ) : (
                  paginated.map((t) => (
                    <TableRow key={t.id} className="text-xs">
                      <TableCell>{t.transactionFor}</TableCell>
                      <TableCell>{t.transactionType}</TableCell>
                      <TableCell className="font-medium">{t.toWhom}</TableCell>
                      <TableCell className="text-right">{t.generatedAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{t.receivedAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{t.discount}</TableCell>
                      <TableCell>{t.paymentMethod}</TableCell>
                      <TableCell>{t.createdBy}</TableCell>
                      <TableCell>{t.creationDate}</TableCell>
                      <TableCell>{t.receivedBy}</TableCell>
                      <TableCell>{t.receivedDate}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
        <span>Showing {startEntry} to {endEntry} of {filtered.length} entries</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
