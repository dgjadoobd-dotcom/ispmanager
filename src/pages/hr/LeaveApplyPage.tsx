import { useState } from "react";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Search, CalendarDays, RotateCcw, Send, Eye, Paperclip } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LeaveApplication {
  id: string;
  employeeName: string;
  leaveCategory: string;
  subject: string;
  startDate: string;
  endDate: string;
  applyDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  attachment?: string;
}

const employees = [
  "Md. Rahim Uddin",
  "Fatema Begum",
  "Kamal Hossain",
  "Nasrin Akter",
  "Jahangir Alam",
];

const leaveCategories = ["Full Day", "Half Day", "Casual", "Sick", "Unpaid Leave"];

const initialApplications: LeaveApplication[] = [
  { id: "1", employeeName: "Md. Rahim Uddin", leaveCategory: "Casual", subject: "Family Event", startDate: "2026-03-10", endDate: "2026-03-11", applyDate: "2026-03-08", reason: "Attending a family wedding ceremony", status: "Approved" },
  { id: "2", employeeName: "Fatema Begum", leaveCategory: "Sick", subject: "Medical Appointment", startDate: "2026-03-12", endDate: "2026-03-12", applyDate: "2026-03-11", reason: "Doctor's appointment for routine checkup", status: "Pending" },
  { id: "3", employeeName: "Kamal Hossain", leaveCategory: "Full Day", subject: "Personal Work", startDate: "2026-03-15", endDate: "2026-03-16", applyDate: "2026-03-10", reason: "Need to handle some personal matters", status: "Rejected" },
  { id: "4", employeeName: "Nasrin Akter", leaveCategory: "Half Day", subject: "Bank Work", startDate: "2026-03-14", endDate: "2026-03-14", applyDate: "2026-03-12", reason: "Bank related documentation work", status: "Pending" },
  { id: "5", employeeName: "Jahangir Alam", leaveCategory: "Unpaid Leave", subject: "Emergency", startDate: "2026-03-20", endDate: "2026-03-22", applyDate: "2026-03-18", reason: "Family emergency in hometown", status: "Approved" },
];

export default function LeaveApplyPage() {
  const [applications, setApplications] = useState<LeaveApplication[]>(initialApplications);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState("10");
  const [page, setPage] = useState(1);

  // Form state
  const [formEmployee, setFormEmployee] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formLeaveType, setFormLeaveType] = useState("");
  const [formApplyDate, setFormApplyDate] = useState(new Date().toISOString().split("T")[0]);
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formReason, setFormReason] = useState("");

  // View dialog
  const [viewItem, setViewItem] = useState<LeaveApplication | null>(null);

  const filtered = applications.filter(
    (a) =>
      a.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase()) ||
      a.leaveCategory.toLowerCase().includes(search.toLowerCase())
  );
  const pp = parseInt(perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pp));
  const paginated = filtered.slice((page - 1) * pp, page * pp);

  const resetForm = () => {
    setFormEmployee("");
    setFormSubject("");
    setFormLeaveType("");
    setFormApplyDate(new Date().toISOString().split("T")[0]);
    setFormStartDate("");
    setFormEndDate("");
    setFormReason("");
  };

  const handleSubmit = () => {
    if (!formEmployee || !formSubject || !formLeaveType || !formApplyDate || !formStartDate || !formEndDate || !formReason) return;
    const newApp: LeaveApplication = {
      id: Date.now().toString(),
      employeeName: formEmployee,
      leaveCategory: formLeaveType,
      subject: formSubject,
      startDate: formStartDate,
      endDate: formEndDate,
      applyDate: formApplyDate,
      reason: formReason,
      status: "Pending",
    };
    setApplications((prev) => [newApp, ...prev]);
    resetForm();
  };

  const statusVariant = (s: string) =>
    s === "Approved" ? "active" : s === "Rejected" ? "suspended" : "pending";

  return (
    <PageContainer title="Leave Apply" description="Apply for leave and view application history">
      {/* Application Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Apply for Leave</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Employee Name <span className="text-destructive">*</span></Label>
              <Select value={formEmployee} onValueChange={setFormEmployee}>
                <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject <span className="text-destructive">*</span></Label>
              <Input value={formSubject} onChange={(e) => setFormSubject(e.target.value)} placeholder="Leave subject" />
            </div>
            <div className="space-y-2">
              <Label>Leave Type <span className="text-destructive">*</span></Label>
              <Select value={formLeaveType} onValueChange={setFormLeaveType}>
                <SelectTrigger><SelectValue placeholder="Select Leave Type" /></SelectTrigger>
                <SelectContent>
                  {leaveCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Apply Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={formApplyDate} onChange={(e) => setFormApplyDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Start Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Reason <span className="text-destructive">*</span></Label>
              <Textarea value={formReason} onChange={(e) => setFormReason(e.target.value)} placeholder="Describe reason for leave" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Upload Attachment</Label>
              <Input type="file" className="cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <Button variant="outline" onClick={resetForm}>
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-1" /> Submit Application
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
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
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 hover:bg-primary/5">
                <TableHead className="w-12 font-semibold">#</TableHead>
                <TableHead className="font-semibold">Leave Category</TableHead>
                <TableHead className="font-semibold">Subject</TableHead>
                <TableHead className="font-semibold">Start Date</TableHead>
                <TableHead className="font-semibold">End Date</TableHead>
                <TableHead className="font-semibold">Apply Date</TableHead>
                <TableHead className="font-semibold">Reason</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-center w-20">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    No leave applications found
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((app, idx) => (
                  <TableRow key={app.id}>
                    <TableCell className="text-muted-foreground">{(page - 1) * pp + idx + 1}</TableCell>
                    <TableCell className="font-medium">{app.leaveCategory}</TableCell>
                    <TableCell>{app.subject}</TableCell>
                    <TableCell>{app.startDate}</TableCell>
                    <TableCell>{app.endDate}</TableCell>
                    <TableCell>{app.applyDate}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{app.reason}</TableCell>
                    <TableCell className="text-center">
                      <StatusBadge variant={statusVariant(app.status)}>{app.status}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setViewItem(app)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t text-sm text-muted-foreground">
              <span>
                Showing {(page - 1) * pp + 1}–{Math.min(page * pp, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Leave Application Details</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Employee:</span><p className="font-medium">{viewItem.employeeName}</p></div>
                <div><span className="text-muted-foreground">Leave Type:</span><p className="font-medium">{viewItem.leaveCategory}</p></div>
                <div><span className="text-muted-foreground">Subject:</span><p className="font-medium">{viewItem.subject}</p></div>
                <div><span className="text-muted-foreground">Status:</span><p><StatusBadge variant={statusVariant(viewItem.status)}>{viewItem.status}</StatusBadge></p></div>
                <div><span className="text-muted-foreground">Start Date:</span><p className="font-medium">{viewItem.startDate}</p></div>
                <div><span className="text-muted-foreground">End Date:</span><p className="font-medium">{viewItem.endDate}</p></div>
                <div><span className="text-muted-foreground">Apply Date:</span><p className="font-medium">{viewItem.applyDate}</p></div>
              </div>
              <div>
                <span className="text-muted-foreground">Reason:</span>
                <p className="font-medium mt-1">{viewItem.reason}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
