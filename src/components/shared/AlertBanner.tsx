import { LucideIcon, AlertTriangle, CheckCircle2, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const alertBannerVariants = cva(
  "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        info: "bg-info/10 border-info/20 text-foreground",
        success: "bg-success/10 border-success/20 text-foreground",
        warning: "bg-warning/10 border-warning/20 text-foreground",
        error: "bg-destructive/10 border-destructive/20 text-foreground",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const iconMap: Record<string, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const iconColorMap: Record<string, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
};

interface AlertBannerProps extends VariantProps<typeof alertBannerVariants> {
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function AlertBanner({
  title,
  children,
  variant = "info",
  onDismiss,
  className,
}: AlertBannerProps) {
  const Icon = iconMap[variant ?? "info"];

  return (
    <div className={cn(alertBannerVariants({ variant }), className)} role="alert">
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconColorMap[variant ?? "info"])} />
      <div className="flex-1 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-muted-foreground">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 hover:bg-accent transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
