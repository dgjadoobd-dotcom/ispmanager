import { useState } from "react";
import {
  Receipt,
  Download,
  Search,
  Plus,
  Eye,
  Send,
  MoreHorizontal,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  RefreshCw,
  Ban,
  RotateCcw,
  MapPin,
  ChevronDown,
  ChevronUp,
  Users,
  DollarSign,
  Wallet,
  TrendingUp,
  
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { InvoiceDetailDialog, type InvoiceDetail } from "@/components/billing/InvoiceDetailDialog";
import { RecordPaymentDialog } from "@/components/billing/RecordPaymentDialog";
import { useBills, useGenerateBills, type Bill } from "@/hooks/useBills";
import { useTenantContext } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { downloadInvoicePdf } from "@/lib/generateInvoicePdf";
import type { PaymentStatus } from "@/types";
import { useDemoMode } from "@/contexts/DemoModeContext";

// Demo billing list data
const demoBillingList = [
  { id: "BL-001", cCode: "C001", idIp: "192.168.1.10", name: "Rahim Ahmed", mobile: "01712345678", zone: "Zone-A", cusType: "Home", connType: "Fiber", package: "Home 20", speed: "20 Mbps", exDate: "2025-04-15", mBill: 800, received: 800 },
  { id: "BL-002", cCode: "C002", idIp: "192.168.1.11", name: "Fatima Begum", mobile: "01812345679", zone: "Zone-B", cusType: "Home", connType: "Fiber", package: "Pro 50", speed: "50 Mbps", exDate: "2025-04-15", mBill: 1500, received: 0 },
  { id: "BL-003", cCode: "C003", idIp: "192.168.1.12", name: "Kamal Hossain", mobile: "01912345680", zone: "Zone-A", cusType: "Home", connType: "Cable", package: "Starter 10", speed: "10 Mbps", exDate: "2025-03-10", mBill: 600, received: 0 },
  { id: "BL-004", cCode: "C004", idIp: "192.168.1.13", name: "Nusrat Jahan", mobile: "01612345681", zone: "Zone-C", cusType: "Corporate", connType: "Fiber", package: "Home 20", speed: "20 Mbps", exDate: "2025-04-20", mBill: 800, received: 800 },
  { id: "BL-005", cCode: "C005", idIp: "192.168.1.14", name: "Shahin Alam", mobile: "01512345682", zone: "Zone-B", cusType: "Home", connType: "Fiber", package: "Ultra 100", speed: "100 Mbps", exDate: "2025-04-10", mBill: 3000, received: 0 },
  { id: "BL-006", cCode: "C006", idIp: "192.168.1.15", name: "Anika Rahman", mobile: "01312345683", zone: "Zone-A", cusType: "Home", connType: "Fiber", package: "Pro 50", speed: "50 Mbps", exDate: "2025-04-25", mBill: 1500, received: 1500 },
  { id: "BL-007", cCode: "C007", idIp: "192.168.1.16", name: "Tanvir Islam", mobile: "01412345684", zone: "Zone-C", cusType: "Home", connType: "Cable", package: "Home 20", speed: "20 Mbps", exDate: "2025-04-18", mBill: 800, received: 0 },
  { id: "BL-008", cCode: "C008", idIp: "192.168.1.17", name: "Mithila Das", mobile: "01712345699", zone: "Zone-A", cusType: "Home", connType: "Fiber", package: "Starter 10", speed: "10 Mbps", exDate: "2025-04-30", mBill: 600, received: 600 },
];

const statusConfig: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ComponentType<{ className?: string }> }
> = {
  paid: { label: "Paid", variant: "default", icon: CheckCircle },
  due: { label: "Due", variant: "secondary", icon: Clock },
  partial: { label: "Partial", variant: "outline", icon: AlertCircle },
  overdue: { label: "Overdue", variant: "destructive", icon: AlertCircle },
};

function transformBillToInvoiceDetail(bill: Bill): InvoiceDetail {
  const paidAmount = bill.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  
  return {
    id: bill.invoice_number,
    customerId: bill.customer_id,
    customerName: bill.customer?.name || "Unknown Customer",
    customerPhone: bill.customer?.phone || "",
    customerEmail: bill.customer?.email || undefined,
    customerAddress: bill.customer?.address || undefined,
    packageName: bill.customer?.package?.name || "No Package",
    amount: Number(bill.amount),
    dueDate: new Date(bill.due_date),
    status: (bill.status || "due") as PaymentStatus,
    billingPeriod: {
      start: new Date(bill.billing_period_start),
      end: new Date(bill.billing_period_end),
    },
    createdAt: new Date(bill.created_at),
    paidAmount,
    lineItems: [
      {
        id: "1",
        description: `Monthly Internet Subscription - ${bill.customer?.package?.name || "Standard"}`,
        quantity: 1,
        unitPrice: Number(bill.amount),
        total: Number(bill.amount),
      },
    ],
    payments: bill.payments?.map((p) => ({
      id: p.id,
      date: new Date(p.created_at),
      amount: Number(p.amount),
      method: (p.method as "cash" | "online" | "bank_transfer") || "cash",
      reference: p.reference || undefined,
      receivedBy: "Staff",
    })) || [],
    notes: bill.notes || undefined,
  };
}

export default function Billing() {
  const { toast } = useToast();
  const { currentTenant } = useTenantContext();
  const { isDemoMode } = useDemoMode();
  const { data: bills, isLoading, error } = useBills(currentTenant?.id);
  const generateBills = useGenerateBills();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    billId: string;
    customerId: string;
    customerName: string;
    invoiceNumber: string;
    outstandingAmount: number;
  } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleGenerateBills = async () => {
    if (!currentTenant?.id) {
      toast({ title: "Error", description: "Tenant not found", variant: "destructive" });
      return;
    }
    const [year, month] = selectedMonth.split('-').map(Number);
    const billingPeriodStart = new Date(year, month - 1, 1);
    const billingPeriodEnd = new Date(year, month, 0);
    const dueDate = new Date(year, month - 1, 15);
    try {
      const result = await generateBills.mutateAsync({
        tenantId: currentTenant.id,
        billingPeriodStart: billingPeriodStart.toISOString().split('T')[0],
        billingPeriodEnd: billingPeriodEnd.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
      });
      toast({ title: "Bills generated", description: `Bills generated for ${result.length} customer(s)` });
      setIsGenerateDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Failed to generate bills", description: error.message, variant: "destructive" });
    }
  };

  const filteredBills = (bills || []).filter((bill) => {
    const matchesSearch =
      bill.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBilled = (bills || []).reduce((sum, bill) => sum + Number(bill.amount), 0);
  const totalPaid = (bills || []).reduce((sum, bill) => {
    const paid = bill.payments?.reduce((s, p) => s + Number(p.amount), 0) || 0;
    return sum + paid;
  }, 0);
  const totalDue = totalBilled - totalPaid;
  const paidCount = (bills || []).filter((b) => b.status === "paid").length;
  const unpaidCount = (bills || []).filter((b) => b.status !== "paid").length;

  // Demo metrics
  const demoTotalBill = demoBillingList.reduce((s, r) => s + r.mBill, 0);
  const demoReceived = demoBillingList.reduce((s, r) => s + r.received, 0);
  const demoDue = demoTotalBill - demoReceived;
  const demoPaidCount = demoBillingList.filter(r => r.received >= r.mBill).length;
  const demoUnpaidCount = demoBillingList.filter(r => r.received < r.mBill).length;

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(d);
  };

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  const handleViewInvoice = (bill: Bill) => {
    setSelectedInvoice(transformBillToInvoiceDetail(bill));
    setIsDetailDialogOpen(true);
  };

  const handleRecordPayment = (bill: Bill) => {
    const paidAmount = bill.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const outstanding = Number(bill.amount) - paidAmount;
    setPaymentDialog({
      open: true,
      billId: bill.id,
      customerId: bill.customer_id,
      customerName: bill.customer?.name || "Unknown",
      invoiceNumber: bill.invoice_number,
      outstandingAmount: outstanding,
    });
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const toggleAllRows = () => {
    if (isDemoMode) {
      setSelectedRows(selectedRows.length === demoBillingList.length ? [] : demoBillingList.map(r => r.id));
    }
  };

  if (isLoading && !isDemoMode) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !isDemoMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Failed to load billing data</p>
        <p className="text-sm text-destructive">{error.message}</p>
      </div>
    );
  }

  // Summary card data
  const summaryCards = [
    { label: "Paid Client", value: isDemoMode ? demoPaidCount : paidCount, icon: Users, gradient: "from-emerald-500 to-emerald-600" },
    { label: "Unpaid Client", value: isDemoMode ? demoUnpaidCount : unpaidCount, icon: Users, gradient: "from-rose-500 to-rose-600" },
    { label: "Received Bill", value: formatCurrency(isDemoMode ? demoReceived : totalPaid), icon: CheckCircle, gradient: "from-sky-500 to-sky-600" },
    { label: "Due Amount", value: formatCurrency(isDemoMode ? demoDue : totalDue), icon: AlertCircle, gradient: "from-amber-500 to-amber-600" },
  ];

  const summaryCards2 = [
    { label: "Generated Bill", value: isDemoMode ? demoBillingList.length : (bills?.length || 0), icon: FileText, gradient: "from-violet-500 to-violet-600" },
    { label: "Advance Amount", value: formatCurrency(0), icon: Wallet, gradient: "from-teal-500 to-teal-600" },
    { label: "Monthly Bill", value: formatCurrency(isDemoMode ? demoTotalBill : totalBilled), icon: TrendingUp, gradient: "from-indigo-500 to-indigo-600" },
  ];

  const displayData = isDemoMode ? demoBillingList : [];
  const filteredDisplayData = displayData.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.mobile.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing List</h1>
          <p className="text-sm text-muted-foreground">Manage invoices, generate bills, and track payment status</p>
        </div>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Generate Bills
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Monthly Bills</DialogTitle>
              <DialogDescription>Generate bills for all active customers for the selected billing period.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Billing Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const months = [];
                      const now = new Date();
                      for (let i = 0; i < 6; i++) {
                        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                        months.push(<SelectItem key={value} value={value}>{label}</SelectItem>);
                      }
                      return months;
                    })()}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">Invoices will be generated for active customers based on their package price.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleGenerateBills} disabled={generateBills.isPending}>
                {generateBills.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Bills
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <Button size="sm" className="gap-1.5 text-xs">
          <FileSpreadsheet className="h-3.5 w-3.5" /> Generate Excel
        </Button>
        <Button size="sm" className="gap-1.5 text-xs">
          <FileText className="h-3.5 w-3.5" /> Generate PDF
        </Button>
        <Button size="sm" className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Sync Clients & Servers
        </Button>
        <Button size="sm" className="gap-1.5 text-xs">
          <Ban className="h-3.5 w-3.5" /> Disable Selected
        </Button>
        <Button size="sm" className="gap-1.5 text-xs">
          <RotateCcw className="h-3.5 w-3.5" /> Bulk Status Change
        </Button>
        <Button size="sm" className="gap-1.5 text-xs">
          <MapPin className="h-3.5 w-3.5" /> Bulk Zone Change
        </Button>
      </div>

      {/* Summary Cards Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-xl bg-gradient-to-br ${card.gradient} p-4 text-white shadow-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-90">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <card.icon className="h-8 w-8 opacity-80" />
            </div>
          </div>
        ))}
      </div>

      {/* Summary Cards Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {summaryCards2.map((card) => (
          <div key={card.label} className={`rounded-xl bg-gradient-to-br ${card.gradient} p-4 text-white shadow-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-90">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <card.icon className="h-8 w-8 opacity-80" />
            </div>
          </div>
        ))}
      </div>

      {/* Collapsible Filter Panel */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <div className="flex justify-center">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {filtersOpen ? "Hide Filters" : "Show Filters"}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <Card className="mt-3">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  "Server", "Protocol Type", "Profiles", "Zone", "Sub Zone", "Box",
                  "Package", "Billing Status", "Payment Status", "Mikrotik Status", "Connection Type", "Client Type",
                  "From Ex.Date", "To Ex.Date", "From EffectiveTo", "To EffectiveTo", "Area", "Reseller",
                ].map((label) => (
                  <div key={label} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    {label.includes("Date") || label.includes("Effective") ? (
                      <Input type="date" className="h-8 text-xs" />
                    ) : (
                      <Select>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder={`Select ${label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Entries + Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">entries</span>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          {isDemoMode ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary">
                    <TableHead className="text-primary-foreground">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedRows.length === demoBillingList.length}
                        onChange={toggleAllRows}
                      />
                    </TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">C.Code</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">ID/IP</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">Cus. Name</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">Mobile</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">Zone</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">Cus. Type</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">Conn. Type</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">Package</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">Speed</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">Ex.Date</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">M.Bill</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">Received</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDisplayData.map((row, idx) => (
                    <TableRow key={row.id} className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleRowSelection(row.id)}
                        />
                      </TableCell>
                      <TableCell className="text-xs font-medium">{row.cCode}</TableCell>
                      <TableCell className="text-xs">{row.idIp}</TableCell>
                      <TableCell className="text-xs font-medium">{row.name}</TableCell>
                      <TableCell className="text-xs">{row.mobile}</TableCell>
                      <TableCell className="text-xs">{row.zone}</TableCell>
                      <TableCell className="text-xs">{row.cusType}</TableCell>
                      <TableCell className="text-xs">{row.connType}</TableCell>
                      <TableCell className="text-xs">{row.package}</TableCell>
                      <TableCell className="text-xs">{row.speed}</TableCell>
                      <TableCell className="text-xs">{row.exDate}</TableCell>
                      <TableCell className="text-xs font-semibold">{formatCurrency(row.mBill)}</TableCell>
                      <TableCell className="text-xs font-semibold">
                        <span className={row.received >= row.mBill ? "text-emerald-600" : "text-destructive"}>
                          {formatCurrency(row.received)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No invoices found</p>
              <p className="text-sm text-muted-foreground">
                {bills?.length === 0 ? "Generate bills to get started" : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary">
                    <TableHead className="text-primary-foreground text-xs font-semibold">Invoice ID</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">Customer</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">Billing Period</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">Amount</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">Due Date</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-primary-foreground text-xs font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill, idx) => {
                    const status = (bill.status || "due") as PaymentStatus;
                    const StatusIcon = statusConfig[status].icon;
                    return (
                      <TableRow
                        key={bill.id}
                        className={`cursor-pointer ${idx % 2 === 0 ? "bg-background" : "bg-muted/30"}`}
                        onClick={() => handleViewInvoice(bill)}
                      >
                        <TableCell className="text-xs font-medium">{bill.invoice_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-medium">{bill.customer?.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{bill.customer?.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(bill.billing_period_start)} - {formatDate(bill.billing_period_end)}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">{formatCurrency(Number(bill.amount))}</TableCell>
                        <TableCell className="text-xs">{formatDate(bill.due_date)}</TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[status].variant} className="gap-1 text-xs">
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewInvoice(bill); }}>
                                <Eye className="mr-2 h-4 w-4" /> View Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                const invoiceDetail = transformBillToInvoiceDetail(bill);
                                downloadInvoicePdf(invoiceDetail);
                                toast({ title: "PDF Downloaded", description: `Invoice ${bill.invoice_number} has been downloaded.` });
                              }}>
                                <Download className="mr-2 h-4 w-4" /> Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <Send className="mr-2 h-4 w-4" /> Send to Customer
                              </DropdownMenuItem>
                              {bill.status !== "paid" && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRecordPayment(bill); }}>
                                  <Receipt className="mr-2 h-4 w-4" /> Record Payment
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing 1 to {isDemoMode ? filteredDisplayData.length : filteredBills.length} of{" "}
          {isDemoMode ? demoBillingList.length : (bills?.length || 0)} entries
        </span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button size="sm" className="min-w-[32px]">1</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>

      {/* Invoice Detail Dialog */}
      <InvoiceDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        invoice={selectedInvoice}
        branding={currentTenant ? {
          name: currentTenant.name,
          logoUrl: currentTenant.logo_url,
          primaryColor: currentTenant.primary_color,
          accentColor: currentTenant.accent_color,
        } : undefined}
        onRecordPayment={(invoiceId) => {
          const bill = bills?.find(b => b.invoice_number === invoiceId);
          if (bill) handleRecordPayment(bill);
        }}
      />

      {/* Record Payment Dialog */}
      {paymentDialog && currentTenant && (() => {
        const bill = bills?.find(b => b.id === paymentDialog.billId);
        const billingPeriod = bill
          ? `${formatDate(bill.billing_period_start)} - ${formatDate(bill.billing_period_end)}`
          : undefined;
        return (
          <RecordPaymentDialog
            open={paymentDialog.open}
            onOpenChange={(open) => setPaymentDialog(open ? paymentDialog : null)}
            billId={paymentDialog.billId}
            customerId={paymentDialog.customerId}
            tenantId={currentTenant.id}
            customerName={paymentDialog.customerName}
            customerPhone={bill?.customer?.phone}
            customerAddress={bill?.customer?.address || undefined}
            invoiceNumber={paymentDialog.invoiceNumber}
            billingPeriod={billingPeriod}
            outstandingAmount={paymentDialog.outstandingAmount}
            tenantName={currentTenant.name}
            tenantLogoUrl={currentTenant.logo_url}
            tenantPrimaryColor={currentTenant.primary_color}
            tenantAccentColor={currentTenant.accent_color}
          />
        );
      })()}
    </div>
  );
}
