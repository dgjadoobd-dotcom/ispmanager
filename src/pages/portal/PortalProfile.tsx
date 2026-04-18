import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Mail, 
  Phone, 
  Wifi,
  Calendar,
  Save,
  Loader2,
  UserX,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePortalCustomer } from "@/hooks/usePortalData";
import { useCurrentTenant } from "@/hooks/useTenant";
import { dbUpdate, now, TABLES } from "@/lib/db";
import { toast } from "sonner";

const statusConfig = {
  active: { label: "Active", variant: "default" as const },
  suspended: { label: "Suspended", variant: "destructive" as const },
  pending: { label: "Pending", variant: "secondary" as const },
};

export default function PortalProfile() {
  const { data: customer, isLoading, refetch } = usePortalCustomer();
  const { data: tenant } = useCurrentTenant();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Load customer data into form
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
      });
    }
  }, [customer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!customer?.id) return;
    setSaving(true);
    try {
      dbUpdate(TABLES.customers, customer.id, {
        name: formData.name, email: formData.email,
        phone: formData.phone, address: formData.address,
        updated_at: now(),
      });
      toast.success("Profile updated successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-80" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <UserX className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">No Account Found</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Your login is not linked to any customer account. Please contact your ISP to link your account.
        </p>
      </div>
    );
  }

  const connectionStatus = customer.connection_status || "pending";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          View and update your account information
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Account Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <Separator />
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Connection Details Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wifi className="h-5 w-5" />
                Connection Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={statusConfig[connectionStatus].variant}>
                  {statusConfig[connectionStatus].label}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Wifi className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Package</p>
                    <p className="font-medium">
                      {customer.packages?.name || "No Package"}
                      {customer.packages?.speed_label && (
                        <span className="text-muted-foreground text-sm ml-1">
                          ({customer.packages.speed_label})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Customer ID</p>
                    <p className="font-medium font-mono text-sm">
                      {customer.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">{formatDate(customer.join_date)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Contact your ISP for support or to request changes to your package.
              </p>
              {tenant && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{tenant.name}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full bg-background"
                onClick={() => {
                  toast.info("Password reset is not available. Please contact your administrator.");
                }}
              >
                Reset My Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
