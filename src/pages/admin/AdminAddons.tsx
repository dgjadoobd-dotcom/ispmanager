import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Package, Plus, Users, Zap, Bell, Network, BarChart3, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const addons = [
  {
    id: "1",
    name: "Network Automation Pack",
    code: "network_auto",
    description: "MikroTik/RADIUS integration with auto-sync, suspend/restore automation",
    pricing: "Tiered",
    basePrice: 500,
    isActive: true,
    adopters: 42,
    icon: Network,
  },
  {
    id: "2",
    name: "Advanced Analytics",
    code: "analytics_pro",
    description: "Detailed revenue analytics, customer churn predictions, and trend reports",
    pricing: "Fixed",
    basePrice: 300,
    isActive: true,
    adopters: 28,
    icon: BarChart3,
  },
  {
    id: "3",
    name: "Push Notifications",
    code: "push_notify",
    description: "Send payment reminders and alerts via push notifications to customers",
    pricing: "Usage-based",
    basePrice: 200,
    isActive: true,
    adopters: 55,
    icon: Bell,
  },
  {
    id: "4",
    name: "Multi-Staff Access",
    code: "multi_staff",
    description: "Add unlimited staff members with role-based access control",
    pricing: "Tiered",
    basePrice: 400,
    isActive: true,
    adopters: 35,
    icon: Users,
  },
  {
    id: "5",
    name: "API Access",
    code: "api_access",
    description: "Full REST API access for third-party integrations and custom apps",
    pricing: "Fixed",
    basePrice: 1000,
    isActive: false,
    adopters: 12,
    icon: Zap,
  },
  {
    id: "6",
    name: "White-Label Portal",
    code: "white_label",
    description: "Custom branding for customer portal with reseller support",
    pricing: "Fixed",
    basePrice: 800,
    isActive: true,
    adopters: 20,
    icon: Shield,
  },
];

export default function AdminAddons() {
  const activeAddons = addons.filter(a => a.isActive).length;
  const totalAdopters = addons.reduce((s, a) => s + a.adopters, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add-ons Management</h1>
          <p className="text-muted-foreground">Configure and manage platform add-on features</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Add-on
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Add-ons</p>
              <p className="text-lg font-bold">{addons.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <Zap className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-lg font-bold">{activeAddons}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-info/10">
              <Users className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Adoptions</p>
              <p className="text-lg font-bold">{totalAdopters}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add-ons Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {addons.map((addon) => {
          const Icon = addon.icon;
          return (
            <Card key={addon.id} className="group hover:shadow-soft transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-xl",
                      addon.isActive ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Icon className={cn("h-5 w-5", addon.isActive ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{addon.name}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono">{addon.code}</p>
                    </div>
                  </div>
                  <Switch checked={addon.isActive} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{addon.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{addon.pricing}</Badge>
                    <span className="text-sm font-semibold">৳{addon.basePrice}/mo</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span className="text-xs">{addon.adopters} ISPs</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Configure
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
