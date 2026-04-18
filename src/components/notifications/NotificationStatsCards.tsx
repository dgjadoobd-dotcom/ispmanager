import { Bell, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsProps {
  stats: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    recentCount: number;
    successRate: number;
  } | null | undefined;
  isLoading: boolean;
}

export function NotificationStatsCards({ stats, isLoading }: StatsProps) {
  const cards = [
    {
      label: "Total Notifications",
      value: stats?.total ?? 0,
      icon: Bell,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Successfully Sent",
      value: stats?.sent ?? 0,
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Failed",
      value: stats?.failed ?? 0,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Success Rate",
      value: `${stats?.successRate ?? 0}%`,
      icon: TrendingUp,
      color: "text-accent-foreground",
      bg: "bg-accent/50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              {isLoading ? (
                <div className="h-6 w-12 bg-muted rounded animate-pulse" />
              ) : (
                <p className="text-xl font-bold text-foreground">{card.value}</p>
              )}
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
