import { useState } from "react";
import { Wallet, Search, FileText, FileSpreadsheet, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pgwData = [
  { code: "R001", name: "NetZone BD", type: "Postpaid", mobile: "01711-234567", totalReceived: 125000, settled: 120000, remaining: 5000, status: "Settled" },
  { code: "R002", name: "SpeedLink IT", type: "Prepaid", mobile: "01812-345678", totalReceived: 89500, settled: 75000, remaining: 14500, status: "Cash" },
  { code: "R003", name: "FiberNet Solutions", type: "Postpaid", mobile: "01913-456789", totalReceived: 210000, settled: 210000, remaining: 0, status: "Settled" },
  { code: "R004", name: "DataStream BD", type: "Prepaid", mobile: "01614-567890", totalReceived: 67800, settled: 50000, remaining: 17800, status: "Fund" },
  { code: "R005", name: "CloudNet ISP", type: "Postpaid", mobile: "01515-678901", totalReceived: 0, settled: 0, remaining: 0, status: "No Transaction" },
  { code: "R006", name: "QuickByte Net", type: "Prepaid", mobile: "01716-789012", totalReceived: 45200, settled: 45200, remaining: 0, status: "Settled" },
  { code: "R007", name: "MegaLink BD", type: "Postpaid", mobile: "01817-890123", totalReceived: 178000, settled: 150000, remaining: 28000, status: "Cash" },
  { code: "R008", name: "TurboNet IT", type: "Prepaid", mobile: "01918-901234", totalReceived: 92300, settled: 92300, remaining: 0, status: "Settled" },
  { code: "R009", name: "WaveConnect", type: "Postpaid", mobile: "01619-012345", totalReceived: 156700, settled: 130000, remaining: 26700, status: "Fund" },
  { code: "R010", name: "BrightFiber BD", type: "Prepaid", mobile: "01520-123456", totalReceived: 0, settled: 0, remaining: 0, status: "No Transaction" },
  { code: "R011", name: "SwiftNet Solutions", type: "Postpaid", mobile: "01721-234567", totalReceived: 234500, settled: 234500, remaining: 0, status: "Settled" },
  { code: "R012", name: "ProLink ISP", type: "Prepaid", mobile: "01822-345678", totalReceived: 78900, settled: 60000, remaining: 18900, status: "Cash" },
];

const settlementHistory = [
  { date: "2025-03-10", reseller: "NetZone BD", amount: 120000, method: "Bank Transfer", reference: "STL-20250310-001", status: "Completed" },
  { date: "2025-03-09", reseller: "FiberNet Solutions", amount: 210000, method: "bKash", reference: "STL-20250309-002", status: "Completed" },
  { date: "2025-03-08", reseller: "QuickByte Net", amount: 45200, method: "Bank Transfer", reference: "STL-20250308-003", status: "Completed" },
  { date: "2025-03-07", reseller: "TurboNet IT", amount: 92300, method: "Nagad", reference: "STL-20250307-004", status: "Completed" },
  { date: "2025-03-06", reseller: "SwiftNet Solutions", amount: 234500, method: "Bank Transfer", reference: "STL-20250306-005", status: "Completed" },
  { date: "2025-03-05", reseller: "MegaLink BD", amount: 150000, method: "bKash", reference: "STL-20250305-006", status: "Pending" },
];

const resellerTransactions = [
  { sn: 1, reseller: "SpeedLink IT", txnId: "TXN-20250310-A1", amount: 5000, date: "2025-03-10", type: "Collection", status: "Success" },
  { sn: 2, reseller: "DataStream BD", txnId: "TXN-20250310-A2", amount: 3200, date: "2025-03-10", type: "Collection", status: "Success" },
  { sn: 3, reseller: "MegaLink BD", txnId: "TXN-20250309-B1", amount: 8500, date: "2025-03-09", type: "Collection", status: "Success" },
  { sn: 4, reseller: "ProLink ISP", txnId: "TXN-20250309-B2", amount: 4100, date: "2025-03-09", type: "Refund", status: "Refunded" },
  { sn: 5, reseller: "WaveConnect", txnId: "TXN-20250308-C1", amount: 12000, date: "2025-03-08", type: "Collection", status: "Success" },
  { sn: 6, reseller: "NetZone BD", txnId: "TXN-20250308-C2", amount: 7600, date: "2025-03-08", type: "Collection", status: "Failed" },
];

function statusBadge(status: string) {
  switch (status) {
    case "Settled":
      return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/25 hover:bg-emerald-500/20">{status}</Badge>;
    case "Cash":
      return <Badge className="bg-sky-500/15 text-sky-600 border-sky-500/25 hover:bg-sky-500/20">{status}</Badge>;
    case "Fund":
      return <Badge className="bg-violet-500/15 text-violet-600 border-violet-500/25 hover:bg-violet-500/20">{status}</Badge>;
    case "No Transaction":
      return <Badge className="bg-muted text-muted-foreground border-border">{status}</Badge>;
    case "Completed":
      return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/25 hover:bg-emerald-500/20">{status}</Badge>;
    case "Pending":
      return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/25 hover:bg-amber-500/20">{status}</Badge>;
    case "Success":
      return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/25 hover:bg-emerald-500/20">{status}</Badge>;
    case "Refunded":
      return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/25 hover:bg-amber-500/20">{status}</Badge>;
    case "Failed":
      return <Badge className="bg-destructive/15 text-destructive border-destructive/25 hover:bg-destructive/20">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function typeBadge(type: string) {
  return type === "Postpaid"
    ? <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/25 hover:bg-blue-500/20">{type}</Badge>
    : <Badge className="bg-orange-500/15 text-orange-600 border-orange-500/25 hover:bg-orange-500/20">{type}</Badge>;
}

export default function ResellerPgwSettlementPage() {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState("10");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>MAC Reseller</span>
          <span>/</span>
          <span className="text-foreground font-medium">PGW Settlement</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PGW Transaction Settlement</h1>
            <p className="text-sm text-muted-foreground">Manage payment gateway settlements for resellers</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pgw" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="pgw">PGW Transactions</TabsTrigger>
            <TabsTrigger value="history">Settlement History</TabsTrigger>
            <TabsTrigger value="transactions">Reseller Transactions</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1.5" />PDF</Button>
            <Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4 mr-1.5" />Excel</Button>
          </div>
        </div>

        {/* PGW Transactions Tab */}
        <TabsContent value="pgw" className="space-y-4">
          <Card>
            <CardContent className="pt-5 space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Select><SelectTrigger><SelectValue placeholder="Reseller Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
                <Select><SelectTrigger><SelectValue placeholder="Reseller Type" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="postpaid">Postpaid</SelectItem><SelectItem value="prepaid">Prepaid</SelectItem></SelectContent></Select>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Show</span>
                  <Select value={entries} onValueChange={setEntries}><SelectTrigger className="w-20"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem></SelectContent></Select>
                  <span className="text-sm text-muted-foreground">entries</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search resellers..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>

              {/* Table */}
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-800 hover:bg-slate-800 border-slate-700">
                      <TableHead className="text-white font-semibold text-xs">Code</TableHead>
                      <TableHead className="text-white font-semibold text-xs">Reseller Name</TableHead>
                      <TableHead className="text-white font-semibold text-xs">Type</TableHead>
                      <TableHead className="text-white font-semibold text-xs">Mobile</TableHead>
                      <TableHead className="text-white font-semibold text-xs text-right">Total Received</TableHead>
                      <TableHead className="text-white font-semibold text-xs text-right">Settled</TableHead>
                      <TableHead className="text-white font-semibold text-xs text-right">Remaining</TableHead>
                      <TableHead className="text-white font-semibold text-xs text-center">Payment Status</TableHead>
                      <TableHead className="text-white font-semibold text-xs text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pgwData.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map(row => (
                      <TableRow key={row.code} className="hover:bg-muted/40">
                        <TableCell className="font-mono text-xs">{row.code}</TableCell>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>{typeBadge(row.type)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{row.mobile}</TableCell>
                        <TableCell className="text-right font-medium">৳{row.totalReceived.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium">৳{row.settled.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-amber-600 font-medium">৳{row.remaining.toLocaleString()}</TableCell>
                        <TableCell className="text-center">{statusBadge(row.status)}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Showing 1 to {pgwData.length} of {pgwData.length} entries</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button size="sm" className="bg-primary text-primary-foreground h-8 w-8 p-0">1</Button>
                  <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settlement History Tab */}
        <TabsContent value="history">
          <Card>
            <CardContent className="pt-5">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-800 hover:bg-slate-800 border-slate-700">
                      <TableHead className="text-white font-semibold text-xs">Date</TableHead>
                      <TableHead className="text-white font-semibold text-xs">Reseller</TableHead>
                      <TableHead className="text-white font-semibold text-xs text-right">Amount</TableHead>
                      <TableHead className="text-white font-semibold text-xs">Method</TableHead>
                      <TableHead className="text-white font-semibold text-xs">Reference</TableHead>
                      <TableHead className="text-white font-semibold text-xs text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settlementHistory.map((row, i) => (
                      <TableRow key={i} className="hover:bg-muted/40">
                        <TableCell className="text-sm">{row.date}</TableCell>
                        <TableCell className="font-medium">{row.reseller}</TableCell>
                        <TableCell className="text-right font-medium">৳{row.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{row.method}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{row.reference}</TableCell>
                        <TableCell className="text-center">{statusBadge(row.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reseller Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardContent className="pt-5">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-800 hover:bg-slate-800 border-slate-700">
                      <TableHead className="text-white font-semibold text-xs">S/N</TableHead>
                      <TableHead className="text-white font-semibold text-xs">Reseller</TableHead>
                      <TableHead className="text-white font-semibold text-xs">Transaction ID</TableHead>
                      <TableHead className="text-white font-semibold text-xs text-right">Amount</TableHead>
                      <TableHead className="text-white font-semibold text-xs">Date</TableHead>
                      <TableHead className="text-white font-semibold text-xs">Type</TableHead>
                      <TableHead className="text-white font-semibold text-xs text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resellerTransactions.map(row => (
                      <TableRow key={row.sn} className="hover:bg-muted/40">
                        <TableCell className="text-sm">{row.sn}</TableCell>
                        <TableCell className="font-medium">{row.reseller}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{row.txnId}</TableCell>
                        <TableCell className="text-right font-medium">৳{row.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{row.date}</TableCell>
                        <TableCell><Badge variant={row.type === "Refund" ? "destructive" : "secondary"}>{row.type}</Badge></TableCell>
                        <TableCell className="text-center">{statusBadge(row.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}