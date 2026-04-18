import { useAuth } from "@/contexts/AuthContext";
import { isSuperAdminUser, isStaffUser, LocalRole } from "@/lib/localAuth";

export type AppRole = LocalRole;

const STAFF_ROLES: AppRole[] = [
  "super_admin",
  "isp_owner",
  "admin",
  "manager",
  "staff",
  "accountant",
  "marketing",
  "reseller",
];

export function useUserRole() {
  const { user } = useAuth();
  const role = (user?.role ?? null) as AppRole | null;
  return {
    data: role,
    isLoading: false,
    error: null,
  };
}

export function useIsStaff() {
  const { user } = useAuth();
  return {
    isStaff: isStaffUser(user),
    isLoading: false,
  };
}

export function useIsSuperAdmin() {
  const { user } = useAuth();
  return {
    isSuperAdmin: isSuperAdminUser(user),
    isLoading: false,
  };
}

export function useIsCustomer() {
  const { user } = useAuth();
  return {
    isCustomer: !user || user.role === "member",
    isLoading: false,
  };
}
