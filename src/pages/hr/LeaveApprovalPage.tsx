import { useState } from "react";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Search, CalendarDays, Eye, CheckCircle2, XCircle, Clock, ListChecks, Paperclip } from "lucide-react";

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

const initialApplications: LeaveApplication[] = [
  { id: "1", employeeName: "Md. Rahim Uddin", leaveCategory: "Casual", subject: "Family Event", startDate: "2026-03-10", endDate: "2026-03-11", applyDate: "2026-03-08", reason: "Attending a family wedding ceremony", status: "Approved" },
  { id: "2", employeeName: "Fatema Begum", leaveCategory: "Sick", subject: "Medical Appointment", startDate: "2026-03-12", endDate: "2026-03-12", applyDate: "2026-03-11", reason: "Doctor's appointment for routine checkup", status: "Pending" },
  { id: "3", employeeName: "Kamal Hossain", leaveCategory: "Full Day", subject: "Personal Work", startDate: "2026-03-15", endDate: "2026-03-16", applyDate: "2026-03-10", reason: "Need to handle some personal matters", status: "Rejected" },
  { id: "4", employeeName: "Nasrin Akter", leaveCategory: "Half Day", subject: "Bank Work", startDate: "2026-03-14", endDate: "2026-03-14", applyDate: "2026-03-12", reason: "Bank related documentation work", status: "Pending" },
  { id: "5", employeeName: "Jahangir Alam", leaveCategory: "Unpaid Leave", subject: "Emergency", startDate: "2026-03-20", endDate: "2026-03-22", applyDate: "2026-03-18", reason: "Family emergency in hometown", status: "Approved" },
  { id: "6", employeeName: "Salma Khatun", leaveCategory: "Casual", subject: "Personal Leave", startDate: "2026-03-25", endDate: "2026-03-25", applyDate: "2026-03-23", reason: "Personal work at home", status: "Pending" },
  { id: "7", employeeName: "Rafiq Ahmed", leaveCategory: "Sick", subject: "Fever", startDate: "2026-03-13", endDate: "2026-03-14", applyDate: "2026-03-13", reason: "High fever and body pain", status: "Approved" },
];

export default function LeaveApprovalPage() {
  const [applications, setApplications] = useState<LeaveApplication[]>(initialApplications);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState("10");
  const [page, setPage] = useState(1);
  const [viewItem, setViewItem] = useState<LeaveApplication | null>(null);
  const [approveItem, setApproveItem] = useState<LeaveApplication | null>(null);
  const [rejectItem, setRejectItem] = useState<LeaveApplication | null>(null);

  const approvedCount = applications.filter((a) => a.status === "Approved").length;
  const pendingCount = applications.filter((a) => a.status === "Pending").length;
  const rejectedCount = applications.filter((a) => a.status === "Rejected").length;

  const filtered = applications.filter(
    (a) =>
      a.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase()) ||
      a.leaveCategory.toLowerCase().includes(search.toLowerCase())
  );
  const pp = parseInt(perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pp));
  const paginated = filtered.slice((page - 1) * pp, page * pp);

  const handleApprove = () => {
    if (approveItem) {
      setApplications((prev) =>
        prev.map((a) => (a.id === approveItem.id ? { ...a, status: "Approved" as const } : a))
      );
      setApproveItem(null);
    }
  };

  const handleReject = () => {
    if (rejectItem) {
      setApplications((prev) =>
        prev.map((a) => (a.id === rejectItem.id ? { ...a, status: "Rejected" as const } : a))
      );
      setRejectItem(null);
    }
  };

  const statusVariant = (s: string) =>
    s === "Approved" ? "active" : s === "Rejected" ? "suspended" : "pending";

  return (
    <PageContainer title="Leave Approval" description="Review and approve/reject leave applications">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard title="Approved Requests" value={approvedCount} icon={CheckCircle2} variant="success" />
        <DashboardStatCard title="Pending Requests" value={pendingCount} icon={Clock} variant="info" />
        <DashboardStatCard title="Declined Requests" value={rejectedCount} icon={XCircle} variant="danger" />
        <DashboardStatCard title="Total Requests" value={applications.length} icon={ListChecks} variant="purple" />
      </div>

      {/* Table */}
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

          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 hover:bg-primary/5">
                <TableHead className="w-12 font-semibold">#</TableHead>
                <TableHead className="font-semibold">Employee Name</TableHead>
                <TableHead className="font-semibold">Leave Category</TableHead>
                <TableHead className="font-semibold">Subject</TableHead>
                <TableHead className="font-semibold">Start Date</TableHead>
                <TableHead className="font-semibold">End Date</TableHead>
                <TableHead className="font-semibold">Apply Date</TableHead>
                <TableHead className="font-semibold max-w-[150px]">Reason</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-center">Attachment</TableHead>
                <TableHead className="font-semibold text-center w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">
                    <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    No leave applications found
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((app, idx) => (
                  <TableRow key={app.id}>
                    <TableCell className="text-muted-foreground">{(page - 1) * pp + idx + 1}</TableCell>
                    <TableCell className="font-medium">{app.employeeName}</TableCell>
                    <TableCell>{app.leaveCategory}</TableCell>
                    <TableCell>{app.subject}</TableCell>
                    <TableCell>{app.startDate}</TableCell>
                    <TableCell>{app.endDate}</TableCell>
                    <TableCell>{app.applyDate}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{app.reason}</TableCell>
                    <TableCell className="text-center">
                      <StatusBadge variant={statusVariant(app.status)}>{app.status}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-center">
                      {app.attachment ? (
                        <Paperclip className="h-4 w-4 mx-auto text-primary" />
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {app.status === "Pending" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-success hover:text-success" onClick={() => setApproveItem(app)} title="Approve">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setRejectItem(app)} title="Reject">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => setViewItem(app)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
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
                <Button variant="outline" size="sm" className="h-8 px-3" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </Button>
                ))}
                <Button variant="outline" size="sm" className="h-8 px-3" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
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

      {/* Approve Confirmation */}
      <ConfirmationDialog
        open={!!approveItem}
        onOpenChange={(o) => !o && setApproveItem(null)}
        title="Approve Leave"
        description={`Are you sure you want to approve the leave application from "${approveItem?.employeeName}"?`}
        confirmLabel="Approve"
        onConfirm={handleApprove}
      />

      {/* Reject Confirmation */}
      <ConfirmationDialog
        open={!!rejectItem}
        onOpenChange={(o) => !o && setRejectItem(null)}
        title="Reject Leave"
        description={`Are you sure you want to reject the leave application from "${rejectItem?.employeeName}"?`}
        confirmLabel="Reject"
        onConfirm={handleReject}
        variant="destructive"
      />
    </PageContainer>
  );
}
