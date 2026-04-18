import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  href?: string;
  isLoading?: boolean;
  className?: string;
}

const variantStyles = {
  default: {
    icon: "bg-primary/10 text-primary",
    card: "hover:border-primary/30",
  },
  success: {
    icon: "bg-success/10 text-success",
    card: "hover:border-success/30",
  },
  warning: {
    icon: "bg-warning/10 text-warning",
    card: "hover:border-warning/30",
  },
  danger: {
    icon: "bg-destructive/10 text-destructive",
    card: "hover:border-destructive/30",
  },
  info: {
    icon: "bg-info/10 text-info",
    card: "hover:border-info/30",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  href,
  isLoading,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  const content = (
    <Card
      className={cn(
        "transition-all duration-200 group",
        href && "cursor-pointer hover:shadow-md",
        styles.card,
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <p className="text-2xl font-bold tracking-tight truncate">
                  {value}
                </p>
                {(subtitle || trend) && (
                  <div className="flex items-center gap-2 mt-1">
                    {trend && (
                      <span
                        className={cn(
                          "inline-flex items-center text-xs font-medium",
                        trend.isPositive
                            ? "text-success"
                            : "text-destructive"
                        )}
                      >
                        {trend.isPositive ? (
                          <TrendingUp className="h-3 w-3 mr-0.5" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-0.5" />
                        )}
                        {trend.value}%
                      </span>
                    )}
                    {subtitle && (
                      <span className="text-xs text-muted-foreground truncate">
                        {subtitle}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
              styles.icon
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}
