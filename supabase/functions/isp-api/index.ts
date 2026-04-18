import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

interface ApiKeyValidation {
  tenant_id: string;
  api_key_id: string;
  scope: "read_only" | "read_write";
  is_valid: boolean;
}

// Simple in-memory rate limiting (per edge function instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function checkRateLimit(keyId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(keyId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(keyId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function createErrorResponse(
  status: number,
  code: string,
  message: string
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { code, message },
      version: "v1",
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

function createSuccessResponse(data: unknown, status = 200): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      version: "v1",
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

Deno.serve(async (req) => {
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  // deno-lint-ignore no-explicit-any
  const supabase: SupabaseClient<any> = createClient(supabaseUrl, supabaseServiceKey);

  // Extract API key from header
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return createErrorResponse(401, "MISSING_API_KEY", "API key is required");
  }

  // Validate API key
  const keyHash = await hashApiKey(apiKey);
  const { data: keyData, error: keyError } = await supabase.rpc(
    "validate_api_key",
    { _key_hash: keyHash }
  );

  if (keyError || !keyData || keyData.length === 0) {
    return createErrorResponse(401, "INVALID_API_KEY", "Invalid API key");
  }

  const validation: ApiKeyValidation = keyData[0];

  if (!validation.is_valid) {
    return createErrorResponse(
      403,
      "API_KEY_INACTIVE",
      "API key is inactive or API access is disabled"
    );
  }

  // Rate limiting
  if (!checkRateLimit(validation.api_key_id)) {
    await supabase.rpc("log_api_request", {
      _tenant_id: validation.tenant_id,
      _api_key_id: validation.api_key_id,
      _endpoint: new URL(req.url).pathname,
      _method: req.method,
      _status_code: 429,
      _request_ip: req.headers.get("x-forwarded-for") || null,
      _user_agent: req.headers.get("user-agent") || null,
      _error_message: "Rate limit exceeded",
    });
    return createErrorResponse(
      429,
      "RATE_LIMIT_EXCEEDED",
      "Too many requests. Please try again later."
    );
  }

  // Update last used timestamp
  await supabase.rpc("update_api_key_last_used", {
    _api_key_id: validation.api_key_id,
  });

  // Parse URL path
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  // Expected path: /isp-api/v1/{resource}[/{id}]
  const version = pathParts[1]; // v1
  const resource = pathParts[2]; // customers, bills, payments, packages
  const resourceId = pathParts[3]; // optional ID

  if (version !== "v1") {
    return createErrorResponse(
      400,
      "INVALID_VERSION",
      "API version must be v1"
    );
  }

  let response: Response;

  try {
    // Check write permission for non-GET requests
    if (req.method !== "GET" && validation.scope === "read_only") {
      response = createErrorResponse(
        403,
        "INSUFFICIENT_PERMISSIONS",
        "Read-only API key cannot perform write operations"
      );
    } else {
      // Route to appropriate handler
      switch (resource) {
        case "customers":
          response = await handleCustomers(
            supabase,
            validation.tenant_id,
            req,
            resourceId
          );
          break;
        case "bills":
          response = await handleBills(
            supabase,
            validation.tenant_id,
            req,
            resourceId
          );
          break;
        case "payments":
          response = await handlePayments(
            supabase,
            validation.tenant_id,
            req,
            resourceId
          );
          break;
        case "packages":
          response = await handlePackages(
            supabase,
            validation.tenant_id,
            req,
            resourceId
          );
          break;
        case "status":
          response = createSuccessResponse({
            api_enabled: true,
            scope: validation.scope,
            tenant_id: validation.tenant_id,
          });
          break;
        default:
          response = createErrorResponse(
            404,
            "RESOURCE_NOT_FOUND",
            `Unknown resource: ${resource}`
          );
      }
    }
  } catch (error) {
    console.error("API error:", error);
    response = createErrorResponse(
      500,
      "INTERNAL_ERROR",
      "An internal error occurred"
    );
  }

  // Log the request
  const responseTime = Date.now() - startTime;
  const status = response.status;

  await supabase.rpc("log_api_request", {
    _tenant_id: validation.tenant_id,
    _api_key_id: validation.api_key_id,
    _endpoint: `/${resource}${resourceId ? `/${resourceId}` : ""}`,
    _method: req.method,
    _status_code: status,
    _request_ip: req.headers.get("x-forwarded-for") || null,
    _user_agent: req.headers.get("user-agent") || null,
    _response_time_ms: responseTime,
    _error_message: status >= 400 ? await getErrorMessage(response) : null,
  });

  return response;
});

async function getErrorMessage(response: Response): Promise<string | null> {
  try {
    const clone = response.clone();
    const body = await clone.json();
    return body.error?.message || null;
  } catch {
    return null;
  }
}

// ==================== CUSTOMERS ====================
// deno-lint-ignore no-explicit-any
async function handleCustomers(
  supabase: SupabaseClient<any>,
  tenantId: string,
  req: Request,
  customerId?: string
): Promise<Response> {
  const url = new URL(req.url);

  switch (req.method) {
    case "GET": {
      if (customerId) {
        // Get single customer
        const { data, error } = await supabase
          .from("customers")
          .select(
            `
            id, name, phone, email, address, connection_status,
            due_balance, advance_balance, join_date, last_payment_date,
            package:packages(id, name, speed_label, monthly_price)
          `
          )
          .eq("tenant_id", tenantId)
          .eq("id", customerId)
          .single();

        if (error || !data) {
          return createErrorResponse(404, "NOT_FOUND", "Customer not found");
        }

        return createSuccessResponse(data);
      } else {
        // List customers with pagination
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = Math.min(
          parseInt(url.searchParams.get("limit") || "50"),
          100
        );
        const status = url.searchParams.get("status");
        const search = url.searchParams.get("search");

        let query = supabase
          .from("customers")
          .select(
            `
            id, name, phone, email, connection_status,
            due_balance, advance_balance, join_date,
            package:packages(id, name, speed_label)
          `,
            { count: "exact" }
          )
          .eq("tenant_id", tenantId)
          .order("created_at", { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        if (status) {
          query = query.eq("connection_status", status);
        }
        if (search) {
          query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) {
          return createErrorResponse(500, "QUERY_ERROR", error.message);
        }

        return createSuccessResponse({
          customers: data,
          pagination: {
            page,
            limit,
            total: count,
            total_pages: Math.ceil((count || 0) / limit),
          },
        });
      }
    }

    case "POST": {
      const body = await req.json();
      const { name, phone, email, address, package_id } = body;

      if (!name || !phone) {
        return createErrorResponse(
          400,
          "VALIDATION_ERROR",
          "Name and phone are required"
        );
      }

      const { data, error } = await supabase
        .from("customers")
        .insert({
          tenant_id: tenantId,
          name,
          phone,
          email: email || null,
          address: address || null,
          package_id: package_id || null,
          connection_status: "pending",
        })
        .select()
        .single();

      if (error) {
        return createErrorResponse(400, "INSERT_ERROR", error.message);
      }

      return createSuccessResponse(data, 201);
    }

    case "PATCH":
    case "PUT": {
      if (!customerId) {
        return createErrorResponse(
          400,
          "MISSING_ID",
          "Customer ID is required"
        );
      }

      const body = await req.json();
      const allowedFields = [
        "name",
        "phone",
        "email",
        "address",
        "package_id",
        "connection_status",
      ];
      // deno-lint-ignore no-explicit-any
      const updateData: Record<string, any> = {};

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }

      const { data, error } = await supabase
        .from("customers")
        .update(updateData)
        .eq("tenant_id", tenantId)
        .eq("id", customerId)
        .select()
        .single();

      if (error || !data) {
        return createErrorResponse(404, "NOT_FOUND", "Customer not found");
      }

      return createSuccessResponse(data);
    }

    default:
      return createErrorResponse(
        405,
        "METHOD_NOT_ALLOWED",
        "Method not allowed"
      );
  }
}

// ==================== BILLS ====================
// deno-lint-ignore no-explicit-any
async function handleBills(
  supabase: SupabaseClient<any>,
  tenantId: string,
  req: Request,
  billId?: string
): Promise<Response> {
  const url = new URL(req.url);

  if (req.method !== "GET") {
    return createErrorResponse(405, "METHOD_NOT_ALLOWED", "Method not allowed");
  }

  if (billId) {
    // Get single bill
    const { data, error } = await supabase
      .from("bills")
      .select(
        `
        id, invoice_number, amount, due_date, status, notes,
        billing_period_start, billing_period_end, created_at,
        customer:customers(id, name, phone)
      `
      )
      .eq("tenant_id", tenantId)
      .eq("id", billId)
      .single();

    if (error || !data) {
      return createErrorResponse(404, "NOT_FOUND", "Bill not found");
    }

    return createSuccessResponse(data);
  } else {
    // List bills with pagination
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50"),
      100
    );
    const status = url.searchParams.get("status");
    const customerId = url.searchParams.get("customer_id");

    let query = supabase
      .from("bills")
      .select(
        `
        id, invoice_number, amount, due_date, status,
        billing_period_start, billing_period_end, created_at,
        customer:customers(id, name, phone)
      `,
        { count: "exact" }
      )
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq("status", status);
    }
    if (customerId) {
      query = query.eq("customer_id", customerId);
    }

    const { data, error, count } = await query;

    if (error) {
      return createErrorResponse(500, "QUERY_ERROR", error.message);
    }

    return createSuccessResponse({
      bills: data,
      pagination: {
        page,
        limit,
        total: count,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  }
}

// ==================== PAYMENTS ====================
// deno-lint-ignore no-explicit-any
async function handlePayments(
  supabase: SupabaseClient<any>,
  tenantId: string,
  req: Request,
  paymentId?: string
): Promise<Response> {
  const url = new URL(req.url);

  if (req.method !== "GET") {
    return createErrorResponse(405, "METHOD_NOT_ALLOWED", "Method not allowed");
  }

  if (paymentId) {
    // Get single payment
    const { data, error } = await supabase
      .from("payments")
      .select(
        `
        id, amount, method, reference, notes, created_at,
        customer:customers(id, name, phone),
        bill:bills(id, invoice_number)
      `
      )
      .eq("tenant_id", tenantId)
      .eq("id", paymentId)
      .single();

    if (error || !data) {
      return createErrorResponse(404, "NOT_FOUND", "Payment not found");
    }

    return createSuccessResponse(data);
  } else {
    // List payments with pagination
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50"),
      100
    );
    const customerId = url.searchParams.get("customer_id");
    const method = url.searchParams.get("method");

    let query = supabase
      .from("payments")
      .select(
        `
        id, amount, method, reference, created_at,
        customer:customers(id, name, phone)
      `,
        { count: "exact" }
      )
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (customerId) {
      query = query.eq("customer_id", customerId);
    }
    if (method) {
      query = query.eq("method", method);
    }

    const { data, error, count } = await query;

    if (error) {
      return createErrorResponse(500, "QUERY_ERROR", error.message);
    }

    return createSuccessResponse({
      payments: data,
      pagination: {
        page,
        limit,
        total: count,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  }
}

// ==================== PACKAGES ====================
// deno-lint-ignore no-explicit-any
async function handlePackages(
  supabase: SupabaseClient<any>,
  tenantId: string,
  req: Request,
  packageId?: string
): Promise<Response> {
  if (req.method !== "GET") {
    return createErrorResponse(405, "METHOD_NOT_ALLOWED", "Method not allowed");
  }

  if (packageId) {
    // Get single package
    const { data, error } = await supabase
      .from("packages")
      .select("id, name, speed_label, monthly_price, validity_days, is_active")
      .eq("tenant_id", tenantId)
      .eq("id", packageId)
      .single();

    if (error || !data) {
      return createErrorResponse(404, "NOT_FOUND", "Package not found");
    }

    return createSuccessResponse(data);
  } else {
    // List all packages
    const { data, error } = await supabase
      .from("packages")
      .select("id, name, speed_label, monthly_price, validity_days, is_active")
      .eq("tenant_id", tenantId)
      .order("monthly_price", { ascending: true });

    if (error) {
      return createErrorResponse(500, "QUERY_ERROR", error.message);
    }

    return createSuccessResponse({ packages: data });
  }
}
