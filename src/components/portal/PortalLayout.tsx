import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  User, 
  LogOut,
  Menu,
  X,
  Building2
} from "lucide-react";
import ispManagerIcon from "@/assets/isp-manager-icon.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { usePortalCustomer } from "@/hooks/usePortalData";
import { useCustomerBranding } from "@/hooks/useBranding";

const navItems = [
  { title: "Overview", href: "/portal", icon: LayoutDashboard },
  { title: "My Bills", href: "/portal/bills", icon: Receipt },
  { title: "Payments", href: "/portal/payments", icon: CreditCard },
  { title: "Profile", href: "/portal/profile", icon: User },
];

export function PortalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: customer } = usePortalCustomer();
  const { branding } = useCustomerBranding(customer?.id);

  const handleSignOut = async () => {
    await signOut();
    navigate("/portal/login");
  };

  const isActive = (href: string) => {
    if (href === "/portal") {
      return location.pathname === "/portal";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.brandName}
                  className="h-9 w-9 rounded-lg object-contain"
                />
              ) : (
                <img src={ispManagerIcon} alt="ISP Manager" className="h-9 w-9 rounded-lg object-contain" />
              )}
              <span className="font-semibold">{branding.brandName}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSignOut}
                className="hidden md:flex"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t bg-card p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
