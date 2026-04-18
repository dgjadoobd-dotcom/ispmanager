import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsSection, SettingsRow } from "./SettingsSection";
import { useCurrentTenant } from "@/hooks/useTenant";
import { useUpdateTenantSettings } from "@/hooks/useTenantSettings";
import { Loader2 } from "lucide-react";

export function GeneralSettings() {
  const { data: tenant, isLoading } = useCurrentTenant();
  const updateSettings = useUpdateTenantSettings(tenant?.id);

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    currency: "BDT",
    timezone: "Asia/Dhaka",
    language: "en",
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || "",
        subdomain: tenant.subdomain || "",
        currency: tenant.currency || "BDT",
        timezone: tenant.timezone || "Asia/Dhaka",
        language: tenant.language || "en",
      });
    }
  }, [tenant]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      name: formData.name,
      subdomain: formData.subdomain,
      currency: formData.currency,
      timezone: formData.timezone,
      language: formData.language,
    });
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-muted/50 animate-pulse rounded-lg" />
        <div className="h-48 bg-muted/50 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Business Information"
        description="Your ISP identity — this appears on invoices, receipts, and the customer portal."
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your ISP Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex">
                <Input
                  id="subdomain"
                  value={formData.subdomain}
                  onChange={(e) => handleChange("subdomain", e.target.value)}
                  className="rounded-r-none"
                  placeholder="yourname"
                />
                <div className="flex items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                  .ispmanager.app
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Support Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="support@yourisp.com"
              />
              <p className="text-xs text-muted-foreground">Shown on customer invoices and portal</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Support Phone</Label>
              <Input id="phone" placeholder="+880 1XXX-XXXXXX" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              placeholder="Your business address"
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Regional Settings"
        description="Currency and timezone affect how amounts and dates appear across your workspace."
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(v) => handleChange("currency", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BDT">BDT (৳)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(v) => handleChange("timezone", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={formData.language}
                onValueChange={(v) => handleChange("language", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">বাংলা (Bangla)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </SettingsSection>

      {hasChanges && (
        <div className="flex justify-end animate-slide-up">
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
