import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const variantStyles = {
  default: {
    icon: "bg-primary/10 text-primary",
    gradient: "from-primary/5 via-transparent to-transparent",
  },
  success: {
    icon: "bg-success/10 text-success",
    gradient: "from-success/5 via-transparent to-transparent",
  },
  warning: {
    icon: "bg-warning/10 text-warning",
    gradient: "from-warning/5 via-transparent to-transparent",
  },
  danger: {
    icon: "bg-destructive/10 text-destructive",
    gradient: "from-destructive/5 via-transparent to-transparent",
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: MetricCardProps) {
  const styles = variantStyles[variant];
  
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300",
        "hover:shadow-soft hover:border-border/80",
        className
      )}
    >
      {/* Subtle gradient background */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          styles.gradient
        )} 
      />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {trend && (
              <div 
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  trend.isPositive 
                    ? "bg-success/10 text-success" 
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        <div className={cn(
          "rounded-xl p-3 transition-transform duration-300 group-hover:scale-110",
          styles.icon
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
