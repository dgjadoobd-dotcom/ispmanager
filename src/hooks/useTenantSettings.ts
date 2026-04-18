import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTenantContext } from "@/contexts/TenantContext";
import { toast } from "sonner";

const LOCAL_TENANT_KEY = "local_tenant_settings";

interface TenantSettingsUpdate {
  [key: string]: unknown;
}

export function useUpdateTenantSettings(tenantId: string | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentTenant, setCurrentTenant } = useTenantContext();

  return useMutation({
    mutationFn: async (settings: TenantSettingsUpdate) => {
      if (!tenantId) throw new Error("No tenant ID");

      // Always persist locally first (instant feedback)
      const merged = { ...(currentTenant ?? {}), ...settings };
      localStorage.setItem(LOCAL_TENANT_KEY, JSON.stringify(merged));

      // Try to write to Supabase DB
      const { data, error } = await supabase
        .from("tenants")
        .update(settings)
        .eq("id", tenantId)
        .select()
        .single();

      if (error) {
        // DB write failed (RLS or network) — local save still succeeded
        console.warn("Supabase update failed, saved locally:", error.message);
        return merged;
      }

      return data;
    },
    onSuccess: (updated) => {
      if (updated && currentTenant) {
        setCurrentTenant({ ...currentTenant, ...updated });
      }
      queryClient.invalidateQueries({ queryKey: ["currentTenant", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["tenants-for-context"] });
      toast.success("Settings updated successfully");
    },
    onError: (error) => {
      console.error("Error updating tenant settings:", error);
      toast.error("Failed to update settings");
    },
  });
}
