import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Network, Plus, Settings2, Trash2, RefreshCw, CheckCircle, XCircle, Clock,
  AlertTriangle, Wifi, Server, Loader2, Eye, EyeOff,
} from "lucide-react";
import { format } from "date-fns";
import {
  useNetworkIntegrations, useCreateNetworkIntegration, useUpdateNetworkIntegration,
  useDeleteNetworkIntegration, useTestConnection, useNetworkSyncLogs,
} from "@/hooks/useNetworkIntegration";
import { useIsSuperAdmin } from "@/hooks/useUserRole";

type ProviderType = "mikrotik" | "radius" | "custom";
type SyncMode = "manual" | "scheduled" | "event_driven";

const providerConfig = {
  mikrotik: { label: "MikroTik RouterOS", icon: Wifi, defaultPort: 8728, description: "MikroTik API-based integration" },
  radius: { label: "RADIUS Server", icon: Server, defaultPort: 1812, description: "RADIUS protocol integration" },
  custom: { label: "Custom Provider", icon: Network, defaultPort: 8080, description: "Custom network provider" },
};

const syncModeLabels = { manual: "Manual", scheduled: "Scheduled", event_driven: "Event-driven" };

const statusConfig = {
  success: { label: "Success", variant: "default" as const, icon: CheckCircle },
  failed: { label: "Failed", variant: "destructive" as const, icon: XCircle },
  pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
  in_progress: { label: "In Progress", variant: "secondary" as const, icon: RefreshCw },
  retrying: { label: "Retrying", variant: "outline" as const, icon: AlertTriangle },
};

export function NetworkIntegrationSettings() {
  const { data: integrations, isLoading: integrationsLoading } = useNetworkIntegrations();
  const { data: syncLogs, isLoading: logsLoading } = useNetworkSyncLogs(undefined, 50);
  const createIntegration = useCreateNetworkIntegration();
  const updateIntegration = useUpdateNetworkIntegration();
  const deleteIntegration = useDeleteNetworkIntegration();
  const testConnection = useTestConnection();
  const { isSuperAdmin } = useIsSuperAdmin();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "", provider_type: "mikrotik" as ProviderType, host: "", port: 8728,
    username: "", credentials_encrypted: "", sync_mode: "manual" as SyncMode,
    sync_interval_minutes: 60, mikrotik_use_ssl: false, mikrotik_ppp_profile: "",
    mikrotik_address_list: "", radius_auth_port: 1812, radius_acct_port: 1813,
  });

  const resetForm = () => {
    setFormData({ name: "", provider_type: "mikrotik", host: "", port: 8728, username: "", credentials_encrypted: "", sync_mode: "manual", sync_interval_minutes: 60, mikrotik_use_ssl: false, mikrotik_ppp_profile: "", mikrotik_address_list: "", radius_auth_port: 1812, radius_acct_port: 1813 });
    setShowPassword(false);
  };

  const handleProviderChange = (provider: ProviderType) => {
    setFormData({ ...formData, provider_type: provider, port: providerConfig[provider].defaultPort });
  };

  const handleCreateIntegration = async () => { await createIntegration.mutateAsync(formData); setDialogOpen(false); resetForm(); };
  const handleToggleEnabled = async (id: string, currentState: boolean) => { await updateIntegration.mutateAsync({ id, updates: { is_enabled: !currentState } }); };
  const handleDeleteConfirm = async () => { if (!integrationToDelete) return; await deleteIntegration.mutateAsync(integrationToDelete); setDeleteDialogOpen(false); setIntegrationToDelete(null); };
  const handleTestConnection = async (id: string) => { await testConnection.mutateAsync(id); };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Network className="h-5 w-5" />Network Integration</CardTitle>
              <CardDescription>Set up synchronization with MikroTik or RADIUS servers</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" />New Integration</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Network Integration</DialogTitle>
                  <DialogDescription>Connect to your network device</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Integration Name</Label>
                      <Input id="name" placeholder="Main Router" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Provider Type</Label>
                      <Select value={formData.provider_type} onValueChange={(v) => handleProviderChange(v as ProviderType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(providerConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2"><config.icon className="h-4 w-4" />{config.label}</div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Connection Details</h4>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="host">Host / IP Address</Label>
                        <Input id="host" placeholder="192.168.1.1" value={formData.host} onChange={(e) => setFormData({ ...formData, host: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input id="port" type="number" value={formData.port} onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" placeholder="admin" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.credentials_encrypted} onChange={(e) => setFormData({ ...formData, credentials_encrypted: e.target.value })} />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {formData.provider_type === "mikrotik" && (
                    <div className="space-y-4">
                      <h4 className="font-medium">MikroTik Settings</h4>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ssl">Use SSL/TLS</Label>
                        <Switch id="ssl" checked={formData.mikrotik_use_ssl} onCheckedChange={(v) => setFormData({ ...formData, mikrotik_use_ssl: v })} />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="ppp_profile">PPP Profile</Label>
                          <Input id="ppp_profile" placeholder="default" value={formData.mikrotik_ppp_profile} onChange={(e) => setFormData({ ...formData, mikrotik_ppp_profile: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address_list">Block Address List</Label>
                          <Input id="address_list" placeholder="blocked" value={formData.mikrotik_address_list} onChange={(e) => setFormData({ ...formData, mikrotik_address_list: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.provider_type === "radius" && (
                    <div className="space-y-4">
                      <h4 className="font-medium">RADIUS Settings</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="auth_port">Auth Port</Label>
                          <Input id="auth_port" type="number" value={formData.radius_auth_port} onChange={(e) => setFormData({ ...formData, radius_auth_port: parseInt(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="acct_port">Accounting Port</Label>
                          <Input id="acct_port" type="number" value={formData.radius_acct_port} onChange={(e) => setFormData({ ...formData, radius_acct_port: parseInt(e.target.value) })} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="font-medium">Sync Settings</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Sync Mode</Label>
                        <Select value={formData.sync_mode} onValueChange={(v) => setFormData({ ...formData, sync_mode: v as SyncMode })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="event_driven">Event-driven</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {formData.sync_mode === "scheduled" && (
                        <div className="space-y-2">
                          <Label htmlFor="interval">Sync Interval (minutes)</Label>
                          <Input id="interval" type="number" min={5} value={formData.sync_interval_minutes} onChange={(e) => setFormData({ ...formData, sync_interval_minutes: parseInt(e.target.value) })} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateIntegration} disabled={createIntegration.isPending || !formData.name || !formData.host || !formData.username}>
                    {createIntegration.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="integrations">
            <TabsList className="mb-4">
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="logs">Sync Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="integrations">
              {integrationsLoading ? (
                <div className="space-y-4">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
              ) : integrations?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Network className="mx-auto h-12 w-12 opacity-50 mb-4" />
                  <p>No network integrations configured</p>
                  <p className="text-sm">Click the button above to add a new integration</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {integrations?.map((integration) => {
                    const ProviderIcon = providerConfig[integration.provider_type as ProviderType]?.icon || Network;
                    const status = integration.last_sync_status as keyof typeof statusConfig;
                    const StatusIcon = status ? statusConfig[status]?.icon : Clock;
                    return (
                      <Card key={integration.id} className="relative">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <ProviderIcon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{integration.name}</h3>
                                  <Badge variant={integration.is_enabled ? "default" : "secondary"}>
                                    {integration.is_enabled ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {providerConfig[integration.provider_type as ProviderType]?.label} • {integration.host}:{integration.port}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <span>Mode: {syncModeLabels[integration.sync_mode as SyncMode]}</span>
                                  {integration.last_sync_at && (
                                    <span className="flex items-center gap-1">
                                      {StatusIcon && <StatusIcon className="h-3 w-3" />}
                                      Last sync: {format(new Date(integration.last_sync_at), "dd MMM, hh:mm a")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch checked={integration.is_enabled} onCheckedChange={() => handleToggleEnabled(integration.id, integration.is_enabled)} disabled={updateIntegration.isPending} />
                              <Button variant="outline" size="sm" onClick={() => handleTestConnection(integration.id)} disabled={testConnection.isPending}>
                                {testConnection.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                <span className="ml-2 hidden sm:inline">Test</span>
                              </Button>
                              <Button variant="ghost" size="icon"><Settings2 className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => { setIntegrationToDelete(integration.id); setDeleteDialogOpen(true); }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="logs">
              {logsLoading ? <Skeleton className="h-64 w-full" /> : syncLogs?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="mx-auto h-12 w-12 opacity-50 mb-4" />
                  <p>No sync logs found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Integration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Trigger</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncLogs?.map((log: any) => {
                        const status = log.status as keyof typeof statusConfig;
                        const StatusIcon = statusConfig[status]?.icon || Clock;
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap">{format(new Date(log.created_at), "dd MMM, hh:mm:ss a")}</TableCell>
                            <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                            <TableCell>{log.customers?.name || "-"}</TableCell>
                            <TableCell><span className="flex items-center gap-1">{log.network_integrations?.name}</span></TableCell>
                            <TableCell>
                              <Badge variant={statusConfig[status]?.variant || "secondary"} className="gap-1">
                                <StatusIcon className="h-3 w-3" />{statusConfig[status]?.label || status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{log.triggered_by}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium">Security Notice</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Network credentials are stored encrypted and only used in server-side functions. They are never exposed on the frontend.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Integration?</AlertDialogTitle>
            <AlertDialogDescription>
              This integration and all associated sync logs will be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteIntegration.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
