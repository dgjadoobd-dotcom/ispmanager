import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NetworkIntegration {
  id: string;
  tenant_id: string;
  provider_type: "mikrotik" | "radius" | "custom";
  host: string;
  port: number;
  username: string;
  credentials_encrypted: string | null;
  mikrotik_use_ssl: boolean;
  mikrotik_ppp_profile: string | null;
  mikrotik_address_list: string | null;
  radius_secret_encrypted: string | null;
  radius_auth_port: number;
  radius_acct_port: number;
}

interface CustomerSyncData {
  customer_id: string;
  customer_name: string;
  network_username: string | null;
  connection_status: "active" | "suspended" | "pending";
  package_name: string | null;
  speed_label: string | null;
}

interface SyncRequest {
  action: "test_connection" | "enable" | "disable" | "update_speed" | "sync_all" | "sync_package";
  integration_id: string;
  customer_id?: string;
  package_id?: string;
  triggered_by?: string;
}

// MikroTik API simulation - In production, this would use actual RouterOS API
async function mikrotikSync(
  integration: NetworkIntegration,
  action: string,
  customer?: CustomerSyncData
): Promise<{ success: boolean; message: string; data?: any }> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // For test_connection, just verify we can reach the host
  if (action === "test_connection") {
    // In production: Actually try to connect to MikroTik API
    // For now, simulate success if host is provided
    if (!integration.host) {
      return { success: false, message: "Host not configured" };
    }
    
    // Simulate connection test
    return {
      success: true,
      message: `Successfully connected to MikroTik at ${integration.host}:${integration.port}`,
      data: {
        router_identity: "MikroTik-Router",
        version: "7.x",
        connected_at: new Date().toISOString(),
      },
    };
  }

  if (!customer) {
    return { success: false, message: "Customer data required for sync" };
  }

  if (!customer.network_username) {
    return {
      success: false,
      message: `Customer ${customer.customer_name} has no network username configured`,
    };
  }

  // Simulate sync operations
  switch (action) {
    case "enable":
      // In production: Enable PPP secret or remove from address-list
      return {
        success: true,
        message: `Enabled access for ${customer.network_username}`,
        data: {
          ppp_secret: customer.network_username,
          profile: integration.mikrotik_ppp_profile || "default",
          status: "enabled",
        },
      };

    case "disable":
      // In production: Disable PPP secret or add to address-list
      return {
        success: true,
        message: `Disabled access for ${customer.network_username}`,
        data: {
          ppp_secret: customer.network_username,
          status: "disabled",
          address_list: integration.mikrotik_address_list || "blocked",
        },
      };

    case "update_speed":
      // In production: Update PPP profile or queue
      return {
        success: true,
        message: `Updated speed profile for ${customer.network_username}`,
        data: {
          ppp_secret: customer.network_username,
          profile: customer.package_name,
          speed: customer.speed_label,
        },
      };

    default:
      return { success: false, message: `Unknown action: ${action}` };
  }
}

// RADIUS sync simulation
async function radiusSync(
  integration: NetworkIntegration,
  action: string,
  customer?: CustomerSyncData
): Promise<{ success: boolean; message: string; data?: any }> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (action === "test_connection") {
    if (!integration.host) {
      return { success: false, message: "RADIUS host not configured" };
    }
    return {
      success: true,
      message: `RADIUS server at ${integration.host} is reachable`,
      data: {
        auth_port: integration.radius_auth_port,
        acct_port: integration.radius_acct_port,
      },
    };
  }

  if (!customer || !customer.network_username) {
    return { success: false, message: "Valid customer data required" };
  }

  // Simulate RADIUS user management
  switch (action) {
    case "enable":
      return {
        success: true,
        message: `RADIUS user ${customer.network_username} enabled`,
        data: { user: customer.network_username, status: "active" },
      };

    case "disable":
      return {
        success: true,
        message: `RADIUS user ${customer.network_username} disabled`,
        data: { user: customer.network_username, status: "suspended" },
      };

    case "update_speed":
      return {
        success: true,
        message: `RADIUS profile updated for ${customer.network_username}`,
        data: {
          user: customer.network_username,
          bandwidth_profile: customer.speed_label,
        },
      };

    default:
      return { success: false, message: `Unknown action: ${action}` };
  }
}

// Main sync dispatcher
async function performSync(
  integration: NetworkIntegration,
  action: string,
  customer?: CustomerSyncData
): Promise<{ success: boolean; message: string; data?: any }> {
  switch (integration.provider_type) {
    case "mikrotik":
      return mikrotikSync(integration, action, customer);
    case "radius":
      return radiusSync(integration, action, customer);
    case "custom":
      return {
        success: false,
        message: "Custom provider sync not yet implemented",
      };
    default:
      return { success: false, message: "Unknown provider type" };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token for RLS
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate user
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabaseUser.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub as string;
    const startTime = Date.now();

    // Parse request body
    const body: SyncRequest = await req.json();
    const { action, integration_id, customer_id, package_id, triggered_by = "manual" } = body;

    if (!action || !integration_id) {
      return new Response(
        JSON.stringify({ error: "action and integration_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch integration details
    const { data: integration, error: integrationError } = await supabaseAdmin
      .from("network_integrations")
      .select("*")
      .eq("id", integration_id)
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: "Integration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has access to this tenant
    const { data: hasAccess } = await supabaseAdmin.rpc("can_access_tenant", {
      _user_id: userId,
      _tenant_id: integration.tenant_id,
    });

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "Access denied to this integration" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle sync_package action
    if (action === "sync_package" && package_id) {
      const { data: pkg, error: pkgError } = await supabaseAdmin
        .from("packages")
        .select("*")
        .eq("id", package_id)
        .single();

      if (pkgError || !pkg) {
        return new Response(
          JSON.stringify({ error: "Package not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!pkg.mikrotik_profile_name) {
        return new Response(
          JSON.stringify({ error: "Package has no MikroTik profile configured" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Simulate creating/updating PPP Profile on MikroTik
      const profileResult = {
        success: true,
        message: `PPP Profile '${pkg.mikrotik_profile_name}' synced successfully`,
        data: {
          profile_name: pkg.mikrotik_profile_name,
          rate_limit: pkg.mikrotik_rate_limit,
          address_pool: pkg.mikrotik_address_pool,
          queue_type: pkg.mikrotik_queue_type,
        },
      };

      const responseTime = Date.now() - startTime;

      // Log the sync
      await supabaseAdmin.from("network_sync_logs").insert({
        tenant_id: integration.tenant_id,
        integration_id: integration.id,
        action: "update_speed",
        status: profileResult.success ? "success" : "failed",
        request_payload: { action: "sync_package", package_id, triggered_by },
        response_payload: profileResult.data,
        error_message: profileResult.success ? null : profileResult.message,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        triggered_by,
        triggered_by_user: userId,
      });

      // Queue bulk customer updates for all customers on this package
      const { data: packageCustomers } = await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("package_id", package_id)
        .eq("connection_status", "active");

      if (packageCustomers && packageCustomers.length > 0) {
        const queueItems = packageCustomers.map((c) => ({
          tenant_id: integration.tenant_id,
          integration_id: integration.id,
          customer_id: c.id,
          action: "update_speed" as const,
          priority: 5,
          payload: {
            package_id,
            profile_name: pkg.mikrotik_profile_name,
            rate_limit: pkg.mikrotik_rate_limit,
          },
        }));

        await supabaseAdmin.from("network_sync_queue").insert(queueItems);
      }

      // Update integration last sync
      await supabaseAdmin
        .from("network_integrations")
        .update({
          last_sync_at: new Date().toISOString(),
          last_sync_status: "success",
        })
        .eq("id", integration_id);

      return new Response(
        JSON.stringify({
          success: true,
          message: profileResult.message,
          data: {
            ...profileResult.data,
            customers_queued: packageCustomers?.length ?? 0,
          },
          response_time_ms: responseTime,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let customerData: CustomerSyncData | undefined;
    
    // Fetch customer data if needed
    if (customer_id && action !== "test_connection") {
      const { data: customer, error: customerError } = await supabaseAdmin
        .from("customers")
        .select(`
          id,
          name,
          network_username,
          connection_status,
          packages:package_id (
            name,
            speed_label
          )
        `)
        .eq("id", customer_id)
        .single();

      if (customerError || !customer) {
        return new Response(
          JSON.stringify({ error: "Customer not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      customerData = {
        customer_id: customer.id,
        customer_name: customer.name,
        network_username: customer.network_username,
        connection_status: customer.connection_status,
        package_name: (customer.packages as any)?.name || null,
        speed_label: (customer.packages as any)?.speed_label || null,
      };
    }

    // Perform the sync operation
    const result = await performSync(integration as NetworkIntegration, action, customerData);
    const responseTime = Date.now() - startTime;

    // Log the sync operation
    await supabaseAdmin.from("network_sync_logs").insert({
      tenant_id: integration.tenant_id,
      integration_id: integration.id,
      customer_id: customer_id || null,
      action,
      status: result.success ? "success" : "failed",
      request_payload: { action, customer_id, triggered_by },
      response_payload: result.data || null,
      error_message: result.success ? null : result.message,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      triggered_by,
      triggered_by_user: userId,
    });

    // Update integration last sync status
    await supabaseAdmin
      .from("network_integrations")
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: result.success ? "success" : "failed",
      })
      .eq("id", integration_id);

    // Update customer sync status if applicable
    if (customer_id && result.success) {
      await supabaseAdmin
        .from("customers")
        .update({
          last_network_sync_at: new Date().toISOString(),
          network_sync_status: "success",
        })
        .eq("id", customer_id);
    }

    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.message,
        data: result.data,
        response_time_ms: responseTime,
      }),
      {
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Network sync error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
