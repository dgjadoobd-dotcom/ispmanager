import React, { useState, useMemo } from "react";
import { LayoutGrid, FileText, FileSpreadsheet, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AssetEntry {
  id: number;
  itemName: string;
  serialOrQty: string;
  assigningDate: string;
  assignedBy: string;
  remarks: string;
}

const demoAssets: AssetEntry[] = [
  { id: 1, itemName: "Huawei OLT MA5608T", serialOrQty: "SN-HW5608T-001", assigningDate: "2025-01-15", assignedBy: "Admin", remarks: "Main POP" },
  { id: 2, itemName: "TP-Link Router TL-R480T+", serialOrQty: "5 Pcs", assigningDate: "2025-01-20", assignedBy: "Store Manager", remarks: "Client distribution" },
  { id: 3, itemName: "VSOL ONU V2804RGW", serialOrQty: "50 Pcs", assigningDate: "2025-02-01", assignedBy: "Admin", remarks: "New connections" },
  { id: 4, itemName: "1:8 PLC Splitter", serialOrQty: "20 Pcs", assigningDate: "2025-02-05", assignedBy: "Technician Lead", remarks: "Field deployment" },
  { id: 5, itemName: "Fiber Patch Cord SC/UPC 3m", serialOrQty: "100 Pcs", assigningDate: "2025-02-10", assignedBy: "Store Manager", remarks: "Stock refill" },
  { id: 6, itemName: "Dell Desktop PC", serialOrQty: "SN-DELL-2025-003", assigningDate: "2025-02-15", assignedBy: "Admin", remarks: "Billing office" },
  { id: 7, itemName: "MikroTik CCR1036-8G-2S+", serialOrQty: "SN-MT1036-007", assigningDate: "2025-02-18", assignedBy: "Network Engineer", remarks: "Core router" },
  { id: 8, itemName: "24 Port Gigabit Switch", serialOrQty: "3 Pcs", assigningDate: "2025-03-01", assignedBy: "Technician Lead", remarks: "POP switches" },
  { id: 9, itemName: "UPS 1500VA", serialOrQty: "2 Pcs", assigningDate: "2025-03-05", assignedBy: "Admin", remarks: "Server room" },
  { id: 10, itemName: "OTDR Machine", serialOrQty: "SN-OTDR-2025-001", assigningDate: "2025-03-08", assignedBy: "Network Engineer", remarks: "Fiber testing" },
  { id: 11, itemName: "Fiber Drop Cable 1 Core", serialOrQty: "5000 Meters", assigningDate: "2025-03-10", assignedBy: "Store Manager", remarks: "Monthly stock" },
  { id: 12, itemName: "Crimping Tool Kit", serialOrQty: "4 Sets", assigningDate: "2025-03-12", assignedBy: "Technician Lead", remarks: "Field team" },
];

const assignedByOptions = [...new Set(demoAssets.map(a => a.assignedBy))];

const AssetsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [assignedByFilter, setAssignedByFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return demoAssets.filter(a => {
      const matchSearch = !search || a.itemName.toLowerCase().includes(search.toLowerCase()) || a.remarks.toLowerCase().includes(search.toLowerCase());
      const matchAssigned = assignedByFilter === "all" || a.assignedBy === assignedByFilter;
      const matchFrom = !fromDate || a.assigningDate >= fromDate;
      const matchTo = !toDate || a.assigningDate <= toDate;
      return matchSearch && matchAssigned && matchFrom && matchTo;
    });
  }, [search, assignedByFilter, fromDate, toDate]);

  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span>Inventory</span>
          <span>/</span>
          <span className="text-foreground font-medium">Assets</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <LayoutGrid className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assets</h1>
            <p className="text-sm text-muted-foreground">Asset Items</p>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-end justify-between">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Assigned By</label>
            <Select value={assignedByFilter} onValueChange={v => { setAssignedByFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {assignedByOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">From Date</label>
            <Input type="date" className="h-9 w-[150px]" value={fromDate} onChange={e => { setFromDate(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">To Date</label>
            <Input type="date" className="h-9 w-[150px]" value={toDate} onChange={e => { setToDate(e.target.value); setCurrentPage(1); }} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileText className="h-4 w-4" /> Generate PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileSpreadsheet className="h-4 w-4" /> Generate CSV
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          {/* Show entries + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Show</span>
              <Select value={String(entriesPerPage)} onValueChange={v => { setEntriesPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 25, 50].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">entries</span>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search assets..." className="pl-9 h-8" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground font-semibold w-[60px]">Sr.</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Item Name</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Serial / Quantity</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Assigning Date</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Assigned By</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No assets found</TableCell>
                  </TableRow>
                ) : (
                  paginated.map((asset, idx) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{(currentPage - 1) * entriesPerPage + idx + 1}</TableCell>
                      <TableCell className="font-medium">{asset.itemName}</TableCell>
                      <TableCell>{asset.serialOrQty}</TableCell>
                      <TableCell>{asset.assigningDate}</TableCell>
                      <TableCell>{asset.assignedBy}</TableCell>
                      <TableCell className="text-muted-foreground">{asset.remarks}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t text-sm text-muted-foreground">
            <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filtered.length)} of {filtered.length} entries</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetsPage;
