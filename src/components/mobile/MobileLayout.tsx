import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Receipt, CreditCard, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePortalCustomer } from "@/hooks/usePortalData";
import { useCustomerBranding } from "@/hooks/useBranding";
import { Skeleton } from "@/components/ui/skeleton";

interface MobileLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/app", icon: Home, label: "Home" },
  { path: "/app/bills", icon: Receipt, label: "Bills" },
  { path: "/app/payments", icon: CreditCard, label: "Payments" },
  { path: "/app/profile", icon: User, label: "Profile" },
];

export default function MobileLayout({ children }: MobileLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { data: customer } = usePortalCustomer();
  const { branding } = useCustomerBranding(customer?.id);
  const [prevPath, setPrevPath] = useState(location.pathname);
  const [slideDir, setSlideDir] = useState<"left" | "right" | "none">("none");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/app/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Track navigation direction for page transitions
  useEffect(() => {
    const prevIdx = navItems.findIndex(n => n.path === prevPath);
    const currIdx = navItems.findIndex(n => n.path === location.pathname);
    if (prevIdx >= 0 && currIdx >= 0 && prevIdx !== currIdx) {
      setSlideDir(currIdx > prevIdx ? "left" : "right");
    } else {
      setSlideDir("none");
    }
    setPrevPath(location.pathname);
  }, [location.pathname]);

  // Apply branding colors as CSS custom properties
  useEffect(() => {
    if (branding.source !== "platform" && branding.primaryColor) {
      document.documentElement.style.setProperty("--pwa-primary", branding.primaryColor);
    }
    return () => {
      document.documentElement.style.removeProperty("--pwa-primary");
    };
  }, [branding]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background safe-area-inset">
        <div className="flex-1 p-4 space-y-6 pt-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-28" />
            </div>
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
          <Skeleton className="h-44 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
        <div className="h-16 border-t" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 scroll-smooth-ios">
        <div
          key={location.pathname}
          className={cn(
            "p-4 safe-area-inset",
            slideDir === "left" && "animate-slide-in-left",
            slideDir === "right" && "animate-slide-in-right",
            slideDir === "none" && "animate-fade-in"
          )}
        >
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom z-50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/app" && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-all duration-200",
                  "active:scale-[0.92] touch-manipulation select-none-mobile",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={cn(
                    "relative flex items-center justify-center w-12 h-8 rounded-2xl transition-all duration-200",
                    isActive && "bg-primary/12"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-[22px] h-[22px] transition-all duration-200",
                      isActive && "scale-105"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span
                  className={cn(
                    "text-[11px] leading-tight mt-0.5 transition-all duration-200",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
