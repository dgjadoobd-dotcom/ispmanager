// Local authentication - no Supabase auth required
// Super admin credentials (change these as needed)
export const SUPER_ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
  email: "admin@ispmanager.local",
  id: "local-super-admin-001",
  full_name: "Super Admin",
  role: "super_admin" as const,
};

// Staff credentials (add more as needed)
export const STAFF_CREDENTIALS = [
  {
    username: "staff",
    password: "staff123",
    email: "staff@ispmanager.local",
    id: "local-staff-001",
    full_name: "ISP Staff",
    role: "isp_owner" as const,
  },
];

export type LocalRole = "super_admin" | "isp_owner" | "admin" | "manager" | "staff" | "accountant" | "marketing" | "reseller" | "member";

export interface LocalUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: LocalRole;
}

const SESSION_KEY = "local_auth_session";

export function saveSession(user: LocalUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): LocalUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function signInLocal(usernameOrEmail: string, password: string): LocalUser | null {
  // Check super admin
  const sa = SUPER_ADMIN_CREDENTIALS;
  if (
    (usernameOrEmail === sa.username || usernameOrEmail === sa.email) &&
    password === sa.password
  ) {
    return { id: sa.id, email: sa.email, username: sa.username, full_name: sa.full_name, role: sa.role };
  }

  // Check staff
  for (const s of STAFF_CREDENTIALS) {
    if (
      (usernameOrEmail === s.username || usernameOrEmail === s.email) &&
      password === s.password
    ) {
      return { id: s.id, email: s.email, username: s.username, full_name: s.full_name, role: s.role };
    }
  }

  return null;
}

export function isSuperAdminUser(user: LocalUser | null): boolean {
  return user?.role === "super_admin";
}

export function isStaffUser(user: LocalUser | null): boolean {
  if (!user) return false;
  const staffRoles: LocalRole[] = ["super_admin", "isp_owner", "admin", "manager", "staff", "accountant", "marketing", "reseller"];
  return staffRoles.includes(user.role);
}
