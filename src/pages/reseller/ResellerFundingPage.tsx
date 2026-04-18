import React, { useState } from "react";
import { PiggyBank, FileText, FileSpreadsheet, Plus, Copy, Eye, Trash2, ShieldAlert } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const demoFunds = [
  { id: "1", reseller: "Rahim Networks", invoice: "INV-2025-0401", amount: 50000, payment: 50000, fee: 500, vat: 750, discount: 0, due: 0, fundDate: "2025-04-01", givenBy: "Admin", receivedDate: "2025-04-01", receivedBy: "Rahim", remarks: "Monthly fund", status: "paid" as const, restricted: false },
  { id: "2", reseller: "Karim ISP", invoice: "INV-2025-0402", amount: 30000, payment: 20000, fee: 300, vat: 450, discount: 500, due: 9750, fundDate: "2025-04-02", givenBy: "Admin", receivedDate: "—", receivedBy: "—", remarks: "Partial payment", status: "due" as const, restricted: false },
  { id: "3", reseller: "Star Net BD", invoice: "INV-2025-0403", amount: 25000, payment: 25000, fee: 250, vat: 375, discount: 1000, due: 0, fundDate: "2025-04-03", givenBy: "Manager", receivedDate: "2025-04-03", receivedBy: "Imran", remarks: "Full cleared", status: "paid" as const, restricted: true },
  { id: "4", reseller: "Fast Link", invoice: "INV-2025-0404", amount: 15000, payment: 15000, fee: 150, vat: 225, discount: 0, due: 0, fundDate: "2025-04-05", givenBy: "Admin", receivedDate: "2025-04-06", receivedBy: "Sumon", remarks: "Refund processed", status: "refund" as const, restricted: false },
  { id: "5", reseller: "BD Connect", invoice: "INV-2025-0405", amount: 40000, payment: 10000, fee: 400, vat: 600, discount: 0, due: 29000, fundDate: "2025-04-07", givenBy: "Admin", receivedDate: "—", receivedBy: "—", remarks: "Awaiting balance", status: "due" as const, restricted: false },
  { id: "6", reseller: "Mega Broadband", invoice: "INV-2025-0406", amount: 60000, payment: 60000, fee: 600, vat: 900, discount: 2000, due: 0, fundDate: "2025-04-08", givenBy: "Manager", receivedDate: "2025-04-08", receivedBy: "Rafiq", remarks: "Advance payment", status: "paid" as const, restricted: false },
];

const historyData = [
  { id: "1", reseller: "Rahim Networks", type: "Fund Added", amount: 50000, date: "2025-04-01", by: "Admin", note: "Monthly top-up" },
  { id: "2", reseller: "Karim ISP", type: "Fund Added", amount: 30000, date: "2025-04-02", by: "Admin", note: "Partial fund" },
  { id: "3", reseller: "Fast Link", type: "Refund", amount: 15000, date: "2025-04-05", by: "Admin", note: "Refund processed" },
  { id: "4", reseller: "BD Connect", type: "Fund Added", amount: 40000, date: "2025-04-07", by: "Admin", note: "New allocation" },
  { id: "5", reseller: "Mega Broadband", type: "Fund Added", amount: 60000, date: "2025-04-08", by: "Manager", note: "Advance fund" },
];

const statusConfig = {
  paid: { label: "Paid", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  due: { label: "Due", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  refund: { label: "Refund", className: "bg-red-500/15 text-red-600 border-red-500/30" },
};

const ResellerFundingPage = () => {
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<Record<string, boolean>>(
    Object.fromEntries(demoFunds.map((f) => [f.id, f.restricted]))
  );

  const filtered = demoFunds.filter(
    (f) =>
      f.reseller.toLowerCase().includes(search.toLowerCase()) ||
      f.invoice.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map((f) => f.id) : []);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>MAC Reseller</span>
          <span>/</span>
          <span className="text-foreground font-medium">Funding</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <PiggyBank className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reseller Funding</h1>
        </div>
      </div>

      <Tabs defaultValue="fund" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fund">Reseller Fund</TabsTrigger>
          <TabsTrigger value="history">Fund History</TabsTrigger>
        </TabsList>

        {/* ===== Reseller Fund Tab ===== */}
        <TabsContent value="fund" className="space-y-4">
          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-1.5" /> Download PDF
            </Button>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Download Excel
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Give Fund
            </Button>
            <Button variant="destructive" size="sm" className="ml-auto">
              <ShieldAlert className="h-4 w-4 mr-1.5" /> Bulk Online Fund Restriction
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 rounded-lg border bg-card">
            <Select><SelectTrigger><SelectValue placeholder="MAC Resellers" /></SelectTrigger><SelectContent><SelectItem value="all">All Resellers</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Transaction Status" /></SelectTrigger><SelectContent><SelectItem value="paid">Paid</SelectItem><SelectItem value="due">Due</SelectItem><SelectItem value="refund">Refund</SelectItem></SelectContent></Select>
            <Input type="date" placeholder="From Date" />
            <Input type="date" placeholder="To Date" />
            <Select><SelectTrigger><SelectValue placeholder="Payment By" /></SelectTrigger><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="manager">Manager</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Received By" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Restrict Status" /></SelectTrigger><SelectContent><SelectItem value="blocked">Blocked</SelectItem><SelectItem value="unblocked">Unblocked</SelectItem></SelectContent></Select>
          </div>

          {/* Show entries + search */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Show</span>
              <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
              </Select>
              <span className="text-muted-foreground">entries</span>
            </div>
            <Input className="max-w-xs h-8" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-800 dark:bg-slate-900">
                  <TableRow className="hover:bg-slate-800 dark:hover:bg-slate-900 border-slate-700">
                    <TableHead className="text-slate-100 w-10"><Checkbox checked={selectedIds.length === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} /></TableHead>
                    <TableHead className="text-slate-100 font-semibold">Reseller Name</TableHead>
                    <TableHead className="text-slate-100 font-semibold">Invoice No</TableHead>
                    <TableHead className="text-slate-100 font-semibold text-right">Fund Amount</TableHead>
                    <TableHead className="text-slate-100 font-semibold text-right">Payment</TableHead>
                    <TableHead className="text-slate-100 font-semibold text-right">P.Fee</TableHead>
                    <TableHead className="text-slate-100 font-semibold text-right">VAT</TableHead>
                    <TableHead className="text-slate-100 font-semibold text-right">Discount</TableHead>
                    <TableHead className="text-slate-100 font-semibold text-right">Due</TableHead>
                    <TableHead className="text-slate-100 font-semibold">Funding Date</TableHead>
                    <TableHead className="text-slate-100 font-semibold">Given By</TableHead>
                    <TableHead className="text-slate-100 font-semibold">Received Date</TableHead>
                    <TableHead className="text-slate-100 font-semibold">Received By</TableHead>
                    <TableHead className="text-slate-100 font-semibold">Status</TableHead>
                    <TableHead className="text-slate-100 font-semibold text-center">Restrict</TableHead>
                    <TableHead className="text-slate-100 font-semibold text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((f, idx) => {
                    const sc = statusConfig[f.status];
                    return (
                      <TableRow key={f.id} className={idx % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                        <TableCell><Checkbox checked={selectedIds.includes(f.id)} onCheckedChange={(c) => toggleOne(f.id, !!c)} /></TableCell>
                        <TableCell className="font-medium">{f.reseller}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{f.invoice}</TableCell>
                        <TableCell className="text-right font-medium">৳{f.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">৳{f.payment.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">৳{f.fee.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">৳{f.vat.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">৳{f.discount.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">{f.due > 0 ? `৳${f.due.toLocaleString()}` : "—"}</TableCell>
                        <TableCell className="text-xs">{f.fundDate}</TableCell>
                        <TableCell>{f.givenBy}</TableCell>
                        <TableCell className="text-xs">{f.receivedDate}</TableCell>
                        <TableCell>{f.receivedBy}</TableCell>
                        <TableCell><Badge variant="outline" className={sc.className}>{sc.label}</Badge></TableCell>
                        <TableCell className="text-center">
                          <Switch checked={!restrictions[f.id]} onCheckedChange={(v) => setRestrictions((p) => ({ ...p, [f.id]: !v }))} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Copy className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing 1 to {filtered.length} of {filtered.length} entries</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="default" size="sm" className="min-w-[32px]">1</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </TabsContent>

        {/* ===== Fund History Tab ===== */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Show</span>
              <Select defaultValue="10">
                <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem></SelectContent>
              </Select>
              <span className="text-muted-foreground">entries</span>
            </div>
            <Input className="max-w-xs h-8" placeholder="Search history..." />
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-800 dark:bg-slate-900">
                <TableRow className="hover:bg-slate-800 dark:hover:bg-slate-900 border-slate-700">
                  <TableHead className="text-slate-100 font-semibold">S/N</TableHead>
                  <TableHead className="text-slate-100 font-semibold">Reseller</TableHead>
                  <TableHead className="text-slate-100 font-semibold">Type</TableHead>
                  <TableHead className="text-slate-100 font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-slate-100 font-semibold">Date</TableHead>
                  <TableHead className="text-slate-100 font-semibold">By</TableHead>
                  <TableHead className="text-slate-100 font-semibold">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.map((h, idx) => (
                  <TableRow key={h.id} className={idx % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{h.reseller}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={h.type === "Refund" ? "bg-red-500/15 text-red-600 border-red-500/30" : "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"}>
                        {h.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">৳{h.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{h.date}</TableCell>
                    <TableCell>{h.by}</TableCell>
                    <TableCell className="text-muted-foreground">{h.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing 1 to {historyData.length} of {historyData.length} entries</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="default" size="sm" className="min-w-[32px]">1</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResellerFundingPage;
