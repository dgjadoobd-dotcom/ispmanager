import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

// Demo data - last 6 months ISP growth
const data = [
  { month: "Sep", new: 12, churned: 2 },
  { month: "Oct", new: 18, churned: 3 },
  { month: "Nov", new: 15, churned: 1 },
  { month: "Dec", new: 22, churned: 4 },
  { month: "Jan", new: 28, churned: 2 },
  { month: "Feb", new: 25, churned: 3 },
];

interface ISPGrowthChartProps {
  className?: string;
}

export function ISPGrowthChart({ className }: ISPGrowthChartProps) {
  const totalNew = data.reduce((sum, d) => sum + d.new, 0);
  const totalChurned = data.reduce((sum, d) => sum + d.churned, 0);
  const netGrowth = totalNew - totalChurned;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-base">ISP Growth</CardTitle>
            <p className="text-sm text-muted-foreground">
              New vs churned ISPs
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">New ISPs</p>
            <p className="text-lg font-bold text-emerald-600">+{totalNew}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Churned</p>
            <p className="text-lg font-bold text-destructive">-{totalChurned}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Net Growth</p>
            <p className="text-lg font-bold text-primary">+{netGrowth}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
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
              />
              <Bar
                dataKey="new"
                name="New ISPs"
                radius={[4, 4, 0, 0]}
                fill="#10b981"
              />
              <Bar
                dataKey="churned"
                name="Churned"
                radius={[4, 4, 0, 0]}
                fill="hsl(var(--destructive))"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
