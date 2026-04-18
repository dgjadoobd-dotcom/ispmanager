import { useState, useMemo } from "react";
import {
  Server, Plus, RefreshCw, Edit, Trash2, MoreVertical, Search,
  CheckCircle, XCircle, Network as NetworkIcon, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useOltDevices, useCreateOltDevice, useUpdateOltDevice, useDeleteOltDevice,
  type OltDevice,
} from "@/hooks/useOltDevices";
import { OltDeviceFormDialog } from "@/components/olt/OltDeviceFormDialog";
import { OltPortsDialog } from "@/components/olt/OltPortsDialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function OltDevicesPage() {
  const queryClient = useQueryClient();
  const { data: devices, isLoading } = useOltDevices();
  const createDevice = useCreateOltDevice();
  const updateDevice = useUpdateOltDevice();
  const deleteDevice = useDeleteOltDevice();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingDevice, setEditingDevice] = useState<OltDevice | null>(null);
  const [portsDevice, setPortsDevice] = useState<OltDevice | null>(null);

  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const handleAdd = () => { setEditingDevice(null); setFormMode("add"); setFormOpen(true); };
  const handleEdit = (d: OltDevice) => { setEditingDevice(d); setFormMode("edit"); setFormOpen(true); };

  const handleSubmit = async (data: Partial<OltDevice>) => {
    if (formMode === "edit" && data.id) {
      await updateDevice.mutateAsync(data as any);
    } else {
      await createDevice.mutateAsync(data);
    }
  };

  const handleSyncAll = () => {
    queryClient.invalidateQueries({ queryKey: ["olt-devices"] });
    toast.success("সকল OLT সিঙ্ক শুরু হয়েছে");
  };

  const filtered = useMemo(() => {
    if (!devices) return [];
    if (!search.trim()) return devices;
    const q = search.toLowerCase();
    return devices.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.host.toLowerCase().includes(q) ||
      d.brand.toLowerCase().includes(q) ||
      (d.snmp_community || "").toLowerCase().includes(q)
    );
  }, [devices, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  const startEntry = filtered.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, filtered.length);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>OLT</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">OLT Manage</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">OLT</h1>
              <p className="text-sm text-muted-foreground">OLT Manage</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSyncAll}>
            <RefreshCw className="h-4 w-4 mr-2" />Sync All OLTs
          </Button>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />Add OLT
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">SHOW</span>
          <Select value={String(entriesPerPage)} onValueChange={v => { setEntriesPerPage(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map(n => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground whitespace-nowrap">ENTRIES</span>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/80 hover:bg-muted/80">
              <TableHead className="w-[60px] font-semibold text-xs uppercase">Serial</TableHead>
              <TableHead className="font-semibold text-xs uppercase">Name</TableHead>
              <TableHead className="font-semibold text-xs uppercase">IP</TableHead>
              <TableHead className="font-semibold text-xs uppercase">Community</TableHead>
              <TableHead className="font-semibold text-xs uppercase">OLT Type</TableHead>
              <TableHead className="font-semibold text-xs uppercase">PON Ports</TableHead>
              <TableHead className="font-semibold text-xs uppercase text-center">Status</TableHead>
              <TableHead className="font-semibold text-xs uppercase text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <Server className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">কোনো OLT ডিভাইস পাওয়া যায়নি</p>
                  <p className="text-xs mt-1">নতুন OLT যোগ করতে "Add OLT" বাটনে ক্লিক করুন</p>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((device, idx) => (
                <TableRow key={device.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {(currentPage - 1) * entriesPerPage + idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {device.host}:{device.port || 161}
                  </TableCell>
                  <TableCell className="text-sm">{device.snmp_community || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] uppercase">{device.brand}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{device.protocol}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{device.total_pon_ports || 0}</TableCell>
                  <TableCell className="text-center">
                    {device.is_enabled ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                        <XCircle className="h-3 w-3 mr-1" />Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => handleEdit(device)}>
                        <Edit className="h-3.5 w-3.5 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Ports" onClick={() => setPortsDevice(device)}>
                        <NetworkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Delete" onClick={() => deleteDevice.mutate(device.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {startEntry} to {endEntry} of {filtered.length} entries
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="xs" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>First</Button>
            <Button variant="outline" size="xs" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) { page = i + 1; }
              else if (currentPage <= 3) { page = i + 1; }
              else if (currentPage >= totalPages - 2) { page = totalPages - 4 + i; }
              else { page = currentPage - 2 + i; }
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="xs"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button variant="outline" size="xs" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
            <Button variant="outline" size="xs" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>Last</Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <OltDeviceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        device={editingDevice}
        onSubmit={handleSubmit}
        mode={formMode}
      />
      {portsDevice && (
        <OltPortsDialog
          open={!!portsDevice}
          onOpenChange={() => setPortsDevice(null)}
          device={portsDevice}
        />
      )}
    </div>
  );
}
