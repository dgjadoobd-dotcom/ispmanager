import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dbGet, dbInsert, dbUpdate, now, TABLES } from "@/lib/db";
import { useCurrentTenant } from "@/hooks/useTenant";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ApiKey {
  id: string; name: string; key_prefix: string;
  scope: "read_only" | "read_write"; is_active: boolean;
  last_used_at: string | null; expires_at: string | null;
  created_at: string; revoked_at: string | null;
  tenant_id: string; key_hash: string; created_by: string | null; revoked_by: string | null;
}

export interface ApiLog {
  id: string; endpoint: string; method: string;
  status_code: number; response_time_ms: number | null; created_at: string;
}

function generateApiKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return `isp_${Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

async function hashApiKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function useApiKeys() {
  const { data: currentTenant } = useCurrentTenant();
  return useQuery({
    queryKey: ["apiKeys", currentTenant?.id],
    queryFn: () => {
      if (!currentTenant?.id) return [];
      return dbGet<ApiKey>(TABLES.api_keys).filter((k) => k.tenant_id === currentTenant.id);
    },
    enabled: !!currentTenant?.id,
  });
}

export function useApiLogs(limit = 50) {
  const { data: currentTenant } = useCurrentTenant();
  return useQuery({
    queryKey: ["apiLogs", currentTenant?.id, limit],
    queryFn: () => {
      if (!currentTenant?.id) return [];
      return dbGet<ApiLog>(TABLES.api_keys).slice(0, limit);
    },
    enabled: !!currentTenant?.id,
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  const { data: currentTenant } = useCurrentTenant();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ name, scope }: { name: string; scope: "read_only" | "read_write" }) => {
      if (!currentTenant?.id || !user?.id) throw new Error("Missing tenant or user");
      const rawKey = generateApiKey();
      const keyHash = await hashApiKey(rawKey);
      const keyPrefix = rawKey.substring(0, 12) + "...";
      const record = dbInsert<ApiKey>(TABLES.api_keys, {
        tenant_id: currentTenant.id, name, key_hash: keyHash, key_prefix: keyPrefix,
        scope, is_active: true, expires_at: null, last_used_at: null,
        revoked_at: null, revoked_by: null, created_by: user.id,
      } as any);
      return { ...record, rawKey };
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["apiKeys"] }); toast.success("API key created successfully"); },
    onError: (e: any) => toast.error("Failed to create API key"),
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  const { data: currentTenant } = useCurrentTenant();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (keyId: string) => {
      dbUpdate<ApiKey>(TABLES.api_keys, keyId, { is_active: false, revoked_at: now(), revoked_by: user?.id ?? null });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["apiKeys"] }); toast.success("API key revoked successfully"); },
    onError: () => toast.error("Failed to revoke API key"),
  });
}

export function useToggleApiAccess() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (_enabled: boolean) => {
      // Stored in tenant settings via useTenantSettings
    },
    onSuccess: (_, enabled) => {
      queryClient.invalidateQueries({ queryKey: ["currentTenant", user?.id] });
      toast.success(`API access ${enabled ? "enabled" : "disabled"}`);
    },
    onError: () => toast.error("Failed to update API access"),
  });
}
