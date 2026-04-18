import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type StatVariant = "primary" | "success" | "info" | "warning" | "danger" | "purple";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: StatVariant;
  index?: number;
}

const variantStyles: Record<StatVariant, { base: string; gradient: string; iconBg: string }> = {
  primary: { 
    base: "bg-primary", 
    gradient: "from-blue-600/20 to-blue-500/10",
    iconBg: "bg-blue-500/20"
  },
  success: { 
    base: "bg-success", 
    gradient: "from-emerald-600/20 to-emerald-500/10",
    iconBg: "bg-emerald-500/20"
  },
  info: { 
    base: "bg-info", 
    gradient: "from-sky-600/20 to-sky-500/10",
    iconBg: "bg-sky-500/20"
  },
  warning: { 
    base: "bg-warning", 
    gradient: "from-amber-600/20 to-amber-500/10",
    iconBg: "bg-amber-500/20"
  },
  danger: { 
    base: "bg-destructive", 
    gradient: "from-rose-600/20 to-rose-500/10",
    iconBg: "bg-rose-500/20"
  },
  purple: { 
    base: "bg-[hsl(262,60%,55%)]", 
    gradient: "from-purple-600/20 to-purple-500/10",
    iconBg: "bg-purple-500/20"
  },
};

export function DashboardStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "primary",
  index = 0,
}: DashboardStatCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.23, 1, 0.32, 1] 
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-5 transition-all duration-300",
        "border border-white/10 shadow-lg hover:shadow-xl",
        styles.base,
        "text-white"
      )}
    >
      {/* Dynamic Background Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-70",
        styles.gradient
      )} />

      {/* Decorative glass circles */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-black/10 blur-3xl" />

      <div className="relative flex items-center gap-4">
        <div className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl backdrop-blur-md transition-transform duration-300 group-hover:rotate-6",
          styles.iconBg,
          "border border-white/20"
        )}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-white/70">
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black tracking-tight leading-none">
              {value}
            </h3>
            {subtitle && (
              <span className="truncate text-[10px] font-medium text-white/50 uppercase">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-white/30 transition-all duration-500 group-hover:w-full" />
    </motion.div>
  );
}
