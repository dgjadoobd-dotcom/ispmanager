import React, { useState, useMemo } from "react";
import { Settings, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface TaskCategory {
  id: string;
  name: string;
  details: string;
}

const initialData: TaskCategory[] = [
  { id: "1", name: "New Line Add", details: "New fiber line installation task" },
  { id: "2", name: "Home shifting", details: "Customer home shifting relocation" },
  { id: "3", name: "Office Work", details: "Internal office related tasks" },
  { id: "4", name: "Bill", details: "Billing and payment collection" },
  { id: "5", name: "Rudra", details: "Rudra zone specific tasks" },
  { id: "6", name: "rbr", details: "RBR area maintenance" },
  { id: "7", name: "SunnyTest", details: "Test category for QA" },
  { id: "8", name: "ddd", details: "Miscellaneous tasks" },
];

const TaskCategoryPage = () => {
  const [categories, setCategories] = useState<TaskCategory[]>(initialData);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TaskCategory | null>(null);
  const [form, setForm] = useState({ name: "", details: "" });

  const filtered = useMemo(() => {
    if (!search) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.details.toLowerCase().includes(q));
  }, [categories, search]);

  const perPage = parseInt(entriesPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", details: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: TaskCategory) => {
    setEditing(cat);
    setForm({ name: cat.name, details: cat.details });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Category Name is required"); return; }
    if (editing) {
      setCategories((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...form } : c)));
      toast.success("Category updated");
    } else {
      setCategories((prev) => [...prev, { id: Date.now().toString(), ...form }]);
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
          <span>Task Management</span>
          <span>/</span>
          <span className="text-foreground font-medium">Task Category</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Task Category</h1>
              <p className="text-sm text-muted-foreground">Configure Task Category</p>
            </div>
          </div>
          <Button onClick={openAdd} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Task Category
          </Button>
        </div>
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
        <Table>
          <TableHeader>
            <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
              <TableHead className="w-[70px] font-semibold text-primary-foreground">#</TableHead>
              <TableHead className="font-semibold text-primary-foreground">Task Category Type</TableHead>
              <TableHead className="font-semibold text-primary-foreground">Details</TableHead>
              <TableHead className="w-[100px] font-semibold text-primary-foreground text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No data available in table</TableCell>
              </TableRow>
            ) : (
              paginated.map((cat, i) => (
                <TableRow key={cat.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{(currentPage - 1) * perPage + i + 1}</TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[300px] truncate">{cat.details}</TableCell>
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

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="h-8 px-2.5 text-xs">First</Button>
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="h-8 w-8 p-0"><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="h-8 w-8 p-0"><ChevronRight className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)} className="h-8 px-2.5 text-xs">Last</Button>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Task Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. New Line Add" />
            </div>
            <div className="space-y-2">
              <Label>Details</Label>
              <Textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Category description..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskCategoryPage;
