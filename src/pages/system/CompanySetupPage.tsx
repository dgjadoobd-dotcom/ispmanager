import { useState, useEffect } from "react";
import { Building2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTenantContext } from "@/contexts/TenantContext";
import { useUpdateTenantSettings } from "@/hooks/useTenantSettings";
import { toast } from "sonner";

const timezones = [
  "Asia/Dhaka", "Asia/Kolkata", "Asia/Tokyo", "Asia/Dubai", "Asia/Singapore",
  "Europe/London", "Europe/Berlin", "America/New_York", "America/Los_Angeles",
  "Australia/Sydney", "Pacific/Auckland", "UTC",
];

const countries = [
  { name: "Bangladesh", code: "BD", dial: "+880", symbol: "৳" },
  { name: "India", code: "IN", dial: "+91", symbol: "₹" },
  { name: "United States", code: "US", dial: "+1", symbol: "$" },
  { name: "United Kingdom", code: "GB", dial: "+44", symbol: "£" },
  { name: "Australia", code: "AU", dial: "+61", symbol: "A$" },
  { name: "Singapore", code: "SG", dial: "+65", symbol: "S$" },
  { name: "Japan", code: "JP", dial: "+81", symbol: "¥" },
  { name: "UAE", code: "AE", dial: "+971", symbol: "د.إ" },
];

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-t-lg font-semibold text-sm">
      {title}
    </div>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help inline ml-1" />
      </TooltipTrigger>
      <TooltipContent><p className="text-xs">{text}</p></TooltipContent>
    </Tooltip>
  );
}

export default function CompanySetupPage() {
  const { currentTenant } = useTenantContext();
  const updateSettings = useUpdateTenantSettings(currentTenant?.id);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address1: "",
    address2: "",
    mobile1: "",
    mobile2: "",
    phone1: "",
    phone2: "",
    clientCode: "automatic",
    showInLogin: true,
    country: "Bangladesh",
    countryCode: "BD",
    currency: "৳",
    language: "bn",
    dialCode: "+880",
    timezone: "Asia/Dhaka",
  });

  useEffect(() => {
    if (currentTenant) {
      const matched = countries.find(c => c.symbol === currentTenant.currency) || countries[0];
      setForm(prev => ({
        ...prev,
        name: currentTenant.name || "",
        currency: currentTenant.currency || "৳",
        timezone: currentTenant.timezone || "Asia/Dhaka",
        language: currentTenant.language || "bn",
        country: matched.name,
        countryCode: matched.code,
        dialCode: matched.dial,
      }));
    }
  }, [currentTenant]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (countryName: string) => {
    const c = countries.find(ct => ct.name === countryName);
    if (c) {
      setForm(prev => ({
        ...prev,
        country: c.name,
        countryCode: c.code,
        dialCode: c.dial,
        currency: c.symbol,
      }));
    }
  };

  const handleSubmit = () => {
    updateSettings.mutate(
      {
        name: form.name,
        currency: form.currency,
        timezone: form.timezone,
        language: form.language,
      },
      {
        onSuccess: () => toast.success("Company information updated successfully"),
        onError: () => toast.error("Failed to update company information"),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <span>System</span>
          <span>/</span>
          <span className="text-foreground font-medium">Company Setup</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Company Setup</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your company information and localization settings
        </p>
      </div>

      {/* Basic Company Settings */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <SectionHeader title="Basic Company Settings" />
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Company Name <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={e => handleChange("name", e.target.value)} placeholder="Enter company name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Email Address</Label>
              <Input type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} placeholder="company@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Address 1</Label>
              <Input value={form.address1} onChange={e => handleChange("address1", e.target.value)} placeholder="Street address" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Address 2</Label>
              <Input value={form.address2} onChange={e => handleChange("address2", e.target.value)} placeholder="City, State" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Mobile 1</Label>
              <Input value={form.mobile1} onChange={e => handleChange("mobile1", e.target.value)} placeholder="+880 1XXXXXXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Mobile 2</Label>
              <Input value={form.mobile2} onChange={e => handleChange("mobile2", e.target.value)} placeholder="+880 1XXXXXXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Phone 1</Label>
              <Input value={form.phone1} onChange={e => handleChange("phone1", e.target.value)} placeholder="Phone number" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Phone 2</Label>
              <Input value={form.phone2} onChange={e => handleChange("phone2", e.target.value)} placeholder="Phone number" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Logo</Label>
              <Input type="file" accept="image/*" className="cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border">
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Client Code <InfoTooltip text="Choose how client codes are generated — automatic or custom prefix" />
              </Label>
              <RadioGroup value={form.clientCode} onValueChange={v => handleChange("clientCode", v)} className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="customizable" id="customizable" />
                  <Label htmlFor="customizable" className="text-sm font-normal cursor-pointer">Customizable</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="automatic" id="automatic" />
                  <Label htmlFor="automatic" className="text-sm font-normal cursor-pointer">Automatic</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <Checkbox
                id="showInLogin"
                checked={form.showInLogin}
                onCheckedChange={v => handleChange("showInLogin", !!v)}
              />
              <Label htmlFor="showInLogin" className="text-sm font-normal cursor-pointer">
                Want to Show in Login Page?
                <InfoTooltip text="Display company name and logo on the customer login page" />
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Company Localization */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <SectionHeader title="Company Localization" />
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Country</Label>
              <Select value={form.country} onValueChange={handleCountryChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {countries.map(c => (
                    <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Country Code</Label>
              <Input value={form.countryCode} readOnly className="bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Symbol</Label>
              <Input value={form.currency} onChange={e => handleChange("currency", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Language</Label>
              <Input value={form.language} onChange={e => handleChange("language", e.target.value)} placeholder="e.g. bn, en" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Dial Code</Label>
              <Input value={form.dialCode} readOnly className="bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Timezone</Label>
              <Select value={form.timezone} onValueChange={v => handleChange("timezone", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={updateSettings.isPending} className="px-8">
          {updateSettings.isPending ? "Updating..." : "Update Company Information"}
        </Button>
      </div>
    </div>
  );
}