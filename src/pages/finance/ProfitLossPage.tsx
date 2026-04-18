import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, FileText, FileSpreadsheet, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "react-router-dom";

interface AccountRow {
  name: string;
  amount: number;
}

interface Section {
  title: string;
  accounts: AccountRow[];
}

const incomeSection: Section = {
  title: "Income",
  accounts: [
    { name: "Discount", amount: 0 },
    { name: "General Income", amount: 0 },
    { name: "Interest Income", amount: 0 },
    { name: "Late Fee Income", amount: 0 },
    { name: "Sales", amount: 0 },
  ],
};

const cogsSection: Section = {
  title: "Cost of Goods Sold",
  accounts: [
    { name: "Cost of Goods Sold", amount: 0 },
    { name: "Material Purchasing", amount: 0 },
  ],
};

const expenseSection: Section = {
  title: "Expense",
  accounts: [
    { name: "Advertising And Marketing", amount: 0 },
    { name: "Bank Fees And Charges", amount: 0 },
    { name: "Consultant Expense", amount: 0 },
    { name: "Depreciation Expense", amount: 0 },
    { name: "IT and Internet Expenses", amount: 0 },
    { name: "Insurance Expense", amount: 0 },
    { name: "Janitorial Expense", amount: 0 },
    { name: "Lodging", amount: 0 },
    { name: "Meals and Entertainment", amount: 0 },
    { name: "Office Supplies", amount: 0 },
    { name: "Other Expenses", amount: 0 },
    { name: "Payroll Expense", amount: 0 },
    { name: "Postage", amount: 0 },
    { name: "Printing and Stationery", amount: 0 },
    { name: "Rent Expense", amount: 0 },
    { name: "Repair And Maintenance", amount: 0 },
    { name: "Telephone Expense", amount: 0 },
    { name: "Transportation Expense", amount: 0 },
    { name: "Travel Expense", amount: 0 },
    { name: "Bad Debt", amount: 0 },
    { name: "Utility Expense", amount: 0 },
  ],
};

function formatAmount(amount: number): string {
  if (amount < 0) return `(${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })})`;
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function calcPercentage(value: number, total: number): string {
  if (total === 0) return "0.00";
  return ((value / total) * 100).toFixed(2);
}

export default function ProfitLossPage() {
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();

  const totalIncome = incomeSection.accounts.reduce((s, a) => s + a.amount, 0);
  const totalCogs = cogsSection.accounts.reduce((s, a) => s + a.amount, 0);
  const grossProfit = totalIncome - totalCogs;
  const totalExpense = expenseSection.accounts.reduce((s, a) => s + a.amount, 0);
  const netProfit = grossProfit - totalExpense;

  const dateRangeLabel =
    fromDate && toDate
      ? `${format(fromDate, "dd MMM yyyy")} to ${format(toDate, "dd MMM yyyy")}`
      : fromDate
        ? `From ${format(fromDate, "dd MMM yyyy")}`
        : toDate
          ? `Till ${format(toDate, "dd MMM yyyy")}`
          : "All Time";

  const clearFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            <Link to="/dashboard/accounting" className="hover:underline">Accounting Report</Link>
            {" > "}
            <span className="text-foreground font-medium">Profit & Loss Report</span>
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Profit & Loss</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="mr-1.5 h-4 w-4" /> Generate PDF
          </Button>
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Generate CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">From Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !fromDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "dd/MM/yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">To Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !toDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "dd/MM/yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <Button size="sm">Update Report</Button>
        <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
      </div>

      {/* Report Content */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Account Header */}
        <div className="flex items-center justify-between bg-foreground text-background px-4 py-2.5 text-sm font-semibold">
          <span>ACCOUNT</span>
          <span>{dateRangeLabel}</span>
        </div>

        {/* Income */}
        <SectionBanner title="Income" />
        {incomeSection.accounts.map((a) => (
          <AccountRowItem key={a.name} name={a.name} amount={a.amount} />
        ))}
        <TotalRow label="Total Income" amount={totalIncome} />

        {/* COGS */}
        <SectionBanner title="Cost of Goods Sold" />
        {cogsSection.accounts.map((a) => (
          <AccountRowItem key={a.name} name={a.name} amount={a.amount} />
        ))}
        <TotalRow label="Total Cost of Goods Sold" amount={totalCogs} />

        {/* Gross Profit */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-y border-primary/20">
          <span className="font-bold text-primary text-sm">Gross Profit</span>
          <div className="text-right">
            <span className="font-bold text-primary text-sm">{formatAmount(grossProfit)}</span>
            <span className="ml-2 text-xs text-primary/70">({calcPercentage(grossProfit, totalIncome)}% of Total Income)</span>
          </div>
        </div>

        {/* Expense */}
        <SectionBanner title="Expense" />
        {expenseSection.accounts.map((a) => (
          <AccountRowItem key={a.name} name={a.name} amount={a.amount} />
        ))}
        <TotalRow label="Total Expense" amount={totalExpense} />

        {/* Net Profit */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary/15 border-t border-primary/20">
          <span className="font-bold text-primary text-sm">Net Profit</span>
          <div className="text-right">
            <span className="font-bold text-primary text-sm">{formatAmount(netProfit)}</span>
            <span className="ml-2 text-xs text-primary/70">({calcPercentage(netProfit, totalIncome)}% of Total Income)</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-4 text-sm text-blue-700 dark:text-blue-300">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          Asset, Liabilities and Owner's Equity are not shown on the Profit & Loss report.{" "}
          <Link to="/dashboard/accounting/balance-sheet" className="underline font-medium hover:text-blue-900 dark:hover:text-blue-100">
            Go to Balance Sheet
          </Link>{" "}
          to view.
        </p>
      </div>
    </div>
  );
}

function SectionBanner({ title }: { title: string }) {
  return (
    <div className="bg-muted/80 px-4 py-2 text-sm font-semibold text-foreground border-b">
      {title}
    </div>
  );
}

function AccountRowItem({ name, amount }: { name: string; amount: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm border-b border-border/50 hover:bg-muted/30 transition-colors">
      <span className="text-muted-foreground">{name}</span>
      <span className={cn("tabular-nums", amount < 0 && "text-destructive")}>{formatAmount(amount)}</span>
    </div>
  );
}

function TotalRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b font-semibold text-sm">
      <span>{label}</span>
      <span className="tabular-nums">{formatAmount(amount)}</span>
    </div>
  );
}
