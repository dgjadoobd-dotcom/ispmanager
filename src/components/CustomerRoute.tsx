import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsStaff } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

interface CustomerRouteProps {
  children: React.ReactNode;
}

export function CustomerRoute({ children }: CustomerRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isStaff, isLoading: roleLoading } = useIsStaff();
  const location = useLocation();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  // Staff members can also access customer portal (for testing/support)
  // But customers cannot access staff dashboard
  return <>{children}</>;
}
