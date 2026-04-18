import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsSuperAdmin } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const location = useLocation();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isSuperAdmin) {
    // User is logged in but not super admin - redirect appropriately
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
