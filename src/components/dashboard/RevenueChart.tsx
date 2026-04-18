import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const data = [
  { month: "Jul", revenue: 185000, collection: 172000 },
  { month: "Aug", revenue: 192000, collection: 185000 },
  { month: "Sep", revenue: 198000, collection: 190000 },
  { month: "Oct", revenue: 205000, collection: 195000 },
  { month: "Nov", revenue: 215000, collection: 208000 },
  { month: "Dec", revenue: 225000, collection: 218000 },
  { month: "Jan", revenue: 235000, collection: 228000 },
];

type Period = "7d" | "30d" | "6m" | "1y";

export function RevenueChart() {
  const [period, setPeriod] = useState<Period>("6m");

  // Calculate summary stats
  const latestRevenue = data[data.length - 1].revenue;
  const latestCollection = data[data.length - 1].collection;
  const collectionRate = ((latestCollection / latestRevenue) * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">Revenue Overview</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Monthly revenue vs collection trends
            </p>
          </div>
          
          {/* Period selector */}
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
            {(["7d", "30d", "6m", "1y"] as Period[]).map((p) => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-3 text-xs font-medium transition-all",
                  period === p 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div>
            <p className="text-xs text-muted-foreground">Expected</p>
            <p className="text-lg font-semibold mt-0.5">
              ৳{(latestRevenue / 1000).toFixed(0)}k
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Collected</p>
            <p className="text-lg font-semibold text-success mt-0.5">
              ৳{(latestCollection / 1000).toFixed(0)}k
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Collection Rate</p>
            <p className="text-lg font-semibold mt-0.5">{collectionRate}%</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5">
        {/* Legend */}
        <div className="flex items-center gap-5 mb-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground">Expected Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            <span className="text-xs font-medium text-muted-foreground">Actual Collection</span>
          </div>
        </div>

        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCollection" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                vertical={false} 
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                dy={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                dx={-5}
              />
              <Tooltip
                content={<CustomTooltip />}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Expected"
              />
              <Area
                type="monotone"
                dataKey="collection"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCollection)"
                name="Collected"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.name}</span>
          </div>
          <span className="text-sm font-semibold">
            ৳{entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
