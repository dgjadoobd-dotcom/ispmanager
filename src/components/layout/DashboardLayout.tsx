import { useNavigate, Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { SidebarProvider } from "@/components/ui/animated-sidebar";
import { useTenantContext } from "@/contexts/TenantContext";
import { useResellerImpersonation } from "@/contexts/ResellerImpersonationContext";
import { DemoModeBanner } from "@/components/demo/DemoModeBanner";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, UserCheck } from "lucide-react";

export function DashboardLayout() {
  const navigate = useNavigate();
  const { isImpersonating, currentTenant, stopImpersonation } = useTenantContext();
  const { isImpersonatingReseller, impersonatedResellerName, stopResellerImpersonation } = useResellerImpersonation();

  const handleExitImpersonation = () => {
    stopImpersonation();
    navigate("/admin/tenants");
  };

  const handleExitResellerImpersonation = () => {
    stopResellerImpersonation();
    navigate("/dashboard/resellers");
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <DashboardSidebar />
        
        <div className="flex flex-1 flex-col min-w-0">
          <DemoModeBanner />

          {isImpersonating && !isImpersonatingReseller && (
            <div className="bg-warning/15 text-warning-foreground px-4 py-2.5 flex items-center justify-between border-b border-warning/20 animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-warning/20 flex items-center justify-center">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                </div>
                <span className="text-sm font-medium">
                  Viewing as <strong>"{currentTenant?.name}"</strong>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExitImpersonation}
                className="h-8 gap-1.5 text-warning-foreground hover:bg-warning/20 hover:text-warning-foreground"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Exit</span>
              </Button>
            </div>
          )}

          {isImpersonatingReseller && (
            <div className="bg-primary/10 text-primary px-4 py-2.5 flex items-center justify-between border-b border-primary/20 animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Viewing as reseller: <strong>"{impersonatedResellerName}"</strong>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExitResellerImpersonation}
                className="h-8 gap-1.5 text-primary hover:bg-primary/20"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Exit</span>
              </Button>
            </div>
          )}
          
          <DashboardHeader />
          
          <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
          
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
