/**
 * OLT API client — calls the backend proxy at /api/olt/*
 * Supports C-Data, ZTE, Huawei OLT devices via HTTP proxy
 */

export interface OltCredentials {
  host: string;
  port?: number;
  protocol?: "http" | "https";
  username: string;
  password: string;
}

export interface OltResult<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  status?: number;
}

const BASE = "/api/olt";

async function post<T>(path: string, body: object): Promise<OltResult<T>> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ─── Connection test ──────────────────────────────────────────────────────────

export async function testOltConnection(creds: OltCredentials) {
  return post("/test", creds);
}

// ─── Generic HTTP proxy (for any OLT endpoint) ───────────────────────────────

export async function oltProxy(
  creds: Pick<OltCredentials, "host" | "port" | "protocol">,
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: object,
  headers?: Record<string, string>
) {
  return post("/proxy", {
    host: creds.host,
    port: creds.port || 80,
    protocol: creds.protocol || "http",
    path,
    method,
    data,
    headers,
  });
}
