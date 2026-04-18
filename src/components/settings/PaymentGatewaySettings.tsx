import { useState, useEffect } from "react";
import { CreditCard, Eye, EyeOff, ExternalLink, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrentTenant } from "@/hooks/useTenant";
import { useUpdateTenantSettings } from "@/hooks/useTenantSettings";

export function PaymentGatewaySettings() {
  const { data: tenant, isLoading } = useCurrentTenant();
  const updateSettings = useUpdateTenantSettings(tenant?.id);

  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://sandbox.uddoktapay.com");
  const [enableOnlinePayment, setEnableOnlinePayment] = useState(false);
  const [autoSuspendDays, setAutoSuspendDays] = useState("15");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (tenant) {
      setApiKey((tenant as any).uddoktapay_api_key || "");
      setBaseUrl((tenant as any).uddoktapay_base_url || "https://sandbox.uddoktapay.com");
      setEnableOnlinePayment(tenant.enable_online_payment || false);
      setAutoSuspendDays(String(tenant.auto_suspend_days || 15));
    }
  }, [tenant]);

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      uddoktapay_api_key: apiKey || null,
      uddoktapay_base_url: baseUrl,
      enable_online_payment: enableOnlinePayment,
      auto_suspend_days: parseInt(autoSuspendDays),
    });
    setHasChanges(false);
  };

  const handleChange = () => {
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isConfigured = apiKey && apiKey.length > 0;
  const isSandbox = baseUrl.includes("sandbox");

  return (
    <div className="space-y-6">
      {/* Online Payment Gateway */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Online Payment Gateway
              </CardTitle>
              <CardDescription>
                Let customers pay bills online — reduces manual collection effort and speeds up cash flow.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isConfigured ? (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Not configured
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Environment Selection */}
          <div className="space-y-2">
            <Label>Environment</Label>
            <Select
              value={baseUrl}
              onValueChange={(value) => {
                setBaseUrl(value);
                handleChange();
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="https://sandbox.uddoktapay.com">
                  🧪 Sandbox (Test mode — no real charges)
                </SelectItem>
                <SelectItem value="https://uddoktapay.com">
                  🚀 Production (Live payments)
                </SelectItem>
              </SelectContent>
            </Select>
            {isSandbox && (
              <p className="text-xs text-muted-foreground">
                Test your setup safely — no real money is charged in sandbox mode
              </p>
            )}
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  handleChange();
                }}
                placeholder="Enter your UddoktaPay API key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from the{" "}
              <a
                href="https://uddoktapay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                UddoktaPay dashboard <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <Separator />

          {/* Enable Online Payment */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Accept Online Payments</Label>
              <p className="text-sm text-muted-foreground">
                Customers can pay directly from their portal via bKash, Nagad, cards & more
              </p>
            </div>
            <Switch
              checked={enableOnlinePayment}
              onCheckedChange={(checked) => {
                setEnableOnlinePayment(checked);
                handleChange();
              }}
              disabled={!isConfigured}
            />
          </div>

          {enableOnlinePayment && !isConfigured && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Configure your API key first to enable online payments
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Auto-Suspend — Billing Automation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Automatic Suspension
              </CardTitle>
              <CardDescription>
                Automatically suspend unpaid connections — proven to reduce overdue bills significantly.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
              <Zap className="h-3 w-3 mr-0.5" />
              High Impact
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Suspend after overdue for</Label>
            <Select
              value={autoSuspendDays}
              onValueChange={(value) => {
                setAutoSuspendDays(value);
                handleChange();
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="15">15 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="0">Never (manual only)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Connections restore automatically once the customer pays
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-generate monthly bills</Label>
              <p className="text-sm text-muted-foreground">
                Bills are created on the 1st of each month for all active customers
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pro-rated billing</Label>
              <p className="text-sm text-muted-foreground">
                Charge proportionally for customers who join mid-month
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Options</CardTitle>
          <CardDescription>
            Control how customers can pay — flexible options improve collection rates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow partial payments</Label>
              <p className="text-sm text-muted-foreground">
                Customers can pay part of the bill now and the rest later
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow advance payments</Label>
              <p className="text-sm text-muted-foreground">
                Customers can pay ahead and build a credit balance
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
