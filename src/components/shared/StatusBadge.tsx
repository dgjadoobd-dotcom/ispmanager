import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors",
  {
    variants: {
      variant: {
        active: "bg-success/10 text-success border-success/20",
        suspended: "bg-destructive/10 text-destructive border-destructive/20",
        pending: "bg-warning/10 text-warning border-warning/20",
        paid: "bg-success/10 text-success border-success/20",
        due: "bg-destructive/10 text-destructive border-destructive/20",
        partial: "bg-warning/10 text-warning border-warning/20",
        overdue: "bg-destructive/10 text-destructive border-destructive/20",
        info: "bg-info/10 text-info border-info/20",
        default: "bg-muted text-muted-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ children, variant, dot = true, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "active" || variant === "paid" ? "bg-success" :
            variant === "suspended" || variant === "due" || variant === "overdue" ? "bg-destructive" :
            variant === "pending" || variant === "partial" ? "bg-warning" :
            variant === "info" ? "bg-info" :
            "bg-muted-foreground"
          )}
        />
      )}
      {children}
    </span>
  );
}
