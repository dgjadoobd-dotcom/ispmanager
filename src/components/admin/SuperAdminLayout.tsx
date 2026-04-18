import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  DollarSign,
  ChevronDown,
  Activity,
  ScrollText,
  Package,
  Wallet,
  CreditCard as PaymentIcon,
  Bell,
  Network,
  Users,
  Key,
  FileText,
  Settings2,
  Tag,
  AlertTriangle,
  TrendingUp,
  HeartPulse
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { TenantSwitcher } from "@/components/layout/TenantSwitcher";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Navigation structure with grouped sections
const navGroups = [
  {
    title: "Platform Overview",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { title: "System Health", href: "/admin/health", icon: HeartPulse },
      { title: "Activity Logs", href: "/admin/activity", icon: ScrollText },
    ],
  },
  {
    title: "ISP Management",
    items: [
      { title: "All ISPs", href: "/admin/tenants", icon: Building2 },
      { title: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
      { title: "Add-ons", href: "/admin/addons", icon: Package },
    ],
  },
  {
    title: "Financials",
    items: [
      { title: "Platform Revenue", href: "/admin/revenue", icon: TrendingUp },
      { title: "ISP Wallets", href: "/admin/wallets", icon: Wallet },
      { title: "Payout Requests", href: "/admin/payouts", icon: DollarSign },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { title: "Payments", href: "/admin/payments", icon: PaymentIcon },
      { title: "Notifications", href: "/admin/notifications", icon: Bell },
      { title: "Network Integrations", href: "/admin/network", icon: Network },
    ],
  },
  {
    title: "Governance",
    items: [
      { title: "Users & Roles", href: "/admin/users", icon: Users },
      { title: "API Usage", href: "/admin/api", icon: Key },
      { title: "Audit Logs", href: "/admin/audit", icon: FileText },
    ],
  },
  {
    title: "Settings",
    items: [
      { title: "Platform Settings", href: "/admin/settings", icon: Settings2 },
      { title: "Pricing Config", href: "/admin/pricing", icon: Tag },
    ],
  },
];

export function SuperAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "Platform Overview",
    "ISP Management",
  ]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) =>
      prev.includes(title)
        ? prev.filter((g) => g !== title)
        : [...prev, title]
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive shadow-md">
            <Shield className="h-5 w-5 text-destructive-foreground" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">Super Admin</span>
            <p className="text-[11px] text-muted-foreground">Platform Control</p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-4">
          {navGroups.map((group) => (
            <Collapsible
              key={group.title}
              open={expandedGroups.includes(group.title)}
              onOpenChange={() => toggleGroup(group.title)}
            >
              <CollapsibleTrigger asChild>
                <button className="flex w-full items-center justify-between px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  {group.title}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      expandedGroups.includes(group.title) && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5 mt-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        "hover:bg-muted/60",
                        active
                          ? "bg-destructive/10 text-destructive"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active && "text-destructive"
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-destructive" />
                      )}
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border/50 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-destructive/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-destructive">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.email?.split("@")[0] || "Admin"}
            </p>
            <p className="text-[11px] text-muted-foreground">Super Admin</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border/50 bg-card lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-border/50 bg-card transition-transform duration-300 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-14 items-center justify-between px-4 gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {/* Super Admin Badge */}
              <Badge
                variant="destructive"
                className="gap-1.5 px-2.5 py-1 font-semibold hidden sm:flex"
              >
                <Shield className="h-3.5 w-3.5" />
                SUPER ADMIN
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              {/* System Alerts Indicator */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  2
                </span>
              </Button>

              <Separator orientation="vertical" className="h-6" />
              
              <TenantSwitcher />

              <span className="hidden md:block text-sm text-muted-foreground">
                {user?.email}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
