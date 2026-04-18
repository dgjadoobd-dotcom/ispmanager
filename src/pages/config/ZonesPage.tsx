import { useState, useMemo } from "react";
import { PageContainer } from "@/components/shared/PageContainer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Plus, Pencil, Trash2, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Types
interface Zone { id: string; name: string; details: string }
interface SubZone { id: string; name: string; zoneId: string; details: string }
interface Box { id: string; name: string; subZoneId: string; details: string }

// Demo data
const initialZones: Zone[] = [
  { id: "z1", name: "Uttara", details: "Uttara sector 1-14" },
  { id: "z2", name: "Mirpur", details: "Mirpur 1-14" },
  { id: "z3", name: "Dhanmondi", details: "Dhanmondi residential area" },
];
const initialSubZones: SubZone[] = [
  { id: "sz1", name: "Uttara Sector 3", zoneId: "z1", details: "Sector 3 coverage" },
  { id: "sz2", name: "Mirpur 10", zoneId: "z2", details: "Mirpur 10 area" },
  { id: "sz3", name: "Dhanmondi 27", zoneId: "z3", details: "Road 27 area" },
];
const initialBoxes: Box[] = [
  { id: "b1", name: "Box-U3-01", subZoneId: "sz1", details: "Pole #45, near mosque" },
  { id: "b2", name: "Box-M10-01", subZoneId: "sz2", details: "Pole #12, main road" },
];

export default function ZonesPage() {
  const [activeTab, setActiveTab] = useState("zone");

  // Data state
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [subZones, setSubZones] = useState<SubZone[]>(initialSubZones);
  const [boxes, setBoxes] = useState<Box[]>(initialBoxes);

  // Search & pagination
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState("10");
  const [page, setPage] = useState(1);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [formParentId, setFormParentId] = useState("");
  const [formZoneId, setFormZoneId] = useState("");

  const resetForm = () => { setFormName(""); setFormDetails(""); setFormParentId(""); setFormZoneId(""); setEditItem(null); };

  const openAdd = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (item: any) => {
    setEditItem(item);
    setFormName(item.name);
    setFormDetails(item.details);
    setFormParentId(item.zoneId || item.subZoneId || "");
    if (activeTab === "box" && item.subZoneId) {
      const sz = subZones.find(s => s.id === item.subZoneId);
      setFormZoneId(sz?.zoneId || "");
    } else {
      setFormZoneId("");
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (activeTab === "zone") {
      if (editItem) {
        setZones(prev => prev.map(z => z.id === editItem.id ? { ...z, name: formName, details: formDetails } : z));
      } else {
        setZones(prev => [...prev, { id: `z${Date.now()}`, name: formName, details: formDetails }]);
      }
    } else if (activeTab === "subzone") {
      if (editItem) {
        setSubZones(prev => prev.map(s => s.id === editItem.id ? { ...s, name: formName, zoneId: formParentId, details: formDetails } : s));
      } else {
        setSubZones(prev => [...prev, { id: `sz${Date.now()}`, name: formName, zoneId: formParentId, details: formDetails }]);
      }
    } else {
      if (editItem) {
        setBoxes(prev => prev.map(b => b.id === editItem.id ? { ...b, name: formName, subZoneId: formParentId, details: formDetails } : b));
      } else {
        setBoxes(prev => [...prev, { id: `b${Date.now()}`, name: formName, subZoneId: formParentId, details: formDetails }]);
      }
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "zone") setZones(prev => prev.filter(z => z.id !== deleteTarget.id));
    else if (deleteTarget.type === "subzone") setSubZones(prev => prev.filter(s => s.id !== deleteTarget.id));
    else setBoxes(prev => prev.filter(b => b.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // Filtered data
  const limit = parseInt(perPage);
  const filterBySearch = <T extends { name: string; details: string }>(items: T[]) =>
    items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.details.toLowerCase().includes(search.toLowerCase()));

  const filteredZones = useMemo(() => filterBySearch(zones), [zones, search]);
  const filteredSubZones = useMemo(() => filterBySearch(subZones), [subZones, search]);
  const filteredBoxes = useMemo(() => filterBySearch(boxes), [boxes, search]);

  const currentData = activeTab === "zone" ? filteredZones : activeTab === "subzone" ? filteredSubZones : filteredBoxes;
  const totalPages = Math.max(1, Math.ceil(currentData.length / limit));
  const pagedData = currentData.slice((page - 1) * limit, page * limit);

  const getZoneName = (id: string) => zones.find(z => z.id === id)?.name ?? "—";
  const getSubZoneName = (id: string) => subZones.find(s => s.id === id)?.name ?? "—";

  const tabLabel = activeTab === "zone" ? "Zone" : activeTab === "subzone" ? "Sub Zone" : "Box";

  // Reset page on tab/search change
  const handleTabChange = (v: string) => { setActiveTab(v); setPage(1); setSearch(""); };

  return (
    <PageContainer
      title="Zone / Sub Zone / Box"
      description="Manage your network coverage zones, sub zones, and distribution boxes"
    >
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="zone" className="gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Zone
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-[10px]">{zones.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="subzone" className="gap-1.5">
              Sub Zone
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-[10px]">{subZones.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="box" className="gap-1.5">
              Box
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-[10px]">{boxes.length}</Badge>
            </TabsTrigger>
          </TabsList>
          <Button size="sm" onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> Add {tabLabel}
          </Button>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Show
            <Select value={perPage} onValueChange={v => { setPerPage(v); setPage(1); }}>
              <SelectTrigger className="h-8 w-[70px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["5", "10", "25", "50"].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
            entries
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="h-8 pl-8"
            />
          </div>
        </div>

        {/* Zone Tab */}
        <TabsContent value="zone" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5 hover:bg-primary/5">
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Zone Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Details</TableHead>
                  <TableHead className="w-28 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedData.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No zones found</TableCell></TableRow>
                ) : (pagedData as Zone[]).map((z, i) => (
                  <TableRow key={z.id}>
                    <TableCell className="font-medium text-muted-foreground">{(page - 1) * limit + i + 1}</TableCell>
                    <TableCell className="font-medium">{z.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{z.details || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(z)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget({ type: "zone", id: z.id })}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Sub Zone Tab */}
        <TabsContent value="subzone" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5 hover:bg-primary/5">
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Sub Zone</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead className="hidden sm:table-cell">Details</TableHead>
                  <TableHead className="w-28 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedData.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No sub zones found</TableCell></TableRow>
                ) : (pagedData as SubZone[]).map((s, i) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-muted-foreground">{(page - 1) * limit + i + 1}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell><Badge variant="outline">{getZoneName(s.zoneId)}</Badge></TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{s.details || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget({ type: "subzone", id: s.id })}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Box Tab */}
        <TabsContent value="box" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5 hover:bg-primary/5">
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Box Name</TableHead>
                  <TableHead>Sub Zone</TableHead>
                  <TableHead className="hidden sm:table-cell">Details</TableHead>
                  <TableHead className="w-28 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedData.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No boxes found</TableCell></TableRow>
                ) : (pagedData as Box[]).map((b, i) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium text-muted-foreground">{(page - 1) * limit + i + 1}</TableCell>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell><Badge variant="outline">{getSubZoneName(b.subZoneId)}</Badge></TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{b.details || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget({ type: "box", id: b.id })}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, currentData.length)} of {currentData.length}</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={o => { if (!o) { setDialogOpen(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit" : "Add"} {tabLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{tabLabel} Name</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder={`Enter ${tabLabel.toLowerCase()} name`} />
            </div>
            {activeTab === "subzone" && (
              <div className="space-y-2">
                <Label>Parent Zone</Label>
                <Select value={formParentId} onValueChange={setFormParentId}>
                  <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                  <SelectContent>
                    {zones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {activeTab === "box" && (
              <>
                <div className="space-y-2">
                  <Label>Zone</Label>
                  <Select value={formZoneId} onValueChange={v => { setFormZoneId(v); setFormParentId(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                    <SelectContent>
                      {zones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sub Zone</Label>
                  <Select value={formParentId} onValueChange={setFormParentId}>
                    <SelectTrigger><SelectValue placeholder="Select sub zone" /></SelectTrigger>
                    <SelectContent>
                      {subZones.filter(s => s.zoneId === formZoneId).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Details</Label>
              <Textarea value={formDetails} onChange={e => setFormDetails(e.target.value)} placeholder="Optional details..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formName.trim()}>{editItem ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={o => { if (!o) setDeleteTarget(null); }}
        title={`Delete ${deleteTarget?.type === "zone" ? "Zone" : deleteTarget?.type === "subzone" ? "Sub Zone" : "Box"}?`}
        description="This action cannot be undone. Are you sure you want to delete this item?"
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
