import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface NetworkIntegration {
  id: string;
  provider_type: string;
  is_enabled: boolean;
}

interface CustomerNetworkData {
  id: string;
  name: string;
  network_username: string | null;
  connection_status: string;
  packages: { name: string; speed_label: string } | null;
}

// Helper function to trigger network sync
async function triggerNetworkSync(
  supabase: SupabaseClient,
  tenantId: string,
  customerId: string,
  action: "enable" | "disable" | "update_speed"
): Promise<{ success: boolean; message: string }> {
  try {
    // Get active network integration for this tenant
    const { data: integrationData, error: integrationError } = await supabase
      .from("network_integrations")
      .select("id, provider_type, is_enabled")
      .eq("tenant_id", tenantId)
      .eq("is_enabled", true)
      .maybeSingle();

    const integration = integrationData as NetworkIntegration | null;

    if (integrationError || !integration) {
      console.log("No active network integration found for tenant:", tenantId);
      return { success: false, message: "No active network integration" };
    }

    // Get customer network data
    const { data: customerData, error: customerError } = await supabase
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
      .eq("id", customerId)
      .single();

    const customer = customerData as CustomerNetworkData | null;

    if (customerError || !customer) {
      console.log("Customer not found:", customerId);
      return { success: false, message: "Customer not found" };
    }

    if (!customer.network_username) {
      console.log("Customer has no network username:", customerId);
      return { success: false, message: "No network username configured" };
    }

    // Simulate sync operation (in production, this would call actual MikroTik/RADIUS API)
    const syncResult = await performProviderSync(
      integration.provider_type,
      action,
      {
        customer_id: customer.id,
        customer_name: customer.name,
        network_username: customer.network_username,
        connection_status: customer.connection_status,
        package_name: (customer.packages as any)?.name || null,
        speed_label: (customer.packages as any)?.speed_label || null,
      }
    );

    // Log the sync operation
    await supabase.from("network_sync_logs").insert({
      tenant_id: tenantId,
      integration_id: integration.id,
      customer_id: customerId,
      action,
      status: syncResult.success ? "success" : "failed",
      request_payload: { action, triggered_by: "automatic" },
      response_payload: syncResult.data || null,
      error_message: syncResult.success ? null : syncResult.message,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      triggered_by: "automatic",
    });

    // Update customer sync status
    await supabase
      .from("customers")
      .update({
        last_network_sync_at: new Date().toISOString(),
        network_sync_status: syncResult.success ? "success" : "failed",
      })
      .eq("id", customerId);

    // Update integration last sync
    await supabase
      .from("network_integrations")
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: syncResult.success ? "success" : "failed",
      })
      .eq("id", integration.id);

    return syncResult;
  } catch (error: unknown) {
    console.error("Network sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message };
  }
}

// Provider-specific sync logic
async function performProviderSync(
  providerType: string,
  action: string,
  customerData: {
    customer_id: string;
    customer_name: string;
    network_username: string;
    connection_status: string;
    package_name: string | null;
    speed_label: string | null;
  }
): Promise<{ success: boolean; message: string; data?: any }> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // In production, this would make actual API calls to MikroTik/RADIUS
  console.log(`[${providerType}] Performing ${action} for ${customerData.network_username}`);

  return {
    success: true,
    message: `${action} completed for ${customerData.network_username}`,
    data: {
      provider: providerType,
      action,
      username: customerData.network_username,
      timestamp: new Date().toISOString(),
    },
  };
}

// Helper function to send payment confirmation notification
async function sendPaymentNotification(
  supabase: SupabaseClient,
  tenantId: string,
  customerId: string,
  amount: number
): Promise<void> {
  // Log the notification directly (since we're already in an edge function)
  await supabase.from("notification_logs").insert({
    tenant_id: tenantId,
    customer_id: customerId,
    notification_type: "payment_confirmation",
    title: "পেমেন্ট সফল হয়েছে",
    body: `৳${amount.toLocaleString()} পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে। ধন্যবাদ!`,
    data: { amount, type: "payment_confirmation" },
    status: "sent",
    sent_at: new Date().toISOString(),
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook data from UddoktaPay
    const webhookData = await req.json();
    console.log("Payment webhook received:", webhookData);

    const {
      invoice_id,
      status,
      amount,
      fee,
      charged_amount,
      transaction_id,
      payment_method,
      sender_number,
      metadata,
    } = webhookData;

    // Validate required fields
    if (!metadata?.bill_id || !metadata?.customer_id || !metadata?.tenant_id) {
      console.error("Missing metadata in webhook:", webhookData);
      return new Response(
        JSON.stringify({ error: "Invalid webhook data: missing metadata" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only process completed payments
    if (status !== "COMPLETED") {
      console.log(`Payment status is ${status}, not processing`);
      return new Response(
        JSON.stringify({ message: `Payment status: ${status}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if payment already recorded (idempotency)
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("reference", transaction_id)
      .maybeSingle();

    if (existingPayment) {
      console.log("Payment already recorded:", transaction_id);
      return new Response(
        JSON.stringify({ message: "Payment already processed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record the payment
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        tenant_id: metadata.tenant_id,
        customer_id: metadata.customer_id,
        bill_id: metadata.bill_id,
        amount: parseFloat(amount),
        method: "online",
        reference: transaction_id,
        notes: `UddoktaPay: ${payment_method || "N/A"} | Sender: ${sender_number || "N/A"} | Fee: ${fee || 0}`,
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Failed to record payment:", paymentError);
      return new Response(
        JSON.stringify({ error: "Failed to record payment", details: paymentError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Payment recorded successfully:", payment.id);

    // Update bill status to paid
    const { error: billUpdateError } = await supabase
      .from("bills")
      .update({ status: "paid" })
      .eq("id", metadata.bill_id);

    if (billUpdateError) {
      console.error("Failed to update bill status:", billUpdateError);
    }

    // Update customer's due balance, last payment date, and reactivate if suspended
    const { data: customer } = await supabase
      .from("customers")
      .select("due_balance, connection_status")
      .eq("id", metadata.customer_id)
      .single();

    let networkSyncResult = null;

    if (customer) {
      const newDueBalance = Math.max(0, (customer.due_balance || 0) - parseFloat(amount));
      const wasAutoSuspended = customer.connection_status === "suspended";
      
      // If customer was suspended and now has no due, reactivate them
      const shouldReactivate = wasAutoSuspended && newDueBalance === 0;
      
      await supabase
        .from("customers")
        .update({
          due_balance: newDueBalance,
          last_payment_date: new Date().toISOString().split("T")[0],
          ...(shouldReactivate ? { connection_status: "active" } : {}),
        })
        .eq("id", metadata.customer_id);

      // Trigger network sync to enable access after payment
      if (shouldReactivate) {
        console.log("Customer was suspended, triggering network sync to enable access");
        networkSyncResult = await triggerNetworkSync(
          supabase,
          metadata.tenant_id,
          metadata.customer_id,
          "enable"
        );
        console.log("Network sync result:", networkSyncResult);
      }

      // Send payment confirmation notification
      try {
        await sendPaymentNotification(supabase, metadata.tenant_id, metadata.customer_id, parseFloat(amount));
      } catch (notifError) {
        console.error("Failed to send payment notification:", notifError);
        // Don't fail the payment verification if notification fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment processed successfully",
        payment_id: payment.id,
        network_sync: networkSyncResult,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Payment verification error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});