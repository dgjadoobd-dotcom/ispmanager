import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, FileText, FileSpreadsheet, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface AccountEntry {
  name: string;
  debit: number;
  credit: number;
}

interface CategoryData {
  category: string;
  accounts: AccountEntry[];
}

const demoData: CategoryData[] = [
  {
    category: "Asset",
    accounts: [
      { name: "Cash in Hand", debit: 125000, credit: 0 },
      { name: "Bank Account - Sonali Bank", debit: 450000, credit: 0 },
      { name: "Bank Account - bKash", debit: 85000, credit: 0 },
      { name: "Accounts Receivable", debit: 210000, credit: 0 },
      { name: "Equipment & Devices", debit: 320000, credit: 0 },
      { name: "Fiber Optic Infrastructure", debit: 1500000, credit: 0 },
    ],
  },
  {
    category: "Expense",
    accounts: [
      { name: "Bandwidth Cost", debit: 180000, credit: 0 },
      { name: "Staff Salary", debit: 95000, credit: 0 },
      { name: "Office Rent", debit: 25000, credit: 0 },
      { name: "Electricity Bill", debit: 18000, credit: 0 },
      { name: "Marketing & Promotion", debit: 12000, credit: 0 },
      { name: "Maintenance & Repair", debit: 35000, credit: 0 },
    ],
  },
  {
    category: "Income",
    accounts: [
      { name: "Internet Subscription Revenue", debit: 0, credit: 520000 },
      { name: "New Connection Fee", debit: 0, credit: 75000 },
      { name: "Late Payment Fee", debit: 0, credit: 8500 },
      { name: "Equipment Sales", debit: 0, credit: 45000 },
    ],
  },
  {
    category: "Liabilities",
    accounts: [
      { name: "Accounts Payable", debit: 0, credit: 185000 },
      { name: "Bank Loan - IFIC", debit: 0, credit: 800000 },
      { name: "Tax Payable", debit: 0, credit: 42000 },
      { name: "Advance from Customers", debit: 0, credit: 58500 },
    ],
  },
  {
    category: "Owner's Equity",
    accounts: [
      { name: "Owner's Capital", debit: 0, credit: 1200000 },
      { name: "Retained Earnings", debit: 0, credit: 182000 },
    ],
  },
];

const fmt = (val: number) => {
  if (val === 0) return "—";
  return `৳ ${val.toLocaleString("en-IN")}`;
};

const TrialBalancePage: React.FC = () => {
  const [tillDate, setTillDate] = useState<Date | undefined>(new Date());

  const categoryTotals = demoData.map((cat) => ({
    category: cat.category,
    debit: cat.accounts.reduce((s, a) => s + a.debit, 0),
    credit: cat.accounts.reduce((s, a) => s + a.credit, 0),
  }));

  const grandDebit = categoryTotals.reduce((s, c) => s + c.debit, 0);
  const grandCredit = categoryTotals.reduce((s, c) => s + c.credit, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Accounting Report</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Trial Balance</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Trial Balance</h1>
            <p className="text-muted-foreground text-sm">Accounting Report</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText className="h-4 w-4" /> Generate PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileSpreadsheet className="h-4 w-4" /> Generate CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Till Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal", !tillDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {tillDate ? format(tillDate, "dd MMM yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={tillDate} onSelect={setTillDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <Button size="sm" className="gap-1.5">Update Report</Button>
        <Button variant="ghost" size="sm" onClick={() => setTillDate(undefined)}>Clear Filters</Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-foreground hover:bg-foreground">
              <TableHead className="text-background font-semibold w-[55%]">ACCOUNT</TableHead>
              <TableHead className="text-background font-semibold text-right w-[22.5%]">DEBIT</TableHead>
              <TableHead className="text-background font-semibold text-right w-[22.5%]">CREDIT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoData.map((cat, ci) => {
              const totals = categoryTotals[ci];
              return (
                <React.Fragment key={cat.category}>
                  {/* Category banner */}
                  <TableRow className="bg-muted/80 hover:bg-muted/80 border-none">
                    <TableCell colSpan={3} className="py-2.5 font-bold text-foreground text-[13px] tracking-wide">
                      {cat.category}
                    </TableCell>
                  </TableRow>
                  {/* Account rows */}
                  {cat.accounts.map((acc) => (
                    <TableRow key={acc.name} className="hover:bg-muted/30">
                      <TableCell className="py-2.5 pl-8">
                        <span className="text-primary hover:underline cursor-pointer text-sm">{acc.name}</span>
                      </TableCell>
                      <TableCell className="py-2.5 text-right text-sm tabular-nums">{fmt(acc.debit)}</TableCell>
                      <TableCell className="py-2.5 text-right text-sm tabular-nums">{fmt(acc.credit)}</TableCell>
                    </TableRow>
                  ))}
                  {/* Category total */}
                  <TableRow className="border-t-2 border-border hover:bg-muted/20">
                    <TableCell className="py-2.5 pl-8 font-semibold text-sm text-foreground">
                      Total for {cat.category}
                    </TableCell>
                    <TableCell className="py-2.5 text-right font-semibold text-sm tabular-nums">{fmt(totals.debit)}</TableCell>
                    <TableCell className="py-2.5 text-right font-semibold text-sm tabular-nums">{fmt(totals.credit)}</TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
            {/* Grand total */}
            <TableRow className="bg-foreground hover:bg-foreground">
              <TableCell className="py-3 font-bold text-background">Total for all accounts</TableCell>
              <TableCell className="py-3 text-right font-bold text-background tabular-nums">{fmt(grandDebit)}</TableCell>
              <TableCell className="py-3 text-right font-bold text-background tabular-nums">{fmt(grandCredit)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground text-center">
        This report shows all account balances as of {tillDate ? format(tillDate, "dd MMM yyyy") : "today"}. Debit and Credit totals should be equal.
      </p>
    </div>
  );
};

export default TrialBalancePage;
