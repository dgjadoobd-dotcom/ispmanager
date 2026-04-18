import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTenantContext } from "@/contexts/TenantContext";
import { usePayments } from "@/hooks/usePayments";
import { useBills } from "@/hooks/useBills";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

type Period = "3m" | "6m" | "1y";

function buildMonthlyData(payments: any[], bills: any[], months: number) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = subMonths(now, months - 1 - i);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const revenue = payments
      .filter(p => { const t = new Date(p.created_at); return t >= start && t <= end; })
      .reduce((s, p) => s + Number(p.amount), 0);
    const billed = bills
      .filter(b => { const t = new Date(b.created_at); return t >= start && t <= end; })
      .reduce((s, b) => s + Number(b.amount), 0);
    return { month: format(d, "MMM"), revenue, billed };
  });
}

export function RevenueChart() {
  const [period, setPeriod] = useState<Period>("6m");
  const { currentTenant } = useTenantContext();
  const { data: payments = [], isLoading: pLoading } = usePayments(currentTenant?.id);
  const { data: bills = [], isLoading: bLoading } = useBills(currentTenant?.id);

  const months = period === "3m" ? 3 : period === "6m" ? 6 : 12;
  const data = useMemo(() => buildMonthlyData(payments, bills, months), [payments, bills, months]);

  const latestBilled = data[data.length - 1]?.billed ?? 0;
  const latestRevenue = data[data.length - 1]?.revenue ?? 0;
  const collectionRate = latestBilled > 0 ? ((latestRevenue / latestBilled) * 100).toFixed(1) : "0.0";

  if (pLoading || bLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-[220px] w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-5 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">Revenue Overview</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Monthly billed vs collected</p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
            {(["3m", "6m", "1y"] as Period[]).map((p) => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-3 text-xs font-medium transition-all",
                  period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div>
            <p className="text-xs text-muted-foreground">Billed</p>
            <p className="text-lg font-semibold mt-0.5">৳{(latestBilled / 1000).toFixed(0)}k</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Collected</p>
            <p className="text-lg font-semibold text-success mt-0.5">৳{(latestRevenue / 1000).toFixed(0)}k</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Collection Rate</p>
            <p className="text-lg font-semibold mt-0.5">{collectionRate}%</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-5 mb-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground">Billed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            <span className="text-xs font-medium text-muted-foreground">Collected</span>
          </div>
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} dy={8} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} dx={-5} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="billed" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorBilled)" name="Billed" />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--success))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Collected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-muted-foreground">{entry.name}</span>
          </div>
          <span className="text-sm font-semibold">৳{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
