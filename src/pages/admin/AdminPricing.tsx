import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Package, Puzzle, TrendingUp, Trash2 } from "lucide-react";
import {
  usePlatformPlans, usePlatformAddons, useCreatePlan, useUpdatePlan,
  useCreateAddon, useUpdateAddon, useUpdateAddonTiers,
  PlatformPlan, PlatformAddon, AddonTier,
} from "@/hooks/usePlatformPricing";

const billingCycleLabels = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

const pricingTypeLabels = {
  fixed: "Fixed Price",
  tiered: "Tiered",
  usage_based: "Usage Based",
};

export default function AdminPricing() {
  const { data: plans, isLoading: plansLoading } = usePlatformPlans();
  const { data: addons, isLoading: addonsLoading } = usePlatformAddons();

  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlatformPlan | null>(null);
  const [editingAddon, setEditingAddon] = useState<PlatformAddon | null>(null);
  const [editingTiersAddon, setEditingTiersAddon] = useState<PlatformAddon | null>(null);

  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const createAddon = useCreateAddon();
  const updateAddon = useUpdateAddon();
  const updateTiers = useUpdateAddonTiers();

  const handleEditPlan = (plan: PlatformPlan) => { setEditingPlan(plan); setPlanDialogOpen(true); };
  const handleEditAddon = (addon: PlatformAddon) => { setEditingAddon(addon); setAddonDialogOpen(true); };
  const handleEditTiers = (addon: PlatformAddon) => { setEditingTiersAddon(addon); setTierDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pricing Management</h1>
        <p className="text-muted-foreground">Plan, add-on, and tier configuration</p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans" className="gap-2"><Package className="h-4 w-4" />Plans</TabsTrigger>
          <TabsTrigger value="addons" className="gap-2"><Puzzle className="h-4 w-4" />Add-ons</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Subscription Plans</h2>
            <Button onClick={() => { setEditingPlan(null); setPlanDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />New Plan
            </Button>
          </div>

          {plansLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {plans?.map((plan) => (
                <Card key={plan.id} className={!plan.is_active ? "opacity-60" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {plan.name}
                          {!plan.is_active && <Badge variant="secondary">Inactive</Badge>}
                        </CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleEditPlan(plan)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold">৳{plan.base_price}</div>
                      <p className="text-sm text-muted-foreground">/ {billingCycleLabels[plan.billing_cycle]}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Customers</span>
                        <span className="font-medium">{plan.max_customers ?? "Unlimited"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Staff</span>
                        <span className="font-medium">{plan.max_staff ?? "Unlimited"}</span>
                      </div>
                    </div>
                    {plan.features && plan.features.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Features:</p>
                        <ul className="text-xs space-y-1">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <span className="text-green-500">✓</span> {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="addons" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Add-on Modules</h2>
            <Button onClick={() => { setEditingAddon(null); setAddonDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />New Add-on
            </Button>
          </div>

          {addonsLoading ? <Skeleton className="h-64" /> : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Pricing Type</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addons?.map((addon) => (
                    <TableRow key={addon.id}>
                      <TableCell className="font-medium">
                        <div>
                          {addon.name}
                          <p className="text-xs text-muted-foreground">{addon.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-xs">{addon.code}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{pricingTypeLabels[addon.pricing_type]}</Badge>
                      </TableCell>
                      <TableCell>৳{addon.base_price}</TableCell>
                      <TableCell>
                        <Badge variant={addon.is_active ? "default" : "secondary"}>
                          {addon.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {addon.pricing_type === "tiered" && (
                            <Button variant="outline" size="sm" onClick={() => handleEditTiers(addon)}>
                              <TrendingUp className="h-4 w-4 mr-1" />Tiers
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleEditAddon(addon)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <PlanDialog open={planDialogOpen} onOpenChange={setPlanDialogOpen} plan={editingPlan}
        onSave={(data) => {
          if (editingPlan) { updatePlan.mutate({ id: editingPlan.id, updates: data }); }
          else if (data.name && data.base_price !== undefined) {
            createPlan.mutate({ name: data.name, base_price: data.base_price, billing_cycle: data.billing_cycle, description: data.description, max_customers: data.max_customers, max_staff: data.max_staff, features: data.features, is_active: data.is_active, sort_order: data.sort_order });
          }
          setPlanDialogOpen(false);
        }}
        isLoading={createPlan.isPending || updatePlan.isPending}
      />
      <AddonDialog open={addonDialogOpen} onOpenChange={setAddonDialogOpen} addon={editingAddon}
        onSave={(data) => {
          if (editingAddon) { updateAddon.mutate({ id: editingAddon.id, updates: data }); }
          else if (data.name && data.code) {
            createAddon.mutate({ name: data.name, code: data.code, description: data.description, pricing_type: data.pricing_type, base_price: data.base_price, is_active: data.is_active, sort_order: data.sort_order });
          }
          setAddonDialogOpen(false);
        }}
        isLoading={createAddon.isPending || updateAddon.isPending}
      />
      <TierDialog open={tierDialogOpen} onOpenChange={setTierDialogOpen} addon={editingTiersAddon}
        onSave={(tiers) => { if (editingTiersAddon) updateTiers.mutate({ addonId: editingTiersAddon.id, tiers }); setTierDialogOpen(false); }}
        isLoading={updateTiers.isPending}
      />
    </div>
  );
}

function PlanDialog({ open, onOpenChange, plan, onSave, isLoading }: { open: boolean; onOpenChange: (open: boolean) => void; plan: PlatformPlan | null; onSave: (data: Partial<PlatformPlan>) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState<Partial<PlatformPlan>>({ name: "", description: "", base_price: 0, billing_cycle: "monthly", max_customers: null, max_staff: null, features: [], is_active: true, sort_order: 0 });
  const [featuresText, setFeaturesText] = useState("");

  useEffect(() => {
    if (open && plan) { setFormData(plan); setFeaturesText((plan.features || []).join("\n")); }
    else if (open) { setFormData({ name: "", description: "", base_price: 0, billing_cycle: "monthly", max_customers: null, max_staff: null, features: [], is_active: true, sort_order: 0 }); setFeaturesText(""); }
  }, [open, plan]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...formData, features: featuresText.split("\n").filter((f) => f.trim()) }); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Plan" : "New Plan"}</DialogTitle>
          <DialogDescription>Fill in the subscription plan details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input id="name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_price">Price (৳)</Label>
              <Input id="base_price" type="number" value={formData.base_price || 0} onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing_cycle">Billing Cycle</Label>
              <Select value={formData.billing_cycle} onValueChange={(v) => setFormData({ ...formData, billing_cycle: v as PlatformPlan["billing_cycle"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_customers">Max Customers</Label>
              <Input id="max_customers" type="number" placeholder="Unlimited" value={formData.max_customers ?? ""} onChange={(e) => setFormData({ ...formData, max_customers: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_staff">Max Staff</Label>
              <Input id="max_staff" type="number" placeholder="Unlimited" value={formData.max_staff ?? ""} onChange={(e) => setFormData({ ...formData, max_staff: e.target.value ? Number(e.target.value) : null })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea id="features" value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder="Customer Management&#10;Bill Generation" rows={4} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active</Label>
            <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddonDialog({ open, onOpenChange, addon, onSave, isLoading }: { open: boolean; onOpenChange: (open: boolean) => void; addon: PlatformAddon | null; onSave: (data: Partial<PlatformAddon>) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState<Partial<PlatformAddon>>({ name: "", code: "", description: "", pricing_type: "fixed", base_price: 0, is_active: true, sort_order: 0 });

  useEffect(() => {
    if (open && addon) setFormData(addon);
    else if (open) setFormData({ name: "", code: "", description: "", pricing_type: "fixed", base_price: 0, is_active: true, sort_order: 0 });
  }, [open, addon]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{addon ? "Edit Add-on" : "New Add-on"}</DialogTitle>
          <DialogDescription>Fill in the add-on module details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="addon-name">Name</Label>
            <Input id="addon-name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addon-code">Code</Label>
            <Input id="addon-code" value={formData.code || ""} onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s/g, "_") })} placeholder="network_automation" required disabled={!!addon} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addon-description">Description</Label>
            <Textarea id="addon-description" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricing_type">Pricing Type</Label>
              <Select value={formData.pricing_type} onValueChange={(v) => setFormData({ ...formData, pricing_type: v as PlatformAddon["pricing_type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="tiered">Tiered</SelectItem>
                  <SelectItem value="usage_based">Usage Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addon-base_price">Base Price (৳)</Label>
              <Input id="addon-base_price" type="number" value={formData.base_price || 0} onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })} required />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="addon-is_active">Active</Label>
            <Switch id="addon-is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TierDialog({ open, onOpenChange, addon, onSave, isLoading }: { open: boolean; onOpenChange: (open: boolean) => void; addon: PlatformAddon | null; onSave: (tiers: Partial<AddonTier>[]) => void; isLoading: boolean }) {
  const [tiers, setTiers] = useState<Partial<AddonTier>[]>([]);

  useEffect(() => {
    if (open && addon?.tiers) setTiers(addon.tiers.sort((a, b) => a.min_customers - b.min_customers));
    else if (open) setTiers([{ min_customers: 0, max_customers: 100, price: 0 }]);
  }, [open, addon]);

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    setTiers([...tiers, { min_customers: (lastTier?.max_customers ?? 0) + 1, max_customers: (lastTier?.max_customers ?? 0) + 100, price: 0 }]);
  };

  const removeTier = (index: number) => setTiers(tiers.filter((_, i) => i !== index));
  const updateTier = (index: number, field: keyof AddonTier, value: number | null) => setTiers(tiers.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(tiers); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tier Configuration</DialogTitle>
          <DialogDescription>{addon?.name} - Set pricing based on customer count</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {tiers.map((tier, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input type="number" placeholder="Min" value={tier.min_customers ?? 0} onChange={(e) => updateTier(index, "min_customers", Number(e.target.value))} className="w-20" />
                <span className="text-muted-foreground">-</span>
                <Input type="number" placeholder="Unlimited" value={tier.max_customers ?? ""} onChange={(e) => updateTier(index, "max_customers", e.target.value ? Number(e.target.value) : null)} className="w-24" />
                <span className="text-muted-foreground">customers</span>
                <span className="text-muted-foreground">=</span>
                <div className="flex items-center gap-1">
                  <span>৳</span>
                  <Input type="number" value={tier.price ?? 0} onChange={(e) => updateTier(index, "price", Number(e.target.value))} className="w-24" />
                </div>
                {tiers.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeTier(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" onClick={addTier}><Plus className="h-4 w-4 mr-2" />Add Tier</Button>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
