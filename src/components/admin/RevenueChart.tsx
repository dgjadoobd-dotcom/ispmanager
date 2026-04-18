import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

type Period = "7d" | "30d" | "6m" | "1y";

const periodLabels: Record<Period, string> = {
  "7d": "7 Days",
  "30d": "30 Days",
  "6m": "6 Months",
  "1y": "1 Year",
};

// Demo data
const generateData = (period: Period) => {
  const now = new Date();
  const data = [];

  let days: number;
  switch (period) {
    case "7d":
      days = 7;
      break;
    case "30d":
      days = 30;
      break;
    case "6m":
      days = 180;
      break;
    case "1y":
      days = 365;
      break;
  }

  const step = period === "7d" ? 1 : period === "30d" ? 1 : period === "6m" ? 30 : 30;

  for (let i = days; i >= 0; i -= step) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const baseSubscriptions = 15000 + Math.random() * 5000;
    const baseAddons = 3000 + Math.random() * 2000;

    data.push({
      date:
        period === "7d"
          ? date.toLocaleDateString("en", { weekday: "short" })
          : period === "30d"
          ? date.toLocaleDateString("en", { day: "numeric", month: "short" })
          : date.toLocaleDateString("en", { month: "short", year: "2-digit" }),
      subscriptions: Math.round(baseSubscriptions),
      addons: Math.round(baseAddons),
      total: Math.round(baseSubscriptions + baseAddons),
    });
  }

  return data;
};

interface RevenueChartProps {
  className?: string;
}

export function RevenueChart({ className }: RevenueChartProps) {
  const [period, setPeriod] = useState<Period>("30d");
  const data = generateData(period);

  const totalRevenue = data.reduce((sum, d) => sum + d.total, 0);
  const avgRevenue = Math.round(totalRevenue / data.length);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Revenue Trend</CardTitle>
              <p className="text-sm text-muted-foreground">
                Platform revenue over time
              </p>
            </div>
          </div>
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-3 text-xs",
                  period === p && "bg-background shadow-sm"
                )}
                onClick={() => setPeriod(p)}
              >
                {periodLabels[p]}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold">
              ৳{totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Subscriptions</p>
            <p className="text-lg font-bold text-primary">
              ৳{data.reduce((sum, d) => sum + d.subscriptions, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Add-ons</p>
            <p className="text-lg font-bold text-emerald-600">
              ৳{data.reduce((sum, d) => sum + d.addons, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorAddons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value: number, name: string) => [
                  `৳${value.toLocaleString()}`,
                  name === "subscriptions" ? "Subscriptions" : "Add-ons",
                ]}
              />
              <Area
                type="monotone"
                dataKey="subscriptions"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorSubs)"
                name="subscriptions"
              />
              <Area
                type="monotone"
                dataKey="addons"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorAddons)"
                name="addons"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
