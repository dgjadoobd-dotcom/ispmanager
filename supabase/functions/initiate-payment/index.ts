import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InitiatePaymentRequest {
  bill_id: string;
  amount: number;
  return_url: string;
  cancel_url: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create authenticated client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { bill_id, amount, return_url, cancel_url }: InitiatePaymentRequest = await req.json();

    if (!bill_id || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: bill_id, amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get bill details with customer and tenant info
    const { data: bill, error: billError } = await supabase
      .from("bills")
      .select(`
        *,
        customers!inner (
          id,
          name,
          email,
          phone,
          user_id,
          tenant_id
        )
      `)
      .eq("id", bill_id)
      .single();

    if (billError || !bill) {
      return new Response(
        JSON.stringify({ error: "Bill not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the bill belongs to the logged-in user
    if (bill.customers.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "You are not authorized to pay this bill" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get tenant payment settings
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("uddoktapay_api_key, uddoktapay_base_url, enable_online_payment, name")
      .eq("id", bill.customers.tenant_id)
      .single();

    if (tenantError || !tenant) {
      return new Response(
        JSON.stringify({ error: "Tenant configuration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!tenant.enable_online_payment) {
      return new Response(
        JSON.stringify({ error: "Online payment is not enabled for this provider" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!tenant.uddoktapay_api_key || !tenant.uddoktapay_base_url) {
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique invoice ID
    const invoiceId = `PAY-${Date.now()}-${bill_id.slice(0, 8)}`;

    // Prepare UddoktaPay request
    const uddoktaPayload = {
      full_name: bill.customers.name,
      email: bill.customers.email || `customer-${bill.customers.id}@placeholder.com`,
      amount: amount.toString(),
      metadata: {
        bill_id: bill_id,
        customer_id: bill.customers.id,
        tenant_id: bill.customers.tenant_id,
        invoice_number: bill.invoice_number,
      },
      redirect_url: return_url,
      cancel_url: cancel_url,
      webhook_url: `${supabaseUrl}/functions/v1/verify-payment`,
    };

    // Call UddoktaPay API
    const uddoktaResponse = await fetch(`${tenant.uddoktapay_base_url}/api/checkout-v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "RT-UDDOKTAPAY-API-KEY": tenant.uddoktapay_api_key,
      },
      body: JSON.stringify(uddoktaPayload),
    });

    const uddoktaData = await uddoktaResponse.json();

    if (!uddoktaResponse.ok || !uddoktaData.payment_url) {
      console.error("UddoktaPay error:", uddoktaData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to initiate payment", 
          details: uddoktaData.message || "Unknown error" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: uddoktaData.payment_url,
        invoice_id: invoiceId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Payment initiation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
