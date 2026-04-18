import React, { useState, useMemo } from "react";
import { Settings, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type CategoryType = "Only For Office" | "For Everyone";
type TabKey = "clients" | "pops" | "bandwidth";

interface SupportCategory {
  id: string;
  name: string;
  department: string;
  categoryType: CategoryType;
  details: string;
  tab: TabKey;
}

const initialData: SupportCategory[] = [
  { id: "1", name: "Internet Problem", department: "Technical", categoryType: "For Everyone", details: "Client internet connectivity issues", tab: "clients" },
  { id: "2", name: "Billing Issue", department: "Accounts", categoryType: "For Everyone", details: "Billing and payment related queries", tab: "clients" },
  { id: "3", name: "New Connection", department: "Sales", categoryType: "For Everyone", details: "New connection request", tab: "clients" },
  { id: "4", name: "Speed Problem", department: "Technical", categoryType: "For Everyone", details: "Internet speed related complaints", tab: "clients" },
  { id: "5", name: "Disconnection", department: "Technical", categoryType: "Only For Office", details: "Connection disconnection request", tab: "clients" },
  { id: "6", name: "Package Change", department: "Sales", categoryType: "For Everyone", details: "Package upgrade or downgrade", tab: "clients" },
  { id: "7", name: "Router Issue", department: "Technical", categoryType: "Only For Office", details: "Customer router problem", tab: "clients" },
  { id: "8", name: "Cable Problem", department: "Technical", categoryType: "Only For Office", details: "Fiber or cable damage report", tab: "clients" },
  { id: "9", name: "POP Down", department: "Network", categoryType: "Only For Office", details: "POP site is down", tab: "pops" },
  { id: "10", name: "Power Issue", department: "Network", categoryType: "Only For Office", details: "POP power failure", tab: "pops" },
  { id: "11", name: "Bandwidth Overload", department: "Network", categoryType: "Only For Office", details: "Bandwidth POP overloaded", tab: "bandwidth" },
];

const tabs: { key: TabKey; label: string }[] = [
  { key: "clients", label: "Client's" },
  { key: "pops", label: "POP's" },
  { key: "bandwidth", label: "Bandwidth POP's" },
];

const SupportCategoryPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("clients");
  const [categories, setCategories] = useState<SupportCategory[]>(initialData);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SupportCategory | null>(null);
  const [form, setForm] = useState({ name: "", department: "", categoryType: "For Everyone" as CategoryType, details: "" });

  const filtered = useMemo(() => {
    const tabData = categories.filter((c) => c.tab === activeTab);
    if (!search) return tabData;
    const q = search.toLowerCase();
    return tabData.filter((c) => c.name.toLowerCase().includes(q) || c.department.toLowerCase().includes(q) || c.details.toLowerCase().includes(q));
  }, [categories, activeTab, search]);

  const perPage = parseInt(entriesPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const openAdd = () => {
    setEditingCategory(null);
    setForm({ name: "", department: "", categoryType: "For Everyone", details: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: SupportCategory) => {
    setEditingCategory(cat);
    setForm({ name: cat.name, department: cat.department, categoryType: cat.categoryType, details: cat.details });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.department) { toast.error("Name and Department are required"); return; }
    if (editingCategory) {
      setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? { ...c, ...form } : c)));
      toast.success("Category updated");
    } else {
      setCategories((prev) => [...prev, { id: Date.now().toString(), ...form, tab: activeTab }]);
      toast.success("Category added");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success("Category deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>Configuration</span>
          <span>/</span>
          <span className="text-foreground font-medium">Support Categories</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Support Categories</h1>
            <p className="text-sm text-muted-foreground">Configure Support Categories</p>
          </div>
        </div>
      </div>

      {/* Tabs + Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <Button
              key={t.key}
              variant={activeTab === t.key ? "default" : "outline"}
              size="sm"
              onClick={() => { setActiveTab(t.key); setCurrentPage(1); }}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Support Category
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select value={entriesPerPage} onValueChange={(v) => { setEntriesPerPage(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
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
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 h-9" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/80">
                <TableHead className="w-[60px] font-semibold">#</TableHead>
                <TableHead className="font-semibold">Support Category</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
                <TableHead className="font-semibold">Category Type</TableHead>
                <TableHead className="font-semibold">Details</TableHead>
                <TableHead className="w-[100px] font-semibold text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No data available in table</TableCell>
                </TableRow>
              ) : (
                paginated.map((cat, i) => (
                  <TableRow key={cat.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{(currentPage - 1) * perPage + i + 1}</TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>{cat.department}</TableCell>
                    <TableCell>
                      <Badge className={cat.categoryType === "For Everyone" ? "bg-emerald-500/15 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20" : "bg-amber-500/15 text-amber-600 border-amber-200 hover:bg-amber-500/20"}>
                        {cat.categoryType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">{cat.details}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary" onClick={() => openEdit(cat)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(cat.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries</span>
        <div className="flex gap-1">
          <Button variant="outline" size="xs" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>First</Button>
          <Button variant="outline" size="xs" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}><ChevronLeft className="h-3 w-3" /></Button>
          <Button variant="outline" size="xs" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}><ChevronRight className="h-3 w-3" /></Button>
          <Button variant="outline" size="xs" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)}>Last</Button>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit" : "Add"} Support Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Internet Problem" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Technical" />
            </div>
            <div className="space-y-2">
              <Label>Category Type</Label>
              <Select value={form.categoryType} onValueChange={(v) => setForm({ ...form, categoryType: v as CategoryType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="For Everyone">For Everyone</SelectItem>
                  <SelectItem value="Only For Office">Only For Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Details</Label>
              <Textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Category description..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingCategory ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportCategoryPage;
