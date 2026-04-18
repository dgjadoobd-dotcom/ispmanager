import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TenantBilling {
  tenant_id: string;
  tenant_name: string;
  subscription_id: string;
  plan_id: string;
  plan_name: string;
  base_price: number;
  customer_count: number;
  active_addons: {
    addon_id: string;
    addon_name: string;
    price: number;
  }[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get billing period (previous month by default, or from request)
    const { billingMonth, billingYear, dryRun = false } = await req.json().catch(() => ({}));
    
    const now = new Date();
    const targetMonth = billingMonth ?? now.getMonth(); // 0-indexed, current month if not specified
    const targetYear = billingYear ?? now.getFullYear();
    
    // Calculate period start and end
    const periodStart = new Date(targetYear, targetMonth - 1, 1); // Previous month
    const periodEnd = new Date(targetYear, targetMonth, 0); // Last day of previous month
    const dueDate = new Date(targetYear, targetMonth, 15); // 15th of current month

    console.log(`Generating invoices for period: ${periodStart.toISOString()} to ${periodEnd.toISOString()}`);

    // Get all active tenant subscriptions with their plans
    const { data: subscriptions, error: subError } = await supabase
      .from("tenant_subscriptions")
      .select(`
        id,
        tenant_id,
        plan_id,
        status,
        tenant:tenants(id, name, subdomain),
        plan:platform_plans(id, name, base_price, billing_cycle)
      `)
      .eq("status", "active");

    if (subError) {
      throw new Error(`Failed to fetch subscriptions: ${subError.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No active subscriptions found",
          invoices_generated: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const invoicesGenerated: any[] = [];
    const errors: any[] = [];

    for (const subscription of subscriptions) {
      try {
        const tenant = subscription.tenant as any;
        const plan = subscription.plan as any;

        if (!tenant || !plan) {
          console.warn(`Skipping subscription ${subscription.id}: missing tenant or plan`);
          continue;
        }

        // Check if invoice already exists for this period
        const { data: existingInvoice } = await supabase
          .from("platform_invoices")
          .select("id")
          .eq("tenant_id", tenant.id)
          .eq("period_start", periodStart.toISOString().split("T")[0])
          .eq("period_end", periodEnd.toISOString().split("T")[0])
          .maybeSingle();

        if (existingInvoice) {
          console.log(`Invoice already exists for tenant ${tenant.name} for this period`);
          continue;
        }

        // Get customer count for this tenant
        const { count: customerCount } = await supabase
          .from("customers")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", tenant.id)
          .eq("connection_status", "active");

        // Get active addons for this tenant
        const { data: addonSubs } = await supabase
          .from("tenant_addon_subscriptions")
          .select(`
            addon_id,
            addon:platform_addons(id, name, code, pricing_type, base_price)
          `)
          .eq("tenant_id", tenant.id)
          .eq("is_active", true);

        // Calculate addon prices
        const addonItems: any[] = [];
        let addonsTotal = 0;

        for (const addonSub of addonSubs || []) {
          const addon = addonSub.addon as any;
          if (!addon) continue;

          let addonPrice = addon.base_price;

          // For tiered pricing, calculate based on customer count
          if (addon.pricing_type === "tiered") {
            const { data: priceResult } = await supabase
              .rpc("calculate_addon_price", {
                _addon_id: addon.id,
                _customer_count: customerCount || 0,
              });
            addonPrice = priceResult || addon.base_price;
          }

          addonItems.push({
            addon_id: addon.id,
            addon_name: addon.name,
            addon_code: addon.code,
            price: addonPrice,
          });
          addonsTotal += addonPrice;
        }

        // Calculate totals
        const basePlanCost = plan.base_price;
        const subtotal = basePlanCost + addonsTotal;
        const taxAmount = 0; // Can be configured later
        const total = subtotal + taxAmount;

        // Generate invoice number
        const invoiceNumber = `PLT-${targetYear}${String(targetMonth).padStart(2, "0")}-${tenant.subdomain.toUpperCase().substring(0, 4)}-${Date.now().toString(36).toUpperCase().slice(-4)}`;

        if (dryRun) {
          invoicesGenerated.push({
            tenant_id: tenant.id,
            tenant_name: tenant.name,
            invoice_number: invoiceNumber,
            base_plan: { name: plan.name, price: basePlanCost },
            addons: addonItems,
            customer_count: customerCount || 0,
            subtotal,
            tax_amount: taxAmount,
            total,
            period_start: periodStart.toISOString().split("T")[0],
            period_end: periodEnd.toISOString().split("T")[0],
            due_date: dueDate.toISOString().split("T")[0],
          });
          continue;
        }

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
          .from("platform_invoices")
          .insert({
            tenant_id: tenant.id,
            subscription_id: subscription.id,
            invoice_number: invoiceNumber,
            period_start: periodStart.toISOString().split("T")[0],
            period_end: periodEnd.toISOString().split("T")[0],
            due_date: dueDate.toISOString().split("T")[0],
            subtotal,
            tax_amount: taxAmount,
            total,
            status: "pending",
            customer_count_snapshot: customerCount || 0,
            metadata: {
              generated_at: new Date().toISOString(),
              billing_cycle: plan.billing_cycle,
            },
          })
          .select()
          .single();

        if (invoiceError) {
          throw new Error(`Failed to create invoice: ${invoiceError.message}`);
        }

        // Create invoice items
        const invoiceItems = [
          {
            invoice_id: invoice.id,
            item_type: "base_plan",
            description: `${plan.name} - মাসিক সাবস্ক্রিপশন`,
            quantity: 1,
            unit_price: basePlanCost,
            total: basePlanCost,
            metadata: { plan_id: plan.id },
          },
          ...addonItems.map((addon) => ({
            invoice_id: invoice.id,
            item_type: "addon",
            addon_id: addon.addon_id,
            description: `${addon.addon_name} অ্যাড-অন`,
            quantity: 1,
            unit_price: addon.price,
            total: addon.price,
            metadata: { addon_code: addon.addon_code },
          })),
        ];

        const { error: itemsError } = await supabase
          .from("platform_invoice_items")
          .insert(invoiceItems);

        if (itemsError) {
          console.error(`Failed to create invoice items: ${itemsError.message}`);
        }

        invoicesGenerated.push({
          invoice_id: invoice.id,
          invoice_number: invoiceNumber,
          tenant_id: tenant.id,
          tenant_name: tenant.name,
          total,
        });

        console.log(`Generated invoice ${invoiceNumber} for ${tenant.name}: ৳${total}`);

      } catch (err) {
        console.error(`Error processing tenant ${subscription.tenant_id}:`, err);
        errors.push({
          tenant_id: subscription.tenant_id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        dry_run: dryRun,
        period: {
          start: periodStart.toISOString().split("T")[0],
          end: periodEnd.toISOString().split("T")[0],
        },
        invoices_generated: invoicesGenerated.length,
        invoices: invoicesGenerated,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating invoices:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
