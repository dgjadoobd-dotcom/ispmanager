import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dbGet, dbInsert, dbUpdate, dbDelete, dbFind, now, TABLES } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import {
  testMikrotikConnection,
  enablePPPUser,
  disablePPPUser,
  updatePPPSpeed,
  getPPPSecrets,
  getActivePPP,
} from "@/lib/mikrotikApi";

export interface NetworkIntegration {
  id: string;
  tenant_id: string;
  provider_type: "mikrotik" | "radius" | "custom";
  name: string;
  is_enabled: boolean;
  host: string;
  port: number;
  username: string;
  credentials_encrypted: string | null;
  sync_mode: "manual" | "scheduled" | "event_driven";
  sync_interval_minutes: number;
  last_sync_at: string | null;
  last_sync_status: "pending" | "in_progress" | "success" | "failed" | "retrying" | null;
  radius_secret_encrypted: string | null;
  radius_auth_port: number;
  radius_acct_port: number;
  mikrotik_use_ssl: boolean;
  mikrotik_ppp_profile: string | null;
  mikrotik_address_list: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// ─── Supabase DB queries (with localStorage fallback) ────────────────────────

async function fetchIntegrationsFromDB(tenantId: string): Promise<NetworkIntegration[]> {
  const { data, error } = await supabase
    .from("network_integrations")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  if (error || !data?.length) {
    // Fallback to localStorage
    return dbGet<NetworkIntegration>(TABLES.network_integrations)
      .filter((n) => n.tenant_id === tenantId);
  }
  return data as NetworkIntegration[];
}

export function useNetworkIntegrations() {
  const { currentTenant } = useTenantContext();
  return useQuery({
    queryKey: ["network-integrations", currentTenant?.id],
    queryFn: () => {
      if (!currentTenant?.id) return [];
      return fetchIntegrationsFromDB(currentTenant.id);
    },
    enabled: !!currentTenant?.id,
  });
}

export function useNetworkIntegration(integrationId: string | null) {
  return useQuery({
    queryKey: ["network-integration", integrationId],
    queryFn: async () => {
      if (!integrationId) return null;
      const { data, error } = await supabase
        .from("network_integrations")
        .select("*")
        .eq("id", integrationId)
        .single();
      if (error) return dbFind<NetworkIntegration>(TABLES.network_integrations, integrationId);
      return data as NetworkIntegration;
    },
    enabled: !!integrationId,
  });
}

export function useCreateNetworkIntegration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentTenant } = useTenantContext();
  return useMutation({
    mutationFn: async (integration: Partial<NetworkIntegration>) => {
      if (!currentTenant?.id) throw new Error("No tenant selected");
      const payload = {
        tenant_id: currentTenant.id,
        provider_type: "mikrotik" as const,
        name: "", is_enabled: false,
        host: "", port: 8728, username: "",
        credentials_encrypted: null, sync_mode: "manual" as const,
        sync_interval_minutes: 60, last_sync_at: null, last_sync_status: null,
        radius_secret_encrypted: null, radius_auth_port: 1812, radius_acct_port: 1813,
        mikrotik_use_ssl: false, mikrotik_ppp_profile: null, mikrotik_address_list: null,
        ...integration,
      };
      // Try Supabase first
      const { data, error } = await supabase
        .from("network_integrations")
        .insert(payload)
        .select()
        .single();
      if (error) {
        // Fallback to localStorage
        return dbInsert<NetworkIntegration>(TABLES.network_integrations, payload as any);
      }
      return data as NetworkIntegration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-integrations"] });
      toast({ title: "Integration created", description: "Network integration has been created successfully." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateNetworkIntegration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NetworkIntegration> }) => {
      const { data, error } = await supabase
        .from("network_integrations")
        .update({ ...updates, updated_at: now() })
        .eq("id", id)
        .select()
        .single();
      if (error) {
        return dbUpdate<NetworkIntegration>(TABLES.network_integrations, id, { ...updates, updated_at: now() });
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-integrations"] });
      toast({ title: "Updated", description: "Integration settings have been updated." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteNetworkIntegration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("network_integrations").delete().eq("id", id);
      if (error) dbDelete(TABLES.network_integrations, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-integrations"] });
      toast({ title: "Deleted", description: "Integration has been deleted successfully." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useNetworkSyncLogs(integrationId?: string, limit = 20) {
  const { currentTenant } = useTenantContext();
  return useQuery({
    queryKey: ["network-sync-logs", currentTenant?.id, integrationId, limit],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      let query = supabase
        .from("network_sync_logs")
        .select("*, customers:customer_id(name), network_integrations:integration_id(name, provider_type)")
        .eq("tenant_id", currentTenant.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (integrationId) query = query.eq("integration_id", integrationId);
      const { data, error } = await query;
      if (error) {
        // Fallback to localStorage
        const customers = dbGet<any>(TABLES.customers);
        const integrations = dbGet<any>(TABLES.network_integrations);
        let logs = dbGet<any>(TABLES.network_sync_logs)
          .filter((l: any) => l.tenant_id === currentTenant.id);
        if (integrationId) logs = logs.filter((l: any) => l.integration_id === integrationId);
        return logs.slice(0, limit).map((l: any) => ({
          ...l,
          customers: customers.find((c: any) => c.id === l.customer_id) ?? null,
          network_integrations: integrations.find((i: any) => i.id === l.integration_id) ?? null,
        }));
      }
      return data || [];
    },
    enabled: !!currentTenant?.id,
  });
}

// ─── Real MikroTik API test via proxy ────────────────────────────────────────

export function useTestConnection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (integrationId: string) => {
      // Get integration details from DB or localStorage
      let integration: NetworkIntegration | null = null;
      const { data } = await supabase.from("network_integrations").select("*").eq("id", integrationId).single();
      integration = data ?? dbFind<NetworkIntegration>(TABLES.network_integrations, integrationId);
      if (!integration) throw new Error("Integration not found");

      const result = await testMikrotikConnection({
        host: integration.host,
        port: integration.port,
        username: integration.username,
        password: integration.credentials_encrypted ?? "",
        use_ssl: integration.mikrotik_use_ssl,
      });

      if (!result.success) throw new Error(result.error || "Connection failed");

      // Update status in DB
      await supabase.from("network_integrations").update({
        last_sync_status: "success",
        last_sync_at: now(),
      }).eq("id", integrationId);
      dbUpdate(TABLES.network_integrations, integrationId, { last_sync_status: "success", last_sync_at: now() });

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["network-integrations"] });
      queryClient.invalidateQueries({ queryKey: ["mikrotik-servers"] });
      toast({
        title: "✅ Connected",
        description: data.message || `MikroTik ${data.data?.identity || ""} — v${data.data?.version || ""}`,
      });
    },
    onError: (e: Error) => toast({ title: "❌ Connection failed", description: e.message, variant: "destructive" }),
  });
}

// ─── Real customer sync via proxy ─────────────────────────────────────────────

export function useSyncCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ integrationId, customerId, action, triggeredBy = "manual" }: {
      integrationId: string;
      customerId: string;
      action: "enable" | "disable" | "update_speed";
      triggeredBy?: string;
    }) => {
      // Get integration
      const { data: intData } = await supabase.from("network_integrations").select("*").eq("id", integrationId).single();
      const integration: NetworkIntegration = intData ?? dbFind<NetworkIntegration>(TABLES.network_integrations, integrationId);
      if (!integration) throw new Error("Integration not found");

      // Get customer
      const { data: custData } = await supabase.from("customers").select("*").eq("id", customerId).single();
      const customer = custData ?? dbGet<any>(TABLES.customers).find((c: any) => c.id === customerId);
      if (!customer) throw new Error("Customer not found");
      if (!customer.network_username) throw new Error("Customer has no network username set");

      const creds = {
        host: integration.host,
        port: integration.port,
        username: integration.username,
        password: integration.credentials_encrypted ?? "",
        use_ssl: integration.mikrotik_use_ssl,
      };

      let result;
      if (action === "enable") {
        result = await enablePPPUser(creds, customer.network_username);
      } else if (action === "disable") {
        result = await disablePPPUser(creds, customer.network_username);
      } else if (action === "update_speed") {
        const { data: pkgData } = await supabase.from("packages").select("mikrotik_profile_name").eq("id", customer.package_id).single();
        const profile = pkgData?.mikrotik_profile_name || integration.mikrotik_ppp_profile || "default";
        result = await updatePPPSpeed(creds, customer.network_username, profile);
      }

      if (!result?.success) throw new Error(result?.error || "Sync failed");

      // Log to DB
      const logEntry = {
        tenant_id: integration.tenant_id,
        integration_id: integrationId,
        customer_id: customerId,
        action,
        status: "success",
        started_at: now(),
        completed_at: now(),
        error_message: null,
        request_payload: null,
        response_payload: null,
        retry_count: 0,
        next_retry_at: null,
        triggered_by: triggeredBy,
        triggered_by_user: null,
      };
      await supabase.from("network_sync_logs").insert(logEntry).catch(() => {});
      dbInsert(TABLES.network_sync_logs, logEntry as any);

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["network-sync-logs"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "✅ Sync successful", description: data?.message });
    },
    onError: (e: Error) => toast({ title: "❌ Sync failed", description: e.message, variant: "destructive" }),
  });
}

// ─── Fetch PPP Data via Proxy ────────────────────────────────────────────────

export function usePPPSecrets(integrationId: string | null) {
  return useQuery({
    queryKey: ["mikrotik-ppp-secrets", integrationId],
    queryFn: async () => {
      if (!integrationId) return [];
      const { data: intData } = await supabase.from("network_integrations").select("*").eq("id", integrationId).single();
      const integration = intData ?? dbFind<NetworkIntegration>(TABLES.network_integrations, integrationId);
      if (!integration) throw new Error("Integration not found");

      const result = await getPPPSecrets({
        host: integration.host,
        port: integration.port,
        username: integration.username,
        password: integration.credentials_encrypted ?? "",
        use_ssl: integration.mikrotik_use_ssl,
      });

      if (!result.success) throw new Error(result.error || "Failed to fetch PPP secrets");
      return result.data as any[];
    },
    enabled: !!integrationId,
  });
}

export function useActivePPP(integrationId: string | null) {
  return useQuery({
    queryKey: ["mikrotik-ppp-active", integrationId],
    queryFn: async () => {
      if (!integrationId) return [];
      const { data: intData } = await supabase.from("network_integrations").select("*").eq("id", integrationId).single();
      const integration = intData ?? dbFind<NetworkIntegration>(TABLES.network_integrations, integrationId);
      if (!integration) throw new Error("Integration not found");

      const result = await getActivePPP({
        host: integration.host,
        port: integration.port,
        username: integration.username,
        password: integration.credentials_encrypted ?? "",
        use_ssl: integration.mikrotik_use_ssl,
      });

      if (!result.success) throw new Error(result.error || "Failed to fetch active PPP connections");
      return result.data as any[];
    },
    enabled: !!integrationId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
