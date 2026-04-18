import { useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet } from "lucide-react";

interface CollectionReportProps {
  payments: any[];
}

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  online: "Online",
  bank_transfer: "Bank Transfer",
};

const METHOD_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b"];

export function CollectionReport({ payments }: CollectionReportProps) {
  const data = useMemo(() => {
    const methodMap: Record<string, number> = {};
    (payments || []).forEach((p) => {
      const method = p.method || "cash";
      methodMap[method] = (methodMap[method] || 0) + Number(p.amount);
    });
    return Object.entries(methodMap).map(([method, amount]) => ({
      method,
      label: METHOD_LABELS[method] || method,
      amount,
    }));
  }, [payments]);

  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-base">Collection Method</CardTitle>
            <CardDescription>Collection by payment method</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`৳${value.toLocaleString()}`, "Collected"]}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={index} fill={METHOD_COLORS[index % METHOD_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {data.map((d, i) => (
            <div key={d.method} className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">{d.label}</p>
              <p className="text-sm font-bold mt-1">৳{d.amount.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">
                {total > 0 ? Math.round((d.amount / total) * 100) : 0}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
