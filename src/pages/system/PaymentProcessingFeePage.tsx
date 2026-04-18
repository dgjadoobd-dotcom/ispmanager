import { useState } from "react";
import { DollarSign, Info, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const customerTypes = [
  { id: "admin", label: "For Admin Customer" },
  { id: "pop", label: "For POP" },
  { id: "bandwidth_pop", label: "For Bandwidth POP" },
  { id: "pop_customer", label: "For POP Customer" },
];

const paymentGateways = [
  { id: "sslcommerz", label: "SSLCommerz" },
  { id: "bkash", label: "bKash" },
  { id: "nagad", label: "Nagad" },
  { id: "uddoktapay", label: "UddoktaPay" },
  { id: "rocket", label: "Rocket" },
];

const PaymentProcessingFeePage = () => {
  const [selectedType, setSelectedType] = useState("admin");
  const [gateway, setGateway] = useState("");
  const [feeType, setFeeType] = useState("percentage");
  const [feeValue, setFeeValue] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedLabel = customerTypes.find((t) => t.id === selectedType)?.label || "";

  const handleSave = async () => {
    if (!gateway) {
      toast.error("একটি Payment Gateway সিলেক্ট করুন");
      return;
    }
    if (!feeValue) {
      toast.error("Fee value দিন");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success(`${selectedLabel} — Processing Fee সেভ হয়েছে`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>System</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">P. Processing Fee</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payment Processing Fee</h1>
            <p className="text-sm text-muted-foreground">Setting Up Payment Processing Fee</p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left — Customer Types */}
        <Card className="lg:col-span-3">
          <div className="bg-foreground/90 text-background px-4 py-3 rounded-t-lg">
            <h3 className="font-semibold text-sm">Customer Type</h3>
          </div>
          <div className="divide-y divide-border">
            {customerTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-accent/50 ${
                  selectedType === type.id
                    ? "bg-primary/10 text-primary font-semibold border-l-4 border-primary"
                    : "text-foreground"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Right — Settings */}
        <Card className="lg:col-span-9">
          <div className="bg-foreground/90 text-background px-4 py-3 rounded-t-lg flex items-center gap-2">
            <Info className="h-4 w-4" />
            <h3 className="font-semibold text-sm">Payment Processing Fee Settings</h3>
          </div>
          <CardContent className="p-6 space-y-6">
            {/* Info */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                Set <span className="font-semibold text-foreground">"Payment Fee Settings"</span> for{" "}
                <span className="font-semibold text-primary">{selectedLabel}</span>
              </p>
            </div>

            {/* Gateway Select */}
            <div className="space-y-2">
              <Label>Payment Gateways</Label>
              <Select value={gateway} onValueChange={setGateway}>
                <SelectTrigger>
                  <SelectValue placeholder="--- Select Gateway ---" />
                </SelectTrigger>
                <SelectContent>
                  {paymentGateways.map((gw) => (
                    <SelectItem key={gw.id} value={gw.id}>
                      {gw.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {gateway && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                {/* Fee Type */}
                <div className="space-y-2">
                  <Label>Fee Type</Label>
                  <RadioGroup value={feeType} onValueChange={setFeeType} className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="percentage" id="fee-pct" />
                      <Label htmlFor="fee-pct" className="cursor-pointer font-normal">Percentage (%)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="fixed" id="fee-fixed" />
                      <Label htmlFor="fee-fixed" className="cursor-pointer font-normal">Fixed Amount (৳)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Fee Value */}
                <div className="space-y-2 max-w-xs">
                  <Label>{feeType === "percentage" ? "Fee Percentage (%)" : "Fixed Amount (৳)"}</Label>
                  <Input
                    type="number"
                    placeholder={feeType === "percentage" ? "e.g. 2.5" : "e.g. 10"}
                    value={feeValue}
                    onChange={(e) => setFeeValue(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  এই ফি কাস্টমারের পেমেন্ট করার সময় যোগ হবে। গেটওয়ে অনুযায়ী আলাদা ফি সেট করা যাবে।
                </p>
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
    </div>
  );
};

export default PaymentProcessingFeePage;
