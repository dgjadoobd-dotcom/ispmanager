import { useState } from "react";
import { Key, Plus, Copy, Eye, EyeOff, AlertTriangle, Clock, Trash2, Shield, Activity, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrentTenant } from "@/hooks/useTenant";
import { useApiKeys, useApiLogs, useCreateApiKey, useRevokeApiKey, useToggleApiAccess } from "@/hooks/useApiKeys";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function ApiAccessSettings() {
  const { data: currentTenant } = useCurrentTenant();
  const { data: apiKeys = [], isLoading: keysLoading } = useApiKeys();
  const { data: apiLogs = [], isLoading: logsLoading } = useApiLogs(20);
  const createApiKey = useCreateApiKey();
  const revokeApiKey = useRevokeApiKey();
  const toggleApiAccess = useToggleApiAccess();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState<"read_only" | "read_write">("read_only");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const apiEnabled = (currentTenant as { api_enabled?: boolean })?.api_enabled ?? false;
  const activeKeys = apiKeys.filter((k) => k.is_active && !k.revoked_at);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    try {
      const result = await createApiKey.mutateAsync({
        name: newKeyName.trim(),
        scope: newKeyScope,
      });
      setGeneratedKey(result.rawKey);
      setNewKeyName("");
      setNewKeyScope("read_only");
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      toast.success("API key copied to clipboard");
    }
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setGeneratedKey(null);
    setShowKey(false);
    setNewKeyName("");
    setNewKeyScope("read_only");
  };

  const getStatusBadge = (code: number) => {
    if (code >= 200 && code < 300) {
      return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Success</Badge>;
    } else if (code >= 400 && code < 500) {
      return <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20">Client Error</Badge>;
    } else if (code >= 500) {
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Server Error</Badge>;
    }
    return <Badge variant="outline">{code}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* API Access Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>API Access</CardTitle>
                <CardDescription>
                  Enable programmatic access to your ISP data
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={apiEnabled}
              onCheckedChange={(checked) => toggleApiAccess.mutate(checked)}
              disabled={toggleApiAccess.isPending}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="bg-muted/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              API keys provide full access to your ISP data. Keep them secure and never share them publicly. 
              Rotate keys regularly and revoke any that may have been compromised.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {apiEnabled && (
        <>
          {/* API Keys Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    API Keys
                  </CardTitle>
                  <CardDescription>
                    Manage your API keys for external integrations
                  </CardDescription>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                  if (!open) handleCloseCreateDialog();
                  else setIsCreateDialogOpen(true);
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate New Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {generatedKey ? "API Key Generated" : "Generate New API Key"}
                      </DialogTitle>
                      <DialogDescription>
                        {generatedKey
                          ? "Save this key securely. You won't be able to see it again."
                          : "Create a new API key for external integrations."}
                      </DialogDescription>
                    </DialogHeader>

                    {generatedKey ? (
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            This is the only time you'll see this key. Copy it now and store it securely.
                          </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                          <Label>Your API Key</Label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Input
                                type={showKey ? "text" : "password"}
                                value={generatedKey}
                                readOnly
                                className="pr-10 font-mono text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            <Button variant="outline" size="icon" onClick={handleCopyKey}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleCloseCreateDialog}>Done</Button>
                        </DialogFooter>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="keyName">Key Name</Label>
                            <Input
                              id="keyName"
                              placeholder="e.g., Production Integration"
                              value={newKeyName}
                              onChange={(e) => setNewKeyName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Permission Scope</Label>
                            <Select value={newKeyScope} onValueChange={(v) => setNewKeyScope(v as typeof newKeyScope)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="read_only">
                                  <div className="flex flex-col items-start">
                                    <span>Read Only</span>
                                    <span className="text-xs text-muted-foreground">Can only read data</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="read_write">
                                  <div className="flex flex-col items-start">
                                    <span>Read & Write</span>
                                    <span className="text-xs text-muted-foreground">Can read and modify data</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={handleCloseCreateDialog}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateKey} disabled={createApiKey.isPending}>
                            Generate Key
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {keysLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : activeKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No API keys generated yet</p>
                  <p className="text-sm">Create your first API key to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {key.key_prefix}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={key.scope === "read_write" ? "default" : "secondary"}>
                            {key.scope === "read_write" ? "Read & Write" : "Read Only"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {key.last_used_at ? (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">Never</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(key.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to revoke "{key.name}"? Any applications using this key will immediately lose access. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => revokeApiKey.mutate(key.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Revoke Key
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* API Documentation Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                API Quick Reference
              </CardTitle>
              <CardDescription>
                Base URL and available endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Base URL</Label>
                <div className="flex gap-2">
                  <code className="flex-1 text-sm bg-muted px-3 py-2 rounded font-mono">
                    {import.meta.env.VITE_SUPABASE_URL}/functions/v1/isp-api/v1
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/isp-api/v1`);
                      toast.success("Base URL copied");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2 text-sm">
                <div className="grid grid-cols-3 gap-2 font-medium text-muted-foreground border-b pb-2">
                  <span>Endpoint</span>
                  <span>Methods</span>
                  <span>Description</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <code className="text-primary">/customers</code>
                  <span>GET, POST</span>
                  <span>List/create customers</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <code className="text-primary">/customers/:id</code>
                  <span>GET, PATCH</span>
                  <span>Get/update customer</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <code className="text-primary">/bills</code>
                  <span>GET</span>
                  <span>List bills</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <code className="text-primary">/payments</code>
                  <span>GET</span>
                  <span>List payments</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <code className="text-primary">/packages</code>
                  <span>GET</span>
                  <span>List packages</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <code className="text-primary">/status</code>
                  <span>GET</span>
                  <span>Check API status</span>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  Include your API key in the <code className="text-xs bg-muted px-1 rounded">X-API-Key</code> header with every request.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Recent API Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent API Activity
              </CardTitle>
              <CardDescription>
                Latest API requests to your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : apiLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No API activity yet</p>
                  <p className="text-sm">Requests will appear here once you start using the API</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Response Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.method}</Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm">{log.endpoint}</code>
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status_code)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {log.response_time_ms ? `${log.response_time_ms}ms` : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
