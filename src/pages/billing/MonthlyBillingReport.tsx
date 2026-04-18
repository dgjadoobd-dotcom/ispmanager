import { useState, useMemo } from "react";
import { format } from "date-fns";
import { FileText, FileSpreadsheet, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, ChevronDown } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useCustomers } from "@/hooks/useCustomers";
import { useBills } from "@/hooks/useBills";
import { usePayments } from "@/hooks/usePayments";
import { useCurrentTenant } from "@/hooks/useTenant";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function MonthlyBillingReport() {
  const { data: tenant } = useCurrentTenant();
  const { data: customers = [], isLoading: customersLoading } = useCustomers(tenant?.id);
  const { data: bills = [], isLoading: billsLoading } = useBills(tenant?.id);
  const { data: payments = [], isLoading: paymentsLoading } = usePayments(tenant?.id);

  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth()));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [zoneFilter, setZoneFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [connTypeFilter, setConnTypeFilter] = useState("all");
  const [cusTypeFilter, setCusTypeFilter] = useState("all");

  const isLoading = customersLoading || billsLoading || paymentsLoading;

  // Build monthly report data by joining customers + bills + payments
  const reportData = useMemo(() => {
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);

    return customers.map((customer, index) => {
      // Find bills for this customer in the selected month
      const customerBills = bills.filter(b => {
        const billDate = new Date(b.billing_period_start);
        return b.customer_id === customer.id && billDate.getMonth() === month && billDate.getFullYear() === year;
      });

      const generated = customerBills.reduce((sum, b) => sum + Number(b.amount), 0);

      // Find payments for this customer in the selected month
      const customerPayments = payments.filter(p => {
        const payDate = new Date(p.created_at);
        return p.customer_id === customer.id && payDate.getMonth() === month && payDate.getFullYear() === year;
      });

      const received = customerPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const lastPayment = customerPayments.length > 0
        ? customerPayments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : null;

      const balanceDue = Math.max(0, generated - received);
      const advance = Math.max(0, received - generated);

      return {
        id: customer.id,
        cCode: `C-${String(index + 1).padStart(4, "0")}`,
        idIp: customer.network_username || "—",
        name: customer.name,
        mobile: customer.phone,
        zone: "Default",
        cusType: "Regular",
        connType: customer.connection_status || "active",
        packageName: (customer as any).packages?.name || "—",
        speed: (customer as any).packages?.speed_label || "—",
        generated,
        received,
        balanceDue,
        advance,
        paymentDate: lastPayment ? format(new Date(lastPayment.created_at), "dd/MM/yyyy") : "—",
        server: "MikroTik-1",
      };
    });
  }, [customers, bills, payments, selectedMonth, selectedYear]);

  // Apply filters
  const filtered = useMemo(() => {
    let result = reportData;

    if (packageFilter !== "all") {
      result = result.filter(r => r.packageName === packageFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.mobile.includes(q) ||
        r.cCode.toLowerCase().includes(q) ||
        r.idIp.toLowerCase().includes(q)
      );
    }
    return result;
  }, [reportData, packageFilter, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startEntry = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, filtered.length);

  // Totals
  const totals = useMemo(() => ({
    generated: filtered.reduce((s, r) => s + r.generated, 0),
    received: filtered.reduce((s, r) => s + r.received, 0),
    due: filtered.reduce((s, r) => s + r.balanceDue, 0),
    advance: filtered.reduce((s, r) => s + r.advance, 0),
  }), [filtered]);

  // Selection helpers
  const allSelected = paginated.length > 0 && paginated.every(r => selectedIds.has(r.id));
  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allSelected) {
      paginated.forEach(r => next.delete(r.id));
    } else {
      paginated.forEach(r => next.add(r.id));
    }
    setSelectedIds(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  // Unique packages for filter
  const uniquePackages = [...new Set(reportData.map(r => r.packageName).filter(p => p !== "—"))];

  // Page numbers
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <PageContainer
      title="Monthly Billing Report"
      description="Monthwise advance & due report"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileSpreadsheet className="h-4 w-4" />
            Generate CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Generate PDF
          </Button>
        </div>
      }
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground -mt-4 mb-2">
        <span>Billing</span>
        <span>/</span>
        <span className="text-foreground font-medium">Monthly Report</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-200/50">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Generated</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">৳{totals.generated.toLocaleString()}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/50">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Received</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">৳{totals.received.toLocaleString()}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-200/50">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Balance Due</p>
          <p className="text-2xl font-bold text-red-700 mt-1">৳{totals.due.toLocaleString()}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-200/50">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Advance</p>
          <p className="text-2xl font-bold text-violet-700 mt-1">৳{totals.advance.toLocaleString()}</p>
        </Card>
      </div>

      {/* Collapsible Filter */}
      <Collapsible open={filterOpen} onOpenChange={setFilterOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between gap-2 border-dashed">
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Click to filter data
            </span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", filterOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <Card className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Month</label>
                <Select value={selectedMonth} onValueChange={v => { setSelectedMonth(v); setCurrentPage(1); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map((m, i) => (
                      <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Year</label>
                <Select value={selectedYear} onValueChange={v => { setSelectedYear(v); setCurrentPage(1); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Zone</label>
                <Select value={zoneFilter} onValueChange={v => { setZoneFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger><SelectValue placeholder="All Zones" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Zones</SelectItem>
                    <SelectItem value="Default">Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Package</label>
                <Select value={packageFilter} onValueChange={v => { setPackageFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger><SelectValue placeholder="All Packages" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Packages</SelectItem>
                    {uniquePackages.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Conn. Type</label>
                <Select value={connTypeFilter} onValueChange={v => { setConnTypeFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Cus. Type</label>
                <Select value={cusTypeFilter} onValueChange={v => { setCusTypeFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Controls: Show entries + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Show</span>
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map(n => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">entries</span>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, mobile, code..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead className="whitespace-nowrap text-xs">C.Code</TableHead>
                <TableHead className="whitespace-nowrap text-xs">ID/IP</TableHead>
                <TableHead className="whitespace-nowrap text-xs">Name</TableHead>
                <TableHead className="whitespace-nowrap text-xs">Mobile</TableHead>
                <TableHead className="whitespace-nowrap text-xs">Zone</TableHead>
                <TableHead className="whitespace-nowrap text-xs">Cus.Type</TableHead>
                <TableHead className="whitespace-nowrap text-xs">Conn.Type</TableHead>
                <TableHead className="whitespace-nowrap text-xs">Package</TableHead>
                <TableHead className="whitespace-nowrap text-xs">Speed</TableHead>
                <TableHead className="whitespace-nowrap text-xs text-right">Generated</TableHead>
                <TableHead className="whitespace-nowrap text-xs text-right">Received</TableHead>
                <TableHead className="whitespace-nowrap text-xs text-right">BalanceDue</TableHead>
                <TableHead className="whitespace-nowrap text-xs text-right">Advance</TableHead>
                <TableHead className="whitespace-nowrap text-xs">PaymentDate</TableHead>
                <TableHead className="whitespace-nowrap text-xs">Server</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={16} className="text-center py-12 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={16} className="text-center py-12 text-muted-foreground">No data found for this month</TableCell>
                </TableRow>
              ) : (
                paginated.map(row => (
                  <TableRow key={row.id} className={cn(selectedIds.has(row.id) && "bg-primary/5")}>
                    <TableCell>
                      <Checkbox checked={selectedIds.has(row.id)} onCheckedChange={() => toggleOne(row.id)} />
                    </TableCell>
                    <TableCell className="text-xs font-mono">{row.cCode}</TableCell>
                    <TableCell className="text-xs font-mono">{row.idIp}</TableCell>
                    <TableCell className="text-xs font-medium whitespace-nowrap">{row.name}</TableCell>
                    <TableCell className="text-xs">{row.mobile}</TableCell>
                    <TableCell className="text-xs">{row.zone}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="text-[10px]">{row.cusType}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge
                        variant={row.connType === "active" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {row.connType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{row.packageName}</TableCell>
                    <TableCell className="text-xs">{row.speed}</TableCell>
                    <TableCell className="text-xs text-right font-mono">৳{row.generated.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-emerald-600">৳{row.received.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-red-600">
                      {row.balanceDue > 0 ? `৳${row.balanceDue.toLocaleString()}` : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono text-blue-600">
                      {row.advance > 0 ? `৳${row.advance.toLocaleString()}` : "—"}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{row.paymentDate}</TableCell>
                    <TableCell className="text-xs">{row.server}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Showing {startEntry} to {endEntry} of {filtered.length} entries
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {pageNumbers.map(p => (
              <Button
                key={p}
                variant={p === currentPage ? "default" : "outline"}
                size="sm"
                className="h-7 w-7 p-0 text-xs"
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
