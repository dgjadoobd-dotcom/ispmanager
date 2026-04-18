import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Server } from "lucide-react";
import type { OltDevice } from "@/hooks/useOltDevices";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device?: OltDevice | null;
  onSubmit: (data: Partial<OltDevice>) => Promise<void>;
  mode: "add" | "edit";
}

export function OltDeviceFormDialog({ open, onOpenChange, device, onSubmit, mode }: Props) {
  const [form, setForm] = useState({
    name: "", brand: "huawei", model: "", host: "", port: 23,
    protocol: "telnet", username: "", credentials_encrypted: "",
    snmp_community: "public", snmp_version: "v2c",
    total_pon_ports: 8, is_enabled: true, notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (device && mode === "edit") {
      setForm({
        name: device.name, brand: device.brand, model: device.model || "",
        host: device.host, port: device.port, protocol: device.protocol,
        username: device.username, credentials_encrypted: "",
        snmp_community: device.snmp_community || "public",
        snmp_version: device.snmp_version || "v2c",
        total_pon_ports: device.total_pon_ports, is_enabled: device.is_enabled,
        notes: device.notes || "",
      });
    } else {
      setForm({
        name: "", brand: "huawei", model: "", host: "", port: 23,
        protocol: "telnet", username: "", credentials_encrypted: "",
        snmp_community: "public", snmp_version: "v2c",
        total_pon_ports: 8, is_enabled: true, notes: "",
      });
    }
  }, [device, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.host) return;
    setLoading(true);
    try {
      const payload: any = { ...form };
      if (!payload.credentials_encrypted) delete payload.credentials_encrypted;
      if (mode === "edit" && device) payload.id = device.id;
      await onSubmit(payload);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {mode === "add" ? "OLT ডিভাইস যোগ করুন" : "OLT ডিভাইস এডিট করুন"}
          </DialogTitle>
          <DialogDescription>
            আপনার GPON/EPON OLT ডিভাইসের তথ্য দিন
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>নাম *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Main OLT" />
            </div>
            <div className="space-y-2">
              <Label>ব্র্যান্ড</Label>
              <Select value={form.brand} onValueChange={v => setForm(f => ({ ...f, brand: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="huawei">Huawei</SelectItem>
                  <SelectItem value="zte">ZTE</SelectItem>
                  <SelectItem value="bdcom">BDCOM</SelectItem>
                  <SelectItem value="vsol">VSOL</SelectItem>
                  <SelectItem value="nokia">Nokia</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>মডেল</Label>
              <Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="MA5608T" />
            </div>
            <div className="space-y-2">
              <Label>প্রোটোকল</Label>
              <Select value={form.protocol} onValueChange={v => setForm(f => ({ ...f, protocol: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="telnet">Telnet</SelectItem>
                  <SelectItem value="ssh">SSH</SelectItem>
                  <SelectItem value="snmp">SNMP Only</SelectItem>
                  <SelectItem value="http">HTTP API</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>হোস্ট/IP *</Label>
              <Input value={form.host} onChange={e => setForm(f => ({ ...f, host: e.target.value }))} placeholder="192.168.1.1" />
            </div>
            <div className="space-y-2">
              <Label>পোর্ট</Label>
              <Input type="number" value={form.port} onChange={e => setForm(f => ({ ...f, port: parseInt(e.target.value) || 23 }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ইউজারনেম</Label>
              <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="admin" />
            </div>
            <div className="space-y-2">
              <Label>পাসওয়ার্ড</Label>
              <Input type="password" value={form.credentials_encrypted} onChange={e => setForm(f => ({ ...f, credentials_encrypted: e.target.value }))} placeholder={mode === "edit" ? "অপরিবর্তিত রাখুন" : ""} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>SNMP Community</Label>
              <Input value={form.snmp_community} onChange={e => setForm(f => ({ ...f, snmp_community: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>SNMP Version</Label>
              <Select value={form.snmp_version} onValueChange={v => setForm(f => ({ ...f, snmp_version: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">v1</SelectItem>
                  <SelectItem value="v2c">v2c</SelectItem>
                  <SelectItem value="v3">v3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>PON পোর্ট সংখ্যা</Label>
              <Input type="number" value={form.total_pon_ports} onChange={e => setForm(f => ({ ...f, total_pon_ports: parseInt(e.target.value) || 8 }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>নোটস</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.is_enabled} onCheckedChange={v => setForm(f => ({ ...f, is_enabled: v }))} />
            <Label>সক্রিয়</Label>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>বাতিল</Button>
          <Button onClick={handleSubmit} disabled={loading || !form.name || !form.host}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "add" ? "যোগ করুন" : "সেভ করুন"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
