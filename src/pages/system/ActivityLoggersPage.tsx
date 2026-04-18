import { useState } from "react";
import { ClipboardList, ChevronRight, FileText, FileSpreadsheet, CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const mockData = [
  {
    id: 1,
    tableName: "customers",
    oldValues: '{"name": "John Doe", "phone": "01700000001"}',
    newValues: '{"name": "John Smith", "phone": "01700000001"}',
    changedColumns: "name",
    changedBy: "admin@isp.com",
    changingDate: "2026-03-10 14:23:45",
    changeType: "UPDATE",
  },
  {
    id: 2,
    tableName: "packages",
    oldValues: '{"monthly_price": 500}',
    newValues: '{"monthly_price": 600}',
    changedColumns: "monthly_price",
    changedBy: "staff@isp.com",
    changingDate: "2026-03-09 10:15:30",
    changeType: "UPDATE",
  },
  {
    id: 3,
    tableName: "payments",
    oldValues: "—",
    newValues: '{"amount": 1200, "method": "cash"}',
    changedColumns: "amount, method, customer_id",
    changedBy: "admin@isp.com",
    changingDate: "2026-03-08 09:45:12",
    changeType: "INSERT",
  },
];

const changeTypes = ["All", "INSERT", "UPDATE", "DELETE"];
const users = ["All", "admin@isp.com", "staff@isp.com", "manager@isp.com"];

const ActivityLoggersPage = () => {
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [changedBy, setChangedBy] = useState("All");
  const [changeType, setChangeType] = useState("All");
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");

  const filtered = mockData.filter((row) => {
    if (search && !Object.values(row).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))) return false;
    if (changedBy !== "All" && row.changedBy !== changedBy) return false;
    if (changeType !== "All" && row.changeType !== changeType) return false;
    return true;
  });

  const handleGeneratePdf = () => toast.info("PDF জেনারেট হচ্ছে...");
  const handleGenerateCsv = () => toast.info("CSV জেনারেট হচ্ছে...");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>System</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Activity Logs</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
            <p className="text-sm text-muted-foreground">All Activity Loggers Of This Application</p>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <Card>
        <div className="bg-foreground/90 text-background px-4 py-3 rounded-t-lg flex items-center justify-between">
          <h3 className="font-semibold text-sm">Filter Options</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="h-7 text-xs gap-1.5" onClick={handleGeneratePdf}>
              <FileText className="h-3.5 w-3.5" /> Generate PDF
            </Button>
            <Button size="sm" variant="secondary" className="h-7 text-xs gap-1.5" onClick={handleGenerateCsv}>
              <FileSpreadsheet className="h-3.5 w-3.5" /> Generate CSV
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* From Date */}
            <div className="space-y-1.5">
              <Label className="text-xs">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 text-sm", !fromDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {fromDate ? format(fromDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date */}
            <div className="space-y-1.5">
              <Label className="text-xs">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 text-sm", !toDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {toDate ? format(toDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            {/* Changed By */}
            <div className="space-y-1.5">
              <Label className="text-xs">Changed By</Label>
              <Select value={changedBy} onValueChange={setChangedBy}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Changed Type */}
            <div className="space-y-1.5">
              <Label className="text-xs">Changed Type</Label>
              <Select value={changeType} onValueChange={setChangeType}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {changeTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table Card */}
      <Card>
        <div className="bg-foreground/90 text-background px-4 py-3 rounded-t-lg">
          <h3 className="font-semibold text-sm">Activity Log Entries</h3>
        </div>
        <CardContent className="p-4 space-y-4">
          {/* Table toolbar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Show</span>
              <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                <SelectTrigger className="h-8 w-[70px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["10", "25", "50", "100"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">entries</span>
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12 text-xs">Sr.</TableHead>
                  <TableHead className="text-xs">Table Name</TableHead>
                  <TableHead className="text-xs min-w-[180px]">Old Values</TableHead>
                  <TableHead className="text-xs min-w-[180px]">New Values</TableHead>
                  <TableHead className="text-xs">Changed Columns</TableHead>
                  <TableHead className="text-xs">Changed By</TableHead>
                  <TableHead className="text-xs">Changing Date</TableHead>
                  <TableHead className="text-xs">Change Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs font-medium">{idx + 1}</TableCell>
                      <TableCell className="text-xs font-medium">{row.tableName}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground max-w-[200px] truncate">{row.oldValues}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground max-w-[200px] truncate">{row.newValues}</TableCell>
                      <TableCell className="text-xs">{row.changedColumns}</TableCell>
                      <TableCell className="text-xs">{row.changedBy}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{row.changingDate}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          row.changeType === "INSERT" && "bg-emerald-500/10 text-emerald-600",
                          row.changeType === "UPDATE" && "bg-amber-500/10 text-amber-600",
                          row.changeType === "DELETE" && "bg-destructive/10 text-destructive",
                        )}>
                          {row.changeType}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing 1 to {filtered.length} of {filtered.length} entries</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLoggersPage;
