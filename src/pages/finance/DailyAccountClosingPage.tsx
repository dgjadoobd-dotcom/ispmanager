import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCurrentTenant } from "@/hooks/useTenant";
import { useBills } from "@/hooks/useBills";
import { usePayments } from "@/hooks/usePayments";
import { useDemoMode } from "@/contexts/DemoModeContext";

export default function DailyAccountClosingPage() {
  const { data: tenant } = useCurrentTenant();
  const { isDemoMode } = useDemoMode();
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [searched, setSearched] = useState(false);

  const { data: bills } = useBills(tenant?.id);
  const { data: payments } = usePayments(tenant?.id);

  const summary = useMemo(() => {
    if (isDemoMode || !searched) {
      if (!searched) return { bill: 0, income: 0, expense: 0 };
      return { bill: 15500, income: 8200, expense: 3400 };
    }

    const from = format(fromDate, "yyyy-MM-dd");
    const to = format(toDate, "yyyy-MM-dd");

    const billSum = bills
      ?.filter((b) => {
        const d = b.created_at?.split("T")[0];
        return d && d >= from && d <= to;
      })
      .reduce((s, b) => s + Number(b.amount), 0) ?? 0;

    const incomeSum = payments
      ?.filter((p) => {
        const d = p.created_at?.split("T")[0];
        return d && d >= from && d <= to;
      })
      .reduce((s, p) => s + Number(p.amount), 0) ?? 0;

    return { bill: billSum, income: incomeSum, expense: 0 };
  }, [bills, payments, fromDate, toDate, searched, isDemoMode]);

  const cashOnHand = summary.bill + summary.income - summary.expense;

  const handleSearch = () => setSearched(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>Daily Account</span>
          <span>/</span>
          <span className="text-foreground font-medium">Daily Account Closing</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Daily Account Closing</h1>
        <p className="text-sm text-muted-foreground">Close Daily Account</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !fromDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "dd/MM/yyyy") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={fromDate} onSelect={(d) => d && setFromDate(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !toDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "dd/MM/yyyy") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={toDate} onSelect={(d) => d && setToDate(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-t-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-primary/10 p-2.5">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Bill</h3>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Sum</div>
            <div className="text-3xl font-bold text-primary">
              ৳ {summary.bill.toLocaleString("en-BD")}
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4" style={{ borderTopColor: "hsl(var(--primary))" }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-primary/10 p-2.5">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Service Income</h3>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Sum</div>
            <div className="text-3xl font-bold text-primary">
              ৳ {summary.income.toLocaleString("en-BD")}
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-destructive/10 p-2.5">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold">Expense</h3>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Sum</div>
            <div className="text-3xl font-bold text-destructive">
              ৳ {summary.expense.toLocaleString("en-BD")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash on Hand Banner */}
      <div className="rounded-xl bg-foreground text-background p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-background/15 p-3">
            <Wallet className="h-7 w-7" />
          </div>
          <div>
            <div className="text-sm opacity-80">Net Balance</div>
            <div className="text-xl font-bold">Cash on Hand</div>
          </div>
        </div>
        <div className="text-4xl font-extrabold tracking-tight">
          ৳ {cashOnHand.toLocaleString("en-BD")}
        </div>
      </div>
    </div>
  );
}
