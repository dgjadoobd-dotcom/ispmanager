import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Radio } from "lucide-react";
import { useOltDevices, useOltPorts, useCreateCustomerOnu, useUpdateCustomerOnu, type CustomerOnu } from "@/hooks/useOltDevices";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  existingOnu?: CustomerOnu | null;
}

export function CustomerOnuDialog({ open, onOpenChange, customerId, customerName, existingOnu }: Props) {
  const { data: devices } = useOltDevices();
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const { data: ports } = useOltPorts(selectedDevice || undefined);
  const createOnu = useCreateCustomerOnu();
  const updateOnu = useUpdateCustomerOnu();

  const [form, setForm] = useState({
    olt_port_id: "", onu_number: "", onu_serial: "", onu_mac: "",
    onu_type: "router", vlan_id: "", service_port_id: "", notes: "",
  });

  useEffect(() => {
    if (existingOnu) {
      setForm({
        olt_port_id: existingOnu.olt_port_id,
        onu_number: existingOnu.onu_number?.toString() || "",
        onu_serial: existingOnu.onu_serial || "",
        onu_mac: existingOnu.onu_mac || "",
        onu_type: existingOnu.onu_type || "router",
        vlan_id: existingOnu.vlan_id?.toString() || "",
        service_port_id: existingOnu.service_port_id?.toString() || "",
        notes: existingOnu.notes || "",
      });
      // Try to find the device for this port
      if (existingOnu.olt_ports?.olt_devices) {
        // We'll set device after devices load
      }
    } else {
      setForm({ olt_port_id: "", onu_number: "", onu_serial: "", onu_mac: "", onu_type: "router", vlan_id: "", service_port_id: "", notes: "" });
    }
  }, [existingOnu, open]);

  const loading = createOnu.isPending || updateOnu.isPending;

  const handleSubmit = async () => {
    if (!form.olt_port_id) return;
    const payload: any = {
      customer_id: customerId,
      olt_port_id: form.olt_port_id,
      onu_number: form.onu_number ? parseInt(form.onu_number) : null,
      onu_serial: form.onu_serial || null,
      onu_mac: form.onu_mac || null,
      onu_type: form.onu_type,
      vlan_id: form.vlan_id ? parseInt(form.vlan_id) : null,
      service_port_id: form.service_port_id ? parseInt(form.service_port_id) : null,
      notes: form.notes || null,
    };
    if (existingOnu) {
      await updateOnu.mutateAsync({ id: existingOnu.id, ...payload });
    } else {
      await createOnu.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            {existingOnu ? "ONU তথ্য আপডেট" : "ONU অ্যাসাইন করুন"}
          </DialogTitle>
          <DialogDescription>{customerName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>OLT ডিভাইস *</Label>
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger><SelectValue placeholder="ডিভাইস নির্বাচন করুন" /></SelectTrigger>
              <SelectContent>
                {devices?.filter(d => d.is_enabled).map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name} ({d.brand})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>PON পোর্ট *</Label>
            <Select value={form.olt_port_id} onValueChange={v => setForm(f => ({ ...f, olt_port_id: v }))} disabled={!selectedDevice}>
              <SelectTrigger><SelectValue placeholder="পোর্ট নির্বাচন করুন" /></SelectTrigger>
              <SelectContent>
                {ports?.filter(p => p.status === "active").map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    Slot {p.slot} / Port {p.port} {p.port_label ? `(${p.port_label})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ONU নম্বর</Label>
              <Input type="number" value={form.onu_number} onChange={e => setForm(f => ({ ...f, onu_number: e.target.value }))} placeholder="1" />
            </div>
            <div className="space-y-2">
              <Label>ONU Type</Label>
              <Select value={form.onu_type} onValueChange={v => setForm(f => ({ ...f, onu_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="router">Router ONU</SelectItem>
                  <SelectItem value="bridge">Bridge ONU</SelectItem>
                  <SelectItem value="hgu">HGU</SelectItem>
                  <SelectItem value="sfu">SFU</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ONU Serial</Label>
              <Input value={form.onu_serial} onChange={e => setForm(f => ({ ...f, onu_serial: e.target.value }))} placeholder="HWTC-XXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label>ONU MAC</Label>
              <Input value={form.onu_mac} onChange={e => setForm(f => ({ ...f, onu_mac: e.target.value }))} placeholder="AA:BB:CC:DD:EE:FF" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>VLAN ID</Label>
              <Input type="number" value={form.vlan_id} onChange={e => setForm(f => ({ ...f, vlan_id: e.target.value }))} placeholder="100" />
            </div>
            <div className="space-y-2">
              <Label>Service Port ID</Label>
              <Input type="number" value={form.service_port_id} onChange={e => setForm(f => ({ ...f, service_port_id: e.target.value }))} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>বাতিল</Button>
          <Button onClick={handleSubmit} disabled={loading || !form.olt_port_id}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingOnu ? "আপডেট" : "অ্যাসাইন করুন"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
