import { useState } from "react";
import { Receipt, Info, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const userTypes = [
  { id: "admin_customer", label: "AdminCustomer" },
  { id: "mac_reseller", label: "MACReseller" },
  { id: "mac_reseller_customer", label: "MACResellerCustomer" },
  { id: "bandwidth_reseller", label: "BandwidthReseller" },
];

const VatSetupPage = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const [vatPercentage, setVatPercentage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedUser) {
      toast.error("একটি User Type সিলেক্ট করুন");
      return;
    }
    if (!vatPercentage) {
      toast.error("VAT percentage দিন");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success(`${userTypes.find((u) => u.id === selectedUser)?.label} — VAT সেভ হয়েছে`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>System</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">VAT Setup</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payment VAT</h1>
            <p className="text-sm text-muted-foreground">Setting Up Payment VAT</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <div className="bg-foreground/90 text-background px-4 py-3 rounded-t-lg flex items-center gap-2">
          <Info className="h-4 w-4" />
          <h3 className="font-semibold text-sm">VAT Settings</h3>
        </div>
        <CardContent className="p-6 space-y-6">
          {/* Info */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">"Vat Settings"</span> for all user
            </p>
          </div>

          {/* User Type Select */}
          <div className="space-y-2 max-w-md">
            <Label>User Type</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="--- Select ---" />
              </SelectTrigger>
              <SelectContent>
                {userTypes.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              Select user for individual vat setup
            </p>
          </div>

          {selectedUser && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              {/* VAT Percentage */}
              <div className="space-y-2 max-w-xs">
                <Label>VAT Percentage (%)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 15"
                  value={vatPercentage}
                  onChange={(e) => setVatPercentage(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          )}

          {/* Save */}
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving} className="min-w-[160px]">
              {saving ? "সেভ হচ্ছে..." : "Save or Update"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VatSetupPage;
