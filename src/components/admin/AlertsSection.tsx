import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ChevronRight,
  XCircle,
  Wallet,
  Network,
  Key
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  count?: number;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface AlertsSectionProps {
  alerts: Alert[];
  isLoading?: boolean;
}

const alertStyles = {
  critical: {
    border: "border-l-destructive",
    bg: "bg-destructive/5",
    icon: XCircle,
    iconColor: "text-destructive",
    badgeClass: "bg-destructive text-destructive-foreground",
    iconBg: "bg-destructive/10",
  },
  warning: {
    border: "border-l-warning",
    bg: "bg-warning/5",
    icon: AlertTriangle,
    iconColor: "text-warning",
    badgeClass: "bg-warning text-warning-foreground",
    iconBg: "bg-warning/10",
  },
  info: {
    border: "border-l-primary",
    bg: "bg-primary/5",
    icon: Info,
    iconColor: "text-primary",
    badgeClass: "bg-primary text-primary-foreground",
    iconBg: "bg-primary/10",
  },
};

export function AlertsSection({ alerts, isLoading }: AlertsSectionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-5 w-5" />
            Attention Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalCount = alerts.filter((a) => a.type === "critical").length;
  const warningCount = alerts.filter((a) => a.type === "warning").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-5 w-5" />
            Attention Required
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} Critical
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-warning/20 text-warning border-warning/30">
                {warningCount} Warning
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <Info className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-sm">All Systems Normal</p>
              <p className="text-xs text-muted-foreground">
                No issues requiring attention
              </p>
            </div>
          </div>
        ) : (
          alerts.map((alert) => {
            const styles = alertStyles[alert.type];
            const IconComponent = alert.icon || styles.icon;

            const content = (
              <div
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-l-4 transition-colors",
                  styles.border,
                  styles.bg,
                  alert.href && "cursor-pointer hover:opacity-80"
                )}
              >
                <div
                  className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                    styles.iconBg
                  )}
                >
                  <IconComponent className={cn("h-5 w-5", styles.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{alert.title}</p>
                    {alert.count && alert.count > 0 && (
                      <Badge className={cn("text-[10px] px-1.5", styles.badgeClass)}>
                        {alert.count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {alert.description}
                  </p>
                </div>
                {alert.href && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
            );

            if (alert.href) {
              return (
                <Link key={alert.id} to={alert.href}>
                  {content}
                </Link>
              );
            }

            return <div key={alert.id}>{content}</div>;
          })
        )}
      </CardContent>
    </Card>
  );
}

// Default alerts for demo
export const defaultAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "Failed Payments",
    description: "3 platform payments failed in the last 24h",
    count: 3,
    href: "/admin/payments",
    icon: Wallet,
  },
  {
    id: "2",
    type: "warning",
    title: "Network Sync Failures",
    description: "2 ISPs with high sync failure rates",
    count: 2,
    href: "/admin/network",
    icon: Network,
  },
  {
    id: "3",
    type: "warning",
    title: "Suspicious API Usage",
    description: "Unusual request patterns detected",
    count: 1,
    href: "/admin/api",
    icon: Key,
  },
];
