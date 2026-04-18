import React, { useState } from "react";
import { CreditCard, Home, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";

const GATEWAYS = [
  "SSLCommerz",
  "bKash",
  "Nagad",
  "aamarPay",
  "shurjoPay",
  "FosterPayments",
  "Walletmix",
  "PhonePe",
  "Razorpay",
  "Rocket",
  "Stripe",
  "Webhook",
  "Paybill",
];

interface GatewayConfig {
  mode: "sandbox" | "live";
  storeId: string;
  storePassword: string;
  enabled: boolean;
  activationDate: string;
  expiryDate: string;
  applicableFor: {
    adminPortal: boolean;
    popPortal: boolean;
    bandwidthPop: boolean;
    popClient: boolean;
  };
}

const defaultConfig = (): GatewayConfig => ({
  mode: "sandbox",
  storeId: "",
  storePassword: "",
  enabled: false,
  activationDate: "",
  expiryDate: "",
  applicableFor: {
    adminPortal: false,
    popPortal: false,
    bandwidthPop: false,
    popClient: false,
  },
});

const PaymentGatewaysPage = () => {
  const [selected, setSelected] = useState(GATEWAYS[0]);
  const [configs, setConfigs] = useState<Record<string, GatewayConfig>>(() => {
    const init: Record<string, GatewayConfig> = {};
    GATEWAYS.forEach((g) => (init[g] = defaultConfig()));
    return init;
  });
  const [showPassword, setShowPassword] = useState(false);

  const config = configs[selected];

  const updateConfig = (patch: Partial<GatewayConfig>) => {
    setConfigs((prev) => ({
      ...prev,
      [selected]: { ...prev[selected], ...patch },
    }));
  };

  const updateApplicable = (key: keyof GatewayConfig["applicableFor"], val: boolean) => {
    setConfigs((prev) => ({
      ...prev,
      [selected]: {
        ...prev[selected],
        applicableFor: { ...prev[selected].applicableFor, [key]: val },
      },
    }));
  };

  const handleSave = () => {
    toast.success(`${selected} settings saved successfully`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-1 text-muted-foreground">
                <Home className="h-3.5 w-3.5" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>System</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Payment Gateways</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-3 mt-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Payment Gateways
            </h1>
            <p className="text-sm text-muted-foreground">
              Setting Up Payment Gateways
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gateway List */}
        <Card className="lg:col-span-3 border-border/60 shadow-sm">
          <CardHeader className="bg-primary rounded-t-lg px-4 py-3">
            <CardTitle className="text-sm font-semibold text-primary-foreground">
              Gateway List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-1">
              {GATEWAYS.map((gw) => (
                <button
                  key={gw}
                  onClick={() => setSelected(gw)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    selected === gw
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {gw}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Panel */}
        <div className="lg:col-span-9 space-y-5">
          <h2 className="text-lg font-semibold text-foreground">
            {selected} — Configuration
          </h2>

          {/* 1. Gateway Information */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-primary rounded-t-lg px-4 py-3">
              <CardTitle className="text-sm font-semibold text-primary-foreground">
                Payment Gateway Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Environment Mode</Label>
                <RadioGroup
                  value={config.mode}
                  onValueChange={(v) => updateConfig({ mode: v as "sandbox" | "live" })}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="sandbox" id="sandbox" />
                    <Label htmlFor="sandbox" className="cursor-pointer">Sandbox</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="live" id="live" />
                    <Label htmlFor="live" className="cursor-pointer">Live</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeId">Store ID / Username</Label>
                  <Input
                    id="storeId"
                    placeholder="Enter Store ID or Username"
                    value={config.storeId}
                    onChange={(e) => updateConfig({ storeId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePass">Store Password / API Key</Label>
                  <div className="relative">
                    <Input
                      id="storePass"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Store Password or API Key"
                      value={config.storePassword}
                      onChange={(e) => updateConfig({ storePassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Payment Status */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-primary rounded-t-lg px-4 py-3">
              <CardTitle className="text-sm font-semibold text-primary-foreground">
                Payment Status & Validation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Payment Gateway</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enable or disable this payment gateway
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${config.enabled ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {config.enabled ? "Enabled" : "Disabled"}
                  </span>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(v) => updateConfig({ enabled: v })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Activation & Expiry */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-primary rounded-t-lg px-4 py-3">
              <CardTitle className="text-sm font-semibold text-primary-foreground">
                Activation & Expiry Date
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activation">Activation Date</Label>
                  <Input
                    id="activation"
                    type="date"
                    value={config.activationDate}
                    onChange={(e) => updateConfig({ activationDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={config.expiryDate}
                    onChange={(e) => updateConfig({ expiryDate: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Applicable For */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-primary rounded-t-lg px-4 py-3">
              <CardTitle className="text-sm font-semibold text-primary-foreground">
                Payment Gateway Applicable For
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  { key: "adminPortal" as const, label: "Admin Customer (Portal)" },
                  { key: "popPortal" as const, label: "POP (Portal)" },
                  { key: "bandwidthPop" as const, label: "Bandwidth POP (Portal)" },
                  { key: "popClient" as const, label: "POP Client (Portal)" },
                ]).map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <Checkbox
                      id={key}
                      checked={config.applicableFor[key]}
                      onCheckedChange={(v) => updateApplicable(key, !!v)}
                    />
                    <Label htmlFor={key} className="cursor-pointer text-sm">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="px-8">
              Save or Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewaysPage;
