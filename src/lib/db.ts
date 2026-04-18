/**
 * localStorage-based database layer
 * Replaces all Supabase .from() queries with local persistence
 */

export function genId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function now(): string {
  return new Date().toISOString();
}

// ─── Generic CRUD helpers ────────────────────────────────────────────────────

export function dbGet<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function dbSet<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function dbInsert<T extends { id: string; created_at: string }>(
  key: string,
  record: Omit<T, "id" | "created_at"> & Partial<Pick<T, "id" | "created_at">>
): T {
  const rows = dbGet<T>(key);
  const newRow = { ...record, id: record.id ?? genId(), created_at: record.created_at ?? now() } as T;
  rows.unshift(newRow);
  dbSet(key, rows);
  return newRow;
}

export function dbUpdate<T extends { id: string }>(
  key: string,
  id: string,
  updates: Partial<T>
): T | null {
  const rows = dbGet<T>(key);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  rows[idx] = { ...rows[idx], ...updates, id };
  dbSet(key, rows);
  return rows[idx];
}

export function dbDelete<T extends { id: string }>(key: string, id: string): void {
  const rows = dbGet<T>(key);
  dbSet(key, rows.filter((r) => r.id !== id));
}

export function dbFind<T extends { id: string }>(key: string, id: string): T | null {
  return dbGet<T>(key).find((r) => r.id === id) ?? null;
}

// ─── Table keys ──────────────────────────────────────────────────────────────

export const TABLES = {
  customers: "db_customers",
  packages: "db_packages",
  bills: "db_bills",
  payments: "db_payments",
  network_integrations: "db_network_integrations",
  network_sync_logs: "db_network_sync_logs",
  olt_devices: "db_olt_devices",
  olt_ports: "db_olt_ports",
  customer_onu: "db_customer_onu",
  resellers: "db_resellers",
  reseller_commissions: "db_reseller_commissions",
  reseller_wallet_transactions: "db_reseller_wallet_transactions",
  notification_logs: "db_notification_logs",
  api_keys: "db_api_keys",
  tenants: "db_tenants",
} as const;
