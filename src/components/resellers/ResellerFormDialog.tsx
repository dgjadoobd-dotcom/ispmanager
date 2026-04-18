import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateReseller } from "@/hooks/useResellers";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResellerFormDialog({ open, onOpenChange }: Props) {
  const createReseller = useCreateReseller();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    user_email: "",
    user_password: "",
    commission_type: "percentage",
    commission_value: 5,
    notes: "",
  });

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.user_email || !form.user_password) return;
    createReseller.mutate(
      {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        address: form.address || undefined,
        user_email: form.user_email,
        user_password: form.user_password,
        commission_type: form.commission_type,
        commission_value: form.commission_value,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setForm({
            name: "", phone: "", email: "", address: "",
            user_email: "", user_password: "",
            commission_type: "percentage", commission_value: 5, notes: "",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Reseller</DialogTitle>
          <DialogDescription>Enter reseller details and login credentials</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Reseller name" />
          </div>
          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
          </div>
          <div className="space-y-2">
            <Label>Email (Optional)</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="reseller@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Address (Optional)</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Area, City" />
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Login Credentials</p>
            <div className="space-y-2">
              <Label>Login Email *</Label>
              <Input value={form.user_email} onChange={(e) => setForm({ ...form, user_email: e.target.value })} placeholder="login@example.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input value={form.user_password} onChange={(e) => setForm({ ...form, user_password: e.target.value })} placeholder="Minimum 6 characters" type="password" />
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Commission Settings</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Commission Type</Label>
                <Select value={form.commission_type} onValueChange={(v) => setForm({ ...form, commission_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="flat">Flat (৳)</SelectItem>
                    <SelectItem value="per_payment">Per Payment (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Commission Value</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.commission_value}
                  onChange={(e) => setForm({ ...form, commission_value: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional info..." rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createReseller.isPending}>
            {createReseller.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Reseller
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}