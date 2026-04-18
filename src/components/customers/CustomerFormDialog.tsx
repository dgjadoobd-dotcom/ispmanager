import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, User, Phone, Mail, MapPin, Package, Wifi } from "lucide-react";
import { usePackages } from "@/hooks/usePackages";
import type { ConnectionStatus } from "@/types";

export interface CustomerFormData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  packageId: string;
  connectionStatus: ConnectionStatus;
  dueBalance: number;
  advanceBalance: number;
}

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerFormData | null;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  mode: "add" | "edit";
  tenantId?: string;
}

const initialFormData: CustomerFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  packageId: "",
  connectionStatus: "pending",
  dueBalance: 0,
  advanceBalance: 0,
};

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onSubmit,
  mode,
  tenantId,
}: CustomerFormDialogProps) {
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  // Fetch packages from database
  const { data: packages, isLoading: packagesLoading } = usePackages(tenantId);

  useEffect(() => {
    if (customer && mode === "edit") {
      setFormData(customer);
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [customer, mode, open]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^01[3-9]\d{8}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Enter a valid Bangladeshi phone number";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.packageId) {
      newErrors.packageId = "Please select a package";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CustomerFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const selectedPackage = packages?.find((p) => p.id === formData.packageId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {mode === "add" ? "Add New Customer" : "Edit Customer"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Fill in the details to add a new customer to your network."
              : "Update the customer's details and connection settings."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Full Name *
            </Label>
            <Input
              id="name"
              placeholder="Enter customer name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              placeholder="01XXXXXXXXX"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="customer@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Address
            </Label>
            <Textarea
              id="address"
              placeholder="Enter full address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={2}
            />
          </div>

          {/* Package Selection */}
          <div className="space-y-2">
            <Label htmlFor="package" className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Internet Package *
            </Label>
            <Select
              value={formData.packageId}
              onValueChange={(value) => handleChange("packageId", value)}
              disabled={packagesLoading}
            >
              <SelectTrigger className={errors.packageId ? "border-destructive" : ""}>
                <SelectValue placeholder={packagesLoading ? "Loading..." : "Select a package"} />
              </SelectTrigger>
              <SelectContent>
                {packages?.filter(p => p.is_active).map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{pkg.name} ({pkg.speed_label})</span>
                      <span className="text-muted-foreground">
                        ৳{pkg.monthly_price}/mo
                      </span>
                    </div>
                  </SelectItem>
                ))}
                {(!packages || packages.filter(p => p.is_active).length === 0) && !packagesLoading && (
                  <SelectItem value="" disabled>
                    No packages found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.packageId && (
              <p className="text-xs text-destructive">{errors.packageId}</p>
            )}
            {selectedPackage && (
              <p className="text-xs text-muted-foreground">
                Monthly fee: ৳{selectedPackage.monthly_price.toLocaleString()}
              </p>
            )}
          </div>

          {/* Connection Status (only for edit) */}
          {mode === "edit" && (
            <div className="space-y-2">
              <Label htmlFor="status" className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                Connection Status
              </Label>
              <Select
                value={formData.connectionStatus}
                onValueChange={(value) =>
                  handleChange("connectionStatus", value as ConnectionStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Balance fields (only for edit) */}
          {mode === "edit" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueBalance">Due Balance (৳)</Label>
                <Input
                  id="dueBalance"
                  type="number"
                  min="0"
                  value={formData.dueBalance}
                  onChange={(e) =>
                    handleChange("dueBalance", parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advanceBalance">Advance (৳)</Label>
                <Input
                  id="advanceBalance"
                  type="number"
                  min="0"
                  value={formData.advanceBalance}
                  onChange={(e) =>
                    handleChange("advanceBalance", parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "add" ? "Add Customer" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
