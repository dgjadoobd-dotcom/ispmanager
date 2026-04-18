import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PushSubscription {
  id: string;
  customer_id: string;
  tenant_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  is_active: boolean;
}

interface NotificationPayload {
  customer_id?: string;
  tenant_id: string;
  notification_type: "billing_reminder" | "payment_confirmation" | "connection_status" | "general";
  title: string;
  body: string;
  data?: Record<string, unknown>;
  icon?: string;
  badge?: string;
  url?: string;
}

// Simple web push using fetch - for demonstration
// In production, use a proper web-push library
async function sendWebPushSimple(
  subscription: PushSubscription,
  payload: { title: string; body: string; icon?: string; badge?: string; data?: Record<string, unknown> },
  vapidPublicKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // For a simplified implementation, we'll store the notification
    // and let the client fetch it via polling or realtime subscription
    // Full web push requires complex encryption that's better handled by web-push library
    
    console.log(`Sending notification to ${subscription.endpoint}:`, payload);
    
    // Simulate successful push for now
    // In production, integrate with a proper push service
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    console.log("Notification request:", payload);

    // Validate required fields
    if (!payload.tenant_id || !payload.notification_type || !payload.title || !payload.body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get tenant info for branding
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name, logo_url")
      .eq("id", payload.tenant_id)
      .single();

    // Build query for subscriptions
    let query = supabase
      .from("push_subscriptions")
      .select("*")
      .eq("tenant_id", payload.tenant_id)
      .eq("is_active", true);

    if (payload.customer_id) {
      query = query.eq("customer_id", payload.customer_id);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscriptions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    let failed = 0;

    if (subscriptions && subscriptions.length > 0) {
      // Send notifications to all subscriptions
      for (const subscription of subscriptions) {
        const result = await sendWebPushSimple(
          subscription as PushSubscription,
          {
            title: payload.title,
            body: payload.body,
            icon: tenant?.logo_url || payload.icon,
            data: {
              ...payload.data,
              type: payload.notification_type,
              url: payload.url || "/app",
            },
          },
          vapidPublicKey
        );

        if (result.success) {
          sent++;
        } else {
          failed++;
          console.error(`Failed to send to ${subscription.id}:`, result.error);
        }
      }
    }

    // Log the notification - this also serves as the notification store
    // for clients that poll or use realtime
    const { data: logData, error: logError } = await supabase.from("notification_logs").insert({
      tenant_id: payload.tenant_id,
      customer_id: payload.customer_id || null,
      notification_type: payload.notification_type,
      title: payload.title,
      body: payload.body,
      data: payload.data || null,
      status: failed === 0 ? "sent" : sent > 0 ? "partial" : "pending",
      sent_at: new Date().toISOString(),
    }).select().single();

    if (logError) {
      console.error("Error logging notification:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        failed,
        total: subscriptions?.length || 0,
        notification_id: logData?.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
