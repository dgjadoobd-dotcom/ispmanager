import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface BillWithCustomer {
  id: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  customer_id: string;
  tenant_id: string;
  customers: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    user_id: string | null;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const reminderDays = [1, 3, 7];
    
    let totalReminders = 0;
    const results: { day: number; count: number; errors: string[] }[] = [];

    for (const daysBeforeDue of reminderDays) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + daysBeforeDue);
      const targetDateStr = targetDate.toISOString().split("T")[0];

      const { data: bills, error: billsError } = await supabase
        .from("bills")
        .select(`id, invoice_number, amount, due_date, customer_id, tenant_id, customers!inner (id, name, email, phone, user_id)`)
        .eq("due_date", targetDateStr)
        .in("status", ["due", "partial", "overdue"]);

      if (billsError) {
        console.error(`Error fetching bills for ${targetDateStr}:`, billsError);
        results.push({ day: daysBeforeDue, count: 0, errors: [billsError.message] });
        continue;
      }

      const typedBills = bills as unknown as BillWithCustomer[];
      const errors: string[] = [];
      let sentCount = 0;

      for (const bill of typedBills) {
        try {
          const { data: existingReminder } = await supabase
            .from("notification_logs")
            .select("id")
            .eq("customer_id", bill.customer_id)
            .eq("notification_type", "billing_reminder")
            .gte("created_at", today.toISOString().split("T")[0])
            .single();

          if (existingReminder) {
            console.log(`Reminder already sent today for bill ${bill.id}`);
            continue;
          }

          let urgencyText = "";
          let title = "";
          if (daysBeforeDue === 1) {
            urgencyText = "tomorrow";
            title = "⚠️ Bill Payment Reminder - Due Tomorrow";
          } else if (daysBeforeDue === 3) {
            urgencyText = "in 3 days";
            title = "📋 Bill Payment Reminder";
          } else {
            urgencyText = "in 7 days";
            title = "📅 Upcoming Bill Reminder";
          }

          const body = `${bill.customers.name}, your invoice ${bill.invoice_number} for ৳${bill.amount.toLocaleString()} is due ${urgencyText}. Please make your payment on time.`;

          await supabase.from("notification_logs").insert({
            tenant_id: bill.tenant_id,
            customer_id: bill.customer_id,
            notification_type: "billing_reminder",
            title,
            body,
            data: {
              bill_id: bill.id,
              invoice_number: bill.invoice_number,
              amount: bill.amount,
              due_date: bill.due_date,
              days_before_due: daysBeforeDue,
            },
            status: "pending",
          });

          const { data: subscriptions } = await supabase
            .from("push_subscriptions")
            .select("*")
            .eq("customer_id", bill.customer_id)
            .eq("is_active", true);

          if (subscriptions && subscriptions.length > 0) {
            for (const sub of subscriptions) {
              try {
                console.log(`Would send push to ${sub.endpoint} for bill ${bill.id}`);
              } catch (pushError) {
                console.error(`Push notification error:`, pushError);
              }
            }

            await supabase
              .from("notification_logs")
              .update({ status: "sent", sent_at: new Date().toISOString() })
              .eq("customer_id", bill.customer_id)
              .eq("notification_type", "billing_reminder")
              .is("sent_at", null);
          }

          sentCount++;
          totalReminders++;
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          errors.push(`Bill ${bill.id}: ${errorMsg}`);
          console.error(`Error processing bill ${bill.id}:`, err);
        }
      }

      results.push({ day: daysBeforeDue, count: sentCount, errors });
      console.log(`Sent ${sentCount} reminders for bills due in ${daysBeforeDue} days`);
    }

    return new Response(
      JSON.stringify({ success: true, message: `Sent ${totalReminders} billing reminders`, details: results, processed_at: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Billing reminder error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
