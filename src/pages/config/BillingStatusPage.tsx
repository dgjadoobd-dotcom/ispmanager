import { useState } from "react";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, CreditCard, Search } from "lucide-react";

interface BillingStatus {
  id: string;
  name: string;
  details: string;
  isActive: boolean;
}

const initialData: BillingStatus[] = [
  { id: "1", name: "Active", details: "Customer is active and billing normally", isActive: true },
  { id: "2", name: "Inactive", details: "Customer account is inactive", isActive: true },
  { id: "3", name: "Paid", details: "All dues are cleared", isActive: true },
  { id: "4", name: "Due", details: "Payment is pending", isActive: true },
  { id: "5", name: "Partial", details: "Partial payment received", isActive: true },
  { id: "6", name: "Left", details: "Customer has left / disconnected", isActive: true },
  { id: "7", name: "Free", details: "Free connection — no billing", isActive: true },
  { id: "8", name: "Personal", details: "Owner / personal use connection", isActive: false },
];

export default function BillingStatusPage() {
  const [items, setItems] = useState<BillingStatus[]>(initialData);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState("10");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<BillingStatus | null>(null);
  const [formName, setFormName] = useState("");
  const [formDetails, setFormDetails] = useState("");

  const [deleteItem, setDeleteItem] = useState<BillingStatus | null>(null);

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.details.toLowerCase().includes(search.toLowerCase())
  );
  const pp = parseInt(perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pp));
  const paginated = filtered.slice((page - 1) * pp, page * pp);

  const openAdd = () => {
    setEditItem(null);
    setFormName("");
    setFormDetails("");
    setDialogOpen(true);
  };

  const openEdit = (item: BillingStatus) => {
    setEditItem(item);
    setFormName(item.name);
    setFormDetails(item.details);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (editItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editItem.id ? { ...i, name: formName.trim(), details: formDetails.trim() } : i
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        { id: Date.now().toString(), name: formName.trim(), details: formDetails.trim(), isActive: true },
      ]);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteItem) {
      setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
      setDeleteItem(null);
    }
  };

  const toggleActive = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i)));
  };

  return (
    <PageContainer
      title="Billing Status"
      description="Configure customer billing statuses"
      actions={
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Billing Status
        </Button>
      }
    >
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
                <TableHead className="w-16 font-semibold">#</TableHead>
                <TableHead className="font-semibold">Billing Status</TableHead>
                <TableHead className="font-semibold">Details</TableHead>
                <TableHead className="font-semibold w-24 text-center">Status</TableHead>
                <TableHead className="font-semibold w-28 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    No billing statuses found
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{(page - 1) * pp + idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.details || "—"}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch checked={item.isActive} onCheckedChange={() => toggleActive(item.id)} />
                        <Badge variant={item.isActive ? "default" : "secondary"} className="text-xs">
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteItem(item)}>
                          <Trash2 className="h-4 w-4" />
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Billing Status" : "Add Billing Status"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Billing Status Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Active, Due, Free" />
            </div>
            <div className="space-y-2">
              <Label>Details</Label>
              <Input value={formDetails} onChange={(e) => setFormDetails(e.target.value)} placeholder="Optional details" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formName.trim()}>{editItem ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteItem}
        onOpenChange={(o) => !o && setDeleteItem(null)}
        title="Delete Billing Status"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </PageContainer>
  );
}
