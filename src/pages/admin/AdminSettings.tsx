import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Settings, 
  Globe, 
  Mail, 
  CreditCard, 
  Shield, 
  Bell,
  Loader2,
  Save
} from "lucide-react";

const platformSettingsSchema = z.object({
  platformName: z.string().min(1, "Platform name is required"),
  supportEmail: z.string().email("Valid email required"),
  defaultCurrency: z.string(),
  defaultTimezone: z.string(),
  defaultLanguage: z.string(),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
});

type PlatformSettings = z.infer<typeof platformSettingsSchema>;

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoApproveTrials, setAutoApproveTrials] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);

  const form = useForm<PlatformSettings>({
    resolver: zodResolver(platformSettingsSchema),
    defaultValues: {
      platformName: "ISP Manager",
      supportEmail: "support@ispmanager.com",
      defaultCurrency: "BDT",
      defaultTimezone: "Asia/Dhaka",
      defaultLanguage: "bn",
      maintenanceMode: false,
      maintenanceMessage: "",
    },
  });

  const onSubmit = async (data: PlatformSettings) => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Platform settings:", data);
    toast.success("Platform settings saved successfully");
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure global settings for the entire platform
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic platform configuration and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      {...form.register("platformName")}
                      placeholder="ISP Manager"
                    />
                    {form.formState.errors.platformName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.platformName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      {...form.register("supportEmail")}
                      placeholder="support@example.com"
                    />
                    {form.formState.errors.supportEmail && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.supportEmail.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Select
                      value={form.watch("defaultCurrency")}
                      onValueChange={(value) => form.setValue("defaultCurrency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BDT">BDT (৳)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultTimezone">Default Timezone</Label>
                    <Select
                      value={form.watch("defaultTimezone")}
                      onValueChange={(value) => form.setValue("defaultTimezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</SelectItem>
                        <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultLanguage">Default Language</Label>
                    <Select
                      value={form.watch("defaultLanguage")}
                      onValueChange={(value) => form.setValue("defaultLanguage", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable to show maintenance message to all users
                      </p>
                    </div>
                    <Switch
                      checked={form.watch("maintenanceMode")}
                      onCheckedChange={(checked) => form.setValue("maintenanceMode", checked)}
                    />
                  </div>
                  
                  {form.watch("maintenanceMode") && (
                    <div className="space-y-2">
                      <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                      <Textarea
                        id="maintenanceMessage"
                        {...form.register("maintenanceMessage")}
                        placeholder="We're currently performing scheduled maintenance..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure email sending and templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input id="smtpHost" placeholder="smtp.example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input id="smtpPort" type="number" placeholder="587" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input id="smtpUser" placeholder="username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input id="smtpPassword" type="password" placeholder="••••••••" />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input id="fromName" placeholder="ISP Manager" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input id="fromEmail" type="email" placeholder="noreply@ispmanager.com" />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Test Connection</Button>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Email Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Subscription
              </CardTitle>
              <CardDescription>
                Configure platform billing and subscription settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="trialDays">Trial Period (Days)</Label>
                  <Input id="trialDays" type="number" defaultValue={14} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gracePeriod">Grace Period (Days)</Label>
                  <Input id="gracePeriod" type="number" defaultValue={7} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Subscription Plans</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Basic</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">৳500<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                      <p className="text-sm text-muted-foreground mt-2">Up to 100 customers</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Pro</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">৳1500<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                      <p className="text-sm text-muted-foreground mt-2">Up to 500 customers</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Enterprise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">৳3000<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                      <p className="text-sm text-muted-foreground mt-2">Unlimited customers</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Billing Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure platform security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Users must verify email before accessing dashboard
                    </p>
                  </div>
                  <Switch
                    checked={requireEmailVerification}
                    onCheckedChange={setRequireEmailVerification}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Approve Trial Accounts</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically approve new ISP registrations for trial
                    </p>
                  </div>
                  <Switch
                    checked={autoApproveTrials}
                    onCheckedChange={setAutoApproveTrials}
                  />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
                    <Input id="sessionTimeout" type="number" defaultValue={60} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input id="maxLoginAttempts" type="number" defaultValue={5} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowedIPs">Allowed Admin IPs (one per line)</Label>
                  <Textarea
                    id="allowedIPs"
                    placeholder="Leave empty to allow all IPs"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Restrict super admin access to specific IP addresses
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure platform-wide notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <h3 className="font-medium">Admin Alerts</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">New tenant registration</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Subscription cancellation</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Payment failure</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Security alerts</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">System errors</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
