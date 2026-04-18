import { forwardRef } from "react";
import { Bell, Search, LogOut, User, Settings, HelpCircle, ChevronDown, Menu, Mail, Monitor, Info, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TenantSwitcher } from "./TenantSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/components/ui/animated-sidebar";
import { useTenantContext } from "@/contexts/TenantContext";
import { useTheme } from "@/contexts/ThemeContext";

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { setOpen } = useSidebar();
  const { currentTenant, isSuperAdmin } = useTenantContext();
  const { theme, toggleTheme } = useTheme();

  const notificationCount = 3;
  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const profileLoading = false;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center gap-3 bg-primary text-primary-foreground px-3 md:px-4">
      {/* Mobile menu trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 md:hidden text-primary-foreground hover:bg-primary-foreground/10"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Left: Company Name / Tenant Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {isSuperAdmin ? (
          <TenantSwitcher />
        ) : (
          <span className="text-sm font-semibold truncate max-w-[160px]">
            {currentTenant?.name || "ISP Manager"}
          </span>
        )}
      </div>

      {/* Search Customer dropdown */}
      <div className="hidden md:flex">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 border border-primary-foreground/20 rounded-md px-3"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Search Customer</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel className="text-xs">Quick Search</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard/customers")}>
              <Search className="mr-2 h-4 w-4" />
              Browse All Customers
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-1.5">
        {/* Quick action buttons - desktop only */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden lg:inline-flex h-8 gap-1.5 text-xs text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => navigate("/dashboard/notifications")}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Support Ticket</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="hidden lg:inline-flex h-8 gap-1.5 text-xs text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => navigate("/dashboard/network")}
        >
          <Monitor className="h-3.5 w-3.5" />
          <span>Online Monitor</span>
        </Button>

        {/* Divider - desktop only */}
        <div className="hidden lg:block h-5 w-px bg-primary-foreground/20 mx-1" />

        {/* Mobile search */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Info icon with badge */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
        >
          <Info className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
            6
          </span>
        </Button>

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground animate-scale-in">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80" sideOffset={8}>
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs text-primary hover:text-primary">
                Mark all read
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <NotificationItem title="Payment Received" description="Customer #1234 paid ৳2,500 via Cash" time="2 min ago" unread />
              <NotificationItem title="New Customer" description="Rahim Ahmed joined with 20 Mbps plan" time="1 hour ago" unread />
              <NotificationItem title="Auto-Suspend Alert" description="5 customers due for suspension tomorrow" time="3 hours ago" />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary cursor-pointer" onClick={() => navigate("/dashboard/notifications")}>
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-primary-foreground/10">
              <div className="h-7 w-7 rounded-full bg-primary-foreground/20 flex items-center justify-center ring-1 ring-primary-foreground/30">
                {profileLoading ? (
                  <Skeleton className="h-full w-full rounded-full" />
                ) : (
                  <span className="text-[10px] font-semibold text-primary-foreground">{initials}</span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profileLoading ? "Loading..." : displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

interface NotificationItemProps {
  title: string;
  description: string;
  time: string;
  unread?: boolean;
}

const NotificationItem = forwardRef<HTMLDivElement, NotificationItemProps>(
  ({ title, description, time, unread, ...props }, ref) => {
    return (
      <DropdownMenuItem ref={ref} className={cn("flex flex-col items-start gap-1 py-3 px-4 cursor-pointer", unread && "bg-primary/5")} {...props}>
        <div className="flex items-center gap-2 w-full">
          {unread && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
          <span className="font-medium text-sm">{title}</span>
          <span className="text-[10px] text-muted-foreground ml-auto">{time}</span>
        </div>
        <span className="text-xs text-muted-foreground line-clamp-2 pl-4">{description}</span>
      </DropdownMenuItem>
    );
  }
);
NotificationItem.displayName = "NotificationItem";
