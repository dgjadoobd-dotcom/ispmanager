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
const TIMEOUT_MS = 15_000;

async function post<T>(path: string, body: object): Promise<OltResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return { success: false, error: err.error || `HTTP ${res.status}` };
    }
    return res.json();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return { success: false, error: "Connection timed out" };
    }
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  } finally {
    clearTimeout(timer);
  }
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
