import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsStaff, useIsSuperAdmin, useUserRole } from "@/hooks/useUserRole";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useTenantContext } from "@/contexts/TenantContext";
import { Loader2 } from "lucide-react";

interface StaffRouteProps {
  children: React.ReactNode;
}

export function StaffRoute({ children }: StaffRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { isStaff, isLoading: roleLoading } = useIsStaff();
  const { isSuperAdmin, isLoading: superAdminLoading } = useIsSuperAdmin();
  const { data: role } = useUserRole();
  const { isImpersonating } = useTenantContext();
  const location = useLocation();

  if (authLoading || roleLoading || superAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow access if demo mode is active
  if (isDemoMode) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow super admin in impersonation mode to access staff routes
  if (isSuperAdmin && isImpersonating) {
    return <>{children}</>;
  }

  if (!isStaff) {
    return <Navigate to="/portal" replace />;
  }

  // Redirect resellers to their own dashboard if they try to access ISP routes
  if (role === "reseller" && location.pathname === "/dashboard") {
    return <Navigate to="/dashboard/reseller" replace />;
  }

  return <>{children}</>;
}
