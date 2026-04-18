/**
 * MikroTik API client — calls the backend proxy at /api/mikrotik/*
 * No CORS issues since nginx proxies to the Node.js service
 */

export interface MikrotikCredentials {
  host: string;
  port?: number;
  username: string;
  password: string;
  use_ssl?: boolean;
}

export interface MikrotikResult<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

const BASE = "/api/mikrotik";
const TIMEOUT_MS = 15_000;

async function post<T>(path: string, body: object): Promise<MikrotikResult<T>> {
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

// ─── Connection ───────────────────────────────────────────────────────────────

export async function testMikrotikConnection(creds: MikrotikCredentials) {
  return post<{
    identity: string;
    version: string;
    board: string;
    uptime: string;
    cpu_load: string;
  }>("/test", creds);
}

// ─── PPP Secrets (customers) ──────────────────────────────────────────────────

export async function getPPPSecrets(creds: MikrotikCredentials) {
  return post<any[]>("/ppp/secrets", creds);
}

export async function getActivePPP(creds: MikrotikCredentials) {
  return post<any[]>("/ppp/active", creds);
}

export async function enablePPPUser(creds: MikrotikCredentials, ppp_username: string) {
  return post("/ppp/enable", { ...creds, ppp_username });
}

export async function disablePPPUser(creds: MikrotikCredentials, ppp_username: string) {
  return post("/ppp/disable", { ...creds, ppp_username });
}

export async function updatePPPSpeed(creds: MikrotikCredentials, ppp_username: string, profile: string) {
  return post("/ppp/update-speed", { ...creds, ppp_username, profile });
}

// ─── Address list (block/unblock) ─────────────────────────────────────────────

export async function addToAddressList(creds: MikrotikCredentials, address: string, list: string, comment?: string) {
  return post("/address-list/add", { ...creds, address, list, comment });
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export async function getInterfaces(creds: MikrotikCredentials) {
  return post<any[]>("/interfaces", creds);
}

// ─── Generic command ──────────────────────────────────────────────────────────

export async function execMikrotik(creds: MikrotikCredentials, command: string, params: string[] = []) {
  return post("/exec", { ...creds, command, params });
}
