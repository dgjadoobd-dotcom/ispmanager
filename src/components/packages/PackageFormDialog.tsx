import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Router } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Package } from "@/hooks/usePackages";

interface PackageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package?: Package | null;
  onSubmit: (data: {
    name: string;
    speed_label: string;
    monthly_price: number;
    validity_days: number;
    is_active: boolean;
    mikrotik_profile_name: string | null;
    mikrotik_rate_limit: string | null;
    mikrotik_address_pool: string | null;
    mikrotik_queue_type: string | null;
  }) => void;
  isLoading?: boolean;
  hasMikrotikIntegration?: boolean;
}

export function PackageFormDialog({
  open,
  onOpenChange,
  package: pkg,
  onSubmit,
  isLoading,
  hasMikrotikIntegration = false,
}: PackageFormDialogProps) {
  const [name, setName] = useState("");
  const [speedLabel, setSpeedLabel] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [validityDays, setValidityDays] = useState("30");
  const [isActive, setIsActive] = useState(true);
  const [mikrotikProfileName, setMikrotikProfileName] = useState("");
  const [mikrotikRateLimit, setMikrotikRateLimit] = useState("");
  const [mikrotikAddressPool, setMikrotikAddressPool] = useState("");
  const [mikrotikQueueType, setMikrotikQueueType] = useState("");

  useEffect(() => {
    if (pkg) {
      setName(pkg.name);
      setSpeedLabel(pkg.speed_label);
      setMonthlyPrice(pkg.monthly_price.toString());
      setValidityDays((pkg.validity_days ?? 30).toString());
      setIsActive(pkg.is_active ?? true);
      setMikrotikProfileName(pkg.mikrotik_profile_name ?? "");
      setMikrotikRateLimit(pkg.mikrotik_rate_limit ?? "");
      setMikrotikAddressPool(pkg.mikrotik_address_pool ?? "");
      setMikrotikQueueType(pkg.mikrotik_queue_type ?? "");
    } else {
      setName("");
      setSpeedLabel("");
      setMonthlyPrice("");
      setValidityDays("30");
      setIsActive(true);
      setMikrotikProfileName("");
      setMikrotikRateLimit("");
      setMikrotikAddressPool("");
      setMikrotikQueueType("");
    }
  }, [pkg, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      speed_label: speedLabel,
      monthly_price: parseFloat(monthlyPrice),
      validity_days: parseInt(validityDays),
      is_active: isActive,
      mikrotik_profile_name: mikrotikProfileName || null,
      mikrotik_rate_limit: mikrotikRateLimit || null,
      mikrotik_address_pool: mikrotikAddressPool || null,
      mikrotik_queue_type: mikrotikQueueType || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {pkg ? "Edit Package" : "Create New Package"}
            </DialogTitle>
            <DialogDescription>
              {pkg
                ? "Update the package details"
                : "Add a new internet service package"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Basic, Pro, Premium"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="speed">Speed</Label>
              <Input
                id="speed"
                value={speedLabel}
                onChange={(e) => setSpeedLabel(e.target.value)}
                placeholder="e.g. 20 Mbps"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Monthly Price (৳)</Label>
                <Input
                  id="price"
                  type="number"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                  placeholder="800"
                  min="0"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="validity">Validity (Days)</Label>
                <Input
                  id="validity"
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  placeholder="30"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active Package</Label>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            {/* MikroTik Integration Section */}
            {hasMikrotikIntegration && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Router className="h-4 w-4" />
                    <span>MikroTik Profile Mapping</span>
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="mikrotik_profile">PPP Profile Name</Label>
                      <Input
                        id="mikrotik_profile"
                        value={mikrotikProfileName}
                        onChange={(e) => setMikrotikProfileName(e.target.value)}
                        placeholder="e.g. 20M-Plan"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="mikrotik_rate">Rate Limit</Label>
                      <Input
                        id="mikrotik_rate"
                        value={mikrotikRateLimit}
                        onChange={(e) => setMikrotikRateLimit(e.target.value)}
                        placeholder="e.g. 20M/20M"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="mikrotik_pool">Address Pool</Label>
                        <Input
                          id="mikrotik_pool"
                          value={mikrotikAddressPool}
                          onChange={(e) => setMikrotikAddressPool(e.target.value)}
                          placeholder="e.g. pool-20m"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="mikrotik_queue">Queue Type</Label>
                        <Input
                          id="mikrotik_queue"
                          value={mikrotikQueueType}
                          onChange={(e) => setMikrotikQueueType(e.target.value)}
                          placeholder="e.g. pcq-upload-default"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pkg ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
