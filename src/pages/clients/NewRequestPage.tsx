import { useState } from "react";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Search, FileText, CalendarIcon, UserCheck, Filter, RotateCcw, User, Phone, Network, Settings, ChevronLeft, ChevronRight, X } from "lucide-react";

interface ClientRequest {
  id: string;
  customerName: string;
  mobile: string;
  address: string;
  zone: string;
  subzone: string;
  customerType: string;
  connectionType: string;
  packageName: string;
  monthlyBill: number;
  billingDate: string;
  otc: number;
  physicalConnectivity: string;
  createdBy: string;
  createdOn: string;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  paymentStatus: "Paid" | "Due";
  setupBy: string;
  setupTime: string;
}

const demoData: ClientRequest[] = [
  {
    id: "1", customerName: "Kamal Hossain", mobile: "01712345678", address: "House 12, Road 5, Dhanmondi",
    zone: "Zone-1", subzone: "Sub-A", customerType: "Home User", connectionType: "Fiber",
    packageName: "Premium 50Mbps", monthlyBill: 1200, billingDate: "2025-03-01", otc: 2000,
    physicalConnectivity: "FTTH", createdBy: "Admin", createdOn: "2025-02-28", status: "Pending",
    paymentStatus: "Due", setupBy: "—", setupTime: "—",
  },
  {
    id: "2", customerName: "Rina Begum", mobile: "01898765432", address: "Flat 4B, Mirpur-10",
    zone: "Zone-2", subzone: "Sub-C", customerType: "Home User", connectionType: "Fiber",
    packageName: "Standard 30Mbps", monthlyBill: 800, billingDate: "2025-03-05", otc: 1500,
    physicalConnectivity: "FTTH", createdBy: "Staff-1", createdOn: "2025-03-01", status: "Processing",
    paymentStatus: "Paid", setupBy: "Technician-A", setupTime: "2025-03-02 10:30",
  },
  {
    id: "3", customerName: "Rafiq Uddin", mobile: "01556677889", address: "Shop 7, Gulshan Market",
    zone: "Zone-1", subzone: "Sub-B", customerType: "Corporate Office", connectionType: "Dedicated",
    packageName: "Business 100Mbps", monthlyBill: 5000, billingDate: "2025-03-01", otc: 5000,
    physicalConnectivity: "Direct Fiber", createdBy: "Admin", createdOn: "2025-02-25", status: "Completed",
    paymentStatus: "Paid", setupBy: "Technician-B", setupTime: "2025-02-27 14:00",
  },
  {
    id: "4", customerName: "Shahana Akter", mobile: "01611223344", address: "House 3, Uttara Sector 7",
    zone: "Zone-3", subzone: "Sub-A", customerType: "Home User", connectionType: "Fiber",
    packageName: "Basic 15Mbps", monthlyBill: 500, billingDate: "2025-03-10", otc: 1000,
    physicalConnectivity: "FTTH", createdBy: "Staff-2", createdOn: "2025-03-05", status: "Pending",
    paymentStatus: "Due", setupBy: "—", setupTime: "—",
  },
  {
    id: "5", customerName: "Mizanur Rahman", mobile: "01777889900", address: "Office 12, Banani DOHS",
    zone: "Zone-2", subzone: "Sub-D", customerType: "Corporate Office", connectionType: "Dedicated",
    packageName: "Enterprise 200Mbps", monthlyBill: 10000, billingDate: "2025-03-01", otc: 10000,
    physicalConnectivity: "Direct Fiber", createdBy: "Admin", createdOn: "2025-03-03", status: "Processing",
    paymentStatus: "Due", setupBy: "Technician-C", setupTime: "2025-03-04 09:00",
  },
  {
    id: "6", customerName: "Fatema Khatun", mobile: "01922334455", address: "House 45, Mohammadpur",
    zone: "Zone-1", subzone: "Sub-C", customerType: "Reseller", connectionType: "Fiber",
    packageName: "Reseller 100Mbps", monthlyBill: 3000, billingDate: "2025-03-15", otc: 3000,
    physicalConnectivity: "FTTH", createdBy: "Staff-1", createdOn: "2025-03-06", status: "Cancelled",
    paymentStatus: "Due", setupBy: "—", setupTime: "—",
  },
];

const statusColor: Record<string, string> = {
  Pending: "bg-warning/15 text-warning border-warning/25",
  Processing: "bg-info/15 text-info border-info/25",
  Completed: "bg-success/15 text-success border-success/25",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/25",
};

const paymentColor: Record<string, string> = {
  Paid: "bg-success/15 text-success border-success/25",
  Due: "bg-destructive/15 text-destructive border-destructive/25",
};

export default function NewRequestPage() {
  const [items, setItems] = useState<ClientRequest[]>(demoData);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState("10");
  const [page, setPage] = useState(1);

  // Filters
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSetupBy, setFilterSetupBy] = useState("all");
  const [filterCreatedBy, setFilterCreatedBy] = useState("all");

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ClientRequest | null>(null);
  const [deleteItem, setDeleteItem] = useState<ClientRequest | null>(null);
  const [step, setStep] = useState(0);

  // Form
  const [form, setForm] = useState({
    customerName: "", mobile: "", address: "", zone: "", subzone: "",
    customerType: "Home User", connectionType: "Fiber", packageName: "",
    monthlyBill: 0, billingDate: "", otc: 0, physicalConnectivity: "FTTH",
    gender: "", occupation: "", dateOfBirth: "", fatherName: "", motherName: "",
    nidNo: "", regFormNo: "", remarks: "",
    email: "", division: "", district: "", thana: "", altMobile: "",
    oltDevice: "", onuMac: "",
  });

  const uniqueCreatedBy = [...new Set(items.map((i) => i.createdBy))];
  const uniqueSetupBy = [...new Set(items.map((i) => i.setupBy).filter((s) => s !== "—"))];

  const filtered = items.filter((i) => {
    const matchSearch =
      i.customerName.toLowerCase().includes(search.toLowerCase()) ||
      i.mobile.includes(search) ||
      i.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || i.status === filterStatus;
    const matchSetupBy = filterSetupBy === "all" || i.setupBy === filterSetupBy;
    const matchCreatedBy = filterCreatedBy === "all" || i.createdBy === filterCreatedBy;
    const matchFrom = !fromDate || new Date(i.createdOn) >= fromDate;
    const matchTo = !toDate || new Date(i.createdOn) <= toDate;
    return matchSearch && matchStatus && matchSetupBy && matchCreatedBy && matchFrom && matchTo;
  });

  const pp = parseInt(perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pp));
  const paginated = filtered.slice((page - 1) * pp, page * pp);

  const defaultForm = {
    customerName: "", mobile: "", address: "", zone: "", subzone: "",
    customerType: "Home User", connectionType: "Fiber", packageName: "",
    monthlyBill: 0, billingDate: "", otc: 0, physicalConnectivity: "FTTH",
    gender: "", occupation: "", dateOfBirth: "", fatherName: "", motherName: "",
    nidNo: "", regFormNo: "", remarks: "",
    email: "", division: "", district: "", thana: "", altMobile: "",
    oltDevice: "", onuMac: "",
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(defaultForm);
    setStep(0);
    setDialogOpen(true);
  };

  const openEdit = (item: ClientRequest) => {
    setEditItem(item);
    setForm({
      ...defaultForm,
      customerName: item.customerName, mobile: item.mobile, address: item.address,
      zone: item.zone, subzone: item.subzone, customerType: item.customerType,
      connectionType: item.connectionType, packageName: item.packageName,
      monthlyBill: item.monthlyBill, billingDate: item.billingDate,
      otc: item.otc, physicalConnectivity: item.physicalConnectivity,
    });
    setStep(0);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.customerName.trim() || !form.mobile.trim()) return;
    if (editItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === editItem.id ? { ...i, ...form } : i))
      );
    } else {
      const newItem: ClientRequest = {
        id: Date.now().toString(),
        ...form,
        createdBy: "Admin",
        createdOn: format(new Date(), "yyyy-MM-dd"),
        status: "Pending",
        paymentStatus: "Due",
        setupBy: "—",
        setupTime: "—",
      };
      setItems((prev) => [...prev, newItem]);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteItem) {
      setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
      setDeleteItem(null);
    }
  };

  const resetFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setFilterStatus("all");
    setFilterSetupBy("all");
    setFilterCreatedBy("all");
    setSearch("");
    setPage(1);
  };

  return (
    <PageContainer
      title="New Request"
      description="Manage client connection requests & setup assignments"
      actions={
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Client Request
        </Button>
      }
    >
      {/* Filter Bar */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" /> Filters
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* From Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal h-9 text-xs", !fromDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                  {fromDate ? format(fromDate, "dd/MM/yyyy") : "From Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>

            {/* To Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal h-9 text-xs", !toDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                  {toDate ? format(toDate, "dd/MM/yyyy") : "To Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>

            {/* Setup Status */}
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Setup Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Setup By */}
            <Select value={filterSetupBy} onValueChange={(v) => { setFilterSetupBy(v); setPage(1); }}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Setup By" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technicians</SelectItem>
                {uniqueSetupBy.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Created By */}
            <Select value={filterCreatedBy} onValueChange={(v) => { setFilterCreatedBy(v); setPage(1); }}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Created By" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Creators</SelectItem>
                {uniqueCreatedBy.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="h-9 text-xs" onClick={resetFilters}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Show
              <Select value={perPage} onValueChange={(v) => { setPerPage(v); setPage(1); }}>
                <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["5", "10", "25", "50"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              entries
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, mobile, address..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5 hover:bg-primary/5">
                  <TableHead className="w-12 font-semibold text-xs">SN</TableHead>
                  <TableHead className="font-semibold text-xs min-w-[140px]">Cus. Name</TableHead>
                  <TableHead className="font-semibold text-xs min-w-[110px]">Mobile</TableHead>
                  <TableHead className="font-semibold text-xs min-w-[160px]">Address</TableHead>
                  <TableHead className="font-semibold text-xs">Zone</TableHead>
                  <TableHead className="font-semibold text-xs">Subzone</TableHead>
                  <TableHead className="font-semibold text-xs">Cus. Type</TableHead>
                  <TableHead className="font-semibold text-xs">Conn. Type</TableHead>
                  <TableHead className="font-semibold text-xs">Package</TableHead>
                  <TableHead className="font-semibold text-xs text-right">M. Bill</TableHead>
                  <TableHead className="font-semibold text-xs">B. Date</TableHead>
                  <TableHead className="font-semibold text-xs text-right">OTC</TableHead>
                  <TableHead className="font-semibold text-xs">Phy. Conn.</TableHead>
                  <TableHead className="font-semibold text-xs">Created By</TableHead>
                  <TableHead className="font-semibold text-xs">Created On</TableHead>
                  <TableHead className="font-semibold text-xs text-center">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-center">Payment</TableHead>
                  <TableHead className="font-semibold text-xs">Setup By</TableHead>
                  <TableHead className="font-semibold text-xs">Setup Time</TableHead>
                  <TableHead className="font-semibold text-xs text-center w-28">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={20} className="text-center py-10 text-muted-foreground">
                      <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      No client requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground text-xs">{(page - 1) * pp + idx + 1}</TableCell>
                      <TableCell className="font-medium text-xs">{item.customerName}</TableCell>
                      <TableCell className="text-xs">{item.mobile}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{item.address}</TableCell>
                      <TableCell className="text-xs">{item.zone}</TableCell>
                      <TableCell className="text-xs">{item.subzone}</TableCell>
                      <TableCell className="text-xs">{item.customerType}</TableCell>
                      <TableCell className="text-xs">{item.connectionType}</TableCell>
                      <TableCell className="text-xs">{item.packageName}</TableCell>
                      <TableCell className="text-xs text-right font-medium">৳{item.monthlyBill.toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{item.billingDate}</TableCell>
                      <TableCell className="text-xs text-right font-medium">৳{item.otc.toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{item.physicalConnectivity}</TableCell>
                      <TableCell className="text-xs">{item.createdBy}</TableCell>
                      <TableCell className="text-xs">{item.createdOn}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("text-[10px] border", statusColor[item.status])}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("text-[10px] border", paymentColor[item.paymentStatus])}>
                          {item.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.setupBy}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.setupTime}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-0.5">
                          {item.status === "Pending" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-info" title="Assign">
                              <UserCheck className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => openEdit(item)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteItem(item)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t text-sm text-muted-foreground">
              <span>Showing {(page - 1) * pp + 1}–{Math.min(page * pp, filtered.length)} of {filtered.length}</span>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Multi-Step Wizard Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0">
          {/* Dark Header */}
          <div className="bg-primary px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-primary-foreground">
                  {editItem ? "Edit Client Request" : "New Client Request"}
                </h2>
                <p className="text-xs text-primary-foreground/70 mt-0.5">
                  {editItem ? "Update the client request information" : "Fill in the details to create a new client request"}
                </p>
              </div>
              <span className="text-xs text-primary-foreground/60 font-medium">Step {step + 1} of 4</span>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="px-6 pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              {[
                { icon: User, label: "Personal Info" },
                { icon: Phone, label: "Contact Info" },
                { icon: Network, label: "Network & Product" },
                { icon: Settings, label: "Service Info" },
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 flex-1 group cursor-pointer",
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                    i === step
                      ? "bg-primary border-primary text-primary-foreground shadow-md"
                      : i < step
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "bg-muted border-border text-muted-foreground"
                  )}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors hidden sm:block",
                    i === step ? "text-primary" : "text-muted-foreground"
                  )}>{s.label}</span>
                </button>
              ))}
            </div>
            <Progress value={((step + 1) / 4) * 100} className="h-1.5" />
          </div>

          {/* Form Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[55vh]">
            {/* Step 1: Personal Info */}
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2 mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Name <span className="text-destructive">*</span></Label>
                    <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Full name" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Occupation</Label>
                    <Input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder="Occupation" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Date of Birth</Label>
                    <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Father Name</Label>
                    <Input value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} placeholder="Father's name" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Mother Name</Label>
                    <Input value={form.motherName} onChange={(e) => setForm({ ...form, motherName: e.target.value })} placeholder="Mother's name" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">NID / Birth Certificate No</Label>
                    <Input value={form.nidNo} onChange={(e) => setForm({ ...form, nidNo: e.target.value })} placeholder="NID number" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Registration Form No</Label>
                    <Input value={form.regFormNo} onChange={(e) => setForm({ ...form, regFormNo: e.target.value })} placeholder="Reg. form no" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                    <Label className="text-xs">Remarks</Label>
                    <Textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Any remarks..." className="text-sm min-h-[36px] h-9 resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Mobile <span className="text-destructive">*</span></Label>
                    <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="01XXXXXXXXX" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Alternative Mobile</Label>
                    <Input value={form.altMobile} onChange={(e) => setForm({ ...form, altMobile: e.target.value })} placeholder="01XXXXXXXXX" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Division</Label>
                    <Input value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} placeholder="Division" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">District</Label>
                    <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="District" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Thana / Upazilla</Label>
                    <Input value={form.thana} onChange={(e) => setForm({ ...form, thana: e.target.value })} placeholder="Thana / Upazilla" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                    <Label className="text-xs">Address</Label>
                    <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" className="text-sm min-h-[60px] resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Network & Product Info */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2 mb-3">Network & Product Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Zone</Label>
                    <Input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Zone" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Subzone</Label>
                    <Input value={form.subzone} onChange={(e) => setForm({ ...form, subzone: e.target.value })} placeholder="Subzone" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Connection Type</Label>
                    <Select value={form.connectionType} onValueChange={(v) => setForm({ ...form, connectionType: v })}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fiber">Fiber</SelectItem>
                        <SelectItem value="Dedicated">Dedicated</SelectItem>
                        <SelectItem value="Wireless">Wireless</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Physical Connectivity</Label>
                    <Select value={form.physicalConnectivity} onValueChange={(v) => setForm({ ...form, physicalConnectivity: v })}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FTTH">FTTH</SelectItem>
                        <SelectItem value="Direct Fiber">Direct Fiber</SelectItem>
                        <SelectItem value="UTP Cable">UTP Cable</SelectItem>
                        <SelectItem value="Wireless">Wireless</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">OLT Device</Label>
                    <Input value={form.oltDevice} onChange={(e) => setForm({ ...form, oltDevice: e.target.value })} placeholder="OLT device" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">ONU MAC</Label>
                    <Input value={form.onuMac} onChange={(e) => setForm({ ...form, onuMac: e.target.value })} placeholder="ONU MAC address" className="h-9 text-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Service Info */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2 mb-3">Service Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Package</Label>
                    <Input value={form.packageName} onChange={(e) => setForm({ ...form, packageName: e.target.value })} placeholder="Package name" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Customer Type</Label>
                    <Select value={form.customerType} onValueChange={(v) => setForm({ ...form, customerType: v })}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Home User">Home User</SelectItem>
                        <SelectItem value="Corporate Office">Corporate Office</SelectItem>
                        <SelectItem value="Reseller">Reseller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Monthly Bill (৳)</Label>
                    <Input type="number" value={form.monthlyBill} onChange={(e) => setForm({ ...form, monthlyBill: Number(e.target.value) })} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Billing Date</Label>
                    <Input type="date" value={form.billingDate} onChange={(e) => setForm({ ...form, billingDate: e.target.value })} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">OTC (৳)</Label>
                    <Input type="number" value={form.otc} onChange={(e) => setForm({ ...form, otc: Number(e.target.value) })} className="h-9 text-sm" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              <X className="h-3.5 w-3.5 mr-1" /> Close
            </Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                </Button>
              )}
              {step < 3 ? (
                <Button size="sm" onClick={() => setStep(step + 1)}>
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleSave} disabled={!form.customerName.trim() || !form.mobile.trim()}>
                  {editItem ? "Update" : "Submit Request"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteItem}
        onOpenChange={(o) => !o && setDeleteItem(null)}
        title="Delete Client Request"
        description={`Are you sure you want to delete the request for "${deleteItem?.customerName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </PageContainer>
  );
}
