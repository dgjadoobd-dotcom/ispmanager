import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  CreditCard, 
  Menu 
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Customers", href: "/dashboard/customers", icon: Users },
  { title: "Billing", href: "/dashboard/billing", icon: Receipt },
  { title: "Payments", href: "/dashboard/payments", icon: CreditCard },
];

export function MobileBottomNav() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 rounded-lg transition-all duration-200 touch-manipulation",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative p-1.5 rounded-lg transition-all duration-200",
                active && "bg-primary/10"
              )}>
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  active && "scale-110"
                )} />
                {active && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200",
                active && "font-semibold"
              )}>
                {item.title}
              </span>
            </NavLink>
          );
        })}
        
        {/* More menu */}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors touch-manipulation">
              <div className="p-1.5">
                <Menu className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl">
            <SheetHeader className="pb-4">
              <SheetTitle>More Options</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-4 gap-4 pb-6">
              <MoreNavItem 
                href="/dashboard/packages" 
                icon="📦" 
                label="Packages" 
                onClick={() => setMoreOpen(false)}
              />
              <MoreNavItem 
                href="/dashboard/reports" 
                icon="📊" 
                label="Reports" 
                onClick={() => setMoreOpen(false)}
              />
              <MoreNavItem 
                href="/dashboard/notifications" 
                icon="🔔" 
                label="Alerts" 
                onClick={() => setMoreOpen(false)}
              />
              <MoreNavItem 
                href="/dashboard/settings" 
                icon="⚙️" 
                label="Settings" 
                onClick={() => setMoreOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

interface MoreNavItemProps {
  href: string;
  icon: string;
  label: string;
  onClick: () => void;
}

function MoreNavItem({ href, icon, label, onClick }: MoreNavItemProps) {
  return (
    <NavLink 
      to={href} 
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors touch-manipulation"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </NavLink>
  );
}
