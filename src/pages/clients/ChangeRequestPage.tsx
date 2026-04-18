import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, FileText, FileSpreadsheet, XCircle, CheckCircle, Info, ChevronDown, ChevronUp, Search } from "lucide-react";
import { PageContainer, SectionHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type RequestStatus = "Requested" | "Approved" | "Cancelled" | "Completed";

interface ChangeRequest {
  id: string;
  code: string;
  idIp: string;
  name: string;
  mobile: string;
  zone: string;
  currentPackage: string;
  requestedPackage: string;
  currentBillDate: string;
  requestedBillDate: string;
  remarks: string;
  createdBy: string;
  createdDate: string;
  occurringDate: string;
  status: RequestStatus;
  requestType: string;
}

const demoData: ChangeRequest[] = [
  { id: "1", code: "C-1001", idIp: "10.0.1.101", name: "Rafiq Hasan", mobile: "01712345678", zone: "Zone-A", currentPackage: "Basic 10Mbps", requestedPackage: "Standard 20Mbps", currentBillDate: "2025-03-01", requestedBillDate: "2025-03-15", remarks: "Customer wants upgrade", createdBy: "Admin", createdDate: "2025-02-28", occurringDate: "2025-03-15", status: "Requested", requestType: "Package Change" },
  { id: "2", code: "C-1002", idIp: "10.0.1.102", name: "Fatema Begum", mobile: "01812345679", zone: "Zone-B", currentPackage: "Standard 20Mbps", requestedPackage: "Premium 50Mbps", currentBillDate: "2025-03-05", requestedBillDate: "2025-03-05", remarks: "Speed upgrade needed", createdBy: "Staff-1", createdDate: "2025-02-25", occurringDate: "2025-03-10", status: "Approved", requestType: "Package Change" },
  { id: "3", code: "C-1003", idIp: "10.0.1.103", name: "Kamal Uddin", mobile: "01912345680", zone: "Zone-A", currentPackage: "Premium 50Mbps", requestedPackage: "Premium 50Mbps", currentBillDate: "2025-03-10", requestedBillDate: "2025-03-25", remarks: "Bill date shift requested", createdBy: "Admin", createdDate: "2025-02-20", occurringDate: "2025-03-01", status: "Completed", requestType: "Bill Date Change" },
  { id: "4", code: "C-1004", idIp: "10.0.1.104", name: "Nasima Akter", mobile: "01612345681", zone: "Zone-C", currentPackage: "Basic 10Mbps", requestedPackage: "Standard 20Mbps", currentBillDate: "2025-03-01", requestedBillDate: "2025-03-01", remarks: "Package upgrade", createdBy: "Staff-2", createdDate: "2025-03-01", occurringDate: "2025-03-05", status: "Cancelled", requestType: "Package Change" },
  { id: "5", code: "C-1005", idIp: "10.0.1.105", name: "Jahangir Alam", mobile: "01512345682", zone: "Zone-B", currentPackage: "Standard 20Mbps", requestedPackage: "Basic 10Mbps", currentBillDate: "2025-03-15", requestedBillDate: "2025-03-15", remarks: "Downgrade request", createdBy: "Admin", createdDate: "2025-03-02", occurringDate: "2025-03-10", status: "Requested", requestType: "Package Change" },
  { id: "6", code: "C-1006", idIp: "10.0.1.106", name: "Sumaiya Islam", mobile: "01312345683", zone: "Zone-A", currentPackage: "Premium 50Mbps", requestedPackage: "Premium 50Mbps", currentBillDate: "2025-03-20", requestedBillDate: "2025-04-01", remarks: "Billing cycle change", createdBy: "Staff-1", createdDate: "2025-03-03", occurringDate: "2025-04-01", status: "Requested", requestType: "Bill Date Change" },
  { id: "7", code: "C-1007", idIp: "10.0.1.107", name: "Mizanur Rahman", mobile: "01412345684", zone: "Zone-C", currentPackage: "Basic 10Mbps", requestedPackage: "Premium 50Mbps", currentBillDate: "2025-03-01", requestedBillDate: "2025-03-01", remarks: "Direct upgrade to premium", createdBy: "Admin", createdDate: "2025-03-04", occurringDate: "2025-03-08", status: "Approved", requestType: "Package Change" },
  { id: "8", code: "C-1008", idIp: "10.0.1.108", name: "Taslima Khatun", mobile: "01112345685", zone: "Zone-B", currentPackage: "Standard 20Mbps", requestedPackage: "Standard 20Mbps", currentBillDate: "2025-03-05", requestedBillDate: "2025-03-20", remarks: "Need bill date change", createdBy: "Staff-2", createdDate: "2025-03-05", occurringDate: "2025-03-20", status: "Completed", requestType: "Bill Date Change" },
];

const statusConfig: Record<RequestStatus, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  Requested: { variant: "outline", className: "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400" },
  Approved: { variant: "outline", className: "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400" },
  Cancelled: { variant: "outline", className: "border-red-500 text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400" },
  Completed: { variant: "outline", className: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400" },
};

const ChangeRequestPage = () => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [requestType, setRequestType] = useState("all");
  const [requestStatus, setRequestStatus] = useState("all");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [occurredDate, setOccurredDate] = useState<Date>();
  const [createdBy, setCreatedBy] = useState("all");
  const [showInfo, setShowInfo] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState("25");

  const filtered = demoData.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.code.toLowerCase().includes(search.toLowerCase()) && !r.mobile.includes(search)) return false;
    if (requestType !== "all" && r.requestType !== requestType) return false;
    if (requestStatus !== "all" && r.status !== requestStatus) return false;
    if (createdBy !== "all" && r.createdBy !== createdBy) return false;
    return true;
  });

  const toggleSelect = (id: string) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((r) => r.id));

  const DatePickerField = ({ label, date, setDate }: { label: string; date?: Date; setDate: (d?: Date) => void }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 text-xs", !date && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            {date ? format(date, "dd/MM/yyyy") : "Select"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <PageContainer title="Change Request (Package & Exp. Date)" description="Manage package change and bill date change requests">

      {/* Info Banner */}
      <Card className="mb-4 border-primary/30 bg-primary/5">
        <CardContent className="p-3">
          <button onClick={() => setShowInfo(!showInfo)} className="flex items-center gap-2 text-sm font-medium text-primary w-full">
            <Info className="h-4 w-4" />
            Learn what will happen after changes request approval?
            {showInfo ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
          </button>
          {showInfo && (
            <div className="mt-2 text-xs text-primary/80 space-y-1 pl-6">
              <p>• <strong>Package Change:</strong> After approval, the customer's package will be updated on the occurring date.</p>
              <p>• <strong>Bill Date Change:</strong> After approval, the billing cycle will shift to the new requested date.</p>
              <p>• <strong>Auto Sync:</strong> If network integration is enabled, changes will auto-sync to your router/NAS.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Request Type</label>
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Package Change">Package Change</SelectItem>
                  <SelectItem value="Bill Date Change">Bill Date Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Request Status</label>
              <Select value={requestStatus} onValueChange={setRequestStatus}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Requested">Requested</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DatePickerField label="From Date" date={fromDate} setDate={setFromDate} />
            <DatePickerField label="To Date" date={toDate} setDate={setToDate} />
            <DatePickerField label="Occurred Date" date={occurredDate} setDate={setOccurredDate} />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Created By</label>
              <Select value={createdBy} onValueChange={setCreatedBy}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Staff-1">Staff-1</SelectItem>
                  <SelectItem value="Staff-2">Staff-2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button variant="destructive" size="sm" disabled={selectedIds.length === 0} onClick={() => toast.success(`${selectedIds.length} request(s) cancelled`)}>
          <XCircle className="h-4 w-4 mr-1" /> Cancel Request
        </Button>
        <Button variant="success" size="sm" disabled={selectedIds.length === 0} onClick={() => toast.success(`${selectedIds.length} request(s) approved`)}>
          <CheckCircle className="h-4 w-4 mr-1" /> Approve Request
        </Button>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("PDF generated")}>
            <FileText className="h-4 w-4 mr-1" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("CSV generated")}>
            <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Search & Entries */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Show</span>
              <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                <SelectTrigger className="w-[70px] h-8 text-xs"><SelectValue /></SelectTrigger>
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
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, code, mobile..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10"><Checkbox checked={selectedIds.length === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} /></TableHead>
                  <TableHead className="text-xs font-semibold">Code</TableHead>
                  <TableHead className="text-xs font-semibold">ID/IP</TableHead>
                  <TableHead className="text-xs font-semibold">Name</TableHead>
                  <TableHead className="text-xs font-semibold">Mobile</TableHead>
                  <TableHead className="text-xs font-semibold">Zone</TableHead>
                  <TableHead className="text-xs font-semibold">Current Pkg</TableHead>
                  <TableHead className="text-xs font-semibold">Requested Pkg</TableHead>
                  <TableHead className="text-xs font-semibold">Cur. Bill Date</TableHead>
                  <TableHead className="text-xs font-semibold">Req. Bill Date</TableHead>
                  <TableHead className="text-xs font-semibold">Remarks</TableHead>
                  <TableHead className="text-xs font-semibold">Created By</TableHead>
                  <TableHead className="text-xs font-semibold">Created</TableHead>
                  <TableHead className="text-xs font-semibold">Occurring</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={15} className="text-center py-8 text-muted-foreground">No change requests found</TableCell></TableRow>
                ) : (
                  filtered.map((r) => {
                    const sc = statusConfig[r.status];
                    return (
                      <TableRow key={r.id} className={cn(selectedIds.includes(r.id) && "bg-primary/5")}>
                        <TableCell><Checkbox checked={selectedIds.includes(r.id)} onCheckedChange={() => toggleSelect(r.id)} /></TableCell>
                        <TableCell className="text-xs font-medium">{r.code}</TableCell>
                        <TableCell className="text-xs font-mono">{r.idIp}</TableCell>
                        <TableCell className="text-xs font-medium">{r.name}</TableCell>
                        <TableCell className="text-xs">{r.mobile}</TableCell>
                        <TableCell className="text-xs">{r.zone}</TableCell>
                        <TableCell className="text-xs">{r.currentPackage}</TableCell>
                        <TableCell className="text-xs font-medium">{r.requestedPackage}</TableCell>
                        <TableCell className="text-xs">{r.currentBillDate}</TableCell>
                        <TableCell className="text-xs">{r.requestedBillDate}</TableCell>
                        <TableCell className="text-xs max-w-[120px] truncate" title={r.remarks}>{r.remarks}</TableCell>
                        <TableCell className="text-xs">{r.createdBy}</TableCell>
                        <TableCell className="text-xs">{r.createdDate}</TableCell>
                        <TableCell className="text-xs">{r.occurringDate}</TableCell>
                        <TableCell><Badge variant={sc.variant} className={cn("text-[10px] px-2", sc.className)}>{r.status}</Badge></TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>Showing 1 to {filtered.length} of {filtered.length} entries</span>
            <span>{selectedIds.length} selected</span>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default ChangeRequestPage;
