import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package } from "lucide-react";

interface PackageDistributionProps {
  customers: any[];
  packages: any[];
}

const COLORS = [
  "hsl(var(--primary))",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];

export function PackageDistribution({ customers, packages }: PackageDistributionProps) {
  const data = useMemo(() => {
    const pkgMap: Record<string, number> = {};
    (customers || []).forEach((c) => {
      const pkgId = c.package_id || "unassigned";
      pkgMap[pkgId] = (pkgMap[pkgId] || 0) + 1;
    });

    return Object.entries(pkgMap)
      .map(([pkgId, count]) => {
        const pkg = (packages || []).find((p) => p.id === pkgId);
        return {
          name: pkg ? pkg.name : "Unassigned",
          value: count,
          speed: pkg?.speed_label || "",
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [customers, packages]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-base">Package Distribution</CardTitle>
            <CardDescription>Customer distribution by package</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-[200px] w-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => [`${value} customers`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            {data.slice(0, 6).map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-xs truncate flex-1">{d.name}</span>
                <span className="text-xs font-medium tabular-nums">
                  {d.value} ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
