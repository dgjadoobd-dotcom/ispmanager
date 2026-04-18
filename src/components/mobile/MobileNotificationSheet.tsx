import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bell,
  BellRing,
  CreditCard as PaymentIcon,
  Wifi,
  AlertTriangle
} from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface MobileNotificationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const notificationIcons: Record<string, React.ElementType> = {
  billing_reminder: AlertTriangle,
  payment_confirmation: PaymentIcon,
  connection_status: Wifi,
  general: BellRing,
};

const notificationColors: Record<string, string> = {
  billing_reminder: "text-warning bg-warning/10",
  payment_confirmation: "text-success bg-success/10",
  connection_status: "text-primary bg-primary/10",
  general: "text-muted-foreground bg-muted",
};

export function MobileNotificationSheet({ open, onOpenChange }: MobileNotificationSheetProps) {
  const { notifications, isLoadingNotifications } = usePushNotifications();
  
  const unreadCount = notifications?.filter(
    n => !n.sent_at || new Date(n.sent_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-5 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {isLoadingNotifications ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((notification, index) => {
                const Icon = notificationIcons[notification.notification_type] || BellRing;
                const colorClass = notificationColors[notification.notification_type] || notificationColors.general;
                
                return (
                  <div
                    key={notification.id}
                    className="flex gap-3 p-4 hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      colorClass
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.body}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium">No Notifications</p>
              <p className="text-sm text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
