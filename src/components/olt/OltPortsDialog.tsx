import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Loader2 } from "lucide-react";
import { useOltPorts, useCreateOltPort, type OltDevice } from "@/hooks/useOltDevices";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: OltDevice;
}

export function OltPortsDialog({ open, onOpenChange, device }: Props) {
  const { data: ports, isLoading } = useOltPorts(device.id);
  const createPort = useCreateOltPort();
  const [adding, setAdding] = useState(false);
  const [newPort, setNewPort] = useState({ slot: 0, port: 0, port_label: "", port_type: "gpon", max_onus: 128 });

  const handleAdd = async () => {
    await createPort.mutateAsync({
      olt_device_id: device.id,
      slot: newPort.slot,
      port: newPort.port,
      port_label: newPort.port_label || `${newPort.slot}/${newPort.port}`,
      port_type: newPort.port_type,
      max_onus: newPort.max_onus,
    });
    setAdding(false);
    setNewPort({ slot: 0, port: 0, port_label: "", port_type: "gpon", max_onus: 128 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{device.name} — PON পোর্ট সমূহ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => setAdding(!adding)}>
              <Plus className="h-4 w-4 mr-1" /> পোর্ট যোগ
            </Button>
          </div>

          {adding && (
            <div className="rounded-lg border p-3 space-y-3 bg-muted/30">
              <div className="grid grid-cols-5 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Slot</Label>
                  <Input type="number" value={newPort.slot} onChange={e => setNewPort(p => ({ ...p, slot: +e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Port</Label>
                  <Input type="number" value={newPort.port} onChange={e => setNewPort(p => ({ ...p, port: +e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input value={newPort.port_label} onChange={e => setNewPort(p => ({ ...p, port_label: e.target.value }))} placeholder="0/0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select value={newPort.port_type} onValueChange={v => setNewPort(p => ({ ...p, port_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpon">GPON</SelectItem>
                      <SelectItem value="epon">EPON</SelectItem>
                      <SelectItem value="xgpon">XGPON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max ONUs</Label>
                  <Input type="number" value={newPort.max_onus} onChange={e => setNewPort(p => ({ ...p, max_onus: +e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>বাতিল</Button>
                <Button size="sm" onClick={handleAdd} disabled={createPort.isPending}>
                  {createPort.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  সেভ
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot/Port</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Max ONUs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow>
              ) : !ports?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">কোনো পোর্ট নেই</TableCell></TableRow>
              ) : (
                ports.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono">{p.slot}/{p.port}</TableCell>
                    <TableCell>{p.port_label || "-"}</TableCell>
                    <TableCell><Badge variant="outline" className="uppercase text-[10px]">{p.port_type}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={p.status === "active" ? "default" : "secondary"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.max_onus}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
