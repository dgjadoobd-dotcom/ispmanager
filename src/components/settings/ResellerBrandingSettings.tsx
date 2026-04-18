import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Palette, Image, Type, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCurrentTenant } from "@/hooks/useTenant";
import { useUpdateTenantSettings } from "@/hooks/useTenantSettings";
import { toast } from "sonner";

export function ResellerBrandingSettings() {
  const { data: tenant, isLoading } = useCurrentTenant();
  const updateSettings = useUpdateTenantSettings(tenant?.id);

  const [controls, setControls] = useState({
    allow_reseller_branding: false,
    allow_reseller_logo: false,
    allow_reseller_name: false,
    allow_reseller_theme: false,
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (tenant) {
      setControls({
        allow_reseller_branding: (tenant as any).allow_reseller_branding ?? false,
        allow_reseller_logo: (tenant as any).allow_reseller_logo ?? false,
        allow_reseller_name: (tenant as any).allow_reseller_name ?? false,
        allow_reseller_theme: (tenant as any).allow_reseller_theme ?? false,
      });
    }
  }, [tenant]);

  const handleToggle = (field: keyof typeof controls, value: boolean) => {
    const updated = { ...controls, [field]: value };
    if (field === "allow_reseller_branding" && !value) {
      updated.allow_reseller_logo = false;
      updated.allow_reseller_name = false;
      updated.allow_reseller_theme = false;
    }
    setControls(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(controls as any);
      setHasChanges(false);
      toast.success("Reseller branding settings updated");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Reseller Branding Controls</CardTitle>
          <Badge variant={controls.allow_reseller_branding ? "default" : "secondary"}>
            {controls.allow_reseller_branding ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <CardDescription>
          Allow resellers to use their own branding. You can disable this at any time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Allow Reseller Branding</Label>
              <p className="text-xs text-muted-foreground">
                Allow resellers to use their own brand
              </p>
            </div>
          </div>
          <Switch
            checked={controls.allow_reseller_branding}
            onCheckedChange={(v) => handleToggle("allow_reseller_branding", v)}
          />
        </div>

        {controls.allow_reseller_branding && (
          <>
            <Separator />
            <div className="space-y-4 pl-2">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm">Allow Reseller Logo</Label>
                    <p className="text-xs text-muted-foreground">
                      Display the reseller's own logo
                    </p>
                  </div>
                </div>
                <Switch
                  checked={controls.allow_reseller_logo}
                  onCheckedChange={(v) => handleToggle("allow_reseller_logo", v)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm">Allow Reseller Brand Name</Label>
                    <p className="text-xs text-muted-foreground">
                      Display the reseller's brand name
                    </p>
                  </div>
                </div>
                <Switch
                  checked={controls.allow_reseller_name}
                  onCheckedChange={(v) => handleToggle("allow_reseller_name", v)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm">Allow Reseller Theme Override</Label>
                    <p className="text-xs text-muted-foreground">
                      Use the reseller's color theme instead of ISP theme
                    </p>
                  </div>
                </div>
                <Switch
                  checked={controls.allow_reseller_theme}
                  onCheckedChange={(v) => handleToggle("allow_reseller_theme", v)}
                />
              </div>
            </div>
          </>
        )}

        {hasChanges && (
          <div className="flex justify-end pt-2 animate-fade-in">
            <Button onClick={handleSave} disabled={updateSettings.isPending}>
              {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
