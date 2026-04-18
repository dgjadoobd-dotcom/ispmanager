import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the calling user is staff
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller is staff
    const { data: callerRole } = await callerClient.rpc("get_user_role", { _user_id: caller.id });
    const staffRoles = ["super_admin", "isp_owner", "admin", "manager"];
    if (!callerRole || !staffRoles.includes(callerRole)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { email, password, name, phone, tenant_id, reseller_email, address, commission_type, commission_value, notes } = body;

    if (!email || !password || !name || !phone || !tenant_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use admin client to create user without affecting current session
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authData.user.id;

    // Create reseller record
    const { data: reseller, error: resellerError } = await adminClient
      .from("resellers")
      .insert({
        tenant_id,
        user_id: userId,
        name,
        phone,
        email: reseller_email || null,
        address: address || null,
        commission_type: commission_type || "percentage",
        commission_value: commission_value || 0,
        notes: notes || null,
      })
      .select()
      .single();

    if (resellerError) {
      // Cleanup: delete the created user
      await adminClient.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ error: resellerError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Assign reseller role
    await adminClient.from("user_roles").insert({
      user_id: userId,
      role: "reseller",
      tenant_id,
    });

    // Create/update profile
    await adminClient.from("profiles").upsert({
      id: userId,
      full_name: name,
      email,
      phone,
      tenant_id,
    });

    return new Response(JSON.stringify({ reseller }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
