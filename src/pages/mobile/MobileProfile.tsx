import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Phone,
  Mail,
  MapPin,
  Wifi,
  Calendar,
  LogOut,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Share2,
  Bell,
  BellOff,
} from "lucide-react";
import { usePortalCustomer } from "@/hooks/usePortalData";
import { useCustomerBranding } from "@/hooks/useBranding";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: { label: "Active", variant: "active" as const, icon: CheckCircle },
  suspended: { label: "Suspended", variant: "suspended" as const, icon: AlertCircle },
  pending: { label: "Pending", variant: "pending" as const, icon: Clock },
};

export default function MobileProfile() {
  const { data: customer, isLoading } = usePortalCustomer();
  const { branding } = useCustomerBranding(customer?.id);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const {
    isSupported: notificationsSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    isSubscribing,
    isUnsubscribing,
  } = usePushNotifications();

  const handleLogout = async () => {
    await signOut();
    navigate("/app/login");
  };

  const handleNotificationToggle = () => {
    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col items-center pt-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-6 w-32 mt-4" />
          <Skeleton className="h-4 w-20 mt-2" />
        </div>
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!customer) return null;

  const connectionStatus = customer.connection_status || "pending";

  return (
    <div className="space-y-5">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center pt-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-lg">
          {customer.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-xl font-bold mt-3">{customer.name}</h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          ID: {customer.id.slice(0, 8).toUpperCase()}
        </p>
        <StatusBadge variant={statusConfig[connectionStatus].variant} className="mt-2">
          {statusConfig[connectionStatus].label}
        </StatusBadge>
      </div>

      {/* Contact Info */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-0 divide-y divide-border">
          <ProfileRow icon={Phone} label="Phone" value={customer.phone} />
          {customer.email && (
            <ProfileRow icon={Mail} label="Email" value={customer.email} />
          )}
          {customer.address && (
            <ProfileRow icon={MapPin} label="Address" value={customer.address} />
          )}
        </CardContent>
      </Card>

      {/* Package Info */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-0 divide-y divide-border">
          <div className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <Wifi className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Package</p>
              <p className="font-medium text-sm">{customer.packages?.name || "None"}</p>
              {customer.packages?.speed_label && (
                <p className="text-xs text-muted-foreground">{customer.packages.speed_label}</p>
              )}
            </div>
            {customer.packages && (
              <p className="text-sm font-bold text-primary tabular-nums shrink-0">
                ৳{customer.packages.monthly_price?.toLocaleString()}/mo
              </p>
            )}
          </div>
          <div className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="font-medium text-sm">
                {new Date(customer.join_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Cards */}
      {(Number(customer.due_balance) > 0 || Number(customer.advance_balance) > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {Number(customer.due_balance) > 0 && (
            <Card className="rounded-2xl border-destructive/20">
              <CardContent className="p-4 text-center">
                <AlertCircle className="w-5 h-5 text-destructive mx-auto mb-1.5" />
                <p className="text-xs text-muted-foreground">Due</p>
                <p className="text-lg font-bold text-destructive tabular-nums">
                  ৳{Number(customer.due_balance).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
          {Number(customer.advance_balance) > 0 && (
            <Card className="rounded-2xl border-success/20">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-5 h-5 text-success mx-auto mb-1.5" />
                <p className="text-xs text-muted-foreground">Advance</p>
                <p className="text-lg font-bold text-success tabular-nums">
                  ৳{Number(customer.advance_balance).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Notification Settings */}
      {notificationsSupported && (
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isSubscribed ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  {isSubscribed ? (
                    <Bell className="w-5 h-5 text-primary" />
                  ) : (
                    <BellOff className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    {isSubscribed ? "Alerts enabled" : "Get bill & payment alerts"}
                  </p>
                </div>
              </div>
              <Switch
                checked={isSubscribed}
                onCheckedChange={handleNotificationToggle}
                disabled={isSubscribing || isUnsubscribing || permission === "denied"}
              />
            </div>
            {permission === "denied" && (
              <p className="text-[11px] text-destructive mt-2 pl-[54px]">
                Blocked. Enable in browser settings.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-2 pb-2">
        <ActionRow icon={Download} label="Download Statement" />
        <ActionRow icon={Share2} label="Share App" />
        <Button
          variant="outline"
          className="w-full h-13 text-destructive hover:text-destructive hover:bg-destructive/5 gap-2 mt-3 rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

function ActionRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 p-3.5 bg-card rounded-xl border active:scale-[0.98] touch-manipulation transition-all duration-150"
    >
      <Icon className="w-5 h-5 text-muted-foreground" />
      <span className="flex-1 text-left font-medium text-sm">{label}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}
