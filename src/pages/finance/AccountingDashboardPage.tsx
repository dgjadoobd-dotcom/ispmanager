import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, Filter, TrendingUp, TrendingDown, Wallet, CreditCard, Banknote, ArrowUpRight, ArrowDownRight, DollarSign, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { usePayments } from "@/hooks/usePayments";
import { useBills } from "@/hooks/useBills";
import { useTenantContext } from "@/contexts/TenantContext";
import { useDemoMode } from "@/contexts/DemoModeContext";

// Demo data
const demoIncomeCategories = [
  { name: "Internet Subscription", amount: 285000, color: "hsl(var(--primary))" },
  { name: "New Connection Fee", amount: 45000, color: "hsl(180, 70%, 45%)" },
  { name: "Reconnection Fee", amount: 12000, color: "hsl(200, 70%, 50%)" },
  { name: "Equipment Sale", amount: 18500, color: "hsl(160, 60%, 45%)" },
  { name: "Late Payment Fee", amount: 8200, color: "hsl(220, 60%, 55%)" },
];

const demoExpenseCategories = [
  { name: "Bandwidth Cost", amount: 120000, color: "hsl(0, 70%, 55%)" },
  { name: "Staff Salary", amount: 85000, color: "hsl(20, 70%, 50%)" },
  { name: "Equipment Purchase", amount: 42000, color: "hsl(40, 70%, 50%)" },
  { name: "Office Rent", amount: 25000, color: "hsl(340, 60%, 50%)" },
  { name: "Electricity Bill", amount: 15000, color: "hsl(280, 50%, 55%)" },
];

const demoLatestIncomes = [
  { id: "1", description: "Monthly subscription - Rahim", amount: 1200, method: "bKash", date: "2026-03-10" },
  { id: "2", description: "New connection - Karim", amount: 2500, method: "Cash", date: "2026-03-10" },
  { id: "3", description: "Monthly subscription - Fatema", amount: 1500, method: "Nagad", date: "2026-03-09" },
  { id: "4", description: "Reconnection fee - Jamal", amount: 500, method: "Cash", date: "2026-03-09" },
  { id: "5", description: "Monthly subscription - Sumon", amount: 1000, method: "bKash", date: "2026-03-08" },
];

const demoLatestExpenses = [
  { id: "1", description: "Bandwidth - BDIX", amount: 45000, method: "Bank Transfer", date: "2026-03-10" },
  { id: "2", description: "Staff salary - March", amount: 85000, method: "Bank Transfer", date: "2026-03-09" },
  { id: "3", description: "Router purchase (5x)", amount: 12500, method: "Cash", date: "2026-03-08" },
  { id: "4", description: "Office electricity", amount: 5200, method: "bKash", date: "2026-03-07" },
  { id: "5", description: "Fiber cable (500m)", amount: 8000, method: "Cash", date: "2026-03-06" },
];

interface SummaryCardProps {
  title: string;
  amount: number;
  filteredAmount?: number;
  monthLabel?: string;
  icon: React.ReactNode;
  gradient: string;
  textColor?: string;
}

function SummaryCard({ title, amount, filteredAmount, monthLabel, icon, gradient, textColor = "text-white" }: SummaryCardProps) {
  return (
    <Card className={cn("relative overflow-hidden border-0 shadow-lg", gradient)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className={cn("text-sm font-medium opacity-90", textColor)}>{title}</p>
            <p className={cn("text-2xl font-bold tracking-tight", textColor)}>
              ৳{amount.toLocaleString("en-IN")}
            </p>
            {monthLabel && (
              <p className={cn("text-xs opacity-75", textColor)}>{monthLabel}</p>
            )}
          </div>
          <div className={cn("rounded-xl p-2.5 bg-white/20 backdrop-blur-sm")}>
            {icon}
          </div>
        </div>
        {filteredAmount !== undefined && (
          <div className={cn("mt-3 pt-3 border-t border-white/20")}>
            <p className={cn("text-xs opacity-75", textColor)}>Filtered Transactions</p>
            <p className={cn("text-sm font-semibold", textColor)}>৳{filteredAmount.toLocaleString("en-IN")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AccountingDashboardPage() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const { currentTenant } = useTenantContext();
  const { isDemoMode } = useDemoMode();
  const { data: payments } = usePayments(currentTenant?.id);
  const { data: bills } = useBills(currentTenant?.id);

  const totalIncome = isDemoMode ? 368700 : (payments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0);
  const totalExpense = isDemoMode ? 287000 : 0;
  const totalProfit = totalIncome - totalExpense;
  const expectedFromCustomers = isDemoMode ? 125400 : (bills?.filter(b => b.status === "due" || b.status === "overdue").reduce((s, b) => s + Number(b.amount), 0) ?? 0);
  const expectedToVendors = isDemoMode ? 65000 : 0;
  const totalUpcoming = expectedFromCustomers + expectedToVendors;

  const paymentMethodTotals = useMemo(() => {
    if (isDemoMode) {
      return [
        { name: "Cash on Hand", amount: 142500, icon: <Banknote className="h-5 w-5 text-white" />, gradient: "bg-gradient-to-br from-emerald-500 to-emerald-700" },
        { name: "bKash", amount: 98200, icon: <CreditCard className="h-5 w-5 text-white" />, gradient: "bg-gradient-to-br from-pink-500 to-pink-700" },
        { name: "Nagad", amount: 65000, icon: <CreditCard className="h-5 w-5 text-white" />, gradient: "bg-gradient-to-br from-orange-500 to-orange-700" },
        { name: "SSL Commerz", amount: 35000, icon: <CreditCard className="h-5 w-5 text-white" />, gradient: "bg-gradient-to-br from-blue-500 to-blue-700" },
        { name: "aamarPay", amount: 18000, icon: <CreditCard className="h-5 w-5 text-white" />, gradient: "bg-gradient-to-br from-indigo-500 to-indigo-700" },
        { name: "Bank Transfer", amount: 10000, icon: <Building2 className="h-5 w-5 text-white" />, gradient: "bg-gradient-to-br from-slate-500 to-slate-700" },
      ];
    }
    const grouped: Record<string, number> = {};
    payments?.forEach(p => {
      const method = p.method || "Cash";
      grouped[method] = (grouped[method] || 0) + Number(p.amount);
    });
    return Object.entries(grouped).map(([name, amount]) => ({
      name,
      amount,
      icon: <CreditCard className="h-5 w-5 text-white" />,
      gradient: "bg-gradient-to-br from-slate-500 to-slate-700",
    }));
  }, [payments, isDemoMode]);

  const incomeCategories = isDemoMode ? demoIncomeCategories : demoIncomeCategories.map(c => ({ ...c, amount: 0 }));
  const expenseCategories = isDemoMode ? demoExpenseCategories : demoExpenseCategories.map(c => ({ ...c, amount: 0 }));
  const latestIncomes = isDemoMode ? demoLatestIncomes : [];
  const latestExpenses = isDemoMode ? demoLatestExpenses : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>Accounts</span>
            <span>/</span>
            <span className="text-foreground font-medium">Accounting Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Accounting Dashboard</h1>
        </div>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[160px] justify-start text-left font-normal text-sm", !dateFrom && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[160px] justify-start text-left font-normal text-sm", !dateTo && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <Button className="gap-2">
              <Filter className="h-4 w-4" />
              Filter by date
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Income"
          amount={totalIncome}
          filteredAmount={totalIncome}
          monthLabel="March 2026"
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-cyan-500 to-teal-600"
        />
        <SummaryCard
          title="Total Expense"
          amount={totalExpense}
          filteredAmount={totalExpense}
          monthLabel="March 2026"
          icon={<TrendingDown className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-cyan-600 to-cyan-800"
        />
        <SummaryCard
          title="Total Profit"
          amount={totalProfit}
          filteredAmount={totalProfit}
          monthLabel="March 2026"
          icon={<DollarSign className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-purple-500 to-violet-700"
        />
      </div>

      {/* Summary Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Expected from Customers"
          amount={expectedFromCustomers}
          monthLabel="Outstanding dues"
          icon={<Users className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        />
        <SummaryCard
          title="Expected to Vendors"
          amount={expectedToVendors}
          monthLabel="Pending payments"
          icon={<Building2 className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-rose-500 to-red-600"
        />
        <SummaryCard
          title="Total Upcoming"
          amount={totalUpcoming}
          monthLabel="Net expected"
          icon={<Wallet className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-sky-500 to-blue-700"
        />
      </div>

      {/* Payment Method Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Payment Method Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {paymentMethodTotals.map((pm) => (
            <SummaryCard
              key={pm.name}
              title={pm.name}
              amount={pm.amount}
              icon={pm.icon}
              gradient={pm.gradient}
            />
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              Income by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeCategories} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis type="number" tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} className="text-xs" />
                  <YAxis type="category" dataKey="name" width={140} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip formatter={(value: number) => [`৳${value.toLocaleString("en-IN")}`, "Amount"]} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }} />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={20}>
                    {incomeCategories.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense by Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              Expense by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseCategories} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis type="number" tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} className="text-xs" />
                  <YAxis type="category" dataKey="name" width={140} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip formatter={(value: number) => [`৳${value.toLocaleString("en-IN")}`, "Amount"]} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }} />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={20}>
                    {expenseCategories.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Incomes & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Incomes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              Latest Incomes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs">Method</TableHead>
                  <TableHead className="text-xs text-right">Amount</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestIncomes.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No income records</TableCell></TableRow>
                ) : (
                  latestIncomes.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm">{item.description}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{item.method}</Badge></TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">+৳{item.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Latest Expenses */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              Latest Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs">Method</TableHead>
                  <TableHead className="text-xs text-right">Amount</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestExpenses.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No expense records</TableCell></TableRow>
                ) : (
                  latestExpenses.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm">{item.description}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{item.method}</Badge></TableCell>
                      <TableCell className="text-right font-medium text-red-500">-৳{item.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
