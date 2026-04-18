import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DueOverdueReportProps {
  customers: any[];
  bills: any[];
}

export function DueOverdueReport({ customers, bills }: DueOverdueReportProps) {
  const stats = useMemo(() => {
    const totalDue = (customers || []).reduce((s, c) => s + Number(c.due_balance || 0), 0);
    const totalAdvance = (customers || []).reduce((s, c) => s + Number(c.advance_balance || 0), 0);
    const customersWithDue = (customers || []).filter((c) => Number(c.due_balance || 0) > 0);
    const overdueBills = (bills || []).filter((b) => b.status === "overdue");
    const dueBills = (bills || []).filter((b) => b.status === "due");
    const paidBills = (bills || []).filter((b) => b.status === "paid");
    const totalBills = bills?.length || 0;

    const topDue = [...customersWithDue]
      .sort((a, b) => Number(b.due_balance) - Number(a.due_balance))
      .slice(0, 5);

    return {
      totalDue,
      totalAdvance,
      customersWithDueCount: customersWithDue.length,
      overdueBillsCount: overdueBills.length,
      dueBillsCount: dueBills.length,
      paidBillsCount: paidBills.length,
      totalBills,
      topDue,
    };
  }, [customers, bills]);

  const paidPercent = stats.totalBills > 0 ? Math.round((stats.paidBillsCount / stats.totalBills) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-base">Due & Overdue Report</CardTitle>
            <CardDescription>Summary of due and overdue bills</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-3">
            <p className="text-xs text-muted-foreground">Total Due</p>
            <p className="text-xl font-bold text-destructive">৳{stats.totalDue.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{stats.customersWithDueCount} customers</p>
          </div>
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
            <p className="text-xs text-muted-foreground">Total Advance</p>
            <p className="text-xl font-bold text-emerald-600">৳{stats.totalAdvance.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Collection Rate</span>
            <span className="font-medium">{paidPercent}%</span>
          </div>
          <Progress value={paidPercent} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Paid: {stats.paidBillsCount}</span>
            <span>Due: {stats.dueBillsCount}</span>
            <span>Overdue: {stats.overdueBillsCount}</span>
          </div>
        </div>

        {stats.topDue.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Top Defaulters</p>
            <div className="space-y-1.5">
              {stats.topDue.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                  <span className="text-sm truncate">{c.name}</span>
                  <span className="text-sm font-semibold text-destructive">৳{Number(c.due_balance).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
