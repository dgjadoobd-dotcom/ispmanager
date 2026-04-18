import { useState, useEffect, useRef } from "react";
import { Building2, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentTenant } from "@/hooks/useTenant";
import { useUpdateTenantSettings } from "@/hooks/useTenantSettings";
import { toast } from "sonner";
import { ResellerBrandingSettings } from "./ResellerBrandingSettings";
import { useUserRole } from "@/hooks/useUserRole";

export function BrandingSettings() {
  const { data: currentTenant, isLoading: tenantLoading } = useCurrentTenant();
  const updateSettings = useUpdateTenantSettings(currentTenant?.id);
  
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [accentColor, setAccentColor] = useState("#8B5CF6");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing values
  useEffect(() => {
    if (currentTenant) {
      setPrimaryColor(currentTenant.primary_color || "#3B82F6");
      setAccentColor(currentTenant.accent_color || "#8B5CF6");
      setLogoUrl(currentTenant.logo_url);
    }
  }, [currentTenant]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTenant) return;
    if (!file.type.startsWith("image/")) { toast.error("শুধুমাত্র image ফাইল আপলোড করা যাবে"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("ফাইল সাইজ ২MB এর বেশি হতে পারবে না"); return; }
    setIsUploading(true);
    try {
      // Convert to base64 data URL for local storage
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        await updateSettings.mutateAsync({ logo_url: dataUrl } as any);
        setLogoUrl(dataUrl);
        toast.success("লোগো আপলোড হয়েছে!");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error("লোগো আপলোড করতে সমস্যা হয়েছে");
      setIsUploading(false);
    }
  };

  const handleSaveColors = async () => {
    if (!currentTenant) return;

    // Validate color format
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexPattern.test(primaryColor)) {
      toast.error("Primary color সঠিক hex ফরম্যাটে দিন (যেমন #3B82F6)");
      return;
    }
    if (!hexPattern.test(accentColor)) {
      toast.error("Accent color সঠিক hex ফরম্যাটে দিন (যেমন #8B5CF6)");
      return;
    }

    setIsSaving(true);
    try {
      await updateSettings.mutateAsync({
        primary_color: primaryColor,
        accent_color: accentColor,
      });
      toast.success("Brand colors আপডেট হয়েছে!");
    } catch (error) {
      console.error("Error saving colors:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const { data: userRole } = useUserRole();
  const canManageResellerBranding = userRole === "isp_owner" || userRole === "super_admin";

  if (tenantLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          লোড হচ্ছে...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logo Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
          <CardDescription>
            আপনার ISP এর লোগো আপলোড করুন। এটি Invoice এবং Receipt PDF এ দেখা যাবে।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            {/* Logo Preview */}
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted overflow-hidden">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Company logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {logoUrl ? "Change Logo" : "Upload Logo"}
              </Button>
              <p className="text-sm text-muted-foreground">
                PNG, JPG বা SVG (সর্বোচ্চ 2MB)
              </p>
            </div>
          </div>

          {logoUrl && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              লোগো আপলোড করা আছে
            </div>
          )}
        </CardContent>
      </Card>

      {/* Brand Colors Card */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <CardDescription>
            আপনার ব্র্যান্ড কালার সেট করুন। এগুলো PDF এ ব্যবহার হবে।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Primary Color */}
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <div
                  className="h-10 w-10 rounded-md border cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "color";
                    input.value = primaryColor;
                    input.onchange = (e) =>
                      setPrimaryColor((e.target as HTMLInputElement).value);
                    input.click();
                  }}
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1 font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Header, buttons এবং links এ ব্যবহার হবে
              </p>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <div
                  className="h-10 w-10 rounded-md border cursor-pointer"
                  style={{ backgroundColor: accentColor }}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "color";
                    input.value = accentColor;
                    input.onchange = (e) =>
                      setAccentColor((e.target as HTMLInputElement).value);
                    input.click();
                  }}
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#8B5CF6"
                  className="flex-1 font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Secondary elements এ ব্যবহার হবে
              </p>
            </div>
          </div>

          <Separator />

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="rounded-lg border p-4">
              <div
                className="h-12 rounded-t-md flex items-center px-4"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-white font-semibold">
                  {currentTenant?.name || "Your ISP Name"}
                </span>
              </div>
              <div
                className="h-2"
                style={{ backgroundColor: accentColor }}
              />
              <div className="p-4 bg-muted/30 rounded-b-md">
                <p className="text-sm text-muted-foreground">
                  এভাবে আপনার Invoice PDF দেখাবে
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleSaveColors} disabled={isSaving}>
            {isSaving ? "সেভ হচ্ছে..." : "Colors সেভ করুন"}
          </Button>
        </CardContent>
      </Card>

      {/* Invoice Branding Card */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Branding</CardTitle>
          <CardDescription>
            Customize your invoice appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceHeader">Invoice Header Text</Label>
            <Input
              id="invoiceHeader"
              defaultValue={currentTenant?.name || "FastNet Internet Services"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceFooter">Invoice Footer Text</Label>
            <Input
              id="invoiceFooter"
              defaultValue={`Thank you for choosing ${currentTenant?.name || "us"}!`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reseller Branding Controls - ISP Owner only */}
      {canManageResellerBranding && <ResellerBrandingSettings />}
    </div>
  );
}
