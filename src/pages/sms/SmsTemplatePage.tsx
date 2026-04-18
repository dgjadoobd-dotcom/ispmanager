import { useState } from "react";
import { FileText, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SmsTemplate {
  id: string;
  name: string;
  type: "Default" | "Custom";
  body: string;
}

const initialTemplates: SmsTemplate[] = [
  { id: "1", name: "Payment Receipt", type: "Default", body: "Dear {CustomerName}, your payment of {Amount} TK has been received. Invoice #{InvoiceNo}. Thank you for choosing our service." },
  { id: "2", name: "Welcome Message", type: "Default", body: "Welcome to our ISP service, {CustomerName}! Your account has been activated. Username: {Username}. For support call: {SupportNumber}." },
  { id: "3", name: "Due Reminder", type: "Default", body: "Dear {CustomerName}, your bill of {Amount} TK is due on {DueDate}. Please pay to avoid service disruption." },
  { id: "4", name: "Service Disruption", type: "Default", body: "Dear {CustomerName}, we are experiencing service disruption in {Area}. Our team is working to resolve it. ETA: {ETA}." },
  { id: "5", name: "EID Greetings", type: "Custom", body: "EID Mubarak! {CompanyName} wishes you and your family a blessed EID. May this EID bring peace and happiness." },
  { id: "6", name: "Package Upgrade", type: "Custom", body: "Dear {CustomerName}, upgrade your package to {PackageName} at only {Price} TK/month and enjoy {Speed} speed!" },
  { id: "7", name: "Connection Suspended", type: "Default", body: "Dear {CustomerName}, your connection has been suspended due to non-payment. Due: {Amount} TK. Pay now to restore service." },
  { id: "8", name: "New Year Offer", type: "Custom", body: "Happy New Year from {CompanyName}! Enjoy 20% discount on all packages this month. Call {SupportNumber} for details." },
  { id: "9", name: "Password Reset", type: "Default", body: "Dear {CustomerName}, your password has been reset. New password: {Password}. Please change it after login." },
  { id: "10", name: "Maintenance Notice", type: "Default", body: "Dear {CustomerName}, scheduled maintenance on {Date} from {StartTime} to {EndTime}. Service may be briefly interrupted." },
  { id: "11", name: "Referral Bonus", type: "Custom", body: "Dear {CustomerName}, refer a friend and get {BonusAmount} TK credit! Share code: {ReferralCode}. T&C apply." },
  { id: "12", name: "Invoice Generated", type: "Default", body: "Dear {CustomerName}, your invoice #{InvoiceNo} of {Amount} TK has been generated for {BillingPeriod}. Due: {DueDate}." },
];

export default function SmsTemplatePage() {
  const [templates, setTemplates] = useState<SmsTemplate[]>(initialTemplates);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<SmsTemplate | null>(null);
  const [form, setForm] = useState({ name: "", type: "Custom" as "Default" | "Custom", body: "" });

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.body.toLowerCase().includes(search.toLowerCase())
  );

  const perPage = parseInt(entriesPerPage);
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const openAdd = () => {
    setEditTemplate(null);
    setForm({ name: "", type: "Custom", body: "" });
    setDialogOpen(true);
  };

  const openEdit = (t: SmsTemplate) => {
    setEditTemplate(t);
    setForm({ name: t.name, type: t.type, body: t.body });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.body.trim()) {
      toast.error("Template name and body are required");
      return;
    }
    if (editTemplate) {
      setTemplates((prev) => prev.map((t) => (t.id === editTemplate.id ? { ...t, ...form } : t)));
      toast.success("Template updated successfully");
    } else {
      setTemplates((prev) => [...prev, { id: Date.now().toString(), ...form }]);
      toast.success("Template added successfully");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">SMS Template</h1>
          </div>
          <p className="text-sm text-muted-foreground">SMS Service &gt; SMS Template</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Template
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select value={entriesPerPage} onValueChange={(v) => { setEntriesPerPage(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">entries</span>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 h-9" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="px-4 py-3 text-left font-semibold w-16">#</th>
                <th className="px-4 py-3 text-left font-semibold">Template Name</th>
                <th className="px-4 py-3 text-left font-semibold w-32">Template Type</th>
                <th className="px-4 py-3 text-left font-semibold">Template</th>
                <th className="px-4 py-3 text-center font-semibold w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No templates found</td>
                </tr>
              ) : (
                paginated.map((t, i) => (
                  <tr key={t.id} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{(currentPage - 1) * perPage + i + 1}</td>
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={t.type === "Default" ? "default" : "secondary"} className={t.type === "Default" ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}>
                        {t.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">{t.body}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => openEdit(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={() => handleDelete(t.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} size="sm" className="min-w-[36px]" onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </Button>
          ))}
          <Button variant="outline" size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTemplate ? "Edit Template" : "Add Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Enter template name" />
            </div>
            <div className="space-y-2">
              <Label>Template Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as "Default" | "Custom" }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Default">Default</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Template Body</Label>
              <Textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="Enter SMS template body..." rows={5} />
              <p className="text-xs text-muted-foreground">
                Variables: {"{CustomerName}"}, {"{Amount}"}, {"{InvoiceNo}"}, {"{DueDate}"}, {"{Username}"}, {"{Password}"}, {"{PackageName}"}, {"{CompanyName}"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editTemplate ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
