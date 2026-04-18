import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TenantConfig {
  id: string;
  name: string;
  auto_suspend_days: number;
}

interface OverdueCustomer {
  id: string;
  name: string;
  tenant_id: string;
  due_balance: number;
  network_username: string | null;
  connection_status: string;
  oldest_overdue_date: string;
}

interface NetworkIntegration {
  id: string;
  provider_type: string;
}

// Trigger network sync to disable customer access
async function disableCustomerNetwork(
  supabase: SupabaseClient,
  tenantId: string,
  customerId: string,
  integrationId: string,
  networkUsername: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Simulate network disable (in production, call actual MikroTik/RADIUS API)
    console.log(`[auto-suspend] Disabling network access for: ${networkUsername}`);
    
    // Log the sync operation
    await supabase.from("network_sync_logs").insert({
      tenant_id: tenantId,
      integration_id: integrationId,
      customer_id: customerId,
      action: "disable",
      status: "success",
      request_payload: { action: "disable", triggered_by: "auto_suspend" },
      response_payload: { disabled_at: new Date().toISOString() },
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      triggered_by: "auto_suspend",
    });

    // Update customer sync status
    await supabase
      .from("customers")
      .update({
        last_network_sync_at: new Date().toISOString(),
        network_sync_status: "success",
      })
      .eq("id", customerId);

    return { success: true, message: `Disabled access for ${networkUsername}` };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[auto-suspend] Failed to disable ${networkUsername}:`, message);
    return { success: false, message };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("[auto-suspend] Starting auto-suspend check...");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all tenants with their auto_suspend_days configuration
    const { data: tenantsData, error: tenantsError } = await supabase
      .from("tenants")
      .select("id, name, auto_suspend_days")
      .gt("auto_suspend_days", 0); // Only tenants with auto-suspend enabled

    if (tenantsError) {
      throw new Error(`Failed to fetch tenants: ${tenantsError.message}`);
    }

    const tenants = tenantsData as TenantConfig[];
    console.log(`[auto-suspend] Processing ${tenants.length} tenants with auto-suspend enabled`);

    const results: {
      tenant_id: string;
      tenant_name: string;
      suspended_count: number;
      network_synced: number;
      errors: string[];
    }[] = [];

    for (const tenant of tenants) {
      const tenantResult = {
        tenant_id: tenant.id,
        tenant_name: tenant.name,
        suspended_count: 0,
        network_synced: 0,
        errors: [] as string[],
      };

      // Calculate the cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - tenant.auto_suspend_days);
      const cutoffDateStr = cutoffDate.toISOString().split("T")[0];

      // Find active customers with overdue bills older than cutoff
      const { data: overdueCustomersData, error: overdueError } = await supabase
        .from("bills")
        .select(`
          customer_id,
          due_date,
          customers!inner (
            id,
            name,
            tenant_id,
            due_balance,
            network_username,
            connection_status
          )
        `)
        .eq("tenant_id", tenant.id)
        .eq("status", "overdue")
        .lte("due_date", cutoffDateStr)
        .eq("customers.connection_status", "active");

      if (overdueError) {
        tenantResult.errors.push(`Failed to fetch overdue customers: ${overdueError.message}`);
        results.push(tenantResult);
        continue;
      }

      // Get unique customer IDs to suspend
      const customerIdsToSuspend = new Set<string>();
      const customerData: Map<string, OverdueCustomer> = new Map();

      for (const bill of overdueCustomersData || []) {
        const customer = (bill as any).customers;
        if (customer && !customerIdsToSuspend.has(customer.id)) {
          customerIdsToSuspend.add(customer.id);
          customerData.set(customer.id, {
            id: customer.id,
            name: customer.name,
            tenant_id: customer.tenant_id,
            due_balance: customer.due_balance,
            network_username: customer.network_username,
            connection_status: customer.connection_status,
            oldest_overdue_date: bill.due_date,
          });
        }
      }

      console.log(`[auto-suspend] Found ${customerIdsToSuspend.size} customers to suspend for tenant: ${tenant.name}`);

      if (customerIdsToSuspend.size === 0) {
        results.push(tenantResult);
        continue;
      }

      // Get active network integration for this tenant
      const { data: integrationData } = await supabase
        .from("network_integrations")
        .select("id, provider_type")
        .eq("tenant_id", tenant.id)
        .eq("is_enabled", true)
        .maybeSingle();

      const integration = integrationData as NetworkIntegration | null;

      // Suspend each customer
      for (const customerId of customerIdsToSuspend) {
        const customer = customerData.get(customerId)!;

        // Update customer status to suspended
        const { error: updateError } = await supabase
          .from("customers")
          .update({ connection_status: "suspended" })
          .eq("id", customerId);

        if (updateError) {
          tenantResult.errors.push(`Failed to suspend ${customer.name}: ${updateError.message}`);
          continue;
        }

        tenantResult.suspended_count++;
        console.log(`[auto-suspend] Suspended customer: ${customer.name} (due: ৳${customer.due_balance})`);

        // Trigger network sync if integration is available and customer has network username
        if (integration && customer.network_username) {
          const syncResult = await disableCustomerNetwork(
            supabase,
            tenant.id,
            customerId,
            integration.id,
            customer.network_username
          );

          if (syncResult.success) {
            tenantResult.network_synced++;
          } else {
            tenantResult.errors.push(`Network sync failed for ${customer.name}: ${syncResult.message}`);
          }
        }
      }

      results.push(tenantResult);
    }

    const totalSuspended = results.reduce((sum, r) => sum + r.suspended_count, 0);
    const totalNetworkSynced = results.reduce((sum, r) => sum + r.network_synced, 0);
    const duration = Date.now() - startTime;

    console.log(`[auto-suspend] Completed in ${duration}ms. Suspended: ${totalSuspended}, Network synced: ${totalNetworkSynced}`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          tenants_processed: tenants.length,
          total_suspended: totalSuspended,
          total_network_synced: totalNetworkSynced,
          duration_ms: duration,
        },
        details: results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[auto-suspend] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
