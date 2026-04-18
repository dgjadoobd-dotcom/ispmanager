import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

interface CustomerGrowthReportProps {
  customers: any[];
}

export function CustomerGrowthReport({ customers }: CustomerGrowthReportProps) {
  const chartData = useMemo(() => {
    const months: { label: string; newCustomers: number; cumulative: number }[] = [];
    let cumulative = 0;

    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
    cumulative = (customers || []).filter((c) => {
      const d = parseISO(c.join_date);
      return d < sixMonthsAgo;
    }).length;

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const label = format(date, "MMM yy");

      const newCustomers = (customers || []).filter((c) => {
        const d = parseISO(c.join_date);
        return isWithinInterval(d, { start, end });
      }).length;

      cumulative += newCustomers;
      months.push({ label, newCustomers, cumulative });
    }
    return months;
  }, [customers]);

  const totalCustomers = customers?.length || 0;
  const activeCustomers = (customers || []).filter((c) => c.connection_status === "active").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-base">Customer Growth</CardTitle>
              <CardDescription>Last 6 months customer growth</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{totalCustomers}</p>
            <p className="text-xs text-muted-foreground">Active: {activeCustomers}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  value,
                  name === "cumulative" ? "Total" : "New",
                ]}
              />
              <Line type="monotone" dataKey="cumulative" name="cumulative" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              <Line type="monotone" dataKey="newCustomers" name="newCustomers" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: "#8b5cf6" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
