import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

interface RevenueReportProps {
  payments: any[];
  bills: any[];
}

export function RevenueReport({ payments, bills }: RevenueReportProps) {
  const chartData = useMemo(() => {
    const months: { month: string; label: string; collected: number; billed: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const monthKey = format(date, "yyyy-MM");
      const label = format(date, "MMM yy");

      const collected = (payments || [])
        .filter((p) => {
          const d = parseISO(p.created_at);
          return isWithinInterval(d, { start, end });
        })
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

      const billed = (bills || [])
        .filter((b) => {
          const d = parseISO(b.created_at);
          return isWithinInterval(d, { start, end });
        })
        .reduce((sum: number, b: any) => sum + Number(b.amount), 0);

      months.push({ month: monthKey, label, collected, billed });
    }
    return months;
  }, [payments, bills]);

  const totalCollected = chartData.reduce((s, d) => s + d.collected, 0);
  const totalBilled = chartData.reduce((s, d) => s + d.billed, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base">Revenue Report</CardTitle>
              <CardDescription>Last 6 months billing & collection</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">৳{totalCollected.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Collection Rate: {collectionRate}%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  `৳${value.toLocaleString()}`,
                  name === "billed" ? "Billed" : "Collected",
                ]}
              />
              <Area type="monotone" dataKey="billed" name="billed" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBilled)" strokeWidth={2} />
              <Area type="monotone" dataKey="collected" name="collected" stroke="#10b981" fillOpacity={1} fill="url(#colorCollected)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Billed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Collected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
